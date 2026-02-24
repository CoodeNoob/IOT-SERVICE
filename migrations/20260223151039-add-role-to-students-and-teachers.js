'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'student'
    });

    await queryInterface.addColumn('teachers', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'teacher'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'role');
    await queryInterface.removeColumn('teachers', 'role');
  }
};
