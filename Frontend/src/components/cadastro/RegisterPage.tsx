import { UserCircleIcon } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../login/BackButton";
import api from "../../services/api";
import { getApiErrorMessage } from "../../services/http";
import {
  EMAIL_PATTERN,
  buildUserFormData,
  formatCpf,
  getPasswordStrength,
  isValidCpf,
} from "../user/userForm.utils";

const inputClassName =
  "mt-2 block w-full rounded-2xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400/80 focus:ring-2 focus:ring-blue-500/20";

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  username: string;
  avatarFile: File | null;
};

const emptyRegisterForm: RegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  cpf: "",
  username: "",
  avatarFile: null,
};

function getFriendlyRegisterError(error: Error) {
  return getApiErrorMessage(
    error,
    "Não foi possível concluir o cadastro agora. Tente novamente.",
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(emptyRegisterForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordValidation = getPasswordStrength(formValues.password);
  const selectedPhotoName = formValues.avatarFile?.name ?? "";

  const updateFormValue =
    (field: keyof Omit<RegisterFormValues, "cpf" | "avatarFile">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setErrorMessage("");
    };

  const handleCpfChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      cpf: formatCpf(event.target.value),
    }));
    setErrorMessage("");
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      avatarFile: event.target.files?.[0] ?? null,
    }));
    setErrorMessage("");
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanFullName = formValues.fullName.trim();
    const cleanEmail = formValues.email.trim().toLowerCase();
    const cleanUsername = formValues.username.trim();

    if (
      !cleanUsername ||
      !cleanFullName ||
      !cleanEmail ||
      !formValues.password ||
      !formValues.confirmPassword ||
      !formValues.cpf.trim()
    ) {
      setErrorMessage(
        "Preencha os campos obrigatórios: usuário, nome, email, senha, confirmação e CPF.",
      );
      return;
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setErrorMessage("Digite um email válido.");
      return;
    }

    if (!isValidCpf(formValues.cpf)) {
      setErrorMessage("CPF inválido.");
      return;
    }

    if (!passwordValidation.isStrong) {
      setErrorMessage(
        `A senha ainda não atende os critérios: ${passwordValidation.missingChecks.join(", ")}.`,
      );
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setErrorMessage("As senhas não conferem.");
      return;
    }

    try {
      setErrorMessage("");
      setIsSubmitting(true);

      await api.post(
        "/users",
        buildUserFormData({
          fullName: cleanFullName,
          email: cleanEmail,
          password: formValues.password,
          cpf: formValues.cpf,
          username: cleanUsername,
          avatarFile: formValues.avatarFile,
        }),
      );

      void navigate("/login");
    } catch (error) {
      setErrorMessage(getFriendlyRegisterError(error as Error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="nexus-page-shell min-h-full px-6 py-12 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="nexus-panel p-5 sm:p-6">
          <div className="mx-auto w-full max-w-3xl">
            <img
              alt="Logo Nexus"
              src="/utils/logo.png"
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
              Criar conta
            </h2>
            <p className="mt-2 text-center text-sm text-slate-300">
              Preencha os dados para continuar.
            </p>
          </div>

          <div className="mx-auto mt-6 w-full max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="nexus-card rounded-[28px] border-slate-800/90 bg-slate-900/55 p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label htmlFor="username" className="text-sm font-medium text-slate-100">
                    Nome de usuário
                    <input
                      value={formValues.username}
                      onChange={updateFormValue("username")}
                      placeholder="Nome de usuário"
                      id="username"
                      name="registerUsername"
                      type="text"
                      required
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className={inputClassName}
                    />
                  </label>

                  <label htmlFor="full-name" className="text-sm font-medium text-slate-100">
                    Nome completo
                    <input
                      value={formValues.fullName}
                      onChange={updateFormValue("fullName")}
                      placeholder="Digite seu nome completo"
                      id="full-name"
                      name="registerFullName"
                      type="text"
                      required
                      autoComplete="off"
                      className={inputClassName}
                    />
                  </label>

                  <label htmlFor="cpf" className="text-sm font-medium text-slate-100">
                    CPF
                    <input
                      value={formValues.cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      id="cpf"
                      name="cpf"
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={14}
                      className={inputClassName}
                    />
                  </label>

                  <label htmlFor="email" className="text-sm font-medium text-slate-100">
                    Email
                    <input
                      value={formValues.email}
                      onChange={updateFormValue("email")}
                      placeholder="Email@gmail.com"
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                    Senha
                    <input
                      value={formValues.password}
                      onChange={updateFormValue("password")}
                      placeholder="*****"
                      id="password"
                      name="new-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      className={inputClassName}
                    />
                  </label>

                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-100">
                    Confirmar senha
                    <input
                      value={formValues.confirmPassword}
                      onChange={updateFormValue("confirmPassword")}
                      placeholder="*****"
                      id="confirm-password"
                      name="new-password-confirm"
                      type="password"
                      required
                      autoComplete="new-password"
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr_1.15fr]">
                  <div
                    className="rounded-2xl border border-slate-700/80 bg-slate-950/65 p-3"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Força da senha digitada</span>
                      <span className={`font-semibold ${passwordValidation.strengthTextClass}`}>
                        {passwordValidation.strengthLabel}
                      </span>
                    </div>

                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${passwordValidation.strengthBarClass}`}
                        style={{ width: `${passwordValidation.percent}%` }}
                      />
                    </div>

                    <ul className="mt-2.5 grid gap-1.5 text-xs sm:grid-cols-2">
                      {passwordValidation.checks.map((check) => (
                        <li
                          key={check.label}
                          className={check.isMet ? "text-emerald-300" : "text-slate-400"}
                        >
                          {check.isMet ? "OK" : "Falta"}: {check.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-3.5">
                    <label
                      htmlFor="file-upload"
                      className="block text-sm font-medium text-white"
                    >
                      Foto de perfil
                    </label>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-500">
                        <UserCircleIcon aria-hidden="true" className="size-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor="file-upload"
                          className="inline-flex cursor-pointer rounded-full border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500/60 hover:text-white"
                        >
                          Escolher foto
                        </label>
                        <p className="mt-1.5 truncate text-xs text-slate-400">
                          {selectedPhotoName || "Nenhum arquivo selecionado"}
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        name="file-upload"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p
                  aria-live="polite"
                  className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-400">
              Já possui uma conta?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-300 transition hover:text-blue-200"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
      <BackButton />
    </div>
  );
}
