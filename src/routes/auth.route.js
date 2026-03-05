const express = require('express');
const AuthRouter = express.Router();
const AuthController = require('../controllers/auth.controller');

/**
 * @swagger
 * /auth/student_login:
 *   post:
 *     summary: Student Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
AuthRouter.post('/student_login', AuthController.StudentLogin);

/**
 * @swagger
 * /auth/teacher_login:
 *   post:
 *     summary: Teacher Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: 
 *                 type: string
 *                 example: teacher@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
AuthRouter.post('/teacher_login', AuthController.TeacherLogin);

module.exports = AuthRouter;