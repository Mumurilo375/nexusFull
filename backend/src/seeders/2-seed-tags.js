'use strict';

const { games } = require('./data/games_seed_25.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tagNames = [
      ...new Set(games.flatMap((game) => game.tags.map((tag) => tag.name.trim()))),
    ];

    await queryInterface.bulkInsert(
      'tags',
      tagNames.map((name, index) => ({ id: index + 1, name })),
      {},
    );
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('tags', 'id'), COALESCE(MAX(id), 1)) FROM tags;",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tags', null, {});
  },
};
