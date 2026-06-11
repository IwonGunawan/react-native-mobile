import api from "./api";

export const dashboardService = {
  getSummary: () => 
    api.get('reports/summaries').then(r => r.data)
}