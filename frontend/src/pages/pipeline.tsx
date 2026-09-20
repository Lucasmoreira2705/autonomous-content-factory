import { AlertTriangle, Bot, CircleDashed, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { emptyDashboard } from "@/lib/empty-data";
import { bucketForStatus, pipelineStages, presentJob } from "@/lib/pipeline";

export function PipelinePage() {
  const { data, loading, error } = useApiResource(api.dashboard, emptyDashboard);
  const jobs = data.jobs.map(presentJob);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="OPERAÇÃO"
        title="Pipeline"
        description="Veja cada conteúdo real avançando pelos agentes, aprovações e correções."
        action={<Button><Sparkles size={16} /> Executar pipeline</Button>}
      />
      {error && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>O pipeline não exibirá dados inventados.</span></div></div>}
      <div className="pipeline-board">
        {pipelineStages.map((column) => {
          const columnJobs = jobs.filter((job) => bucketForStatus(job.status) === column.key);
          return (
            <section className="kanban-column" key={column.key}>
              <div className="kanban-title"><span>{column.name}</span><b>{columnJobs.length}</b></div>
              {columnJobs.map((item) => (
                <article className="job-card" key={item.id}>
                  <div className="job-card-top">
                    <StatusBadge tone={item.status.includes("FAILED") ? "red" : "blue"}>{item.status}</StatusBadge>
                    <Bot size={15} />
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.channel}</p>
                  <div className="progress-track"><i style={{ width: `${item.progress}%` }} /></div>
                  <div className="job-footer"><span>{item.progress}%</span><span><CircleDashed size={13} /> {item.stage}</span></div>
                </article>
              ))}
              {!loading && !columnJobs.length && <div className="kanban-empty">0 itens</div>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
