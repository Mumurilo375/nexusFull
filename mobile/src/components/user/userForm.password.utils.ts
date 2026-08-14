const PASSWORD_RULES = [
  { label: "Ter pelo menos 8 caracteres", test: (password: string) => password.length >= 8 },
  { label: "Conter letra maiúscula", test: (password: string) => /[A-Z]/.test(password) },
  { label: "Conter letra minúscula", test: (password: string) => /[a-z]/.test(password) },
  { label: "Conter número", test: (password: string) => /\d/.test(password) },
  { label: "Conter caractere especial", test: (password: string) => /[^a-zA-Z0-9]/.test(password) },
];

export function getPasswordError(password: string): string | null {
  const missingRule = PASSWORD_RULES.find((rule) => !rule.test(password));

  return missingRule
    ? `A senha ainda não atende o critério: ${missingRule.label}.`
    : null;
}
