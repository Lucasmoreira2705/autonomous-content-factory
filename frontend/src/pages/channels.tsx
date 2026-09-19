import { MoreHorizontal, Plus, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";
import { demoChannels } from "@/lib/demo-data";

export function ChannelsPage() {
  const { data: channels } = useApiResource(api.channels, demoChannels);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="MULTICANAL"
        title="Canais"
        description="Cada canal mantém nicho, voz, template, horários e redes independentes."
        action={<Button><Plus size={16} /> Novo canal</Button>}
      />
      <div className="channel-grid">
        {channels.map((channel, index) => (
          <article className="channel-card" key={channel.id}>
            <div className="channel-card-head">
              <div className={`channel-avatar avatar-${index % 3}`}><RadioTower size={22} /></div>
              <Button variant="ghost" size="icon" aria-label="Mais opções"><MoreHorizontal size={18} /></Button>
            </div>
            <h3>{channel.name}</h3>
            <p>{channel.niche}</p>
            <div className="channel-details">
              <div><span>Voz</span><strong>{channel.voice || "Padrão"}</strong></div>
              <div><span>Idioma</span><strong>{channel.language}</strong></div>
              <div><span>Timezone</span><strong>{channel.timezone}</strong></div>
            </div>
            <StatusBadge tone={channel.is_active ? "green" : "neutral"}>{channel.is_active ? "Ativo" : "Pausado"}</StatusBadge>
          </article>
        ))}
      </div>
    </div>
  );
}
