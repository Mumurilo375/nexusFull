import sequelize from "../config/database";
import { connectCache } from "../config/cache";
import "../models/associations";
import { migrateLegacyGameMedia } from "./legacy-game-media.service";
import {
  ensureMediaStorage,
  hasSupabaseStorageConfigured,
} from "../utils/media-storage";

let initialization: Promise<void> | null = null;

export function initializeBackendRuntime(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      await sequelize.authenticate();
      await connectCache();

      if (process.env.VERCEL) {
        if (!hasSupabaseStorageConfigured()) {
          throw new Error("Persistent image storage must be configured for Vercel.");
        }
      } else {
        await ensureMediaStorage();
        await migrateLegacyGameMedia();
      }
    })().catch((error: unknown) => {
      initialization = null;
      throw error;
    });
  }

  return initialization;
}
