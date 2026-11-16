export const HTTP_METRICS_SAMPLE_LIMIT = 1_000;

type HttpMetricSample = {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
};

export type HttpMetricsSummary = {
  totalRequests: number;
  totalServerErrors: number;
  errorRate: number;
  p95ResponseTimeMs: number;
  sampleCount: number;
};

let totalRequests = 0;
let totalServerErrors = 0;
const recentSamples: HttpMetricSample[] = [];

export function recordHttpRequest(sample: HttpMetricSample): void {
  totalRequests += 1;
  if (sample.statusCode >= 500) totalServerErrors += 1;

  recentSamples.push(sample);
  if (recentSamples.length > HTTP_METRICS_SAMPLE_LIMIT) recentSamples.shift();
}

export function getHttpMetricsSummary(): HttpMetricsSummary {
  const durations = recentSamples.map(({ durationMs }) => durationMs).sort((a, b) => a - b);
  const p95Index = durations.length === 0 ? -1 : Math.ceil(durations.length * 0.95) - 1;

  return {
    totalRequests,
    totalServerErrors,
    errorRate: totalRequests === 0 ? 0 : (totalServerErrors / totalRequests) * 100,
    p95ResponseTimeMs: p95Index < 0 ? 0 : Number(durations[p95Index].toFixed(2)),
    sampleCount: recentSamples.length,
  };
}

export function resetHttpMetrics(): void {
  totalRequests = 0;
  totalServerErrors = 0;
  recentSamples.length = 0;
}
