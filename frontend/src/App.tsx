import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { AgentsPage } from "@/pages/agents";
import { CalendarPage } from "@/pages/calendar";
import { ChannelsPage } from "@/pages/channels";
import { ContentDetailPage } from "@/pages/content-detail";
import { ContentsPage } from "@/pages/contents";
import { DashboardPage } from "@/pages/dashboard";
import { LearningPage } from "@/pages/learning";
import { PerformancePage } from "@/pages/performance";
import { PipelinePage } from "@/pages/pipeline";
import { PublicationsPage } from "@/pages/publications";
import { SettingsPage } from "@/pages/settings";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/contents" element={<ContentsPage />} />
        <Route path="/contents/:id" element={<ContentDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
