import { AlertTriangle, BrainCircuit, Lightbulb, TrendingUp } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";

export function LearningPage() {
  const { data: insights, loading, error } = useApiResource(api.learning, []);
  const confidenceValues = insights.map((item) => item.confidence).filter((value): value is number => value !== null);
  const averageConfidence = confidenceValues.length
    ? Math.round((confidenceValues.reduce((total, value) => total + value, 0) / confidenceValues.length) * 100)
    : 0;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="MEMÓRIA DO SISTEMA" title="Aprendizado" description="Insights reais persistidos pelo Agente Aprendiz." />
      {error && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>Nenhum insight demonstrativo será exibido.</span></div></div>}
      <div className="learning-hero">
        <div className="brain-orb"><BrainCircuit size={34} /></div>
        <div><span>BASE DE CONHECIMENTO</span><h2>{insights.length} insights registrados.</h2><p>Os dados aparecem aqui somente depois de serem persistidos pelo backend.</p></div>
        <StatusBadge tone="green"><TrendingUp size={13} /> confiança {averageConfidence}%</StatusBadge>
      </div>
      <section className="insight-grid">
        {insights.map((insight, index) => (
          <article className="insight-card" key={insight.id}>
            <div className={`insight-icon insight-${index % 4}`}><Lightbulb size={18} /></div>
            <span>{insight.insight_type}</span>
            <h3>{insight.statement}</h3>
            <div>
              <StatusBadge tone={(insight.confidence ?? 0) >= 0.8 ? "green" : "amber"}>{Math.round((insight.confidence ?? 0) * 100)}% confiança</StatusBadge>
              <small>{new Date(insight.created_at).toLocaleDateString("pt-BR")}</small>
            </div>
          </article>
        ))}
        {!loading && !insights.length && <div className="empty-state">Nenhum aprendizado registrado ainda.</div>}
      </section>
    </div>
  );
}
