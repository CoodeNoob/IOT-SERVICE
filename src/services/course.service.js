const Course = require('../models/course.model');
const CourseEnroll = require('../models/studentcourse.model');

async function addNewCourse(courseData) {
    return Course.create(courseData);
}

async function findCourseById(id) {
    return Course.findByPk(id, { raw: true });
}


async function enrollStudent(data) {
    return CourseEnroll.create(data)
}

module.exports = {
    addNewCourse,
    findCourseById,
    enrollStudent
}