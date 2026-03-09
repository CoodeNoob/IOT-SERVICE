const { Op } = require('sequelize');
const { FingerPrint, Student, StudentCourse, Attendance } = require('../models');

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

async function resolveCourseIdForStudent(studentId, rawCourseId) {
    const courseId = Number(rawCourseId);
    if (Number.isInteger(courseId) && courseId > 0) {
        return courseId;
    }

    const latestEnrollment = await StudentCourse.findOne({
        where: { student_id: studentId },
        order: [['enrolled_at', 'DESC']]
    });

    return latestEnrollment?.course_id ?? null;
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
    resolveCourseIdForStudent,
    recordAttendance
};
