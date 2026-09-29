import express from "express";
import AuthController from "../../src/controllers/auth.controller";
import { errorMiddleware } from "../../src/middlewares/error.middleware";

it("encaminha erros de controllers assíncronos ao middleware de erro", async () => {
  const app = express();
  app.use(express.json());
  app.post("/login", AuthController.login);
  app.use(errorMiddleware);

  const server = app.listen(0);
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Porta indisponível");

    const response = await fetch(`http://127.0.0.1:${address.port}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "inválido", password: "senha" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  } finally {
    server.close();
  }
});
