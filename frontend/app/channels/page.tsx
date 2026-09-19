import { MoreHorizontal, Plus, RadioTower } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";

const channels=[{name:"Negócios",niche:"Empresas · histórias · decisões",voice:"Narrador BR 01",posts:"3/dia",status:"Ativo"},{name:"Mistérios",niche:"Casos · curiosidades · história",voice:"Narrador BR 02",posts:"2/dia",status:"Ativo"},{name:"Tecnologia",niche:"IA · inovação · produtos",voice:"Narrador BR 01",posts:"2/dia",status:"Pausado"}];

export default function ChannelsPage(){
  return <div className="page-stack"><PageHeader eyebrow="MULTICANAL" title="Canais" description="Cada canal mantém nicho, voz, template, horários e redes independentes." action={<button className="primary-button"><Plus size={16}/> Novo canal</button>}/>
  <div className="channel-grid">{channels.map((c,i)=><article className="channel-card" key={c.name}><div className="channel-card-head"><div className={`channel-avatar avatar-${i}`}><RadioTower size={22}/></div><button className="icon-button"><MoreHorizontal size={18}/></button></div><h3>{c.name}</h3><p>{c.niche}</p><div className="channel-details"><div><span>Voz</span><strong>{c.voice}</strong></div><div><span>Frequência</span><strong>{c.posts}</strong></div><div><span>Plataformas</span><strong>TikTok · Shorts · IG · FB</strong></div></div><StatusBadge tone={c.status==="Ativo"?"green":"neutral"}>{c.status}</StatusBadge></article>)}</div></div>
}
