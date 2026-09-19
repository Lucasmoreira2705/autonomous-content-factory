import { BrainCircuit, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";

const insights=[["Retenção","Vídeos sobre falências empresariais tiveram retenção 24% maior.","Alta"],["Duração","Vídeos entre 65 e 75 segundos performaram melhor nos últimos 14 dias.","Alta"],["Gancho","Começar com conflito direto superou perguntas genéricas em 19%.","Média"],["Horário","O slot das 20h lidera em views para o canal Negócios.","Alta"]];

export default function LearningPage(){
  return <div className="page-stack"><PageHeader eyebrow="MEMÓRIA DO SISTEMA" title="Aprendizado" description="Insights que retornam automaticamente para os agentes de ideia e roteiro."/>
  <div className="learning-hero"><div className="brain-orb"><BrainCircuit size={34}/></div><div><span>BASE DE CONHECIMENTO</span><h2>O sistema está aprendendo com 125 publicações.</h2><p>12 novos padrões foram identificados nesta semana.</p></div><StatusBadge tone="green"><TrendingUp size={13}/> confiança 87%</StatusBadge></div>
  <section className="insight-grid">{insights.map(([cat,text,confidence],i)=><article className="insight-card" key={text}><div className={`insight-icon insight-${i}`}><Lightbulb size={18}/></div><span>{cat}</span><h3>{text}</h3><div><StatusBadge tone={confidence==="Alta"?"green":"amber"}>{confidence} confiança</StatusBadge><small>Atualizado hoje</small></div></article>)}</section>
  <section className="panel recommendation"><Sparkles size={21}/><div><strong>Próxima recomendação do Agente Aprendiz</strong><p>Priorizar histórias de negócios com uma decisão crítica nos primeiros 2 segundos e duração alvo de 70 segundos.</p></div><button className="ghost-button">Aplicar como regra</button></section></div>
}
