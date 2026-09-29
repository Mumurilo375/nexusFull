export const formatMoney = (value: number | string = 0) => `R$ ${Number(value ?? 0).toFixed(2)}`;
