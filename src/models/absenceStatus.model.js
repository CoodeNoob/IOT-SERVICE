const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AbsenceStatus = sequelize.define(
  'AbsenceStatus',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('leave'),
      allowNull: false,
      defaultValue: 'leave',
    },
  },
  { tableName: 'absence_statuses', underscored: true, timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' },
);

module.exports = AbsenceStatus;

