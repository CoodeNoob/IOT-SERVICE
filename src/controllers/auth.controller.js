const Response = require('../utils/ApiResponses');
const bcrypt = require('bcrypt');
const studentService = require('../services/student.service');
const teacherService = require('../services/teacher.service');
const jwtService = require('../utils/jwt');

async function StudentLogin(req, res, next) {
    try {
        const { email, password } = extractEmailPassword(req.body);

        const student = await studentService.FindByEmail(email);

        if (!student) {
            return Response.error(res, "Invalid Email or Password", 401);
        }

        const isMatch = await passwordCompare(password, student.password);

        if (!isMatch) {
            return Response.error(res, "Invalid Email or Password", 401);
        }

        const token = jwtService.generateAccessToken({
            id: student.id,
            role: student.role
        });

        const responseData = {
            token,
            userData: {
                id: student.id,
                name: student.name,
                email: student.email,
                photo_url: student.photo_url
            }
        };

        return Response.success(res, responseData, "Login Successful", 200);

    } catch (error) {
        return Response.error(res, "Internal Server Error", 500);
    }
}

async function TeacherLogin(req, res, next) {
    try {
        const { email, password } = extractEmailPassword(req.body);

        const teacher = teacherService.findByEmail(email);

        if (!teacher) return Response.error(res, "Invalid Email or Password", 401);

        const isMatch = await passwordCompare(password, teacher.password);

        if (!isMatch) return Response.error(res, "Invalid Email or Password", 401);


        const token = jwtService.generateAccessToken({
            id: teacher.id,
            role: teacher.role
        });

        const responseData = {
            token,
            userData: {
                id: teacher.id,
                name: teacher.name,
                email: teacher.email,
            }
        };

        return Response.success(res, responseData, "Login Successful", 200);

    }
    catch (error) {
        Response.error(res, message = error.message, errorCode = 405);
    }
};

//Helper Functions
function extractEmailPassword(reqBody) {
    const { email, password } = reqBody;

    if (!email) {
        throw new Error("Email is required");
    }

    if (!password) {
        throw new Error("Password is required");
    }

    return { email, password };
}

function passwordCompare(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
}

module.exports = {
    StudentLogin,
    TeacherLogin
}