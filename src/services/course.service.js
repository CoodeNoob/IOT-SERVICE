const Course = require('../models/course.model');


async function addNewCourse(courseData) {
    return Course.create(courseData);
}


module.exports = {
    addNewCourse
}