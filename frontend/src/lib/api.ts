export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export type UiJob = {
  id: string;
  title: string;
  channel: string;
  status: string;
  retry_count: number;
  script_revision_count: number;
  max_attempts: number;
  target_duration_seconds: number;
  created_at: string;
};

export type AnalyticsPoint = {
  date: string;
  views: number;
  retention: number;
};

export type CalendarSlotView = {
  id: string;
  channel: string;
  platform: string;
  scheduled_at: string;
  video_id: string | null;
  status: string;
};

export type DashboardSnapshot = {
  totals: {
    ideas: number;
    jobs_active: number;
    published: number;
    errors: number;
  };
  jobs: UiJob[];
  pipeline: Record<string, number>;
};

export type ChannelView = {
  id: string;
  name: string;
  niche: string;
  language: string;
  voice: string | null;
  timezone: string;
  is_active: boolean;
};

export type PublicationView = {
  id: string;
  video_id: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  url: string | null;
  retry_count: number;
};

export type LearningView = {
  id: string;
  insight_type: string;
  statement: string;
  confidence: number | null;
  created_at: string;
};

export type AnalyticsView = {
  id: string;
  publication_id: string;
  captured_at: string;
  metrics: Record<string, number | string | null>;
};

export type AgentView = {
  id: string;
  name: string;
  role: string;
  model_name: string | null;
  enabled: boolean;
  run_count: number;
  last_run_at: string | null;
  last_status: string | null;
  last_duration_ms: number | null;
  last_error: string | null;
};

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => apiFetch<DashboardSnapshot>("/ui/dashboard"),
  channels: () => apiFetch<ChannelView[]>("/ui/channels"),
  publications: () => apiFetch<PublicationView[]>("/ui/publications"),
  learning: () => apiFetch<LearningView[]>("/ui/learning"),
  analytics: () => apiFetch<AnalyticsView[]>("/ui/analytics"),
  calendar: () => apiFetch<CalendarSlotView[]>("/ui/calendar"),
  agents: () => apiFetch<AgentView[]>("/ui/agents"),
  health: () => apiFetch<Record<string, string>>("/health"),
};
