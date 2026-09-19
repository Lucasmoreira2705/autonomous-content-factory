import { Filter, MoreHorizontal, Play, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { demoDashboard } from "@/lib/demo-data";
import { presentJob } from "@/lib/pipeline";

export function ContentsPage() {
  const { data } = useApiResource(api.dashboard, demoDashboard);
  const contents = data.jobs.map(presentJob);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="BIBLIOTECA" title="Conteúdos" description="Todos os vídeos, versões, aprovações e estados do pipeline." />
      <div className="toolbar">
        <div className="search-inline"><Search size={16} /><input placeholder="Buscar conteúdo..." /></div>
        <Button variant="outline"><Filter size={15} /> Filtrar</Button>
      </div>
      <section className="content-grid">
        {contents.map((item, index) => (
          <Link to={`/contents/${item.id}`} className="content-card" key={item.id}>
            <div className="content-thumb"><Play size={24} /><span>{index % 3 === 0 ? "01:12" : "00:58"}</span></div>
            <div className="content-card-body">
              <div className="content-card-title"><strong>{item.title}</strong><span className="icon-button"><MoreHorizontal size={18} /></span></div>
              <p>{item.channel} · {item.platform}</p>
              <div className="content-meta">
                <StatusBadge tone={item.status === "PUBLISHED" ? "green" : item.status.includes("FAILED") ? "red" : "blue"}>{item.status}</StatusBadge>
                <span>{item.stage}</span><span>{item.progress}%</span>
              </div>
            </div>
          </Link>
        ))}
        {contents.length === 0 && <div className="empty-state">Nenhum conteúdo disponível.</div>}
      </section>
    </div>
  );
}
