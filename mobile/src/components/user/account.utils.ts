export { formatDate, toMoney } from "../../utils/format";

export const maskKey = (value?: string) => {
  if (!value) return "-";
  return value.replace(/[^\s-]/g, "•");
};

export const translateOrderStatus = (value?: string) => {
  const labels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    cancelled: "Cancelado",
    failed: "Falhou",
    processing: "Processando",
  };

  return labels[value ?? ""] ?? value ?? "Não informado";
};
