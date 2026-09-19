"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
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
import { useState } from "react";

const navigation = [
  { href: "/", label: "Dashboard", icon: CircleGauge },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/contents", label: "Conteúdos", icon: FileVideo2 },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/channels", label: "Canais", icon: UsersRound },
  { href: "/publications", label: "Publicações", icon: RadioTower },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/learning", label: "Aprendizado", icon: GraduationCap },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <div>
            <strong>Content Factory</strong>
            <span>Autonomous Studio</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={18} /></button>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <div className="sidebar-card-icon"><Clapperboard size={17} /></div>
          <div>
            <span>Autopilot</span>
            <strong>Ativo</strong>
          </div>
          <i className="status-dot" />
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="search-box"><Search size={17} /><input placeholder="Buscar conteúdos, jobs ou canais..." /></div>
          <div className="topbar-actions">
            <select className="channel-select" defaultValue="Negócios"><option>Negócios</option><option>Mistérios</option><option>Tecnologia</option></select>
            <button className="primary-button"><Sparkles size={16} /> Novo conteúdo</button>
          </div>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
