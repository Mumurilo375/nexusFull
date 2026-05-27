import { normalizeCpf } from "./userForm.cpf.utils";

type UserFormDataValues = {
  fullName: string;
  username: string;
  cpf: string;
  email?: string;
  password?: string;
  avatarFile?: File | null;
};

export function buildUserFormData(formValues: UserFormDataValues): FormData {
  const formData = new FormData();

  formData.append("fullName", formValues.fullName);
  formData.append("username", formValues.username);
  formData.append("cpf", normalizeCpf(formValues.cpf));

  if (formValues.email) {
    formData.append("email", formValues.email.trim().toLowerCase());
  }

  if (formValues.password) {
    formData.append("password", formValues.password);
  }

  if (formValues.avatarFile) {
    formData.append("avatarFile", formValues.avatarFile);
  }

  return formData;
}

export function readImagePreview(imageFile: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      resolve(typeof fileReader.result === "string" ? fileReader.result : "");
    };

    fileReader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    fileReader.readAsDataURL(imageFile);
  });
}
