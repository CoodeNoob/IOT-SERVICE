const courseService = require('../services/course.service');
const Response = require('../utils/ApiResponses');
const studentService = require('../services/student.service');

async function addNewCourse(req, res) {
    // courseName | courseCode
    try {

        const { courseName } = req.body;
        const courseData = {
            courseName: courseName,
            courseCode: generateCourseCode()
        }
        await courseService.addNewCourse(courseData);
        Response.success(res, message = "Course Created Successfully!", 200);
    }
    catch (error) {
        Response.error(res, message = error.message, errorCode = 403);
    }
}

async function enrollCourse(req, res) {
    try {
        const { studentId, courseId } = req.body;

        const student = studentService.FindStudentById(studentId);
        const course = courseService.findCourseById(courseId);

        if (!student) Response.error(res, message = "Student is not available !", errorCode = 403);
        if (!course) Response.error(res, message = "Course is not available !", errorCode = 403);

        await courseService.enrollStudent({
            course_id: courseId,
            student_id: studentId
        })

        Response.success(res, message = 'Course enrolled Successfully!', 200);
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
    addNewCourse,
    enrollCourse
}