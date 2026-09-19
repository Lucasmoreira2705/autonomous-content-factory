import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { demoPublications } from "@/lib/demo-data";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function PublicationsPage() {
  const { data: publications } = useApiResource(api.publications, demoPublications);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="DISTRIBUIÇÃO" title="Publicações" description="Status independente por plataforma, retries e idempotência." />
      <section className="panel">
        <div className="data-table publication-table">
          <div className="table-head"><span>Vídeo</span><span>Plataforma</span><span>Agendado</span><span>Publicado</span><span>Status</span><span></span></div>
          {publications.map((publication) => (
            <div className="table-row" key={publication.id}>
              <strong>{publication.video_id}</strong>
              <span>{publication.platform}</span>
              <span>{formatDate(publication.scheduled_at)}</span>
              <span>{formatDate(publication.published_at)}</span>
              <StatusBadge tone={publication.status === "PUBLISHED" ? "green" : publication.status.includes("FAIL") || publication.status.includes("RETRY") ? "amber" : "blue"}>{publication.status}</StatusBadge>
              <Button variant="ghost" size="icon" aria-label="Ação da publicação">{publication.status.includes("RETRY") ? <RefreshCw size={16} /> : <ExternalLink size={16} />}</Button>
            </div>
          ))}
          {publications.length === 0 && <div className="empty-state">Nenhuma publicação registrada.</div>}
        </div>
      </section>
    </div>
  );
}
