import { Bot, CheckCircle2, CircleDashed, RotateCcw, Sparkles } from "lucide-react";
import { contents } from "@/components/mock-data";
import { PageHeader, StatusBadge } from "@/components/ui";

const columns = ["Ideia","Roteiro","Aprovação","Criação","Motion","Revisão","Aprovação final","Metadados","Agendamento","Publicado"];

export default function PipelinePage(){
  return <div className="page-stack"><PageHeader eyebrow="OPERAÇÃO" title="Pipeline" description="Veja cada conteúdo avançando pelos agentes, aprovações e correções." action={<button className="primary-button"><Sparkles size={16}/> Executar pipeline</button>} />
  <div className="pipeline-board">{columns.map((column,idx)=><section className="kanban-column" key={column}><div className="kanban-title"><span>{column}</span><b>{idx < 6 ? Math.max(1,5-idx) : idx===9 ? 125 : 2}</b></div>{contents.filter((_,i)=>i%5===idx%5).slice(0,2).map((item,i)=><article className="job-card" key={item.title}><div className="job-card-top"><StatusBadge tone={i%2?"amber":"blue"}>{item.status}</StatusBadge><Bot size={15}/></div><strong>{item.title}</strong><p>{item.channel} · {item.platform}</p><div className="progress-track"><i style={{width:`${item.progress}%`}}/></div><div className="job-footer"><span>{item.progress}%</span><span>{i%2?<><RotateCcw size={13}/> v2</>:<><CircleDashed size={13}/> ativo</>}</span></div></article>)}{idx===6&&<article className="job-card success-card"><CheckCircle2 size={18}/><strong>2 vídeos aprovados</strong><p>Prontos para metadados</p></article>}</section>)}</div></div>
}
