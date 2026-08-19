'use strict';

const { games } = require('./data/games_seed_25.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const categoryNames = [
      ...new Set(games.flatMap((game) => game.categories.map((category) => category.name.trim()))),
    ];

    await queryInterface.bulkInsert(
      'categories',
      categoryNames.map((name, index) => ({ id: index + 1, name })),
      {},
    );
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE(MAX(id), 1)) FROM categories;",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
