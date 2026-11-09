import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import { validatePaymentNotification } from "../../src/validators/payment.validator";

describe("confirmação de pagamento", () => {
  const payment = { id: "123", reference: "00b5e632-253b-4ff8-9926-dc88fa123456", amountCents: 5000, currency: "BRL", status: "approved" };
  it("aceita uma confirmação do microserviço", () => {
    expect(validatePaymentNotification(payment)).toEqual(payment);
  });
  it.each([null, [], { ...payment, id: "../123" }, { ...payment, amountCents: 10.5 },
    { ...payment, amountCents: -1 }, { ...payment, reference: "pedido" }, { ...payment, currency: "" }])(
    "rejeita confirmação inválida: %j", (input) => {
      expect(() => validatePaymentNotification(input)).toThrow(AppError);
    },
  );
});
