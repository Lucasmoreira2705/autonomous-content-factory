import { BrainCircuit, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { demoLearning } from "@/lib/demo-data";

export function LearningPage() {
  const { data: insights } = useApiResource(api.learning, demoLearning);
  const averageConfidence = insights.length
    ? Math.round((insights.reduce((total, item) => total + (item.confidence ?? 0), 0) / insights.length) * 100)
    : 0;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="MEMÓRIA DO SISTEMA" title="Aprendizado" description="Insights que retornam automaticamente para os agentes de ideia e roteiro." />
      <div className="learning-hero">
        <div className="brain-orb"><BrainCircuit size={34} /></div>
        <div><span>BASE DE CONHECIMENTO</span><h2>O sistema está aprendendo com o histórico publicado.</h2><p>{insights.length} insights disponíveis na API.</p></div>
        <StatusBadge tone="green"><TrendingUp size={13} /> confiança {averageConfidence}%</StatusBadge>
      </div>
      <section className="insight-grid">
        {insights.map((insight, index) => (
          <article className="insight-card" key={insight.id}>
            <div className={`insight-icon insight-${index % 4}`}><Lightbulb size={18} /></div>
            <span>{insight.insight_type}</span>
            <h3>{insight.statement}</h3>
            <div><StatusBadge tone={(insight.confidence ?? 0) >= 0.8 ? "green" : "amber"}>{Math.round((insight.confidence ?? 0) * 100)}% confiança</StatusBadge><small>Atualizado via API</small></div>
          </article>
        ))}
      </section>
      <section className="panel recommendation">
        <Sparkles size={21} />
        <div><strong>Agente Aprendiz</strong><p>Os insights continuam sendo calculados pelo backend; o React apenas exibe os resultados.</p></div>
        <Button variant="outline">Aplicar como regra</Button>
      </section>
    </div>
  );
}
