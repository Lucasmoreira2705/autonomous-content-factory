import { Bell, Brain, Clock3, KeyRound, Mic2, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common";

const sections = [
  { icon: Brain, title: "IA e modelos" },
  { icon: Mic2, title: "Voz e áudio" },
  { icon: Clock3, title: "Agendamento" },
  { icon: SlidersHorizontal, title: "Qualidade" },
  { icon: KeyRound, title: "Integrações" },
  { icon: Bell, title: "Alertas" },
];

export function SettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="CONTROLE" title="Configurações" description="Ajuste o comportamento da fábrica sem alterar o código." action={<Button><Save size={16} /> Salvar alterações</Button>} />
      <div className="settings-layout">
        <aside className="settings-nav">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return <button className={index === 0 ? "selected" : ""} key={section.title}><Icon size={17} /><span>{section.title}</span></button>;
          })}
        </aside>
        <section className="panel settings-panel">
          <div className="settings-heading"><Brain size={20} /><div><h2>IA e modelos</h2><p>Escolha o modelo local utilizado por cada etapa.</p></div></div>
          {[["Agente de ideia", "qwen3:8b"], ["Agente de roteiro", "qwen3:8b"], ["Aprovação de roteiro", "qwen3:8b"], ["Agente de revisão", "qwen3:8b"], ["Aprovação final", "qwen3:8b"]].map(([label, value]) => (
            <label className="setting-row" key={label}>
              <span><strong>{label}</strong><small>Execução local via Ollama no backend</small></span>
              <select defaultValue={value}><option>qwen3:8b</option><option>gemma3:4b</option><option>llama3.1:8b</option></select>
            </label>
          ))}
          <div className="security-note"><ShieldCheck size={18} /><span>Nenhum token, senha ou API key é enviado ao bundle React.</span></div>
        </section>
      </div>
    </div>
  );
}
