const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FingerPrint = sequelize.define('FingerPrint', {
    serialCode: {
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
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

}, { tableName: "fingerprints", underscored: true, timestamps: true, createdAt: "created_at", updatedAt: 'updated_at' })


module.exports = FingerPrint;