'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('promotions');
    if (!columns.email_notified_at) {
      await queryInterface.addColumn('promotions', 'email_notified_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(
      'UPDATE promotions SET email_notified_at = NOW() WHERE start_date <= NOW() AND email_notified_at IS NULL',
    );
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('promotions');
    if (columns.email_notified_at) {
      await queryInterface.removeColumn('promotions', 'email_notified_at');
    }
  },
};
