const { FingerprintEnrollment, FingerPrint, Student, sequelize } = require('../models');

async function requestEnrollment({ studentId, fingerSlot }) {
    const student = await Student.findByPk(studentId);
    if (!student) {
        throw new Error('Student not found');
    }

    const slot = Number(fingerSlot);
    if (fingerSlot !== undefined && (!Number.isInteger(slot) || slot <= 0)) {
        throw new Error('Invalid finger slot');
    }

    return sequelize.transaction(async (transaction) => {
        let assignedSlot = slot;

        if (!assignedSlot) {
            const [maxAssigned, maxPending] = await Promise.all([
                FingerPrint.max('finger_slot', { transaction }),
                FingerprintEnrollment.max('finger_slot', {
                    where: { status: 'pending' },
                    transaction
                })
            ]);

            assignedSlot = Math.max(Number(maxAssigned) || 0, Number(maxPending) || 0) + 1;
        }

        const existingAssigned = await FingerPrint.findOne({
            where: { finger_slot: assignedSlot, is_active: true },
            transaction
        });
        if (existingAssigned) {
            throw new Error('Finger slot is already assigned');
        }

        const existingPending = await FingerprintEnrollment.findOne({
            where: { finger_slot: assignedSlot, status: 'pending' },
            transaction
        });
        if (existingPending) {
            throw new Error('Finger slot is already pending');
        }

        await FingerprintEnrollment.update(
            { status: 'canceled' },
            {
                where: {
                    student_id: studentId,
                    status: 'pending'
                },
                transaction
            }
        );

        return FingerprintEnrollment.create(
            {
                student_id: studentId,
                finger_slot: assignedSlot,
                status: 'pending'
            },
            { transaction }
        );
    });
}

async function getOldestPendingEnrollment() {
    return FingerprintEnrollment.findOne({
        where: { status: 'pending' },
        order: [['requested_at', 'ASC']]
    });
}

async function confirmEnrollment({ fingerSlot }) {
    const slot = Number(fingerSlot);
    if (!Number.isInteger(slot) || slot <= 0) {
        throw new Error('Invalid finger slot');
    }

    return sequelize.transaction(async (transaction) => {
        const pending = await FingerprintEnrollment.findOne({
            where: { finger_slot: slot, status: 'pending' },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!pending) {
            throw new Error('No pending enrollment for this slot');
        }

        const existingAssigned = await FingerPrint.findOne({
            where: { finger_slot: slot, is_active: true },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (existingAssigned) {
            await FingerprintEnrollment.update(
                { status: 'canceled' },
                { where: { id: pending.id }, transaction }
            );
            throw new Error('Finger slot is already assigned');
        }

        const fingerprint = await FingerPrint.create(
            {
                student_id: pending.student_id,
                finger_slot: slot,
                is_active: true
            },
            { transaction }
        );

        await FingerprintEnrollment.update(
            { status: 'confirmed', confirmed_at: new Date() },
            { where: { id: pending.id }, transaction }
        );

        return { pending, fingerprint };
    });
}

async function cancelEnrollment({ studentId }) {
    const id = Number(studentId);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid student id');
    }

    await FingerprintEnrollment.update(
        { status: 'canceled' },
        { where: { student_id: id, status: 'pending' } }
    );

    return true;
}

module.exports = {
    requestEnrollment,
    getOldestPendingEnrollment,
    confirmEnrollment,
    cancelEnrollment
};

