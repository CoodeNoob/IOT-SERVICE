const Response = require('../utils/ApiResponses');
const { Op } = require('sequelize');
const { Attendance, Student, Course, FingerPrint, AbsenceStatus } = require('../models');
const fingerprintService = require('../services/fingerprint.service');
const { buildSimplePdfFromLines } = require('../utils/simplePdf');

function normalizeCourseSelector(obj) {
  return {
    courseId: obj?.courseId ?? obj?.course_id ?? obj?.course,
    courseName: obj?.courseName ?? obj?.course_name ?? obj?.subject ?? obj?.subject_name,
    courseCode: obj?.courseCode ?? obj?.course_code,
  };
}

function normalizeDate(obj) {
  return obj?.date ?? obj?.check_date ?? obj?.checkDate;
}

function normalizeFingerprintId(obj) {
  return obj?.fingerprintId ?? obj?.fingerprint_id ?? obj?.finger_id ?? obj?.finger_slot ?? obj?.id;
}

function isPresentLikeStatus(value) {
  const raw = value === null || value === undefined ? '' : String(value);
  const normalized = raw.trim().toLowerCase().replaceAll('_', ' ').replaceAll('-', ' ');
  return normalized === 'present' || normalized === 'late' || normalized === 'serious late';
}

function toLocalDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toLocalTime(now = new Date()) {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function csvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function resolveCourseId({ courseId, courseName, courseCode }) {
  const numeric = courseId !== undefined && courseId !== null ? Number(courseId) : null;
  if (Number.isInteger(numeric) && numeric > 0) return numeric;

  const name = courseName ? String(courseName).trim() : '';
  const code = courseCode ? String(courseCode).trim() : '';

  if (!name && !code) return null;

  let course = null;

  if (code) {
    course = await Course.findOne({ where: { courseCode: code } });
    if (!course) {
      course = await Course.findOne({ where: { courseCode: { [Op.like]: code } } });
    }
  }

  if (!course && name) {
    course = await Course.findOne({ where: { courseName: name } });
    if (!course) {
      course = await Course.findOne({ where: { courseName: { [Op.like]: name } } });
    }
  }

  return course?.id ?? null;
}

async function exportAttendance(req, res) {
  try {
    const source = req.method === 'POST' ? req.body : req.query;
    const courseSelector = normalizeCourseSelector(source);
    const rawDate = normalizeDate(source);
    const format = String(source?.format || 'pdf').toLowerCase();

    const courseId = await resolveCourseId(courseSelector);
    if (!courseId) {
      return Response.error(res, 'course_id (number) or courseName/courseCode is required', 400);
    }

    const where = { course_id: courseId };
    if (rawDate) {
      const dateStr = String(rawDate);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return Response.error(res, 'date must be YYYY-MM-DD', 400);
      }
      where.check_date = dateStr;
    }

    const rows = await Attendance.findAll({
      where,
      include: [
        { model: Student, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode'] },
      ],
      order: [
        ['check_date', 'ASC'],
        ['check_time', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    if (format === 'csv') {
      const header = [
        'attendance_id',
        'check_date',
        'check_time',
        'status',
        'student_id',
        'student_name',
        'student_email',
        'course_id',
        'course_name',
        'course_code',
      ].join(',');

      const lines = [header];
      for (const r of rows) {
        lines.push(
          [
            csvCell(r.id),
            csvCell(r.check_date),
            csvCell(r.check_time),
            csvCell(r.status),
            csvCell(r.student?.id),
            csvCell(r.student?.name),
            csvCell(r.student?.email),
            csvCell(r.course?.id),
            csvCell(r.course?.courseName),
            csvCell(r.course?.courseCode),
          ].join(','),
        );
      }

      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
      return res.status(200).send(csv);
    }

    const now = new Date();
    const headerDate = now.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
    const courseName = rows[0]?.course?.courseName || String(courseSelector.courseName || '');
    const courseCode = rows[0]?.course?.courseCode || String(courseSelector.courseCode || '');

    const pdfLines = [
      `Attendance Export (${headerDate})`,
      `Course: ${courseId} ${courseName} ${courseCode}`.trim(),
      rawDate ? `Date: ${String(rawDate)}` : 'Date: (all)',
      '',
      'Date | Time | Status | Student ID | Student Name | Student Email',
      '------------------------------------------------------------------',
    ];

    for (const r of rows) {
      pdfLines.push(
        `${r.check_date} | ${r.check_time} | ${r.status} | ${r.student?.id ?? ''} | ${r.student?.name ?? ''} | ${r.student?.email ?? ''}`,
      );
    }

    const pdfBuffer = buildSimplePdfFromLines(pdfLines);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance.pdf"');
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return Response.error(res, error.message, 500);
  }
}

async function getFingerprintRoster(req, res) {
  try {
    const source = req.method === 'POST' ? req.body : req.query;
    const courseSelector = normalizeCourseSelector(source);

    const courseId = await resolveCourseId(courseSelector);
    if (!courseId) {
      return Response.error(res, 'course_id (number) or courseName/courseCode is required', 400);
    }

    const course = await Course.findByPk(courseId, {
      attributes: ['id', 'courseName', 'courseCode'],
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
          include: [
            {
              model: FingerPrint,
              as: 'fingerprints',
              attributes: ['serialCode', 'finger_slot', 'is_active'],
              where: { is_active: true },
              required: false,
            },
          ],
        },
      ],
    });

    let rosterStudents = course?.students ?? [];

    if (rosterStudents.length === 0) {
      const distinctRows = await Attendance.findAll({
        where: { course_id: courseId },
        attributes: ['student_id'],
        group: ['student_id'],
      });

      const studentIds = distinctRows
        .map((r) => Number(r.student_id))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (studentIds.length > 0) {
        rosterStudents = await Student.findAll({
          where: { id: { [Op.in]: studentIds } },
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: FingerPrint,
              as: 'fingerprints',
              attributes: ['serialCode', 'finger_slot', 'is_active'],
              where: { is_active: true },
              required: false,
            },
          ],
        });
      }
    }

    const roster = rosterStudents.map((s) => {
      const fp = (s.fingerprints ?? [])[0];
      const fpId = fp?.finger_slot ?? fp?.serialCode ?? null;
      return {
        name: s.name,
        rollNumber: String(s.id),
        fingerprintId: fpId !== null ? String(fpId) : String(s.id),
      };
    });

    return Response.success(res, roster, 'Roster loaded', 200);
  } catch (error) {
    return Response.error(res, error.message, 500);
  }
}

async function markAttendanceByFingerprint(req, res) {
  try {
    const fingerprintIdRaw = normalizeFingerprintId(req.body);
    const fingerprintId = Number(fingerprintIdRaw);

    if (!Number.isInteger(fingerprintId) || fingerprintId < 0) {
      return Response.error(res, 'Invalid fingerprint ID', 400);
    }

    const courseSelector = normalizeCourseSelector(req.body);
    const courseId = await resolveCourseId(courseSelector);
    if (!courseId) {
      return Response.error(res, 'course_id (number) or courseName/courseCode is required', 400);
    }

    const fingerprint = await fingerprintService.findActiveFingerprintById(fingerprintId);
    if (!fingerprint || !fingerprint.student) {
      return Response.error(res, 'Fingerprint not found', 404);
    }

    const now = new Date();
    const checkDate = toLocalDate(now);
    const checkTime = toLocalTime(now);

    const { attendance, created } = await fingerprintService.recordAttendance({
      studentId: fingerprint.student.id,
      courseId,
      checkDate,
      checkTime,
    });

    return Response.success(
      res,
      {
        attendance: {
          id: attendance.id,
          student_id: attendance.student_id,
          course_id: attendance.course_id,
          check_date: attendance.check_date,
          check_time: attendance.check_time,
          status: attendance.status,
        },
      },
      created ? 'Attendance recorded' : 'Attendance already recorded for today',
      200,
    );
  } catch (error) {
    return Response.error(res, error.message, 500);
  }
}

module.exports = {
  exportAttendance,
  getFingerprintRoster,
  markAttendanceByFingerprint,
  getTeacherAbsenteesByDate,
  setAbsenceStatus,
  listAttendanceRecords,
  listStudentAttendanceHistory,
};

async function setAbsenceStatus(req, res) {
  try {
    const source = req.body ?? {};
    const courseSelector = normalizeCourseSelector(source);
    const rawDate = normalizeDate(source);

    const dateStr = rawDate ? String(rawDate) : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return Response.error(res, 'date must be YYYY-MM-DD', 400);
    }

    const courseId = await resolveCourseId(courseSelector);
    if (!courseId) {
      return Response.error(res, 'course_id (number) or courseName/courseCode is required', 400);
    }

    const studentIdRaw =
      source?.studentId ??
      source?.student_id ??
      source?.rollNumber ??
      source?.roll_number ??
      source?.userId ??
      source?.user_id;
    const studentId = Number(studentIdRaw);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return Response.error(res, 'Invalid student id', 400);
    }

    const rawStatus = String(source?.status ?? '').trim().toLowerCase();
    const status = rawStatus === 'leave' ? 'leave' : 'absent';

    if (status === 'leave') {
      await AbsenceStatus.upsert({
        student_id: studentId,
        course_id: courseId,
        check_date: dateStr,
        status: 'leave',
      });
      return Response.success(
        res,
        { student_id: studentId, course_id: courseId, check_date: dateStr, status: 'leave' },
        'Leave saved',
        200,
      );
    }

    await AbsenceStatus.destroy({
      where: { student_id: studentId, course_id: courseId, check_date: dateStr },
    });
    return Response.success(
      res,
      { student_id: studentId, course_id: courseId, check_date: dateStr, status: 'absent' },
      'Absence saved',
      200,
    );
  } catch (error) {
    return Response.error(res, error.message, 500);
  }
}

