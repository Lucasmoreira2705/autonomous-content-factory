import { ExternalLink, RefreshCw } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";

const rows=[["O mistério que ficou 27 anos sem resposta","TikTok","10:00","10:01","Publicado"],["O erro de 30 segundos que custou milhões","YouTube Shorts","15:00","—","Agendado"],["A decisão que quase quebrou uma gigante","Instagram","20:00","—","Agendado"],["A tecnologia escondida dentro do seu bolso","Facebook","10:00","10:03","Publicado"],["Por que algumas empresas somem?","TikTok","15:00","—","Retry"]];

export default function PublicationsPage(){
  return <div className="page-stack"><PageHeader eyebrow="DISTRIBUIÇÃO" title="Publicações" description="Status independente por plataforma, retries e idempotência."/>
  <section className="panel"><div className="data-table publication-table"><div className="table-head"><span>Conteúdo</span><span>Plataforma</span><span>Agendado</span><span>Publicado</span><span>Status</span><span></span></div>{rows.map((r)=><div className="table-row" key={r[0]+r[1]}><strong>{r[0]}</strong><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span><StatusBadge tone={r[4]==="Publicado"?"green":r[4]==="Retry"?"amber":"blue"}>{r[4]}</StatusBadge><button className="icon-button">{r[4]==="Retry"?<RefreshCw size={16}/>:<ExternalLink size={16}/>}</button></div>)}</div></section></div>
}
