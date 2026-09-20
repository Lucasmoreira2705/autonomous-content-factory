import { AlertTriangle, Eye, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { MetricCard, PageHeader, SectionTitle } from "@/components/common";
import { PerformanceChart } from "@/components/performance-chart";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { averageMetric, buildAnalyticsSeries, metricTotal } from "@/lib/analytics";

export function PerformancePage() {
  const { data: analytics, loading, error } = useApiResource(api.analytics, []);
  const views = metricTotal(analytics, "views");
  const likes = metricTotal(analytics, "likes");
  const shares = metricTotal(analytics, "shares");
  const comments = metricTotal(analytics, "comments");
  const retention = averageMetric(analytics, "retention");
  const series = buildAnalyticsSeries(analytics);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="ANALYTICS" title="Performance" description="Somente métricas persistidas pelo backend." />
      {error && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>Nenhuma métrica demonstrativa será exibida.</span></div></div>}
      <section className="metrics-grid metrics-five">
        <MetricCard label="Views" value={views.toLocaleString("pt-BR")} detail="Total registrado" icon={Eye} tone="blue" />
        <MetricCard label="Retenção" value={`${retention}%`} detail="Média dos snapshots" icon={TrendingUp} tone="green" />
        <MetricCard label="Likes" value={likes.toLocaleString("pt-BR")} detail="Total registrado" icon={Heart} tone="pink" />
        <MetricCard label="Shares" value={shares.toLocaleString("pt-BR")} detail="Total registrado" icon={Share2} tone="purple" />
        <MetricCard label="Comentários" value={comments.toLocaleString("pt-BR")} detail="Total registrado" icon={MessageCircle} tone="cyan" />
      </section>
      <section className="panel">
        <SectionTitle title="Performance ao longo do tempo" subtitle="Snapshots recebidos das plataformas" />
        <PerformanceChart data={series} />
      </section>
      {!loading && !analytics.length && <div className="empty-state">Ainda não existem snapshots de analytics.</div>}
    </div>
  );
}
