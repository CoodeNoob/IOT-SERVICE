const express = require('express');
const attendanceRouter = express.Router();
const fingerprintController = require('../controllers/fingerprint.controller');
const attendanceController = require('../controllers/attendance.controller');
const { authValidate, authorizeRole } = require('../middleware/auth.middleware');

// Healthcheck for quick debugging
attendanceRouter.get('/ping', (req, res) => {
  res.status(200).json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

/**
 * ESP8266 endpoint
 * Accepts form-urlencoded payload like: finger_id=3
 */
attendanceRouter.post('/', fingerprintController.receiveFingerprintData);

// Some Arduino sketches use GET with query params.
attendanceRouter.get('/', fingerprintController.receiveFingerprintData);

// Teacher/admin export
attendanceRouter.get('/export', authValidate, authorizeRole('teacher', 'admin'), attendanceController.exportAttendance);
attendanceRouter.post('/export', authValidate, authorizeRole('teacher', 'admin'), attendanceController.exportAttendance);

// Teacher roster for a subject/course
attendanceRouter.get(
  '/fingerprint-roster',
  authValidate,
  authorizeRole('teacher', 'admin'),
  attendanceController.getFingerprintRoster,
);
attendanceRouter.get(
  '/fingerprint/roster',
  authValidate,
  authorizeRole('teacher', 'admin'),
  attendanceController.getFingerprintRoster,
);

// Mark attendance from the web UI (teacher)
attendanceRouter.post(
  '/fingerprint/mark',
  authValidate,
  authorizeRole('teacher', 'admin'),
  attendanceController.markAttendanceByFingerprint,
);

// Records for dashboards
attendanceRouter.get('/records', authValidate, authorizeRole('teacher', 'admin'), attendanceController.listAttendanceRecords);
attendanceRouter.get(
  '/teacher/records',
  authValidate,
  authorizeRole('teacher', 'admin'),
  attendanceController.listAttendanceRecords,
);
attendanceRouter.get(
  '/student/history',
  authValidate,
  authorizeRole('student', 'admin'),
  attendanceController.listStudentAttendanceHistory,
);

attendanceRouter.post(
  '/student/absenteeism',
  authValidate,
  authorizeRole('student', 'admin'),
  attendanceController.getStudentAbsenteeismByDate,
);
attendanceRouter.get(
  '/student/absenteeism',
  authValidate,
  authorizeRole('student', 'admin'),
  attendanceController.getStudentAbsenteeismByDate,
);
attendanceRouter.post(
  '/student/absenteeism/month',
  authValidate,
  authorizeRole('student', 'admin'),
  attendanceController.getStudentAbsenteeismByMonth,
);
attendanceRouter.get(
  '/student/absenteeism/month',
  authValidate,
  authorizeRole('student', 'admin'),
  attendanceController.getStudentAbsenteeismByMonth,
);

// Teacher can set leave/absent override for a date.
attendanceRouter.post(
  '/absence-status',
  authValidate,
  authorizeRole('teacher', 'admin'),
  attendanceController.setAbsenceStatus,
);

// Absentees by date (teacher)
attendanceRouter.post(
  '/teacher/absentees',
  authValidate,
  authorizeRole('teacher', 'admin'),
  attendanceController.getTeacherAbsenteesByDate,
);
attendanceRouter.get(
  '/teacher/absentees',
  authValidate,
  authorizeRole('teacher', 'admin'),
  attendanceController.getTeacherAbsenteesByDate,
);

module.exports = attendanceRouter;
