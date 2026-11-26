import app from "./app";
import { log } from "./logger";

async function start() {
  const port = Number(process.env.PAYMENTS_PORT ?? 3002);
  log("info", "server.starting", { port, sandbox: process.env.MERCADO_PAGO_SANDBOX === "true", credentialsConfigured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.MERCADO_PAGO_WEBHOOK_SECRET), internalSecretConfigured: (process.env.PAYMENTS_SERVICE_SECRET ?? "").length >= 32 });
  const server = app.listen(port, () => {
    log("info", "server.started", { port });
  });
  const stop = () => {
    log("info", "server.stopping");
    server.close(() => { log("info", "server.stopped"); process.exit(0); });
  };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
}

void start().catch((error: unknown) => {
  log("error", "server.startup_failed", {
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  process.exit(1);
});
