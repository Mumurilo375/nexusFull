import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_CHANGED_EVENT,
  clearAuth,
  getAuthUser,
  getToken,
  isAdminUser,
  isAuthenticated,
  saveAuth,
} from "../../services/auth";

describe("autenticação no localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("salva e lê dados", () => {
    saveAuth("token-123", { id: 1, email: "a@a.com", username: "user" });

    expect(getToken()).toBe("token-123");
    expect(getAuthUser()).toEqual({ id: 1, email: "a@a.com", username: "user" });
    expect(isAuthenticated()).toBe(true);
  });

  it("remove o usuário quando não recebe user", () => {
    saveAuth("token-123", null);

    expect(getToken()).toBe("token-123");
    expect(getAuthUser()).toBeNull();
  });

  it("limpa tudo", () => {
    saveAuth("token-123", { id: 2, email: "b@b.com", username: "admin", isAdmin: true });
    clearAuth();

    expect(getToken()).toBeNull();
    expect(getAuthUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("identifica admin", () => {
    saveAuth("token-123", { id: 2, email: "b@b.com", username: "admin", isAdmin: true });
    expect(isAdminUser()).toBe(true);

    saveAuth("token-123", { id: 3, email: "c@c.com", username: "user", isAdmin: false });
    expect(isAdminUser()).toBe(false);
  });

  it("avisa quando muda", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    saveAuth("token", { id: 1, email: "a@a.com", username: "x" });

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    expect((dispatchSpy.mock.calls[0][0] as Event).type).toBe(AUTH_CHANGED_EVENT);
  });
});
