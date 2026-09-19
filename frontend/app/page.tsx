import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Eye, Film, Sparkles, TrendingUp } from "lucide-react";
import { contents, pipeline } from "@/components/mock-data";
import { PerformanceChart } from "@/components/performance-chart";
import { MetricCard, PageHeader, SectionTitle, StatusBadge } from "@/components/ui";

export default function DashboardPage() {
  return <div className="page-stack">
    <PageHeader eyebrow="VISÃO GERAL" title="Sua fábrica está produzindo." description="Acompanhe criação, revisão, publicação e aprendizado em um único lugar." action={<button className="ghost-button"><Clock3 size={16}/> Ver atividade</button>} />
    <section className="metrics-grid">
      <MetricCard label="Ideias hoje" value="18" detail="+6 vs. ontem" icon={Sparkles} tone="purple" />
      <MetricCard label="Em produção" value="12" detail="5 agentes ativos" icon={Film} tone="blue" />
      <MetricCard label="Publicados hoje" value="9" detail="Meta diária: 12" icon={CheckCircle2} tone="green" />
      <MetricCard label="Views 7 dias" value="220,6k" detail="+28,4%" icon={Eye} tone="cyan" />
      <MetricCard label="Retenção média" value="72%" detail="+4,8 p.p." icon={TrendingUp} tone="pink" />
      <MetricCard label="Atenção necessária" value="2" detail="1 revisão · 1 API" icon={AlertTriangle} tone="amber" />
    </section>

    <section className="panel">
      <SectionTitle title="Pipeline ao vivo" subtitle="Volume atual em cada etapa da produção" right={<a className="text-link" href="/pipeline">Abrir pipeline <ArrowUpRight size={14}/></a>} />
      <div className="pipeline-strip">{pipeline.map((item, index) => <div className="pipeline-step" key={item.name}><div className={`pipeline-node ${item.tone}`}>{item.count}</div><span>{item.name}</span>{index < pipeline.length - 1 && <i />}</div>)}</div>
    </section>

    <div className="dashboard-split">
      <section className="panel">
        <SectionTitle title="Performance" subtitle="Views dos últimos 7 dias" right={<StatusBadge tone="green">+28,4%</StatusBadge>} />
        <PerformanceChart />
      </section>
      <section className="panel schedule-panel">
        <SectionTitle title="Próximos slots" subtitle="Fila de publicação de hoje" />
        {[["10:00","O mistério que ficou 27 anos...","Multi"],["15:00","O erro de 30 segundos...","Shorts"],["20:00","A decisão que quase quebrou...","Multi"]].map(([time,title,platform]) => <div className="schedule-row" key={time}><div className="time-box">{time}</div><div><strong>{title}</strong><span>{platform}</span></div><StatusBadge tone="blue">Agendado</StatusBadge></div>)}
      </section>
    </div>

    <section className="panel">
      <SectionTitle title="Conteúdos em andamento" subtitle="Acompanhe os jobs que ainda não chegaram ao fim" right={<a className="text-link" href="/contents">Ver todos <ArrowUpRight size={14}/></a>} />
      <div className="data-table"><div className="table-head"><span>Conteúdo</span><span>Etapa</span><span>Status</span><span>Progresso</span><span>Slot</span></div>{contents.slice(0,4).map(item => <div className="table-row" key={item.title}><div><strong>{item.title}</strong><small>{item.channel} · {item.platform}</small></div><span>{item.stage}</span><StatusBadge tone={item.status === "APROVADO" ? "green" : item.status === "REVISÃO" ? "amber" : "blue"}>{item.status}</StatusBadge><div className="progress-cell"><div className="progress-track"><i style={{width:`${item.progress}%`}} /></div><small>{item.progress}%</small></div><span>{item.time}</span></div>)}</div>
    </section>
  </div>;
}
