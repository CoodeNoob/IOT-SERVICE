const express = require('express');
const coureseRouter = express.Router();
const courseController = require('../controllers/course.controller');

const { authorizeRole } = require('../middleware/auth.middleware');

coureseRouter.get('/', (req, res) => {
    res.json({
        message: "Course Service is running"
    })
})


coureseRouter.post('/new', courseController.addNewCourse);
coureseRouter.post('/enroll', courseController.enrollCourse);


module.exports = coureseRouter;