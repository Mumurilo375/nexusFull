import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const loggingEnabled = process.env.DB_LOGGING === "true";
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.DB_URL;

function readRequiredEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  throw new Error(`Missing required environment variable: ${names.join(" or ")}`);
}

function shouldUseSsl(): boolean {
  if (process.env.DB_SSL === "true") {
    return true;
  }

  if (process.env.NODE_ENV === "production" && databaseUrl) {
    return true;
  }

  return false;
}

const sequelizeOptions = {
  dialect: "postgres" as const,
  logging: loggingEnabled ? console.log : false,
  define: {
    underscored: true,
  },
  dialectOptions: shouldUseSsl()
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, sequelizeOptions)
  : new Sequelize(
      readRequiredEnv(["PGDATABASE", "DB_NAME"]),
      readRequiredEnv(["PGUSER", "DB_USER"]),
      readRequiredEnv(["PGPASSWORD", "DB_PASSWORD"]),
      {
        ...sequelizeOptions,
        host: readRequiredEnv(["PGHOST", "DB_HOST"]),
        port: Number(readRequiredEnv(["PGPORT", "DB_PORT"])),
      },
    );

export default sequelize;
