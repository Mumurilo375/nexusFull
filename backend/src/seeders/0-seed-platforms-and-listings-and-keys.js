'use strict';

const { games } = require('./data/games_seed_25.json');

const platforms = [
  { id: 1, name: 'Steam', slug: 'steam' },
  { id: 2, name: 'PlayStation', slug: 'playstation' },
  { id: 3, name: 'Xbox', slug: 'xbox' },
  { id: 4, name: 'Nintendo Switch', slug: 'nintendo-switch' },
];

function buildPrice(gameId, platformId) {
  const platformAdjustment = { 1: 0, 2: 20, 3: 10, 4: 15 }[platformId];
  return Number((69.9 + ((gameId - 1) % 10) * 10 + platformAdjustment).toFixed(2));
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const now = new Date();
      await queryInterface.bulkInsert(
        'platforms',
        platforms.map((platform) => ({
          ...platform,
          icon_url: null,
          is_active: true,
          created_at: now,
          updated_at: now,
        })),
        { transaction },
      );

      const titles = games.map((game) => game.title);
      const gameRows = await queryInterface.sequelize.query(
        'SELECT id, title FROM games WHERE title IN (:titles)',
        {
          replacements: { titles },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const gameIdByTitle = new Map(gameRows.map((game) => [game.title, Number(game.id)]));

      if (gameIdByTitle.size !== games.length) {
        throw new Error('Nem todos os jogos do catálogo foram encontrados para criar as listagens.');
      }

      const listings = [];
      const keys = [];
      let listingId = 1;
      let keyId = 1;

      for (const game of games) {
        const gameId = gameIdByTitle.get(game.title);
        const usedPlatformIds = new Set();

        for (const platform of game.platforms) {
          const platformId = Number(platform.platformId);
          if (![1, 2, 3, 4].includes(platformId) || usedPlatformIds.has(platformId)) {
            throw new Error(`Plataforma inválida ou duplicada em ${game.title}.`);
          }
          usedPlatformIds.add(platformId);

          listings.push({
            id: listingId,
            game_id: gameId,
            platform_id: platformId,
            price: buildPrice(gameId, platformId),
            is_active: platform.isActive !== false,
            created_at: now,
            updated_at: now,
          });

          // O estoque é derivado destas keys; não existe coluna de estoque na listing.
          for (let position = 1; position <= 5; position += 1) {
            keys.push({
              id: keyId,
              listing_id: listingId,
              key_value: `NEXUS-SEED-G${gameId}-P${platformId}-K${position}`,
              status: 'available',
              reserved_at: null,
              sold_at: null,
              created_at: now,
            });
            keyId += 1;
          }

          listingId += 1;
        }
      }

      await queryInterface.bulkInsert('game_platform_listings', listings, { transaction });
      await queryInterface.bulkInsert('game_keys', keys, { transaction });
      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('platforms', 'id'), COALESCE(MAX(id), 1)) FROM platforms;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('game_platform_listings', 'id'), COALESCE(MAX(id), 1)) FROM game_platform_listings;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('game_keys', 'id'), COALESCE(MAX(id), 1)) FROM game_keys;",
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('game_keys', null, {});
    await queryInterface.bulkDelete('game_platform_listings', null, {});
    await queryInterface.bulkDelete('platforms', null, {});
  },
};
