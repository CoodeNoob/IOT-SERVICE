const express = require('express');
const TeacherRouter = express.Router();
const TeacherController = require('../controllers/teacher.controller');


TeacherRouter.post('/register', TeacherController.registerTeacher);


module.exports = TeacherRouter;