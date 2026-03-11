const { Op } = require('sequelize');
const { FingerPrint, Student, StudentCourse, Attendance, Course } = require('../models');

async function findActiveFingerprintById(fingerprintId) {
    return FingerPrint.findOne({
        where: {
            is_active: true,
            [Op.or]: [
                { finger_slot: fingerprintId },
                { serialCode: fingerprintId }
            ]
        },
        include: [
            {
                model: Student,
                as: 'student',
                attributes: ['id', 'name', 'email', 'photo_url']
            }
        ]
    });
}

async function registerFingerprint({ studentId, fingerSlot, isActive = true }) {
    const student = await Student.findByPk(studentId);
    if (!student) {
        throw new Error('Student not found');
    }

    const existingSlot = await FingerPrint.findOne({
        where: {
            finger_slot: fingerSlot,
            is_active: true
        }
    });

    if (existingSlot) {
        throw new Error('Finger slot is already assigned');
    }

    return FingerPrint.create({
        student_id: studentId,
        finger_slot: fingerSlot,
        is_active: isActive
    });
}

async function resolveCourseIdForStudent(studentId, rawCourseId) {
    const courseId = Number(rawCourseId);
    if (Number.isInteger(courseId) && courseId > 0) {
        return courseId;
    }

    const latestEnrollment = await StudentCourse.findOne({
        where: { student_id: studentId },
        order: [['enrolled_at', 'DESC']]
    });

    if (latestEnrollment?.course_id) {
        return latestEnrollment.course_id;
    }

    const defaultCourse = await Course.findOne({
        attributes: ['id'],
        order: [['id', 'ASC']]
    });

    return defaultCourse?.id ?? null;
}

async function recordAttendance({ studentId, courseId, checkDate, checkTime }) {
    const [attendance, created] = await Attendance.findOrCreate({
        where: {
            student_id: studentId,
            course_id: courseId,
            check_date: checkDate
        },
        defaults: {
            check_time: checkTime,
            status: 'present'
        }
    });

    return { attendance, created };
}

module.exports = {
    findActiveFingerprintById,
    registerFingerprint,
    resolveCourseIdForStudent,
    recordAttendance
};

