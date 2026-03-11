const express = require('express');
const fingerprintRouter = express.Router();
const fingerprintController = require('../controllers/fingerprint.controller');

/**
 * @swagger
 * /fingerprint/scan:
 *   post:
 *     summary: Accept fingerprint ID from Arduino and resolve student
 *     tags: [Fingerprint]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fingerprintId:
 *                 type: integer
 *                 example: 3
 *               fingerprint_id:
 *                 type: integer
 *                 example: 3
 *               finger_slot:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Fingerprint accepted
 *       404:
 *         description: Fingerprint not found
 */
fingerprintRouter.post('/scan', fingerprintController.scanFingerprint);

// Register student_id + finger_slot mapping (also supports { student_id, finger_id }).
fingerprintRouter.post('/register', fingerprintController.registerFingerprint);

// Enrollment flow for Arduino firmware polling (Get_Fingerid / confirm_id).
fingerprintRouter.post('/enroll/request', fingerprintController.requestFingerprintEnrollment);
fingerprintRouter.get('/enroll/pending', fingerprintController.getPendingFingerprintEnrollment);
fingerprintRouter.post('/enroll/cancel', fingerprintController.cancelFingerprintEnrollment);

// Legacy device endpoint: POST /fingerprint (form-urlencoded) and /api/attendance
fingerprintRouter.post('/', fingerprintController.receiveFingerprintData);
// Browser/health-check convenience endpoint
fingerprintRouter.get('/', (req, res) => {
    res.status(200).json({ ok: true, route: '/fingerprint' });
});

module.exports = fingerprintRouter;
