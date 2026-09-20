import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function PublicationsPage() {
  const { data: publications, loading, error } = useApiResource(api.publications, []);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="DISTRIBUIÇÃO" title="Publicações" description="Status real por plataforma, retries e idempotência." />
      {error && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>Nenhuma publicação demonstrativa será exibida.</span></div></div>}
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
          {!loading && !publications.length && <div className="empty-state">Nenhuma publicação registrada.</div>}
        </div>
      </section>
    </div>
  );
}
