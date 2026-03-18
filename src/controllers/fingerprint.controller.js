const Response = require('../utils/ApiResponses');
const fingerprintService = require('../services/fingerprint.service');
const fingerprintEnrollmentService = require('../services/fingerprintEnrollment.service');

function normalizeFingerprintId(body) {
    return body?.fingerprintId
        ?? body?.FingerID
        ?? body?.fingerID
        ?? body?.fingerprint_id
        ?? body?.finger_id
        ?? body?.finger_slot
        ?? body?.id;
}

function normalizeCourseId(body) {
    return body?.courseId
        ?? body?.course_id
        ?? body?.course;
}

function normalizeStudentId(body) {
    return body?.studentId
        ?? body?.student_id
        ?? body?.student;
}

function toLocalDate(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toLocalTime(now = new Date()) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function isLegacyDeviceRequest(req) {
    const contentType = req.headers['content-type'] || '';
    const formEncoded = contentType.includes('application/x-www-form-urlencoded');
    const hasLegacyKeys =
        req.body?.FingerID !== undefined ||
        req.body?.Get_Fingerid !== undefined ||
        req.body?.confirm_id !== undefined ||
        req.body?.DeleteID !== undefined;

    return formEncoded || hasLegacyKeys;
}

function legacyWantsLoginPrefix(req) {
    // Older tutorial firmware checks payload starts with "login".
    return req.body?.FingerID !== undefined;
}

async function scanFingerprint(req, res) {
    try {
        const rawFingerprintId = normalizeFingerprintId(req.body);
        const fingerprintId = Number(rawFingerprintId);

        if (!Number.isInteger(fingerprintId) || fingerprintId < 0) {
            return Response.error(
                res,
                "Invalid fingerprint ID. Send an integer in fingerprintId, fingerprint_id, or finger_slot.",
                400
            );
        }

        const fingerprint = await fingerprintService.findActiveFingerprintById(fingerprintId);

        if (!fingerprint || !fingerprint.student) {
            return Response.error(res, "Fingerprint not found", 404);
        }

        const responseData = {
            fingerprint: {
                serialCode: fingerprint.serialCode,
                finger_slot: fingerprint.finger_slot,
                is_active: fingerprint.is_active
            },
            student: {
                id: fingerprint.student.id,
                name: fingerprint.student.name,
                email: fingerprint.student.email,
                photo_url: fingerprint.student.photo_url
            }
        };

        return Response.success(res, responseData, "Fingerprint accepted", 200);
    } catch (error) {
        return Response.error(res, error.message, 500);
    }
}

async function receiveFingerprintData(req, res) {
    try {
        const legacyResponse = isLegacyDeviceRequest(req);

        if (legacyResponse && req.body?.Get_Fingerid === 'get_id') {
            const pending = await fingerprintEnrollmentService.getOldestPendingEnrollment();
            if (!pending) {
                return res.status(200).send('no-id');
            }
            return res.status(200).send(`add-id${pending.finger_slot}`);
        }

        if (legacyResponse && req.body?.confirm_id !== undefined) {
            const fingerSlot = Number(req.body.confirm_id);
            await fingerprintEnrollmentService.confirmEnrollment({ fingerSlot });
            return res.status(200).send('Stored');
        }

        if (legacyResponse && req.body?.DeleteID === 'check') {
            return res.status(200).send('none');
        }

        const rawFingerprintId = normalizeFingerprintId(req.body);
        const fingerprintId = Number(rawFingerprintId);

        if (!Number.isInteger(fingerprintId) || fingerprintId < 0) {
            if (legacyResponse) {
                return res.status(400).send('errorInvalid fingerprint ID');
            }
            return Response.error(
                res,
                "Invalid fingerprint ID. Send an integer in fingerprintId, fingerprint_id, finger_id, or finger_slot.",
                400
            );
        }

        let fingerprint = await fingerprintService.findActiveFingerprintById(fingerprintId);

        if (!fingerprint || !fingerprint.student) {
            // Auto-confirm if the sensor already has a template and the confirm callback was missed.
            try {
                await fingerprintEnrollmentService.confirmEnrollment({ fingerSlot: fingerprintId });
            } catch (_) {
                // ignore
            }
            fingerprint = await fingerprintService.findActiveFingerprintById(fingerprintId);
        }

        if (!fingerprint || !fingerprint.student) {
            if (legacyResponse) {
                return res.status(404).send('errorFingerprint not found');
            }
            return Response.error(res, "Fingerprint not found", 404);
        }

        const rawCourseId = normalizeCourseId(req.body);
        const courseId = await fingerprintService.resolveCourseIdForStudent(
            fingerprint.student.id,
            rawCourseId
        );

        if (!courseId) {
            if (legacyResponse) {
                return res.status(400).send('errorCourse not found');
            }
            return Response.error(
                res,
                "Course not provided and no enrolled course found for this student. Send course_id in request body.",
                400
            );
        }

        const now = new Date();
        const checkDate = toLocalDate(now);
        const checkTime = toLocalTime(now);

        const { attendance, created } = await fingerprintService.recordAttendance({
            studentId: fingerprint.student.id,
            courseId,
            checkDate,
            checkTime
        });

        if (legacyResponse) {
            const studentName = fingerprint.student.name ?? '';
            if (legacyWantsLoginPrefix(req)) {
                return res.status(200).send(`login${studentName}`);
            }
            // Newer/simple firmware can just display the response directly on OLED.
            return res.status(200).send(studentName);
        }

        return Response.success(
            res,
            {
                attendance: {
                    id: attendance.id,
                    student_id: attendance.student_id,
                    course_id: attendance.course_id,
                    check_date: attendance.check_date,
                    check_time: attendance.check_time,
                    status: attendance.status
                },
                student: {
                    id: fingerprint.student.id,
                    name: fingerprint.student.name,
                    email: fingerprint.student.email,
                    photo_url: fingerprint.student.photo_url
                },
                already_recorded: !created
            },
            "Attendance recorded",
            200
        );
    } catch (error) {
        return Response.error(res, error.message, 500);
    }
}

async function registerFingerprint(req, res) {
    try {
        const rawStudentId = normalizeStudentId(req.body);
        const rawFingerSlot = normalizeFingerprintId(req.body);

        const studentId = Number(rawStudentId);
        const fingerSlot = Number(rawFingerSlot);
        const isActive = req.body?.is_active ?? req.body?.isActive ?? true;

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return Response.error(
                res,
                "Invalid student ID. Send an integer in studentId or student_id.",
                400
            );
        }

        if (!Number.isInteger(fingerSlot) || fingerSlot <= 0) {
            return Response.error(
                res,
                "Invalid finger slot. Send an integer in finger_slot, fingerprint_id, or fingerprintId.",
                400
            );
        }

        const fingerprint = await fingerprintService.registerFingerprint({
            studentId,
            fingerSlot,
            isActive: Boolean(isActive)
        });

        return Response.success(
            res,
            {
                fingerprint: {
                    serialCode: fingerprint.serialCode,
                    student_id: fingerprint.student_id,
                    finger_slot: fingerprint.finger_slot,
                    is_active: fingerprint.is_active
                }
            },
            "Fingerprint registered successfully",
            201
        );
    } catch (error) {
        if (error.message === "Student not found" || error.message === "Finger slot is already assigned") {
            return Response.error(res, error.message, 400);
        }

        return Response.error(res, error.message, 500);
    }
}

