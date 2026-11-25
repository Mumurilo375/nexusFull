'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'receive_offers', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.sequelize.query('UPDATE users SET receive_offers = TRUE');
    await queryInterface.addColumn('promotions', 'email_notified_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.sequelize.query(
      'UPDATE promotions SET email_notified_at = NOW() WHERE start_date <= NOW()',
    );
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('promotions', 'email_notified_at');
    await queryInterface.removeColumn('users', 'receive_offers');
  },
};
