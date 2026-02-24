const sequelize = require('../config/database');


const Student = require('./student.model');
const Teacher = require('./teacher.model');
const Course = require('./course.model');
const FingerPrint = require('./fingerprint.model');
const Attendance = require('./attendance.model');
const StudentCourse = require('./studentcourse.model');


// STUDENT - FINGER PRINT ( 1 - M)
Student.hasMany(FingerPrint, {
    foreignKey: 'student_id',
    as: 'fingerprints'
});


FingerPrint.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student'
});


// STUDENT - ATTENDANCE 
Student.hasMany(Attendance, {
    foreignKey: 'student_id',
    as: 'attendances'
});

Attendance.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student'
});

// COURSE - ATTENDANCE
Course.hasMany(Attendance, {
    foreignKey: 'course_id',
    as: 'attendances'
});

Attendance.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
});


//  Teacher - Course
Teacher.hasMany(Course, {
    foreignKey: 'teacher_id',
    as: 'courses'
});

Course.belongsTo(Teacher, {
    foreignKey: 'teacher_id',
    as: 'teacher'
});


// Student - Course
Student.belongsToMany(Course, {
    through: StudentCourse,
    foreignKey: 'student_id',
    otherKey: 'course_id',
    as: 'courses'
});

Course.belongsToMany(Student, {
    through: StudentCourse,
    foreignKey: 'course_id',
    otherKey: 'student_id',
    as: 'students'
});



module.exports = {
    sequelize,
    Student,
    Teacher,
    Course,
    FingerPrint,
    Attendance,
    StudentCourse
};
