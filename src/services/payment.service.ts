import { PaginatedResponse } from "../types";
import api from "./api"
import { WaterUsageQuery } from "./water-usage.service";

export interface RecentPayment {
  paymentId:    number;
  total:        number;
  cash:         number;
  paidDate:     string;
  customerName: string;
  prefix:       string;
  village:      string;
  officer:      string;
}

export interface Payment {
  customerId:     number,
  code:           string,
  name:           string,
  villageId:      number,
  prefix:         string,
  isChecked:      number,
  finalTotal:     number,
}

export interface BillDetail {
  customerId:     number,
  waterUsages:    waterUsage,
  underpayment:   number,
  overpayment:    number,
  billTotal:      number,
  finalTotal:     number
}

export interface CreatePayment {
  customerId:     number,
  cash:           number,
  saveChange:     number,
}

interface waterUsage {
  waterUsageId:   number,
  month:          number,
  year:           number,
  waterUsage:     number,
  totalPrice:     number,
}

export const paymentService = {
  // get recent payment limit 5
  getRecent: () => {
    return api.get<{ data: RecentPayment[] }>('/reports/monthly', {
      params: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        page: 1,
        limit: 5,
        sortOrder: 'DESC',
      },
    }).then(r => r.data.data);
  },

  getAll: (params?: WaterUsageQuery) => {
    return api.get<PaginatedResponse<Payment>>('/payments', {params})
    .then(r => r.data)
  },

  getBill: (customerId: number) => {
    return api.get<BillDetail>('/payments/bill', {params: customerId})
    .then(r => r.data)
  },

  create: (payload: CreatePayment) => {
    return api.post('/payments', {payload}).then(r => r.data);
  },

  histories: (customerId: number, params?: {page: number, limit: number}) => {
    return api.get(`/payments/customer/${customerId}`).then(r => r.data);
  }
    
}