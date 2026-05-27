import { describe, expect, it } from "vitest";
import { getApiErrorMessage, translateErrorMessage } from "../../services/http";

describe("mensagens de erro da API", () => {
  it.each([
    ["Invalid email or password", "fallback", 401, "INVALID_CREDENTIALS", "Email ou senha incorretos."],
    ["", "fallback", 404, undefined, "Não encontramos o conteúdo que você tentou acessar."],
    ["", "mensagem fallback", undefined, undefined, "mensagem fallback"],
  ])("traduz %s", (message, fallback, status, code, expected) => {
    expect(translateErrorMessage(message, fallback, status, code)).toBe(expected);
  });

  it("traduz erro do axios e Error comum", () => {
    const axiosError = {
      isAxiosError: true,
      message: "Request failed with status code 401",
      response: { status: 401, data: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
    };

    expect(getApiErrorMessage(axiosError, "fallback")).toContain("Sua sessão expirou");
    expect(getApiErrorMessage(new Error("Network Error"), "fallback")).toContain("Não foi possível se conectar");
  });
});
