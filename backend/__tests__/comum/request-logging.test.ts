import { Request, Response } from "express";
import { requestLoggingMiddleware } from "../../src/middlewares/request-logging.middleware";

function finishRequest(url: string, statusCode = 200) {
  let finish = () => {};
  const response = {
    locals: {}, statusCode,
    setHeader: jest.fn(),
    on: jest.fn((_event: string, callback: () => void) => { finish = callback; }),
  };
  requestLoggingMiddleware(
    { originalUrl: url, method: "GET" } as Request,
    response as unknown as Response,
    jest.fn(),
  );
  finish();
}

describe("registro de requisições", () => {
  afterEach(() => jest.restoreAllMocks());

  it("registra o caminho completo sem parâmetros da consulta", () => {
    const output = jest.spyOn(console, "info").mockImplementation(() => undefined);
    finishRequest("/games/1/details?token=segredo");
    expect(output).toHaveBeenCalledWith(expect.stringContaining('path="/games/1/details"'));
    expect(output.mock.calls[0][0]).not.toContain("segredo");
  });

  it("omite verificações de saúde bem-sucedidas, mas registra falhas", () => {
    const info = jest.spyOn(console, "info").mockImplementation(() => undefined);
    const error = jest.spyOn(console, "error").mockImplementation(() => undefined);
    finishRequest("/health");
    expect(info).not.toHaveBeenCalled();
    finishRequest("/health", 503);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('path="/health"'));
  });
});
