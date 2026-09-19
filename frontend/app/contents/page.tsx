import { Filter, MoreHorizontal, Play, Search } from "lucide-react";
import Link from "next/link";
import { contents } from "@/components/mock-data";
import { PageHeader, StatusBadge } from "@/components/ui";

export default function ContentsPage(){
  return <div className="page-stack"><PageHeader eyebrow="BIBLIOTECA" title="Conteúdos" description="Todos os vídeos, versões, aprovações e estados do pipeline."/>
  <div className="toolbar"><div className="search-inline"><Search size={16}/><input placeholder="Buscar conteúdo..."/></div><button className="ghost-button"><Filter size={15}/> Filtrar</button></div>
  <section className="content-grid">{[...contents,...contents].map((item,i)=><Link href="/contents/CF-01842" className="content-card" key={`${item.title}-${i}`}><div className="content-thumb"><Play size={24}/><span>{i%3===0?"01:12":"00:58"}</span></div><div className="content-card-body"><div className="content-card-title"><strong>{item.title}</strong><button className="icon-button" aria-label="Mais opções"><MoreHorizontal size={18}/></button></div><p>{item.channel} · {item.platform}</p><div className="content-meta"><StatusBadge tone={item.status==="APROVADO"?"green":item.status==="REVISÃO"?"amber":"blue"}>{item.status}</StatusBadge><span>{item.stage}</span><span>{item.progress}%</span></div></div></Link>)}</section></div>
}
