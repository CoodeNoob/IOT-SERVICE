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

module.exports = fingerprintRouter;
