const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentCourse = sequelize.define('StudentCourse', {
    serial_code: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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

},
    {
        tableName: "studentcourses",
        underscored: true,
        timestamps: true,
        createdAt: "enrolled_at",
        updatedAt: "updated_at"
    })


module.exports = StudentCourse;