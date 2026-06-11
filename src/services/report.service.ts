import api from './api';

export interface MonthlyReportItem {
  paymentId:    number;
  refNumber:    string;
  paidDate:     string;
  total:        number;
  cash:         number;
  customerId:   number;
  customerCode: string;
  customerName: string;
  prefix:       string;
  village:      string;
  officer:      string;
}

export interface UnpaidReportItem {
  waterUsageId:      number;
  month:             number;
  year:              number;
  meterUsage:        number;
  status:            string;
  customerId:        number;
  customerCode:      string;
  customerName:      string;
  prefix:            string;
  village:           string;
  underpaymentAmount: number;
}

interface ReportQuery {
  month:      number;
  year:       number;
  villageId?: number;
  search?:    string;
  page?:      number;
  limit?:     number;
  sortOrder?: 'ASC' | 'DESC';
}

interface ReportResponse<T> {
  data:    T[];
  summary?: { totalIncome: number; totalTransactions: number };
  meta:    { totalData: number; page: number; limit: number; totalPages: number };
}

export interface WaterUsageTotal {
  month: number;
  year: number;
  totalMeterUsage: number;
}

export const reportService = {
  getMonthly: (params: ReportQuery) =>
    api.get<ReportResponse<MonthlyReportItem>>('/reports/monthly', { params })
       .then(r => r.data),

  getUnpaid: (params: ReportQuery) =>
    api.get<ReportResponse<UnpaidReportItem>>('/reports/unpaid', { params })
       .then(r => r.data),

  getWaterUsageTotal: () =>
    api.get<WaterUsageTotal>('/reports/water-usage-total').then(r => r.data),
};