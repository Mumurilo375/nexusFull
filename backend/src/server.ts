if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  require("dotenv").config({
    path: require("path").resolve(process.cwd(), "../.env"),
    override: false,
  });
}
import app from "./app";
import { initializeBackendRuntime } from "./services/runtime.service";
import { log } from "./utils/logger";

const port = Number(process.env.PORT ?? 3000);

if (!process.env.VERCEL) {
  void initializeBackendRuntime()
    .then(() => {
      app.listen(port, () => {
        log("info", "server.started", { port });
      });
    })
    .catch((error: unknown) => {
      log("error", "server.startup_failed", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      process.exit(1);
    });
}

module.exports = app;
