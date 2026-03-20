const Response = require('../utils/ApiResponses');
const MailService = require('../services/mail.service');
const StudentService = require('../services/student.service');

async function sendMail(req, res, next) {
    try {
        const { studentId, reason } = req.body;

        if (!studentId) {
            return Response.error(res, "Student ID is required", 401);
        }

        const student = await StudentService.getName_Mail(studentId);
        if (!student) {
            return Response.error(res, "Student not found", 404);
        }

        const { name, email } = student;

        await MailService.sendAbsentEmail(email, `Absent Information`, name, reason);

        return Response.success(res, {
            message: "Mail sent  successfully!",
            data: { name, email }
        });

    } catch (error) {
        return Response.error(res, error.message, 403);
    }
}


module.exports = {
    sendMail
}



