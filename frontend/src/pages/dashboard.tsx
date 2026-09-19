import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Eye, Film, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, SectionTitle, StatusBadge } from "@/components/common";
import { PerformanceChart } from "@/components/performance-chart";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { demoDashboard } from "@/lib/demo-data";
import { countStage, pipelineStages, presentJob } from "@/lib/pipeline";

export function DashboardPage() {
  const { data, usingFallback } = useApiResource(api.dashboard, demoDashboard);
  const contents = data.jobs.map(presentJob);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="VISÃO GERAL"
        title="Sua fábrica está produzindo."
        description="Acompanhe criação, revisão, publicação e aprendizado em um único lugar."
        action={<Button variant="outline"><Clock3 size={16} /> Ver atividade</Button>}
      />

      {usingFallback && <div className="demo-notice">Backend indisponível: exibindo dados de demonstração do frontend.</div>}

      <section className="metrics-grid">
        <MetricCard label="Ideias" value={String(data.totals.ideas)} detail="Banco de ideias" icon={Sparkles} tone="purple" />
        <MetricCard label="Em produção" value={String(data.totals.jobs_active)} detail="Jobs ativos" icon={Film} tone="blue" />
        <MetricCard label="Publicados" value={String(data.totals.published)} detail="Total registrado" icon={CheckCircle2} tone="green" />
        <MetricCard label="Views 7 dias" value="220,6k" detail="Analytics conectado na API" icon={Eye} tone="cyan" />
        <MetricCard label="Retenção média" value="72%" detail="Atualiza com snapshots" icon={TrendingUp} tone="pink" />
        <MetricCard label="Atenção necessária" value={String(data.totals.errors)} detail="Falhas/intervenções" icon={AlertTriangle} tone="amber" />
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
              <div className={`pipeline-node ${item.tone}`}>{countStage(data.pipeline, item.key)}</div>
              <span>{item.name}</span>
              {index < pipelineStages.length - 1 && <i />}
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-split">
        <section className="panel">
          <SectionTitle title="Performance" subtitle="Visualização dos últimos 7 dias" right={<StatusBadge tone="green">API ready</StatusBadge>} />
          <PerformanceChart />
        </section>
        <section className="panel schedule-panel">
          <SectionTitle title="Próximos slots" subtitle="Fila planejada" />
          {[["10:00", "Primeiro slot disponível", "Multi"], ["15:00", "Segundo slot disponível", "Shorts"], ["20:00", "Terceiro slot disponível", "Multi"]].map(([time, title, platform]) => (
            <div className="schedule-row" key={time}>
              <div className="time-box">{time}</div>
              <div><strong>{title}</strong><span>{platform}</span></div>
              <StatusBadge tone="blue">Planejado</StatusBadge>
            </div>
          ))}
        </section>
      </div>

      <section className="panel">
        <SectionTitle
          title="Conteúdos em andamento"
          subtitle="Jobs mais recentes"
          right={<Link className="text-link" to="/contents">Ver todos <ArrowUpRight size={14} /></Link>}
        />
        <div className="data-table">
          <div className="table-head"><span>Conteúdo</span><span>Etapa</span><span>Status</span><span>Progresso</span><span>Slot</span></div>
          {contents.slice(0, 6).map((item) => (
            <div className="table-row" key={item.id}>
              <div><strong>{item.title}</strong><small>{item.channel} · {item.platform}</small></div>
              <span>{item.stage}</span>
              <StatusBadge tone={item.status.includes("FAILED") || item.status.includes("INTERVENTION") ? "red" : item.status.includes("APPROVED") || item.status === "PUBLISHED" ? "green" : "blue"}>{item.status}</StatusBadge>
              <div className="progress-cell"><div className="progress-track"><i style={{ width: `${item.progress}%` }} /></div><small>{item.progress}%</small></div>
              <span>{item.time}</span>
            </div>
          ))}
          {contents.length === 0 && <div className="empty-state">Nenhum job criado ainda.</div>}
        </div>
      </section>
    </div>
  );
}
