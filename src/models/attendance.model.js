const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {

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

    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },

    check_time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    check_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM('present', 'absent', 'late'),
        defaultValue: 'present'
    }

}, {
    tableName: "attendances",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
        {
            unique: true,
            fields: ['student_id', 'course_id', 'check_date']
        }
    ]
});

module.exports = Attendance;