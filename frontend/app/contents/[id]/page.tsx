import { ArrowLeft, Bot, CheckCircle2, Clock3, FileText, History, PlayCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/ui";

export default function ContentDetailPage() {
  return <div className="page-stack">
    <Link href="/contents" className="back-link"><ArrowLeft size={15}/> Voltar para conteúdos</Link>
    <PageHeader eyebrow="JOB #CF-01842" title="A decisão que quase quebrou uma gigante" description="Negócios · Vídeo vertical 9:16 · alvo de 70s" action={<StatusBadge tone="blue">MOTION_PROCESSING</StatusBadge>} />
    <section className="timeline-panel">
      {[["Ideia","Concluído"],["Roteiro","v2 aprovado"],["Criação","Concluído"],["Motion","Processando"],["Revisão","Aguardando"],["Aprovação final","Aguardando"],["Agendamento","Aguardando"]].map(([stage,status],i)=><div className={`timeline-step ${i<3?"done":i===3?"current":""}`} key={stage}><i>{i<3?<CheckCircle2 size={16}/>:<span>{i+1}</span>}</i><div><strong>{stage}</strong><small>{status}</small></div></div>)}
    </section>
    <div className="detail-grid">
      <section className="panel"><div className="detail-tabs"><button className="active"><FileText size={15}/> Roteiro</button><button><PlayCircle size={15}/> Criação</button><button><History size={15}/> Versões</button></div><div className="script-preview"><span>ROTEIRO v2 · APROVADO</span><h3>“Uma única decisão colocou uma empresa bilionária a poucos passos do colapso.”</h3><p>O problema não começou com uma crise enorme. Começou com uma decisão aparentemente simples, tomada rápido demais...</p><p>Nos segundos seguintes, o vídeo contextualiza a escolha, mostra a pressão do momento e conduz para a virada principal sem entregar tudo cedo demais.</p><blockquote>Correção aplicada na v2: “encurtar o fechamento e reforçar a informação principal nos 10 segundos finais”.</blockquote></div></section>
      <aside className="panel job-side"><div><span>Agente atual</span><strong><Bot size={17}/> motion_agent</strong></div><div><span>Iniciado</span><strong><Clock3 size={17}/> hoje, 19:42</strong></div><div><span>Score do roteiro</span><strong>91 / 100</strong></div><div><span>Tentativas</span><strong>2 de 5</strong></div><div><span>Próximo passo</span><strong>Revisão automática</strong></div></aside>
    </div>
  </div>
}
