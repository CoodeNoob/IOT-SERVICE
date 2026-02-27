const express = require('express');
const AuthRouter = express.Router();
const AuthController = require('../controllers/auth.controller');

AuthRouter.post('/student_login', AuthController.StudentLogin);
AuthRouter.post('/teacher_login', AuthController.TeacherLogin);

module.exports = AuthRouter;