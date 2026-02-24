const express = require('express');
const StudentRouter = express.Router();
const StudentController = require('../controllers/student.controller');

StudentRouter.post('/register', StudentController.RegisterStudent);

module.exports = StudentRouter;