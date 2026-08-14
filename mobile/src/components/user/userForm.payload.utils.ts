import { normalizeCpf } from "./userForm.cpf.utils";

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
    const { avatarFile } = formValues;
    const nativeFile = {
      uri: avatarFile.uri,
      type: avatarFile.mimeType,
      name: avatarFile.name,
    };

    formData.append(
      "avatarFile",
      avatarFile.file ?? (nativeFile as unknown as Blob),
    );
  }

  return formData;
}
