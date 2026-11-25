'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_delivery_receipts', {
      notification_id: { type: Sequelize.STRING(255), primaryKey: true, allowNull: false },
      accepted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('email_delivery_receipts');
  },
};
