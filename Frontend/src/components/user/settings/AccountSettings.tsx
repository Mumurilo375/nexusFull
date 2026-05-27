import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/useAuth";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import { getApiErrorMessage } from "../../../services/http";
import {
  EMAIL_PATTERN,
  buildUserFormData,
  formatCpf,
  getPasswordError,
  isValidCpf,
  readImagePreview,
} from "../userForm.utils";
import type { UserProfile } from "./accountSettings.types";

const inputClass =
  "mt-2 block w-full rounded-2xl border border-slate-700 bg-slate-900/85 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/70";
const disabledInputClass =
  "mt-2 block w-full cursor-not-allowed rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-500";

type AccountFormValues = {
  fullName: string;
  username: string;
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatarFile: File | null;
};

const emptyAccountForm: AccountFormValues = {
  fullName: "",
  username: "",
  cpf: "",
  email: "",
  password: "",
  confirmPassword: "",
  avatarFile: null,
};

function getFriendlyUpdateError<TError>(error: TError) {
  return getApiErrorMessage(
    error,
    "Não foi possível atualizar seus dados agora. Tente novamente.",
  );
}

function getAvatarPreviewUrl(value: string | null | undefined) {
  return resolveAssetUrl(value, "");
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const { syncUser, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState(emptyAccountForm);
  const [avatarPreview, setAvatarPreview] = useState(
    getAvatarPreviewUrl(authUser?.avatarUrl),
  );
  const profileLabel = formValues.fullName || authUser?.username || "Usuário Nexus";

  const updateFormValue =
    (field: keyof Omit<AccountFormValues, "cpf" | "avatarFile">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setErrorMessage("");
    };

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser?.id) {
        setErrorMessage("Não foi possível identificar o usuário autenticado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const { data } = await api.get<UserProfile>(`/users/${authUser.id}`);
        const savedAvatarUrl = data.avatarUrl ?? authUser.avatarUrl ?? null;

        setFormValues({
          fullName: data.fullName ?? "",
          username: data.username ?? "",
          cpf: formatCpf(data.cpf ?? ""),
          email: data.email ?? authUser.email ?? "",
          password: "",
          confirmPassword: "",
          avatarFile: null,
        });
        setAvatarPreview(getAvatarPreviewUrl(savedAvatarUrl));
      } catch {
        setErrorMessage("Não foi possível carregar seus dados.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [authUser]);

  const handleCpfChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      cpf: formatCpf(event.target.value),
    }));
    setErrorMessage("");
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const avatarFile = event.target.files?.[0] ?? null;

    setFormValues((currentValues) => ({
      ...currentValues,
      avatarFile,
    }));
    setErrorMessage("");

    if (!avatarFile) {
      setAvatarPreview(getAvatarPreviewUrl(authUser?.avatarUrl));
      return;
    }

    try {
      setAvatarPreview(await readImagePreview(avatarFile));
    } catch {
      setErrorMessage("Não foi possível carregar a prévia da imagem.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.fullName.trim() || !formValues.username.trim() || !formValues.cpf.trim()) {
      setErrorMessage("Preencha os campos obrigatórios: nome, usuário e CPF.");
      return;
    }

    if (!EMAIL_PATTERN.test(formValues.email)) {
      setErrorMessage("O email exibido está inválido.");
      return;
    }

    if (!isValidCpf(formValues.cpf)) {
      setErrorMessage("CPF inválido.");
      return;
    }

    if (formValues.password || formValues.confirmPassword) {
      const passwordError = getPasswordError(formValues.password.trim());

      if (passwordError) {
        setErrorMessage(passwordError);
        return;
      }

      if (formValues.password.trim() !== formValues.confirmPassword.trim()) {
        setErrorMessage("As senhas não conferem.");
        return;
      }
    }

    if (!authUser?.id) {
      setErrorMessage("Não foi possível identificar o usuário autenticado.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const { data } = await api.put<UserProfile>(
        `/users/${authUser.id}`,
        buildUserFormData({
          fullName: formValues.fullName.trim(),
          username: formValues.username.trim(),
          cpf: formValues.cpf,
          password: formValues.password.trim(),
          avatarFile: formValues.avatarFile,
        }),
      );

      const savedAvatarUrl = data.avatarUrl ?? null;

      syncUser({
        id: data.id,
        email: data.email,
        username: data.username,
        avatarUrl: savedAvatarUrl,
        isAdmin: data.isAdmin,
      });

      setFormValues((currentValues) => ({
        ...currentValues,
        fullName: data.fullName ?? currentValues.fullName,
        username: data.username ?? currentValues.username,
        cpf: formatCpf(data.cpf ?? currentValues.cpf),
        email: data.email ?? currentValues.email,
        password: "",
        confirmPassword: "",
        avatarFile: null,
      }));
      setAvatarPreview(getAvatarPreviewUrl(savedAvatarUrl));
      void navigate(-1);
    } catch (error) {
      setErrorMessage(getFriendlyUpdateError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-10 pt-28">
      <div className="rounded-4xl border border-slate-800 bg-slate-950/85 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.4)]">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200/80">
            Minha conta
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Configurações da conta
          </h1>
        </div>

        {loading && <p className="mt-6 text-gray-300">Carregando dados...</p>}

        {!loading && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[320px,1fr]">
            <aside className="rounded-[28px] border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex flex-col items-center text-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview da foto"
                    className="h-24 w-24 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-xs text-slate-400">
                    Sem foto
                  </div>
                )}

                <h2 className="mb-4 mt-4 text-xl font-semibold text-white">
                  {profileLabel}
                </h2>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-5">
                  <label
                    htmlFor="avatarFile"
                    className="block text-sm font-medium text-slate-100"
                  >
                    Foto de perfil
                  </label>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <input
                      id="avatarFile"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatarFile"
                      className="mx-auto inline-flex cursor-pointer justify-between rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/60 hover:text-white"
                    >
                      Escolher imagem
                    </label>
                    <p className="text-xs text-slate-400">
                      Atualize a imagem usada na navbar e no perfil.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-[28px] border border-slate-800 bg-slate-900/50 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-100">
                  Nome completo
                  <input
                    id="fullName"
                    type="text"
                    value={formValues.fullName}
                    onChange={updateFormValue("fullName")}
                    className={inputClass}
                    required
                  />
                </label>

                <label className="text-sm font-medium text-slate-100">
                  Nome de usuário
                  <input
                    id="username"
                    type="text"
                    value={formValues.username}
                    onChange={updateFormValue("username")}
                    className={inputClass}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-100">
                  CPF
                  <input
                    id="cpf"
                    type="text"
                    value={formValues.cpf}
                    onChange={handleCpfChange}
                    className={inputClass}
                    maxLength={14}
                    required
                  />
                </label>

                <label className="text-sm font-medium text-slate-100">
                  Email
                  <input
                    id="email"
                    type="email"
                    value={formValues.email}
                    readOnly
                    disabled
                    className={disabledInputClass}
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-100">
                  Senha
                  <input
                    id="password"
                    type="password"
                    value={formValues.password}
                    onChange={updateFormValue("password")}
                    className={inputClass}
                    placeholder="Digite sua nova senha (opcional)"
                  />
                </label>

                <label className="text-sm font-medium text-slate-100">
                  Confirmar senha
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formValues.confirmPassword}
                    onChange={updateFormValue("confirmPassword")}
                    className={inputClass}
                    placeholder="Repita a senha"
                  />
                </label>
              </div>

              <p className="text-xs leading-6 text-slate-400">
                Se quiser alterar a senha, use um padrão forte: 8 caracteres,
                letras maiúsculas e minúsculas, número e caractere especial.
              </p>

              {errorMessage && (
                <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
