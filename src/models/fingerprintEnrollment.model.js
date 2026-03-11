const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FingerprintEnrollment = sequelize.define(
    'FingerprintEnrollment',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        finger_slot: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'canceled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        confirmed_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: 'fingerprint_enrollments',
        underscored: true,
        timestamps: true,
        createdAt: 'requested_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['status', 'requested_at'] },
            { fields: ['student_id', 'status'] },
            { fields: ['finger_slot', 'status'] }
        ]
    }
);

module.exports = FingerprintEnrollment;

