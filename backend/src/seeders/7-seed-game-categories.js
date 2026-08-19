'use strict';

const { games } = require('./data/games_seed_25.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const titles = games.map((game) => game.title);
      const categoryNames = [
        ...new Set(games.flatMap((game) => game.categories.map((category) => category.name))),
      ];
      const tagNames = [
        ...new Set(games.flatMap((game) => game.tags.map((tag) => tag.name))),
      ];

      const gameRows = await queryInterface.sequelize.query(
        'SELECT id, title FROM games WHERE title IN (:titles)',
        {
          replacements: { titles },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const categoryRows = await queryInterface.sequelize.query(
        'SELECT id, name FROM categories WHERE name IN (:categoryNames)',
        {
          replacements: { categoryNames },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const tagRows = await queryInterface.sequelize.query(
        'SELECT id, name FROM tags WHERE name IN (:tagNames)',
        {
          replacements: { tagNames },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const gameIdByTitle = new Map(gameRows.map((row) => [row.title, Number(row.id)]));
      const categoryIdByName = new Map(categoryRows.map((row) => [row.name, Number(row.id)]));
      const tagIdByName = new Map(tagRows.map((row) => [row.name, Number(row.id)]));

      if (
        gameIdByTitle.size !== titles.length ||
        categoryIdByName.size !== categoryNames.length ||
        tagIdByName.size !== tagNames.length
      ) {
        throw new Error('Jogos, categorias ou tags necessários para os vínculos estão ausentes.');
      }

      const now = new Date();
      const gameCategories = [];
      const gameTags = [];
      const gameImages = [];

      for (const game of games) {
        const gameId = gameIdByTitle.get(game.title);

        for (const category of game.categories) {
          gameCategories.push({
            game_id: gameId,
            category_id: categoryIdByName.get(category.name),
          });
        }

        for (const tag of game.tags) {
          gameTags.push({
            game_id: gameId,
            tag_id: tagIdByName.get(tag.name),
          });
        }

        for (const image of game.images) {
          if (typeof image.imageUrl !== 'string' || image.imageUrl.length > 500) {
            throw new Error(`URL de galeria inválida em ${game.title}.`);
          }
          if (!Number.isInteger(image.sortOrder) || image.sortOrder < 0) {
            throw new Error(`Ordem de imagem inválida em ${game.title}.`);
          }

          gameImages.push({
            game_id: gameId,
            image_url: image.imageUrl,
            sort_order: image.sortOrder,
            created_at: now,
            updated_at: now,
          });
        }
      }

      await queryInterface.bulkInsert('game_categories', gameCategories, { transaction });
      await queryInterface.bulkInsert('game_tags', gameTags, { transaction });
      await queryInterface.bulkInsert('game_images', gameImages, { transaction });
      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('game_images', 'id'), COALESCE(MAX(id), 1)) FROM game_images;",
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('game_images', null, {});
    await queryInterface.bulkDelete('game_tags', null, {});
    await queryInterface.bulkDelete('game_categories', null, {});
  },
};
