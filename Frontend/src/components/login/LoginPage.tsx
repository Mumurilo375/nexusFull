import { type FormEvent, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import api from "../../services/api";
import { getApiErrorMessage } from "../../services/http";
import BackButton from "./BackButton";
import type { LoginResponse } from "./login.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POST_LOGIN_REDIRECT_KEY = "nexus:post-login-redirect";
const inputClass =
  "mt-2 block w-full rounded-2xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400/80 focus:ring-2 focus:ring-blue-500/20";

function getFriendlyLoginError<TError>(error: TError): string {
  return getApiErrorMessage(
    error,
    "Não foi possível fazer login agora. Tente novamente.",
  );
}

type LoginLocationState = {
  from?: string | null;
};

function isSafeRedirectPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && value !== "/login";
}

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = (emailRef.current?.value ?? "").trim().toLowerCase();
    const password = passwordRef.current?.value ?? "";

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Digite um email válido.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      login(data.token, data.user);
      const fromState = (location.state as LoginLocationState | null)?.from;
      const fromSession = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
      const from = fromState ?? fromSession;

      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);

      if (from && isSafeRedirectPath(from)) {
        void navigate(from, { replace: true });
        return;
      }

      void navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getFriendlyLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="nexus-page-shell min-h-full px-6 py-12 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="nexus-panel p-6 sm:p-8">
          <div className="mx-auto w-full max-w-md">
            <img
              alt="Logo Nexus"
              src="/utils/logo.png"
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-7 text-center text-3xl font-bold tracking-tight text-white">
              Entrar
            </h2>
            <p className="mt-2 text-center text-sm text-slate-300">
              Entre com seu email e senha.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="nexus-card rounded-[28px] border-slate-800/90 bg-slate-900/55 p-5 sm:p-6">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-100"
                    >
                      Email
                    </label>
                    <input
                      ref={emailRef}
                      placeholder="email@gmail.com"
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      onChange={() => setErrorMessage("")}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-100"
                    >
                      Senha
                    </label>
                    <input
                      placeholder="*****"
                      ref={passwordRef}
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      onChange={() => setErrorMessage("")}
                      className={inputClass}
                    />
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
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Não possui conta?{" "}
              <Link
                to="/cadastro"
                className="font-semibold text-blue-300 transition hover:text-blue-200"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
      <BackButton />
    </div>
  );
}
