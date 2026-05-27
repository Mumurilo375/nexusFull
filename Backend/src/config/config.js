require('dotenv').config();

const connectionUrl = process.env.DATABASE_URL || process.env.DB_URL;
const useSsl =
  process.env.DB_SSL === 'true' ||
  (process.env.NODE_ENV === 'production' && Boolean(connectionUrl));

function readRequiredEnv(names) {
  for (const name of names) {
    const value = process.env[name] && process.env[name].trim();
    if (value) {
      return value;
    }
  }

  throw new Error(`Missing required environment variable: ${names.join(' or ')}`);
}

function createConfig() {
  if (connectionUrl) {
    return {
      use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : 'DB_URL',
      dialect: 'postgres',
      dialectOptions: useSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
    };
  }

  return {
    username: readRequiredEnv(['PGUSER', 'DB_USER']),
    password: readRequiredEnv(['PGPASSWORD', 'DB_PASSWORD']),
    database: readRequiredEnv(['PGDATABASE', 'DB_NAME']),
    host: readRequiredEnv(['PGHOST', 'DB_HOST']),
    port: Number(readRequiredEnv(['PGPORT', 'DB_PORT'])),
    dialect: 'postgres',
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
  };
}

module.exports = {
  development: createConfig(),
  production: createConfig(),
};
