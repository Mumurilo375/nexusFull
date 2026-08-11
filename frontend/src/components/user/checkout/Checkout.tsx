import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../../login/BackButton";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import CardPaymentPanel from "./CardPaymentPanel";
import CheckoutPaymentMethods from "./CheckoutPaymentMethods";
import CheckoutSuccessPanel from "./CheckoutSuccessPanel";
import CheckoutSummary from "./CheckoutSummary";
import PixPaymentPanel from "./PixPaymentPanel";
import PaypalPaymentPanel from "./PaypalPaymentPanel";
import {
  buildPixCode,
  createPixQrDataUrl,
  digitsOnly,
  getQuantity,
  isValidFutureExpiry,
  sanitizeCardName,
} from "./checkout.helpers";
import type {
  CardField,
  CheckoutCartItem,
  CheckoutCartResponse,
  CheckoutCreateResponse,
  CheckoutOrderResponse,
  PaymentMethod,
} from "./checkout.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CardValues = {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
  focusedField: CardField;
};

type PaypalValues = {
  email: string;
  password: string;
};

const emptyCardValues: CardValues = {
  name: "",
  number: "",
  expiry: "",
  cvv: "",
  focusedField: null,
};

const emptyPaypalValues: PaypalValues = {
  email: "",
  password: "",
};

