import { normalizeCpf } from "./userForm.cpf.utils";
import { appendImageFile } from "../../services/image-upload";

export type AvatarFile = {
  uri: string;
  mimeType: string;
  name: string;
  file?: File;
};

type UserFormDataValues = {
  fullName: string;
  username: string;
  cpf: string;
  password?: string;
  avatarFile?: AvatarFile | null;
};

export function buildUserFormData(formValues: UserFormDataValues): FormData {
  const formData = new FormData();

  formData.append("fullName", formValues.fullName);
  formData.append("username", formValues.username);
  formData.append("cpf", normalizeCpf(formValues.cpf));

  if (formValues.password) {
    formData.append("password", formValues.password);
  }

  if (formValues.avatarFile) {
    const { mimeType: type, ...avatarFile } = formValues.avatarFile;
    appendImageFile(formData, "avatarFile", { ...avatarFile, type });
  }

  return formData;
}

export function buildAvatarFormData(avatarFile: AvatarFile): FormData {
  const formData = new FormData();
  const { mimeType: type, ...file } = avatarFile;
  appendImageFile(formData, "avatarFile", { ...file, type });

  return formData;
}

export function buildPasswordFormData(password: string): FormData {
  const formData = new FormData();
  formData.append("password", password);
  return formData;
}
