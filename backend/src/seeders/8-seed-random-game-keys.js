'use strict';

const { randomUUID } = require('node:crypto');
const { Op } = require('sequelize');
const { games } = require('./data/games_seed_25.json');

const KEYS_PER_GAME = 10;
const KEY_PREFIX = 'NEXUS-RANDOM-G';

function createKeyValue(gameId) {
  return `${KEY_PREFIX}${gameId}-${randomUUID().toUpperCase()}`;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const titles = games.map((game) => game.title);
      const gamesWithListings = await queryInterface.sequelize.query(
        `
          SELECT DISTINCT ON (games.id)
            games.id AS game_id,
            game_platform_listings.id AS listing_id
          FROM games
          INNER JOIN game_platform_listings
            ON game_platform_listings.game_id = games.id
          WHERE games.title IN (:titles)
            AND game_platform_listings.is_active = true
          ORDER BY games.id, game_platform_listings.id
        `,
        {
          replacements: { titles },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      if (gamesWithListings.length !== games.length) {
        throw new Error('Nem todos os 25 jogos do catálogo possuem uma listagem ativa para receber keys.');
      }

      const keys = [];
      const now = new Date();

      for (const { game_id: gameId, listing_id: listingId } of gamesWithListings) {
        const prefix = `${KEY_PREFIX}${gameId}-%`;
        const [{ key_count: keyCount }] = await queryInterface.sequelize.query(
          `
            SELECT COUNT(*)::int AS key_count
            FROM game_keys
            WHERE key_value LIKE :prefix
          `,
          {
            replacements: { prefix },
            type: Sequelize.QueryTypes.SELECT,
            transaction,
          },
        );

        const missingKeys = Math.max(KEYS_PER_GAME - Number(keyCount), 0);
        for (let position = 0; position < missingKeys; position += 1) {
          keys.push({
            listing_id: listingId,
            key_value: createKeyValue(gameId),
            status: 'available',
            reserved_at: null,
            sold_at: null,
            created_at: now,
          });
        }
      }

      if (keys.length > 0) {
        await queryInterface.bulkInsert('game_keys', keys, { transaction });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('game_keys', {
      key_value: {
        [Op.like]: `${KEY_PREFIX}%`,
      },
    });
  },
};
