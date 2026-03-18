const express = require('express');
const TeacherRouter = express.Router();
const TeacherController = require('../controllers/teacher.controller');


TeacherRouter.post('/register', TeacherController.registerTeacher);
TeacherRouter.get('/export/pdf', TeacherController.exportTeachersPdf);


module.exports = TeacherRouter;
