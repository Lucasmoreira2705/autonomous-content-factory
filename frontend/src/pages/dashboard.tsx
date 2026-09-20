import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Eye, Film, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, SectionTitle, StatusBadge } from "@/components/common";
import { PerformanceChart } from "@/components/performance-chart";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { averageMetric, buildAnalyticsSeries, lastSevenDays, metricTotal } from "@/lib/analytics";
import { emptyDashboard } from "@/lib/empty-data";
import { countStage, pipelineStages, presentJob } from "@/lib/pipeline";

export function DashboardPage() {
  const dashboard = useApiResource(api.dashboard, emptyDashboard);
  const analytics = useApiResource(api.analytics, []);
  const calendar = useApiResource(api.calendar, []);

  const contents = dashboard.data.jobs.map(presentJob);
  const recentAnalytics = lastSevenDays(analytics.data);
  const views7d = metricTotal(recentAnalytics, "views");
  const retention = averageMetric(recentAnalytics, "retention");
  const series = buildAnalyticsSeries(recentAnalytics);
  const upcomingSlots = calendar.data
    .filter((slot) => new Date(slot.scheduled_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3);
  const hasConnectionError = Boolean(dashboard.error || analytics.error || calendar.error);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="VISÃO GERAL"
        title="Sua fábrica de conteúdo"
        description="Acompanhe dados reais de criação, revisão, publicação e aprendizado."
        action={<Button variant="outline"><Clock3 size={16} /> Ver atividade</Button>}
      />

      {hasConnectionError && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível ou parcialmente inacessível</strong><span>O frontend não exibe dados simulados. Inicie o FastAPI para carregar as informações reais.</span></div></div>}

      <section className="metrics-grid">
        <MetricCard label="Ideias" value={String(dashboard.data.totals.ideas)} detail="Banco de ideias" icon={Sparkles} tone="purple" />
        <MetricCard label="Em produção" value={String(dashboard.data.totals.jobs_active)} detail="Jobs ativos" icon={Film} tone="blue" />
        <MetricCard label="Publicados" value={String(dashboard.data.totals.published)} detail="Total registrado" icon={CheckCircle2} tone="green" />
        <MetricCard label="Views 7 dias" value={views7d.toLocaleString("pt-BR")} detail="Somente analytics reais" icon={Eye} tone="cyan" />
        <MetricCard label="Retenção média" value={`${retention}%`} detail="Snapshots dos últimos 7 dias" icon={TrendingUp} tone="pink" />
        <MetricCard label="Atenção necessária" value={String(dashboard.data.totals.errors)} detail="Falhas/intervenções" icon={AlertTriangle} tone="amber" />
      </section>

      <section className="panel">
        <SectionTitle
          title="Pipeline ao vivo"
          subtitle="Volume atual em cada etapa da produção"
          right={<Link className="text-link" to="/pipeline">Abrir pipeline <ArrowUpRight size={14} /></Link>}
        />
        <div className="pipeline-strip">
          {pipelineStages.map((item, index) => (
            <div className="pipeline-step" key={item.key}>
              <div className={`pipeline-node ${item.tone}`}>{countStage(dashboard.data.pipeline, item.key)}</div>
              <span>{item.name}</span>
              {index < pipelineStages.length - 1 && <i />}
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-split">
        <section className="panel">
          <SectionTitle title="Performance" subtitle="Dados reais dos últimos 7 dias" />
          <PerformanceChart data={series} />
        </section>
        <section className="panel schedule-panel">
          <SectionTitle title="Próximos agendamentos" subtitle="Slots registrados no backend" />
          {upcomingSlots.map((slot) => (
            <div className="schedule-row" key={slot.id}>
              <div className="time-box">{new Date(slot.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
              <div>
                <strong>{slot.video_id || "Slot disponível"}</strong>
                <span>{slot.channel} · {slot.platform} · {new Date(slot.scheduled_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <StatusBadge tone="blue">{slot.status}</StatusBadge>
            </div>
          ))}
          {!calendar.loading && !upcomingSlots.length && <div className="empty-state">Nenhum agendamento futuro.</div>}
        </section>
      </div>

      <section className="panel">
        <SectionTitle
          title="Conteúdos em andamento"
          subtitle="Jobs persistidos no backend"
          right={<Link className="text-link" to="/contents">Ver todos <ArrowUpRight size={14} /></Link>}
        />
        <div className="data-table">
          <div className="table-head"><span>Conteúdo</span><span>Etapa</span><span>Status</span><span>Progresso</span><span>Criado</span></div>
          {contents.slice(0, 6).map((item) => (
            <div className="table-row" key={item.id}>
              <div><strong>{item.title}</strong><small>{item.channel}</small></div>
              <span>{item.stage}</span>
              <StatusBadge tone={item.status.includes("FAILED") || item.status.includes("INTERVENTION") ? "red" : item.status.includes("APPROVED") || item.status === "PUBLISHED" ? "green" : "blue"}>{item.status}</StatusBadge>
              <div className="progress-cell"><div className="progress-track"><i style={{ width: `${item.progress}%` }} /></div><small>{item.progress}%</small></div>
              <span>{new Date(dashboard.data.jobs.find((job) => job.id === item.id)?.created_at || Date.now()).toLocaleDateString("pt-BR")}</span>
            </div>
          ))}
          {!dashboard.loading && !contents.length && <div className="empty-state">Nenhum job criado ainda.</div>}
        </div>
      </section>
    </div>
  );
}
