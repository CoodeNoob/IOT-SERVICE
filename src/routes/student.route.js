const express = require('express');
const StudentRouter = express.Router();
const StudentController = require('../controllers/student.controller');

// public route
StudentRouter.post('/register', StudentController.RegisterStudent);

// strict


module.exports = StudentRouter;