import { requestPaymentService } from "../../src/services/payment.service";
import { requestContext } from "../../src/utils/logger";

describe("observabilidade do serviço de pagamentos", () => {
  const originalFetch = global.fetch;
  const originalSecret = process.env.PAYMENTS_SERVICE_SECRET;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.PAYMENTS_SERVICE_SECRET;
    else process.env.PAYMENTS_SERVICE_SECRET = originalSecret;
    jest.restoreAllMocks();
  });

  it("propaga o identificador de correlação sem registrar o segredo", async () => {
    const id = "00b5e632-253b-4ff8-9926-dc88fa123456";
    const secret = "segredo-de-teste-com-mais-de-32-caracteres";
    process.env.PAYMENTS_SERVICE_SECRET = secret;
    const output = jest.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await requestContext.run(id, () => requestPaymentService("/checkouts", {}));

    expect(fetchMock.mock.calls[0][1].headers["X-Nexus-Correlation-Id"]).toBe(id);
    expect(JSON.parse(output.mock.calls[0][0])).toMatchObject({ correlationId: id, statusCode: 200 });
    expect(output.mock.calls[0][0]).not.toContain(secret);
  });
});
