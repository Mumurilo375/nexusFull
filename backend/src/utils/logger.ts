import { AsyncLocalStorage } from "node:async_hooks";

export type LogLevel = "info" | "warn" | "error";
export const requestContext = new AsyncLocalStorage<string>();

type LogContext = Record<string, string | number | boolean | undefined>;

export function log(level: LogLevel, event: string, context: LogContext = {}): void {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, service: "backend", event, correlationId: requestContext.getStore(), ...context });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
