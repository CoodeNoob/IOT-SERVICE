const Response = require('../utils/ApiResponses');
const StudentService = require('../services/student.service');
const bcrypt = require('bcrypt');

async function RegisterStudent(req, res, next) {

    try {
        const { name, email, password } = req.body;
        console.log(name);

        if (name.trim() == "") {
            Response.error(res, "Name is requied", errorCode = 403);
        }

        const exist = await StudentService.FindByEmail(email);

        if (exist) {
            Response.error(res, message = "Email is already registered!", errorCode = 405);
        }


        const encryptPassword = await bcrypt.hash(password, 10);

        await StudentService.RegisterStudent(name, email, encryptPassword)

        Response.success(res, message = "Student Registered Successfully!", 200);
    }
    catch (error) {
        Response.error(res, message = error.message, errorCode = 403);
    }


}

module.exports = {
    RegisterStudent
}