const Response = require('../utils/ApiResponses');
const TeacherService = require('../services/teacher.service');
const bcrypt = require('bcrypt');
const e = require('express');


async function registerTeacher(req, res) {

    try {
        const { name, email, password, role } = req.body;


        if (!name) Response.error(res, message = "Name is required", errorCode = 403);
        if (!email) Response.error(res, message = "Email is required", errorCode = 403);
        if (!password) Response.error(res, message = "Password is required", errorCode = 403);
        if (!role) role = "teacher";

        const exist = await TeacherService.findByEmail(email);

        if (exist) {
            Response.error(res, message = "Email is already registered!", errorCode = 405);
        }

        const encryptPassword = await bcrypt.hash(password, 10);

        await TeacherService.registerTeacher(name, email, encryptPassword, role);

        Response.success(res, message = "Teacher Registered Successfully!", 200);

    }
    catch (error) {
        Response.error(res, message = error.message, errorCode = 403);
    }
}

module.exports = {
    registerTeacher
}