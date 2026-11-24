import app from "./app";
import { startCheckoutWorker } from "./checkout-queue";

const stopWorker = startCheckoutWorker();
process.once("SIGTERM", () => { stopWorker(); process.exit(0); });
process.once("SIGINT", () => { stopWorker(); process.exit(0); });

app.listen(Number(process.env.PAYMENTS_PORT ?? 3002), () => {
  console.log("Serviço de pagamentos iniciado.");
});
