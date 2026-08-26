import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_CHANGED_EVENT,
  clearAuth,
  getAuthUser,
  getToken,
  hasPermission,
  isAuthenticated,
  saveAuth,
} from "../../services/auth";

describe("autenticação no localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("salva e lê dados", () => {
    saveAuth("token-123", { id: 1, email: "a@a.com", username: "user", roles: ["customer"], permissions: [] });

    expect(getToken()).toBe("token-123");
    expect(getAuthUser()).toEqual({ id: 1, email: "a@a.com", username: "user", roles: ["customer"], permissions: [] });
    expect(isAuthenticated()).toBe(true);
  });

  it("remove o usuário quando não recebe user", () => {
    saveAuth("token-123", null);

    expect(getToken()).toBe("token-123");
    expect(getAuthUser()).toBeNull();
  });

  it("limpa tudo", () => {
    saveAuth("token-123", { id: 2, email: "b@b.com", username: "admin", roles: ["admin"], permissions: ["admin.access"] });
    clearAuth();

    expect(getToken()).toBeNull();
    expect(getAuthUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("identifica permissões concedidas pelas roles", () => {
    saveAuth("token-123", { id: 2, email: "b@b.com", username: "admin", roles: ["admin"], permissions: ["admin.access"] });
    expect(hasPermission("admin.access")).toBe(true);

    saveAuth("token-123", { id: 3, email: "c@c.com", username: "user", roles: ["customer"], permissions: [] });
    expect(hasPermission("admin.access")).toBe(false);
  });

  it("invalida uma sessão legada sem roles e permissões", () => {
    localStorage.setItem("token", "token-legado");
    localStorage.setItem("authUser", JSON.stringify({
      id: 4,
      email: "legado@nexus.com",
      username: "legado",
      isAdmin: true,
    }));

    expect(getAuthUser()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("avisa quando muda", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    saveAuth("token", { id: 1, email: "a@a.com", username: "x", roles: ["customer"], permissions: [] });

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchSpy.mock.calls[0][0].type).toBe(AUTH_CHANGED_EVENT);
  });
});
