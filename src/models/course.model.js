const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    courseCode: {
        type: DataTypes.STRING(100),
        allowNull: false,
    }
}, {
    tableName: "courses",
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

module.exports = Course;