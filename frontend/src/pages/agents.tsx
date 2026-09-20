import { Activity, AlertTriangle, Bot, BrainCircuit, Clock3, Cpu, PlayCircle, ShieldCheck } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";

function formatRunDate(value: string | null) {
  if (!value) return "Nunca executado";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function AgentsPage() {
  const { data: agents, loading, error } = useApiResource(api.agents, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="AUTOMAÇÃO"
        title="Agentes"
        description="Agentes realmente cadastrados no backend, seus modelos e histórico de execução."
      />

      {error && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>Não foi possível consultar os agentes registrados.</span></div></div>}

      <section className="agent-grid">
        {agents.map((agent) => (
          <article className="agent-card" key={agent.id}>
            <div className="agent-card-head">
              <div className="agent-avatar"><Bot size={23} /></div>
              <StatusBadge tone={agent.enabled ? "green" : "neutral"}>{agent.enabled ? "Ativo" : "Desativado"}</StatusBadge>
            </div>

            <div className="agent-title">
              <h3>{agent.name}</h3>
              <p>{agent.role}</p>
            </div>

            <div className="agent-meta">
              <div><Cpu size={15} /><span>Modelo</span><strong>{agent.model_name || "Sem modelo"}</strong></div>
              <div><PlayCircle size={15} /><span>Execuções</span><strong>{agent.run_count}</strong></div>
              <div><Clock3 size={15} /><span>Última execução</span><strong>{formatRunDate(agent.last_run_at)}</strong></div>
              <div><Activity size={15} /><span>Último status</span><strong>{agent.last_status || "Sem execução"}</strong></div>
            </div>

            {agent.last_duration_ms !== null && <div className="agent-runtime"><BrainCircuit size={14} /> {agent.last_duration_ms} ms na última execução</div>}
            {agent.last_error && <div className="agent-error"><AlertTriangle size={14} /> {agent.last_error}</div>}
            {!agent.last_error && agent.last_status === "SUCCESS" && <div className="agent-ok"><ShieldCheck size={14} /> Última execução concluída sem erro</div>}
          </article>
        ))}
        {!loading && !agents.length && <div className="empty-state">Nenhum agente cadastrado. Execute o seed do backend para registrar os agentes disponíveis.</div>}
      </section>
    </div>
  );
}
