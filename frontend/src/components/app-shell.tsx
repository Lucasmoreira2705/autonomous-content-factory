import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CircleGauge,
  Clapperboard,
  FileVideo2,
  GraduationCap,
  Menu,
  RadioTower,
  Search,
  Settings,
  Sparkles,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiResource } from "@/hooks/use-api-resource";
import { api } from "@/lib/api";

const navigation = [
  { href: "/", label: "Dashboard", icon: CircleGauge },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/agents", label: "Agentes", icon: Bot },
  { href: "/contents", label: "Conteúdos", icon: FileVideo2 },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/channels", label: "Canais", icon: UsersRound },
  { href: "/publications", label: "Publicações", icon: RadioTower },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/learning", label: "Aprendizado", icon: GraduationCap },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: channels } = useApiResource(api.channels, []);
  const { error: healthError } = useApiResource(api.health, { status: "checking" });

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <div>
            <strong>Content Factory</strong>
            <span>Autonomous Studio</span>
          </div>
          <Button className="mobile-close" variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={18} /></Button>
        </div>

        <nav className="nav-list">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-icon"><Clapperboard size={17} /></div>
          <div>
            <span>Backend</span>
            <strong>{healthError ? "Offline" : "Conectado"}</strong>
          </div>
          <i className={`status-dot ${healthError ? "offline" : ""}`} />
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <Button className="mobile-menu" variant="outline" size="icon" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20} /></Button>
          <div className="search-box"><Search size={17} /><Input className="border-0 bg-transparent p-0 focus:border-0" placeholder="Buscar conteúdos, jobs ou canais..." /></div>
          <div className="topbar-actions">
            <select className="channel-select" disabled={!channels.length} defaultValue="">
              <option value="">{channels.length ? "Todos os canais" : "Sem canais"}</option>
              {channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
            </select>
            <Button className="primary-button"><Sparkles size={16} /> Novo conteúdo</Button>
          </div>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
