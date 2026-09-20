import type { DashboardSnapshot } from "@/lib/api";

export const emptyDashboard: DashboardSnapshot = {
  totals: {
    ideas: 0,
    jobs_active: 0,
    published: 0,
    errors: 0,
  },
  jobs: [],
  pipeline: {},
};
