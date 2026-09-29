export const toMoney = (value: number | string | null | undefined) =>
  `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`;

export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
};
