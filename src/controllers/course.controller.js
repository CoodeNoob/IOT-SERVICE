const stuentService = require('../services/course.service');
const Response = require('../utils/ApiResponses');

async function addNewCourse(req, res) {
    // courseName | courseCode
    try {

        const { courseName } = req.body;
        const courseData = {
            courseName: courseName,
            courseCode: generateCourseCode()
        }
        stuentService.addNewCourse(courseData);
        Response.success(res, message = "Course Created Successfully!", 200);
    }
    catch (error) {
        Response.error(res, message = error.message, errorCode = 403);
    }
}

// helper function
function generateCourseCode() {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(100 + Math.random() * 900);
    return `CRS-${timestamp}${random}`;
}

module.exports = {
    addNewCourse
}