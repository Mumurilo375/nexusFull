'use strict';

const { games } = require('./data/games_seed_25.json');

const EXPECTED_GAME_COUNT = 25;

function validateCatalog() {
  if (!Array.isArray(games) || games.length !== EXPECTED_GAME_COUNT) {
    throw new Error(`O catálogo deve conter exatamente ${EXPECTED_GAME_COUNT} jogos.`);
  }

  const titles = new Set();
  for (const game of games) {
    const requiredTextFields = [
      'title',
      'description',
      'longDescription',
      'releaseDate',
      'coverImageUrl',
    ];

    for (const field of requiredTextFields) {
      if (typeof game[field] !== 'string' || !game[field].trim()) {
        throw new Error(`Campo obrigatório inválido em games.${field}.`);
      }
    }

    if (titles.has(game.title)) {
      throw new Error(`Título duplicado no catálogo: ${game.title}.`);
    }
    titles.add(game.title);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(game.releaseDate)) {
      throw new Error(`Data inválida para ${game.title}: ${game.releaseDate}.`);
    }

    if (game.title.length > 255 || game.coverImageUrl.length > 500) {
      throw new Error(`Título ou URL de capa excede o limite em ${game.title}.`);
    }

    if (typeof game.isActive !== 'boolean') {
      throw new Error(`isActive deve ser booleano em ${game.title}.`);
    }
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    validateCatalog();

    await queryInterface.sequelize.transaction(async (transaction) => {
      // O catálogo antigo e todos os registros dependentes deixam de ser válidos.
      await queryInterface.sequelize.query(
        'TRUNCATE TABLE "games", "categories", "tags", "platforms" RESTART IDENTITY CASCADE;',
        { transaction },
      );

      const now = new Date();
      const rows = games.map((game, index) => ({
        id: index + 1,
        title: game.title.trim(),
        description: game.description.trim(),
        long_description: game.longDescription.trim(),
        release_date: game.releaseDate,
        cover_image_url: game.coverImageUrl.trim(),
        is_active: game.isActive,
        created_at: now,
        updated_at: now,
      }));

      await queryInterface.bulkInsert('games', rows, { transaction });
      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('games', 'id'), COALESCE(MAX(id), 1)) FROM games;",
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'TRUNCATE TABLE "games", "categories", "tags", "platforms" RESTART IDENTITY CASCADE;',
    );
  },
};