async function getTeacherAbsenteesByDate(req, res) {
  try {
    const source = req.method === 'POST' ? req.body : req.query;
    const courseSelector = normalizeCourseSelector(source);
    const rawDate = normalizeDate(source);

    const dateStr = rawDate ? String(rawDate) : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return Response.error(res, 'date must be YYYY-MM-DD', 400);
    }

    const courseId = await resolveCourseId(courseSelector);
    if (!courseId) {
      return Response.error(res, 'course_id (number) or courseName/courseCode is required', 400);
    }

    const course = await Course.findByPk(courseId, {
      attributes: ['id', 'courseName', 'courseCode'],
      include: [{ model: Student, as: 'students', attributes: ['id', 'name'] }],
    });

    let roster = (course?.students ?? []).map((student) => ({
      id: student.id,
      name: student.name,
      rollNumber: String(student.id),
    }));

    if (roster.length === 0) {
      const distinctRows = await Attendance.findAll({
        where: { course_id: courseId },
        attributes: ['student_id'],
        group: ['student_id'],
      });

      const studentIds = distinctRows
        .map((r) => Number(r.student_id))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (studentIds.length > 0) {
        const students = await Student.findAll({
          where: { id: { [Op.in]: studentIds } },
          attributes: ['id', 'name'],
        });
        roster = students.map((student) => ({ id: student.id, name: student.name, rollNumber: String(student.id) }));
      }
    }

    const rows = await Attendance.findAll({
      where: { course_id: courseId, check_date: dateStr },
      attributes: ['id', 'student_id', 'status'],
      order: [
        ['check_time', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    const presentLikeStudentIds = new Set();
    for (const row of rows) {
      if (isPresentLikeStatus(row.status)) {
        presentLikeStudentIds.add(String(row.student_id));
      }
    }

    const subject = course?.courseName ?? courseSelector.courseName ?? '';
    const absentees = roster
      .filter((student) => !presentLikeStudentIds.has(String(student.id)))
      .map((student) => ({
        studentName: student.name,
        rollNumber: student.rollNumber,
        subject,
        date: dateStr,
        status: 'absent',
      }));

    if (absentees.length > 0) {
      const absenteeIds = absentees
        .map((row) => Number(row.rollNumber))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (absenteeIds.length > 0) {
        const overrides = await AbsenceStatus.findAll({
          where: {
            course_id: courseId,
            check_date: dateStr,
            student_id: { [Op.in]: absenteeIds },
          },
          attributes: ['student_id', 'status'],
        });

        const overrideByStudent = new Map(overrides.map((o) => [String(o.student_id), String(o.status)]));
        for (const row of absentees) {
          if (overrideByStudent.get(String(row.rollNumber)) === 'leave') {
            row.status = 'leave';
          }
        }
      }
    }

    return Response.success(res, absentees, 'Absentees loaded', 200);
  } catch (error) {
    return Response.error(res, error.message, 500);
  }
}

async function listAttendanceRecords(req, res) {
  try {
    const source = req.method === 'POST' ? req.body : req.query;
    const courseSelector = normalizeCourseSelector(source);
    const rawDate = normalizeDate(source);

    const courseId = await resolveCourseId(courseSelector);

    const where = {};
    if (courseId) {
      where.course_id = courseId;
    }

    if (rawDate) {
      const dateStr = String(rawDate);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return Response.error(res, 'date must be YYYY-MM-DD', 400);
      }
      where.check_date = dateStr;
    }

    const rows = await Attendance.findAll({
      where,
      include: [
        { model: Student, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode'] },
      ],
      order: [
        ['check_date', 'DESC'],
        ['check_time', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    const records = rows.map((r) => ({
      id: r.id,
      student_id: r.student_id,
      student_name: r.student?.name ?? '',
      roll_number: String(r.student?.id ?? r.student_id ?? ''),
      course_id: r.course_id,
      subject: r.course?.courseName ?? '',
      course_name: r.course?.courseName ?? '',
      course_code: r.course?.courseCode ?? '',
      check_date: r.check_date,
      check_time: r.check_time,
      status: r.status,
      created_at: r.created_at,
    }));

    return Response.success(res, records, 'Attendance records loaded', 200);
  } catch (error) {
    return Response.error(res, error.message, 500);
  }
}

async function listStudentAttendanceHistory(req, res) {
  try {
    const studentId = Number(req?.user?.id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return Response.error(res, 'Invalid student id', 400);
    }

    const rows = await Attendance.findAll({
      where: { student_id: studentId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode'] }],
      order: [
        ['check_date', 'DESC'],
        ['check_time', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    const records = rows.map((r) => ({
      id: r.id,
      student_id: r.student_id,
      subject: r.course?.courseName ?? '',
      course_name: r.course?.courseName ?? '',
      course_code: r.course?.courseCode ?? '',
      check_date: r.check_date,
      check_time: r.check_time,
      status: r.status,
      created_at: r.created_at,
    }));

    return Response.success(res, records, 'Attendance history loaded', 200);
  } catch (error) {
    return Response.error(res, error.message, 500);
  }
}
