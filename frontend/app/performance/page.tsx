import { Eye, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { PerformanceChart } from "@/components/performance-chart";
import { MetricCard, PageHeader, SectionTitle, StatusBadge } from "@/components/ui";

export default function PerformancePage(){
  return <div className="page-stack"><PageHeader eyebrow="ANALYTICS" title="Performance" description="Descubra quais temas, ganchos, horários e plataformas geram mais resultado."/>
  <section className="metrics-grid metrics-five"><MetricCard label="Views" value="1,28M" detail="+31%" icon={Eye} tone="blue"/><MetricCard label="Retenção" value="72%" detail="+4,8 p.p." icon={TrendingUp} tone="green"/><MetricCard label="Likes" value="84,2k" detail="6,5% rate" icon={Heart} tone="pink"/><MetricCard label="Shares" value="12,8k" detail="+18%" icon={Share2} tone="purple"/><MetricCard label="Comentários" value="8,4k" detail="+9%" icon={MessageCircle} tone="cyan"/></section>
  <div className="dashboard-split"><section className="panel"><SectionTitle title="Views por dia" subtitle="Últimos 7 dias"/><PerformanceChart/></section><section className="panel"><SectionTitle title="O que mais performa" subtitle="Padrões atuais"/><div className="ranking-list">{[["1","Falências empresariais","+24% retenção"],["2","Ganchos com conflito","+19% conclusão"],["3","65–75 segundos","+14% watch time"],["4","Slot das 20h","+11% views"]].map(r=><div key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><StatusBadge tone="green">{r[2]}</StatusBadge></div>)}</div></section></div></div>
}
