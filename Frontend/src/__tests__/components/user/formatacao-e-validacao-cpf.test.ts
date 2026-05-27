import { describe, expect, it } from "vitest";
import { formatCpf, isValidCpf, normalizeCpf } from "../../../components/user/userForm.cpf.utils";

describe("CPF", () => {
  it("limpa o formato", () => {
    expect(normalizeCpf("516.038.718-88")).toBe("51603871888");
  });

  it.each([
    ["516", "516"],
    ["516038", "516.038"],
    ["516038718", "516.038.718"],
    ["51603871888", "516.038.718-88"],
  ])("formata %s", (input, expected) => {
    expect(formatCpf(input)).toBe(expected);
  });

  it.each([
    ["516.038.718-88", true],
    ["111.111.111-11", false],
    ["123", false],
  ])("valida %s", (input, expected) => {
    expect(isValidCpf(input)).toBe(expected);
  });
});
