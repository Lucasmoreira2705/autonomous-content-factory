import type { AnalyticsPoint, AnalyticsView } from "@/lib/api";

export function metricTotal(items: AnalyticsView[], key: string) {
  return items.reduce((total, item) => total + Number(item.metrics[key] ?? 0), 0);
}

export function averageMetric(items: AnalyticsView[], key: string) {
  const values = items.map((item) => Number(item.metrics[key] ?? 0)).filter((value) => value > 0);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

export function buildAnalyticsSeries(items: AnalyticsView[]): AnalyticsPoint[] {
  const grouped = new Map<string, { sort: number; views: number; retentions: number[] }>();

  items.forEach((item) => {
    const date = new Date(item.captured_at);
    const key = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const current = grouped.get(key) ?? { sort: date.setHours(0, 0, 0, 0), views: 0, retentions: [] };
    current.views += Number(item.metrics.views ?? 0);
    const retention = Number(item.metrics.retention ?? 0);
    if (retention > 0) current.retentions.push(retention);
    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .map(([date, value]) => ({
      date,
      sort: value.sort,
      views: value.views,
      retention: value.retentions.length
        ? Math.round(value.retentions.reduce((a, b) => a + b, 0) / value.retentions.length)
        : 0,
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ date, views, retention }) => ({ date, views, retention }));
}

export function lastSevenDays(items: AnalyticsView[]) {
  const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.captured_at).getTime() >= threshold);
}
