import { Eye, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { MetricCard, PageHeader, SectionTitle, StatusBadge } from "@/components/common";
import { PerformanceChart } from "@/components/performance-chart";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { chartData, demoAnalytics } from "@/lib/demo-data";

function metricTotal(items: typeof demoAnalytics, key: string) {
  return items.reduce((total, item) => total + Number(item.metrics[key] ?? 0), 0);
}

export function PerformancePage() {
  const { data: analytics } = useApiResource(api.analytics, demoAnalytics);
  const views = metricTotal(analytics, "views");
  const likes = metricTotal(analytics, "likes");
  const shares = metricTotal(analytics, "shares");
  const comments = metricTotal(analytics, "comments");
  const retentionValues = analytics.map((item) => Number(item.metrics.retention ?? 0)).filter((value) => value > 0);
  const retention = retentionValues.length ? Math.round(retentionValues.reduce((a, b) => a + b, 0) / retentionValues.length) : 0;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="ANALYTICS" title="Performance" description="Descubra quais temas, ganchos, horários e plataformas geram mais resultado." />
      <section className="metrics-grid metrics-five">
        <MetricCard label="Views" value={views.toLocaleString("pt-BR")} detail="Snapshots disponíveis" icon={Eye} tone="blue" />
        <MetricCard label="Retenção" value={`${retention}%`} detail="Média dos snapshots" icon={TrendingUp} tone="green" />
        <MetricCard label="Likes" value={likes.toLocaleString("pt-BR")} detail="Total registrado" icon={Heart} tone="pink" />
        <MetricCard label="Shares" value={shares.toLocaleString("pt-BR")} detail="Total registrado" icon={Share2} tone="purple" />
        <MetricCard label="Comentários" value={comments.toLocaleString("pt-BR")} detail="Total registrado" icon={MessageCircle} tone="cyan" />
      </section>
      <div className="dashboard-split">
        <section className="panel"><SectionTitle title="Views por dia" subtitle="Visualização histórica" /><PerformanceChart data={chartData} /></section>
        <section className="panel">
          <SectionTitle title="O que mais performa" subtitle="Padrões atuais" />
          <div className="ranking-list">
            {[["1", "Falências empresariais", "+24% retenção"], ["2", "Ganchos com conflito", "+19% conclusão"], ["3", "65–75 segundos", "+14% watch time"], ["4", "Slot das 20h", "+11% views"]].map((row) => (
              <div key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><StatusBadge tone="green">{row[2]}</StatusBadge></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
