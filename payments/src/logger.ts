type Level = "info" | "warn" | "error";
type Context = Record<string, string | number | boolean | undefined>;

export function log(level: Level, event: string, context: Context = {}): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: "payments",
    event,
    ...context,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
