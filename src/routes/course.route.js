const express = require('express');
const coureseRouter = express.Router();
const courseController = require('../controllers/course.controller');
const { authValidate, authorizeRole } = require('../middleware/auth.middleware');

coureseRouter.get('/', (req, res) => {
    res.json({
        message: "Course Service is running"
    })
})


// STRICT | NEED TO BE ADMIN
coureseRouter.post('/new', authValidate, authorizeRole('admin'), courseController.addNewCourse);
coureseRouter.post('/enroll', authValidate, authorizeRole('admin'), courseController.enrollCourse);

module.exports = coureseRouter;