async function requestFingerprintEnrollment(req, res) {
    try {
        const rawStudentId = normalizeStudentId(req.body);
        const rawFingerSlot = normalizeFingerprintId(req.body);

        const studentId = Number(rawStudentId);
        const fingerSlot = rawFingerSlot !== undefined ? Number(rawFingerSlot) : undefined;

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return Response.error(res, "Invalid student ID. Send an integer in studentId or student_id.", 400);
        }

        const enrollment = await fingerprintEnrollmentService.requestEnrollment({
            studentId,
            fingerSlot: Number.isFinite(fingerSlot) ? fingerSlot : undefined
        });

        return Response.success(
            res,
            {
                enrollment: {
                    id: enrollment.id,
                    student_id: enrollment.student_id,
                    finger_slot: enrollment.finger_slot,
                    status: enrollment.status,
                    requested_at: enrollment.requested_at
                }
            },
            "Enrollment requested",
            201
        );
    } catch (error) {
        if (
            error.message === "Student not found" ||
            error.message === "Invalid finger slot" ||
            error.message === "Finger slot is already assigned" ||
            error.message === "Finger slot is already pending"
        ) {
            return Response.error(res, error.message, 400);
        }
        return Response.error(res, error.message, 500);
    }
}

async function getPendingFingerprintEnrollment(req, res) {
    try {
        const pending = await fingerprintEnrollmentService.getOldestPendingEnrollment();
        return Response.success(res, { enrollment: pending }, "Pending enrollment", 200);
    } catch (error) {
        return Response.error(res, error.message, 500);
    }
}

async function cancelFingerprintEnrollment(req, res) {
    try {
        const rawStudentId = normalizeStudentId(req.body);
        const studentId = Number(rawStudentId);

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return Response.error(res, "Invalid student ID. Send an integer in studentId or student_id.", 400);
        }

        await fingerprintEnrollmentService.cancelEnrollment({ studentId });
        return Response.success(res, null, "Enrollment canceled", 200);
    } catch (error) {
        if (error.message === "Invalid student id") {
            return Response.error(res, error.message, 400);
        }
        return Response.error(res, error.message, 500);
    }
}

module.exports = {
    scanFingerprint,
    receiveFingerprintData,
    registerFingerprint,
    requestFingerprintEnrollment,
    getPendingFingerprintEnrollment,
    cancelFingerprintEnrollment
};
