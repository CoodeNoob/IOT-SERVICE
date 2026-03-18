const Response = require('../utils/ApiResponses');
const TeacherService = require('../services/teacher.service');
const bcrypt = require('bcrypt');
const e = require('express');
const { Teacher } = require('../models');
const { buildSimplePdfFromLines } = require('../utils/simplePdf');


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

async function exportTeachersPdf(req, res) {
    try {
        const teachers = await Teacher.findAll({
            attributes: ['id', 'name', 'email', 'created_at'],
            order: [['id', 'ASC']],
            raw: true
        });

        const now = new Date();
        const headerDate = now.toISOString().replace('T', ' ').slice(0, 19) + 'Z';

        const lines = [
            `Teachers Export (${headerDate})`,
            '',
            'ID | Name | Email | Created At',
            '----------------------------------------'
        ];

        for (const t of teachers) {
            lines.push(`${t.id} | ${t.name} | ${t.email} | ${t.created_at}`);
        }

        const pdfBuffer = buildSimplePdfFromLines(lines);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=\"teachers.pdf\"');
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        return Response.error(res, error.message, 500);
    }
}


module.exports = {
    registerTeacher,
    exportTeachersPdf,
}
