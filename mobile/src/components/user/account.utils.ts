export const toMoney = (value: number | string | null | undefined) =>
  `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`;

export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
};

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
