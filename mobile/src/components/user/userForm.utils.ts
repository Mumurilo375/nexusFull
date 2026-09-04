export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export { formatCpf, isValidCpf, normalizeCpf } from "./userForm.cpf.utils";
export { getPasswordError } from "./userForm.password.utils";
export {
  buildPasswordFormData,
  buildUserFormData,
  type AvatarFile,
} from "./userForm.payload.utils";
