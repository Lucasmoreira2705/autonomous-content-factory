import { Bot, CheckCircle2, CircleDashed, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { demoDashboard } from "@/lib/demo-data";
import { bucketForStatus, pipelineStages, presentJob } from "@/lib/pipeline";

export function PipelinePage() {
  const { data } = useApiResource(api.dashboard, demoDashboard);
  const jobs = data.jobs.map(presentJob);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="OPERAÇÃO"
        title="Pipeline"
        description="Veja cada conteúdo avançando pelos agentes, aprovações e correções."
        action={<Button><Sparkles size={16} /> Executar pipeline</Button>}
      />
      <div className="pipeline-board">
        {pipelineStages.map((column) => {
          const columnJobs = jobs.filter((job) => bucketForStatus(job.status) === column.key);
          return (
            <section className="kanban-column" key={column.key}>
              <div className="kanban-title"><span>{column.name}</span><b>{columnJobs.length}</b></div>
              {columnJobs.map((item, index) => (
                <article className="job-card" key={item.id}>
                  <div className="job-card-top">
                    <StatusBadge tone={item.status.includes("FAILED") ? "red" : "blue"}>{item.status}</StatusBadge>
                    <Bot size={15} />
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.channel} · {item.platform}</p>
                  <div className="progress-track"><i style={{ width: `${item.progress}%` }} /></div>
                  <div className="job-footer">
                    <span>{item.progress}%</span>
                    <span>{index % 2 ? <><RotateCcw size={13} /> revisão</> : <><CircleDashed size={13} /> ativo</>}</span>
                  </div>
                </article>
              ))}
              {column.key === "final" && columnJobs.length === 0 && (
                <article className="job-card success-card"><CheckCircle2 size={18} /><strong>Sem pendências</strong><p>Aguardando novos vídeos</p></article>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
