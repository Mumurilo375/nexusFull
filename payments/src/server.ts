import app from "./app";
import { log } from "./logger";

async function start() {
  const port = Number(process.env.PAYMENTS_PORT ?? 3002);
  const server = app.listen(port, () => {
    log("info", "server.started", { port });
  });
  const stop = () => server.close(() => process.exit(0));
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
}

void start().catch((error: unknown) => {
  log("error", "server.startup_failed", {
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  process.exit(1);
});
