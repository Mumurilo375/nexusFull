import { describe, expect, it, jest } from "@jest/globals";
import { requirePermission } from "../../src/middlewares/admin.middleware";
import { PERMISSIONS } from "../../src/services/rbac.service";

function makeResponse() {
  return {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

describe("autorização RBAC", () => {
  const middleware = requirePermission(PERMISSIONS.CATALOG_MANAGE);

  it("retorna 401 quando a autenticação não foi executada", () => {
    const response = makeResponse();
    const next = jest.fn();

    middleware({} as never, response as never, next);

    expect(response.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 403 quando a role não concede a permissão", () => {
    const response = makeResponse();
    const next = jest.fn();
    const request = {
      user: { id: 2, email: "cliente@nexus.com", roles: ["customer"], permissions: [] },
    };

    middleware(request as never, response as never, next);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      code: "FORBIDDEN",
      message: "Você não possui a permissão necessária para acessar este recurso",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("autoriza quando uma role concede a permissão exigida", () => {
    const response = makeResponse();
    const next = jest.fn();
    const request = {
      user: {
        id: 1,
        email: "admin@nexus.com",
        roles: ["admin"],
        permissions: [PERMISSIONS.CATALOG_MANAGE],
      },
    };

    middleware(request as never, response as never, next);

    expect(response.statusCode).toBe(200);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