export default function Checkout() {
  const [items, setItems] = useState<CheckoutCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [order, setOrder] = useState<CheckoutOrderResponse | null>(null);
  const [cardValues, setCardValues] = useState(emptyCardValues);
  const [paypalValues, setPaypalValues] = useState(emptyPaypalValues);
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.listing?.price ?? 0) * getQuantity(item), 0),
    [items],
  );
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + getQuantity(item), 0),
    [items],
  );
  const hasStockIssues = useMemo(
    () => items.some((item) => item.isQuantityAvailable === false),
    [items],
  );
  const pixCode = useMemo(() => buildPixCode(subtotal, totalQuantity), [subtotal, totalQuantity]);
  const pixQrSrc = useMemo(() => createPixQrDataUrl(pixCode), [pixCode]);
  const canSubmit =
    !placingOrder && !hasStockIssues && (paymentMethod !== "pix" || pixConfirmed);

  const clearError = () => setError("");

  const loadCart = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
        clearError();
      }

      const { data } = await api.get<CheckoutCartResponse>("/cart");
      setItems(data.items ?? []);
    } catch (requestError) {
      if (showLoading) {
        setItems([]);
        setError(getApiErrorMessage(requestError, "Não foi possível carregar o checkout."));
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadCart(true);
  }, []);

  useEffect(() => {
    if (copyStatus === "idle") return;

    const timeoutId = window.setTimeout(() => setCopyStatus("idle"), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  useEffect(() => {
    if (!order) return;

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [order]);

  const selectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    clearError();
    if (method !== "pix") setPixConfirmed(false);
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === "card") {
      if (cardValues.name.trim().length < 3) {
        return "Informe o nome impresso no cartão.";
      }
      if (digitsOnly(cardValues.number).length !== 16) {
        return "O número do cartão deve ter 16 dígitos.";
      }
      if (!isValidFutureExpiry(cardValues.expiry)) {
        return "Informe uma validade válida e que ainda não tenha expirado.";
      }
      if (digitsOnly(cardValues.cvv).length !== 3) {
        return "O CVV deve ter exatamente 3 dígitos.";
      }
      return "";
    }

    if (paymentMethod === "paypal") {
      if (!EMAIL_REGEX.test(paypalValues.email.trim().toLowerCase())) {
        return "Informe um email válido para o PayPal.";
      }
      if (paypalValues.password.trim().length < 6) {
        return "Informe a senha da conta PayPal com pelo menos 6 caracteres.";
      }
      return "";
    }

    return pixConfirmed ? "" : "Confirme a leitura do QR Code para concluir o pagamento.";
  };

  const createOrder = async () => {
    if (hasStockIssues) {
      setError(
        "O estoque de um ou mais itens mudou. Volte ao carrinho e ajuste as quantidades.",
      );
      return;
    }

    const paymentError = validatePaymentDetails();
    if (paymentError) {
      setError(paymentError);
      return;
    }

    try {
      setPlacingOrder(true);
      clearError();

      const { data } = await api.post<CheckoutCreateResponse>("/checkout", {
        paymentMethod,
      });

      setOrder(data.order);
      setItems([]);
      window.dispatchEvent(new Event("nexus:counts-updated"));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível finalizar o pedido."));
      await loadCart();
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 pb-10 pt-28">
      <h1 className="text-3xl font-bold">Resumo do pedido</h1>
      <p className="mt-2 text-sm text-gray-300">
        Escolha a forma de pagamento e conclua a compra para liberar as keys na hora.
      </p>

      {loading && <p className="mt-4 text-gray-300">Carregando resumo...</p>}

      {!loading && order && <CheckoutSuccessPanel order={order} />}

      {!loading && !order && (
        <section className="mt-6 rounded-2xl border border-gray-800 bg-gray-950/80 p-5">
          {error && items.length === 0 && (
            <p className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          {items.length === 0 ? (
            <>
              <p className="text-gray-300">Seu carrinho está vazio.</p>
              <Link to="/loja" className="mt-3 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm">
                Ir para loja
              </Link>
            </>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
              <div className="space-y-4">
                <CheckoutSummary
                  items={items}
                  subtotal={subtotal}
                  totalQuantity={totalQuantity}
                  hasStockIssues={hasStockIssues}
                />

                <CheckoutPaymentMethods
                  paymentMethod={paymentMethod}
                  onSelect={selectPaymentMethod}
                />
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                {paymentMethod === "card" && (
                  <CardPaymentPanel
                    cardName={cardValues.name}
                    cardNumber={cardValues.number}
                    cardExpiry={cardValues.expiry}
                    cardCvv={cardValues.cvv}
                    focusedField={cardValues.focusedField}
                    onFieldFocus={(focusedField) =>
                      setCardValues((currentValues) => ({ ...currentValues, focusedField }))
                    }
                    onFieldBlur={() =>
                      setCardValues((currentValues) => ({ ...currentValues, focusedField: null }))
                    }
                    onNameChange={(value) => {
                      setCardValues((currentValues) => ({
                        ...currentValues,
                        name: sanitizeCardName(value),
                      }));
                      clearError();
                    }}
                    onNumberChange={(value) => {
                      setCardValues((currentValues) => ({
                        ...currentValues,
                        number: digitsOnly(value).slice(0, 16),
                      }));
                      clearError();
                    }}
                    onExpiryChange={(value) => {
                      setCardValues((currentValues) => ({
                        ...currentValues,
                        expiry: digitsOnly(value).slice(0, 4),
                      }));
                      clearError();
                    }}
                    onCvvChange={(value) => {
                      setCardValues((currentValues) => ({
                        ...currentValues,
                        cvv: digitsOnly(value).slice(0, 3),
                      }));
                      clearError();
                    }}
                  />
                )}

                {paymentMethod === "paypal" && (
                  <PaypalPaymentPanel
                    email={paypalValues.email}
                    password={paypalValues.password}
                    onEmailChange={(value) => {
                      setPaypalValues((currentValues) => ({ ...currentValues, email: value }));
                      clearError();
                    }}
                    onPasswordChange={(value) => {
                      setPaypalValues((currentValues) => ({
                        ...currentValues,
                        password: value.slice(0, 40),
                      }));
                      clearError();
                    }}
                  />
                )}

                {paymentMethod === "pix" && (
                  <PixPaymentPanel
                    pixCode={pixCode}
                    pixQrSrc={pixQrSrc}
                    copyStatus={copyStatus}
                    pixConfirmed={pixConfirmed}
                    onCopy={() => {
                      void handleCopyPixCode();
                    }}
                    onConfirmChange={(checked) => {
                      setPixConfirmed(checked);
                      clearError();
                    }}
                  />
                )}

                {error && (
                  <p className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    void createOrder();
                  }}
                  disabled={!canSubmit}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder
                    ? "Finalizando..."
                    : hasStockIssues
                      ? "Ajuste o carrinho para continuar"
                      : "Finalizar pedido"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {!order && <BackButton />}
    </main>
  );
}
