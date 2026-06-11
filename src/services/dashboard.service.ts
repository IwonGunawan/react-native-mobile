import api from "./api";

export interface PaymentSummary {
  paidCount: number;
  unpaidCount: number;
  percent: number;
}

export const dashboardService = {
  getSummary: () =>
    api.get<PaymentSummary>('/payments/summary').then(r => r.data),
}