import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "../userForm.utils";
import type { UserProfile } from "./accountSettings.types";

const inputClass =
  "mt-2 block w-full rounded-2xl border border-slate-700 bg-slate-900/85 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/70";
const disabledInputClass =
  "mt-2 block w-full cursor-not-allowed rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-500";
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

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

function loadRenderableImagePreview(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => resolve(previewUrl);
    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error("A imagem selecionada não pôde ser visualizada."));
    };

    image.src = previewUrl;
  });
}

type FlashMessage = {
  kind: "success" | "error";
  text: string;
};

export default function AccountSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { syncUser, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);
  const [formValues, setFormValues] = useState(emptyAccountForm);
  const [avatarPreview, setAvatarPreview] = useState(
    getAvatarPreviewUrl(authUser?.avatarUrl),
  );
  const avatarObjectUrlRef = useRef<string | null>(null);
  const profileLabel =
    formValues.fullName || authUser?.username || "Usuário Nexus";

  useEffect(() => {
    const flash = searchParams.get("flash");

    if (flash === "success") {
      setFlashMessage({
        kind: "success",
        text: "Suas alterações foram salvas com sucesso.",
      });
      return;
    }

    if (flash === "error") {
      setFlashMessage({
        kind: "error",
        text: "Não foi possível salvar suas alterações.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const setLocalAvatarPreview = (previewUrl: string) => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    setAvatarPreview(previewUrl);
  };

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
        setLocalAvatarPreview(getAvatarPreviewUrl(savedAvatarUrl));
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

  const handleAvatarFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const avatarFile = event.target.files?.[0] ?? null;

    setFormValues((currentValues) => ({
      ...currentValues,
      avatarFile,
    }));
    setErrorMessage("");
    setFlashMessage(null);

    if (!avatarFile) {
      setLocalAvatarPreview(getAvatarPreviewUrl(authUser?.avatarUrl));
      return;
    }

    if (avatarFile.size > MAX_AVATAR_FILE_SIZE) {
      setFormValues((currentValues) => ({
        ...currentValues,
        avatarFile: null,
      }));
      setErrorMessage("A imagem enviada é maior do que o permitido. Escolha uma imagem menor.");
      return;
    }

    if (!avatarFile.type.startsWith("image/")) {
      setFormValues((currentValues) => ({
        ...currentValues,
        avatarFile: null,
      }));
      setErrorMessage("Selecione apenas arquivos de imagem válidos.");
      return;
    }

    void loadRenderableImagePreview(avatarFile)
      .then((previewUrl) => {
        avatarObjectUrlRef.current = previewUrl;
        setAvatarPreview(previewUrl);
      })
      .catch(() => {
        setFormValues((currentValues) => ({
          ...currentValues,
          avatarFile: null,
        }));
        setErrorMessage("Essa imagem não pôde ser usada na prévia. Use JPG, PNG ou WEBP.");
        setLocalAvatarPreview(getAvatarPreviewUrl(authUser?.avatarUrl));
      });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formValues.fullName.trim() ||
      !formValues.username.trim() ||
      !formValues.cpf.trim()
    ) {
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
      setLocalAvatarPreview(getAvatarPreviewUrl(savedAvatarUrl));
      setErrorMessage("");
      setFlashMessage({
        kind: "success",
        text: "Suas alterações foram salvas com sucesso.",
      });
      void navigate("/configuracoes?flash=success", {
        replace: true,
      });
    } catch (error) {
      const friendlyMessage = getFriendlyUpdateError(error);
      setErrorMessage(friendlyMessage);
      setFlashMessage({
        kind: "error",
        text: friendlyMessage,
      });
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
              <div className="grid gap-6 md:grid-cols-[1fr_1px_0.95fr] md:items-center">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview da foto"
                      className="h-32 w-32 shrink-0 rounded-full border border-emerald-500/20 object-cover shadow-[0_0_40px_rgba(34,197,94,0.12)] ring-4 ring-slate-950"
                    />
                  ) : (
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-xs text-slate-400 shadow-[0_0_40px_rgba(34,197,94,0.10)] ring-4 ring-slate-950">
                      Sem foto
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {profileLabel}
                    </h2>

                    <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
                      Gerencie suas informações e preferências da conta.
                    </p>
                  </div>
                </div>

                <div className="hidden h-full w-px bg-slate-800 md:block" />

                <div className="rounded-3xl border border-slate-800 bg-slate-950/45 p-5 md:min-h-[110%] md:w-[95%]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5V7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m7 15 3.2-3.2a1 1 0 0 1 1.4 0L14 14.2l1.1-1.1a1 1 0 0 1 1.4 0L19 15.6"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.5 9.5h.01"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <label
                        htmlFor="avatarFile"
                        className="block text-base font-semibold text-slate-100"
                      >
                        Foto de perfil
                      </label>

                      <p className="mt-1 text-sm leading-5 text-slate-300">
                        Atualize sua foto e personalize como você aparece.
                      </p>
                    </div>
                  </div>

                  <input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="avatarFile"
                    className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-blue-500/60 hover:bg-slate-800 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4m0 0 4 4m-4-4-4 4"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5"
                      />
                    </svg>
                    Escolher imagem
                  </label>

                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Recomendado: imagem quadrada, no mínimo 400x400px.
                    <br />
                    Formatos: JPG, PNG ou WEBP. Máx. 5MB.
                  </p>
                </div>
              </div>
            </aside>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-[28px] border border-slate-800 bg-slate-900/50 p-6"
            >
              {flashMessage && (
                <p
                  className={
                    flashMessage.kind === "success"
                      ? "rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                      : "rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  }
                >
                  {flashMessage.text}
                </p>
              )}

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
