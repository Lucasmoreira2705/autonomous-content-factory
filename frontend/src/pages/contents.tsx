import { AlertTriangle, Filter, MoreHorizontal, Play, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { emptyDashboard } from "@/lib/empty-data";
import { presentJob } from "@/lib/pipeline";

export function ContentsPage() {
  const { data, loading, error } = useApiResource(api.dashboard, emptyDashboard);
  const contents = data.jobs.map(presentJob);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="BIBLIOTECA" title="Conteúdos" description="Todos os jobs e estados reais do pipeline." />
      {error && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>Nenhum conteúdo demonstrativo será exibido.</span></div></div>}
      <div className="toolbar">
        <div className="search-inline"><Search size={16} /><input placeholder="Buscar conteúdo..." /></div>
        <Button variant="outline"><Filter size={15} /> Filtrar</Button>
      </div>
      <section className="content-grid">
        {contents.map((item) => (
          <Link to={`/contents/${item.id}`} className="content-card" key={item.id}>
            <div className="content-thumb"><Play size={24} /></div>
            <div className="content-card-body">
              <div className="content-card-title"><strong>{item.title}</strong><span className="icon-button"><MoreHorizontal size={18} /></span></div>
              <p>{item.channel}</p>
              <div className="content-meta">
                <StatusBadge tone={item.status === "PUBLISHED" ? "green" : item.status.includes("FAILED") ? "red" : "blue"}>{item.status}</StatusBadge>
                <span>{item.stage}</span><span>{item.progress}%</span>
              </div>
            </div>
          </Link>
        ))}
        {!loading && !contents.length && <div className="empty-state">Nenhum conteúdo criado ainda.</div>}
      </section>
    </div>
  );
}
