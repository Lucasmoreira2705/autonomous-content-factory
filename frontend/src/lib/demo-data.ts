import type {
  AnalyticsView,
  ChannelView,
  DashboardSnapshot,
  LearningView,
  PublicationView,
  UiJob,
} from "@/lib/api";

export type ContentCardData = {
  id: string;
  title: string;
  channel: string;
  stage: string;
  status: string;
  progress: number;
  platform: string;
  time: string;
};

export const demoJobs: UiJob[] = [
  { id: "CF-01842", title: "A decisão que quase quebrou uma gigante", channel: "Negócios", status: "MOTION_PROCESSING", retry_count: 0, script_revision_count: 2, max_attempts: 5, target_duration_seconds: 70, created_at: new Date().toISOString() },
  { id: "CF-01841", title: "O erro de 30 segundos que custou milhões", channel: "Negócios", status: "QUALITY_REVIEW", retry_count: 0, script_revision_count: 1, max_attempts: 5, target_duration_seconds: 65, created_at: new Date().toISOString() },
  { id: "CF-01840", title: "A tecnologia escondida dentro do seu bolso", channel: "Tecnologia", status: "SCRIPT_APPROVED", retry_count: 0, script_revision_count: 1, max_attempts: 5, target_duration_seconds: 60, created_at: new Date().toISOString() },
  { id: "CF-01839", title: "Por que algumas empresas somem de repente?", channel: "Negócios", status: "VIDEO_BUILDING", retry_count: 1, script_revision_count: 2, max_attempts: 5, target_duration_seconds: 75, created_at: new Date().toISOString() },
  { id: "CF-01838", title: "O mistério que ficou 27 anos sem resposta", channel: "Mistérios", status: "SCHEDULED", retry_count: 0, script_revision_count: 1, max_attempts: 5, target_duration_seconds: 68, created_at: new Date().toISOString() },
];

export const demoDashboard: DashboardSnapshot = {
  totals: { ideas: 18, jobs_active: 12, published: 125, errors: 2 },
  jobs: demoJobs,
  pipeline: {
    IDEA_CREATED: 5,
    SCRIPT_GENERATING: 3,
    SCRIPT_REVIEW: 2,
    VIDEO_BUILDING: 4,
    MOTION_PROCESSING: 2,
    QUALITY_REVIEW: 1,
    FINAL_REVIEW: 2,
    SCHEDULED: 8,
    PUBLISHED: 125,
  },
};

export const demoChannels: ChannelView[] = [
  { id: "channel-business", name: "Negócios", niche: "Empresas · histórias · decisões", language: "pt-BR", voice: "Narrador BR 01", timezone: "America/Sao_Paulo", is_active: true },
  { id: "channel-mystery", name: "Mistérios", niche: "Casos · curiosidades · história", language: "pt-BR", voice: "Narrador BR 02", timezone: "America/Sao_Paulo", is_active: true },
  { id: "channel-tech", name: "Tecnologia", niche: "IA · inovação · produtos", language: "pt-BR", voice: "Narrador BR 01", timezone: "America/Sao_Paulo", is_active: false },
];

export const demoPublications: PublicationView[] = [
  { id: "pub-1", video_id: "CF-01838", platform: "TikTok", status: "PUBLISHED", scheduled_at: new Date().toISOString(), published_at: new Date().toISOString(), url: null, retry_count: 0 },
  { id: "pub-2", video_id: "CF-01841", platform: "YouTube Shorts", status: "SCHEDULED", scheduled_at: new Date().toISOString(), published_at: null, url: null, retry_count: 0 },
  { id: "pub-3", video_id: "CF-01842", platform: "Instagram", status: "SCHEDULED", scheduled_at: new Date().toISOString(), published_at: null, url: null, retry_count: 0 },
  { id: "pub-4", video_id: "CF-01840", platform: "Facebook", status: "PUBLISHED", scheduled_at: new Date().toISOString(), published_at: new Date().toISOString(), url: null, retry_count: 0 },
  { id: "pub-5", video_id: "CF-01839", platform: "TikTok", status: "RETRYING", scheduled_at: new Date().toISOString(), published_at: null, url: null, retry_count: 1 },
];

export const demoLearning: LearningView[] = [
  { id: "ins-1", insight_type: "Retenção", statement: "Vídeos sobre falências empresariais tiveram retenção 24% maior.", confidence: 0.92, created_at: new Date().toISOString() },
  { id: "ins-2", insight_type: "Duração", statement: "Vídeos entre 65 e 75 segundos performaram melhor nos últimos 14 dias.", confidence: 0.89, created_at: new Date().toISOString() },
  { id: "ins-3", insight_type: "Gancho", statement: "Começar com conflito direto superou perguntas genéricas em 19%.", confidence: 0.76, created_at: new Date().toISOString() },
  { id: "ins-4", insight_type: "Horário", statement: "O slot das 20h lidera em views para o canal Negócios.", confidence: 0.91, created_at: new Date().toISOString() },
];

export const demoAnalytics: AnalyticsView[] = [
  { id: "ana-1", publication_id: "pub-1", captured_at: new Date().toISOString(), metrics: { views: 18400, retention: 61, likes: 1200, shares: 180, comments: 90 } },
  { id: "ana-2", publication_id: "pub-2", captured_at: new Date().toISOString(), metrics: { views: 24600, retention: 68, likes: 1700, shares: 260, comments: 120 } },
  { id: "ana-3", publication_id: "pub-3", captured_at: new Date().toISOString(), metrics: { views: 32800, retention: 72, likes: 2400, shares: 390, comments: 180 } },
  { id: "ana-4", publication_id: "pub-4", captured_at: new Date().toISOString(), metrics: { views: 45200, retention: 79, likes: 3900, shares: 610, comments: 250 } },
];

export const chartData = [
  { day: "Seg", views: 18400, retention: 61 },
  { day: "Ter", views: 24600, retention: 68 },
  { day: "Qua", views: 21900, retention: 64 },
  { day: "Qui", views: 32800, retention: 72 },
  { day: "Sex", views: 40100, retention: 75 },
  { day: "Sáb", views: 37600, retention: 73 },
  { day: "Dom", views: 45200, retention: 79 },
];
