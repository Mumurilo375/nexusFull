export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export { normalizeCpf, formatCpf, isValidCpf } from "./userForm.cpf.utils";
export {
  getPasswordStrength,
  getPasswordError,
  type PasswordCheck,
  type PasswordStrength,
} from "./userForm.password.utils";
export { buildUserFormData, readImagePreview } from "./userForm.payload.utils";
