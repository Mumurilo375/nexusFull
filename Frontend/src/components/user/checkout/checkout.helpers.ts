import type { CheckoutCartItem } from "./checkout.types";

export function toMoney(value: number) {
  return `R$ ${value.toFixed(2)}`;
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string) {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function formatExpiry(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function sanitizeCardName(value: string) {
  return value
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 40);
}

export function isValidFutureExpiry(value: string) {
  const digits = digitsOnly(value);

  if (digits.length !== 4) return false;

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));

  if (month < 1 || month > 12) return false;

  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export function getCardBrand(value: string) {
  const digits = digitsOnly(value);

  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^(5067|5090|650|6516|6550|6363)/.test(digits)) return "Elo";

  return "Cartão";
}

export function buildPixCode(total: number, itemCount: number) {
  const amount = total.toFixed(2);
  const reference = String(itemCount).padStart(2, "0");

  return [
    "000201",
    "26400014BR.GOV.BCB.PIX0118nexus-faculdade",
    "52040000",
    "5303986",
    `540${String(amount.length).padStart(2, "0")}${amount}`,
    "5802BR",
    "5917NEXUS GAME STORE",
    "6009SAO PAULO",
    `62100506PED${reference}`,
    "6304ABCD",
  ].join("");
}

export function createPixQrDataUrl(value: string) {
  const size = 29;
  const cell = 8;
  const quietZone = 4;
  const total = (size + quietZone * 2) * cell;
  const squares: string[] = [];

  const drawSquare = (x: number, y: number, fill = "#111827") => {
    squares.push(
      `<rect x="${(x + quietZone) * cell}" y="${(y + quietZone) * cell}" width="${cell}" height="${cell}" rx="1" fill="${fill}" />`,
    );
  };

  const drawFinder = (x: number, y: number) => {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const isOuter = row === 0 || row === 6 || col === 0 || col === 6;
        const isInner = row >= 2 && row <= 4 && col >= 2 && col <= 4;
        if (isOuter || isInner) drawSquare(x + col, y + row);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const isFinderArea =
        (row < 7 && col < 7) ||
        (row < 7 && col >= size - 7) ||
        (row >= size - 7 && col < 7);

      if (isFinderArea) continue;

      const charCode = value.charCodeAt((row * size + col) % value.length);
      if ((charCode + row + col) % 2 === 0) drawSquare(col, row);
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}">
      <rect width="${total}" height="${total}" rx="20" fill="#ffffff" />
      ${squares.join("")}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getQuantity(item: CheckoutCartItem) {
  return Math.max(1, Number(item.quantity ?? 1));
}

export function getAvailableStock(item: CheckoutCartItem) {
  return Math.max(0, Number(item.stock?.available ?? 0));
}
