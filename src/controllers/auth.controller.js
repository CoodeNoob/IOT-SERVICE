const Response = require('../utils/ApiResponses');
const bcrypt = require('bcrypt');
const studentService = require('../services/student.service');
const jwtService = require('../utils/jwt');

async function StudentLogin(req, res, next) {

    try {
        const { email, password } = req.body;

        if (!email) {
            Response.error(res, message = "Email is required !", errorCode = 403);
        }
        else if (!password) {
            Response.error(res, message = "Password is required !", errorCode = 403);
        }

        // raw true
        const student = await studentService.FindByEmail(email);

        if (!student) Response.error(res, message = "Invalid Email or Password", errorCode = 401);

        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) Response.error(res, message = "Invalid Email or Password", errorCode = 401);

        // TOKEN
        const token = jwtService.generateAccessToken({
            id: student.id,
            role: student.role
        });

        console.log(student);

        const responseData = {
            token: token,
            userData: {
                id: student.id,
                name: student.name,
                email: student.email,
                photo_url: student.photo_url
            }
        }

        //Successful Response
        Response.success(res, data = responseData, message = "Login Successful", 200);
    }
    catch (error) {
        Response.error(res, message = error.message, errorCode = 405);
    }

};

async function TeacherLogin(req, res, next) {

};


module.exports = {
    StudentLogin,
    TeacherLogin
}