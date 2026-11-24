import app from "./app";

app.listen(Number(process.env.PAYMENTS_PORT ?? 3002), () => {
  console.log("Serviço de pagamentos iniciado.");
});
