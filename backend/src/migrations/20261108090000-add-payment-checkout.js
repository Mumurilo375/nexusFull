'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const fields = {
        payment_reference: { type: Sequelize.UUID, allowNull: true, unique: true },
        checkout_url: { type: Sequelize.TEXT, allowNull: true },
        payment_id: { type: Sequelize.STRING(100), allowNull: true, unique: true },
        payment_expires_at: { type: Sequelize.DATE, allowNull: true },
      };
      for (const [name, definition] of Object.entries(fields)) {
        await queryInterface.addColumn('orders', name, definition, { transaction });
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const name of ['payment_expires_at', 'payment_id', 'checkout_url', 'payment_reference']) {
        await queryInterface.removeColumn('orders', name, { transaction });
      }
    });
  },
};
