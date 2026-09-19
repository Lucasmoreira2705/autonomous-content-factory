import type { ContentCardData } from "@/lib/demo-data";
import type { UiJob } from "@/lib/api";

export const pipelineStages = [
  { key: "idea", name: "Ideia", tone: "purple" },
  { key: "script", name: "Roteiro", tone: "blue" },
  { key: "approval", name: "Aprovação", tone: "amber" },
  { key: "creation", name: "Criação", tone: "cyan" },
  { key: "motion", name: "Motion", tone: "pink" },
  { key: "review", name: "Revisão", tone: "amber" },
  { key: "final", name: "Aprovação final", tone: "green" },
  { key: "schedule", name: "Agendamento", tone: "blue" },
  { key: "published", name: "Publicação", tone: "green" },
] as const;

const statusPresentation: Record<string, { stage: string; progress: number; bucket: string }> = {
  IDEA_CREATED: { stage: "Ideia", progress: 8, bucket: "idea" },
  SCRIPT_GENERATING: { stage: "Roteiro", progress: 18, bucket: "script" },
  SCRIPT_REVIEW: { stage: "Aprovação", progress: 25, bucket: "approval" },
  SCRIPT_REJECTED: { stage: "Aprovação", progress: 22, bucket: "approval" },
  SCRIPT_APPROVED: { stage: "Criação", progress: 32, bucket: "creation" },
  ASSETS_COLLECTING: { stage: "Criação", progress: 40, bucket: "creation" },
  VOICE_GENERATING: { stage: "Criação", progress: 48, bucket: "creation" },
  VIDEO_BUILDING: { stage: "Criação", progress: 56, bucket: "creation" },
  MOTION_PROCESSING: { stage: "Motion", progress: 68, bucket: "motion" },
  VIDEO_RENDERED: { stage: "Revisão", progress: 76, bucket: "review" },
  QUALITY_REVIEW: { stage: "Revisão", progress: 82, bucket: "review" },
  QUALITY_FAILED: { stage: "Revisão", progress: 78, bucket: "review" },
  FINAL_REVIEW: { stage: "Aprovação final", progress: 90, bucket: "final" },
  FINAL_REJECTED: { stage: "Aprovação final", progress: 86, bucket: "final" },
  READY_TO_SCHEDULE: { stage: "Agendamento", progress: 95, bucket: "schedule" },
  SCHEDULED: { stage: "Agendamento", progress: 98, bucket: "schedule" },
  PUBLISHING: { stage: "Publicação", progress: 99, bucket: "published" },
  PUBLISHED: { stage: "Publicação", progress: 100, bucket: "published" },
  PUBLISH_FAILED: { stage: "Publicação", progress: 98, bucket: "published" },
  ANALYTICS_COLLECTING: { stage: "Publicação", progress: 100, bucket: "published" },
  COMPLETED: { stage: "Publicação", progress: 100, bucket: "published" },
  NEEDS_INTERVENTION: { stage: "Erro", progress: 0, bucket: "review" },
  PIPELINE_PAUSED: { stage: "Pausado", progress: 0, bucket: "review" },
};

export function presentJob(job: UiJob): ContentCardData {
  const presentation = statusPresentation[job.status] ?? { stage: job.status, progress: 0, bucket: "idea" };
  return {
    id: job.id,
    title: job.title,
    channel: job.channel,
    stage: presentation.stage,
    status: job.status,
    progress: presentation.progress,
    platform: "Multi",
    time: "—",
  };
}

export function bucketForStatus(status: string) {
  return statusPresentation[status]?.bucket ?? "idea";
}

export function countStage(pipeline: Record<string, number>, stageKey: string) {
  return Object.entries(pipeline).reduce((total, [status, count]) => {
    return total + (bucketForStatus(status) === stageKey ? count : 0);
  }, 0);
}
