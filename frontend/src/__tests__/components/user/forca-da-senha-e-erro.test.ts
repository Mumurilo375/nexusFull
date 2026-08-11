import { describe, expect, it } from "vitest";
import { getPasswordError, getPasswordStrength } from "../../../components/user/userForm.password.utils";

describe("senha", () => {
  it.each([
    ["", "Pendente", 0, false],
    ["abc", "Fraca", 20, false],
    ["Abcdef12", "Média", 80, false],
    ["SenhaForte123!", "Forte", 100, true],
  ])("classifica %s", (password, label, percent, isStrong) => {
    const result = getPasswordStrength(password);

    expect(result.strengthLabel).toBe(label);
    expect(result.percent).toBe(percent);
    expect(result.isStrong).toBe(isStrong);
  });

  it("mostra erro só quando a senha é fraca", () => {
    expect(getPasswordError("abc")).toContain("A senha ainda não atende o critério");
    expect(getPasswordError("SenhaForte123!")).toBeNull();
  });
});
