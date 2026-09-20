import { AlertTriangle, ArrowLeft, Bot, CheckCircle2, Clock3, FileText, History, PlayCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { emptyDashboard } from "@/lib/empty-data";
import { presentJob } from "@/lib/pipeline";

export function ContentDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useApiResource(api.dashboard, emptyDashboard);
  const source = data.jobs.find((job) => job.id === id);
  const job = source ? presentJob(source) : null;

  if (error) {
    return <div className="page-stack"><div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>Não foi possível carregar este job.</span></div></div></div>;
  }

  if (!job || !source) {
    return <div className="page-stack"><Link to="/contents" className="back-link"><ArrowLeft size={15} /> Voltar para conteúdos</Link><div className="empty-state">{loading ? "Carregando job..." : "Job não encontrado."}</div></div>;
  }

  const stages = ["Ideia", "Roteiro", "Aprovação", "Criação", "Motion", "Revisão", "Aprovação final", "Agendamento", "Publicação"];
  const currentIndex = Math.max(0, stages.indexOf(job.stage));

  return (
    <div className="page-stack">
      <Link to="/contents" className="back-link"><ArrowLeft size={15} /> Voltar para conteúdos</Link>
      <PageHeader
        eyebrow={`JOB #${job.id}`}
        title={job.title}
        description={`${job.channel} · Vídeo vertical 9:16 · alvo de ${source.target_duration_seconds}s`}
        action={<StatusBadge tone="blue">{job.status}</StatusBadge>}
      />
      <section className="timeline-panel">
        {stages.map((stage, index) => (
          <div className={`timeline-step ${index < currentIndex ? "done" : index === currentIndex ? "current" : ""}`} key={stage}>
            <i>{index < currentIndex ? <CheckCircle2 size={16} /> : <span>{index + 1}</span>}</i>
            <div><strong>{stage}</strong><small>{index < currentIndex ? "Concluído" : index === currentIndex ? "Em andamento" : "Aguardando"}</small></div>
          </div>
        ))}
      </section>
      <div className="detail-grid">
        <section className="panel">
          <div className="detail-tabs"><button className="active"><FileText size={15} /> Roteiro</button><button><PlayCircle size={15} /> Criação</button><button><History size={15} /> Versões</button></div>
          <div className="script-preview">
            <span>ROTEIRO v{source.script_revision_count || 0}</span>
            <h3>{job.title}</h3>
            <p>O conteúdo do roteiro permanece armazenado e versionado no backend Python. Esta tela React não executa IA ou processamento de vídeo.</p>
            <blockquote>Status atual: {job.status}. Progresso visual: {job.progress}%.</blockquote>
          </div>
        </section>
        <aside className="panel job-side">
          <div><span>Etapa atual</span><strong><Bot size={17} /> {job.stage}</strong></div>
          <div><span>Criado</span><strong><Clock3 size={17} /> {new Date(source.created_at).toLocaleString("pt-BR")}</strong></div>
          <div><span>Revisões de roteiro</span><strong>{source.script_revision_count}</strong></div>
          <div><span>Tentativas</span><strong>{source.retry_count} de {source.max_attempts}</strong></div>
          <div><span>Próximo passo</span><strong>Controlado pelo orquestrador Python</strong></div>
        </aside>
      </div>
    </div>
  );
}
