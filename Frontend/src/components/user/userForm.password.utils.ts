export type PasswordCheck = {
  label: string;
  isMet: boolean;
};

type PasswordStrengthLevel = "pending" | "weak" | "medium" | "strong";

type PasswordStrengthVisual = {
  strengthLabel: string;
  strengthTextClass: string;
  strengthBarClass: string;
};

export type PasswordStrength = {
  checks: PasswordCheck[];
  missingChecks: string[];
  percent: number;
  isStrong: boolean;
  strengthLabel: string;
  strengthTextClass: string;
  strengthBarClass: string;
};
// met rules = regras atendidas
const MINIMUM_MEDIUM_RULES = 3;

const PASSWORD_RULES: Array<{ label: string; test: (password: string) => boolean }> = [
  { label: "Ter pelo menos 8 caracteres", test: (password) => password.length >= 8 },
  { label: "Conter letra maiúscula", test: (password) => /[A-Z]/.test(password) },
  { label: "Conter letra minúscula", test: (password) => /[a-z]/.test(password) },
  { label: "Conter número", test: (password) => /\d/.test(password) },
  { label: "Conter caractere especial", test: (password) => /[^a-zA-Z0-9]/.test(password) },
];

const PASSWORD_VISUALS: Record<PasswordStrengthLevel, PasswordStrengthVisual> = {
  pending: {
    strengthLabel: "Pendente",
    strengthTextClass: "text-slate-300",
    strengthBarClass: "bg-slate-600",
  },
  weak: {
    strengthLabel: "Fraca",
    strengthTextClass: "text-rose-300",
    strengthBarClass: "bg-rose-500",
  },
  medium: {
    strengthLabel: "Média",
    strengthTextClass: "text-amber-300",
    strengthBarClass: "bg-amber-500",
  },
  strong: {
    strengthLabel: "Forte",
    strengthTextClass: "text-emerald-300",
    strengthBarClass: "bg-emerald-500",
  },
};

function buildPasswordChecks(password: string): PasswordCheck[] {
  return PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    isMet: rule.test(password),
  }));
}

function getPasswordStrengthLevel(password: string, metRulesCount: number, totalRules: number): PasswordStrengthLevel {
  if (!password) return "pending";
  if (metRulesCount === totalRules) return "strong";
  if (metRulesCount >= MINIMUM_MEDIUM_RULES) return "medium";
  return "weak";
}

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = buildPasswordChecks(password);
  const missingChecks = checks.filter((check) => !check.isMet).map((check) => check.label);
  const totalRules = checks.length;
  const metRulesCount = totalRules - missingChecks.length;
  const percent = password ? Math.round((metRulesCount / totalRules) * 100) : 0;

  const strengthLevel = getPasswordStrengthLevel(password, metRulesCount, totalRules);
  const visual = PASSWORD_VISUALS[strengthLevel];

  return {
    checks,
    missingChecks,
    percent,
    isStrong: strengthLevel === "strong",
    strengthLabel: visual.strengthLabel,
    strengthTextClass: visual.strengthTextClass,
    strengthBarClass: visual.strengthBarClass,
  };
}

export function getPasswordError(password: string): string | null {
  const strength = getPasswordStrength(password);
  const firstMissingCheck = strength.missingChecks[0];

  if (strength.isStrong) return null;
  if (firstMissingCheck) return `A senha ainda não atende o critério: ${firstMissingCheck}.`;

  return "A senha informada é inválida.";
}
