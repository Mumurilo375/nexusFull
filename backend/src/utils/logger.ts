export type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, string | number | boolean | undefined>;

export function log(level: LogLevel, event: string, context: LogContext = {}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "backend",
    event,
    ...context,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
