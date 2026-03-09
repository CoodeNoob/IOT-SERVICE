const Response = require('../utils/ApiResponses');
const fingerprintService = require('../services/fingerprint.service');

function normalizeFingerprintId(body) {
    return body?.fingerprintId
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
        const rawFingerprintId = normalizeFingerprintId(req.body);
        const fingerprintId = Number(rawFingerprintId);

        if (!Number.isInteger(fingerprintId) || fingerprintId < 0) {
            return Response.error(
                res,
                "Invalid fingerprint ID. Send an integer in fingerprintId, fingerprint_id, finger_id, or finger_slot.",
                400
            );
        }

        const fingerprint = await fingerprintService.findActiveFingerprintById(fingerprintId);

        if (!fingerprint || !fingerprint.student) {
            return Response.error(res, "Fingerprint not found", 404);
        }

        const rawCourseId = normalizeCourseId(req.body);
        const courseId = await fingerprintService.resolveCourseIdForStudent(
            fingerprint.student.id,
            rawCourseId
        );

        if (!courseId) {
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
                }
            },
            created ? "Attendance recorded" : "Attendance already recorded for today",
            200
        );
    } catch (error) {
        return Response.error(res, error.message, 500);
    }
}

module.exports = {
    scanFingerprint,
    receiveFingerprintData
};
