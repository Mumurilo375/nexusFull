import { Request, Response } from "express";
import { requestLoggingMiddleware } from "../../src/middlewares/request-logging.middleware";

function finishRequest(url: string, statusCode = 200, correlationId?: string) {
  let finish = () => {};
  const response = {
    locals: {}, statusCode,
    setHeader: jest.fn(),
    on: jest.fn((_event: string, callback: () => void) => { finish = callback; }),
  };
  requestLoggingMiddleware(
    { originalUrl: url, method: "GET", get: () => correlationId } as unknown as Request,
    response as unknown as Response,
    jest.fn(),
  );
  finish();
  return response;
}

describe("registro de requisições", () => {
  afterEach(() => jest.restoreAllMocks());

  it("registra o caminho completo sem parâmetros da consulta", () => {
    const output = jest.spyOn(console, "info").mockImplementation(() => undefined);
    finishRequest("/games/1/details?token=segredo");
    expect(JSON.parse(output.mock.calls[0][0])).toMatchObject({ path: "/games/1/details", service: "backend" });
    expect(output.mock.calls[0][0]).not.toContain("segredo");
  });

  it("omite verificações de saúde bem-sucedidas, mas registra falhas", () => {
    const info = jest.spyOn(console, "info").mockImplementation(() => undefined);
    const error = jest.spyOn(console, "error").mockImplementation(() => undefined);
    finishRequest("/health");
    expect(info).not.toHaveBeenCalled();
    finishRequest("/health", 503);
    expect(JSON.parse(error.mock.calls[0][0])).toMatchObject({ path: "/health", statusCode: 503 });
  });

  it("aceita correlação válida e substitui valores inválidos", () => {
    jest.spyOn(console, "info").mockImplementation(() => undefined);
    const id = "00b5e632-253b-4ff8-9926-dc88fa123456";
    expect(finishRequest("/games", 200, id).setHeader).toHaveBeenCalledWith("X-Correlation-Id", id);
    expect(finishRequest("/games", 200, "token=segredo").setHeader).not.toHaveBeenCalledWith("X-Correlation-Id", "token=segredo");
  });
});
