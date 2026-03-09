const express = require('express');
const attendanceRouter = express.Router();
const fingerprintController = require('../controllers/fingerprint.controller');

/**
 * ESP8266 endpoint
 * Accepts form-urlencoded payload like: finger_id=3
 */
attendanceRouter.post('/', fingerprintController.receiveFingerprintData);

module.exports = attendanceRouter;
