import sequelize from "../config/database";
import { connectCache } from "../config/cache";
import "../models/associations";
import { migrateLegacyGameMedia } from "./legacy-game-media.service";
import {
  ensureMediaStorage,
  hasSupabaseStorageConfigured,
} from "../utils/media-storage";
import { log } from "../utils/logger";
import { startPromotionEmailScheduler } from "./email-events.service";

let initialization: Promise<void> | null = null;

export function initializeBackendRuntime(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      const startedAt = Date.now();
      log("info", "runtime.initialization.started");
      log("info", "runtime.database.connecting");
      await sequelize.authenticate();
      log("info", "runtime.database.connected");
      log("info", "runtime.cache.connecting");
      await connectCache();
      startPromotionEmailScheduler();
      log("info", "runtime.email_scheduler.started");

      if (process.env.VERCEL) {
        if (!hasSupabaseStorageConfigured()) {
          throw new Error("Persistent image storage must be configured for Vercel.");
        }
      } else {
        log("info", "runtime.storage.initializing");
        await ensureMediaStorage();
        await migrateLegacyGameMedia();
      }
      log("info", "runtime.initialization.completed", {
        storage: hasSupabaseStorageConfigured() ? "supabase" : "local",
        durationMs: Date.now() - startedAt,
      });
    })().catch((error: unknown) => {
      log("error", "runtime.initialization.failed", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      initialization = null;
      throw error;
    });
  }

  return initialization;
}
