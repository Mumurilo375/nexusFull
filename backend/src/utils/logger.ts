export type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, string | number | boolean | undefined>;

export function log(level: LogLevel, event: string, context: LogContext = {}): void {
  const details = Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join("   |   ");
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${event}${details ? ` | ${details}` : ""}\n`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
