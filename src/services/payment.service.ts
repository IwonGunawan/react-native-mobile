import { PaginatedResponse } from "../types";
import api from "./api"
import { WaterUsageQuery } from "./water-usage.service";

/** HOME Menu */
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


/** PAYMENTS Menu */

export interface Payment {
  customerId:     number,
  code:           string,
  name:           string,
  villageId:      number,
  prefix:         string,
  isChecked:      number,
  finalTotal:     number,
}

export interface Bill {
  customerId:     number,
  waterUsages:    ListBill[],
  underpayment:   number,
  overpayment:    number,
  billTotal:      number,
  finalTotal:     number,
  textInfo:      string,
}

export interface CreatePayment {
  customerId:     number,
  cash:           number,
  saveChange:     number,
}

export interface PaymentReceipt {
  refNumber:  string;
  paidDate:   string;
  total:       number;
  cash:        number;
  change:      number;
  monthTotal: number;
  textInfo:   string;
}

export interface PaymentHistory {
  id:        number;
  total:     number;
  cash:      number;
  logUuid:   string;
  createdAt: string;
}

interface ListBill {
  waterUsageId:   number,
  month:          number,
  year:           number,
  status:         string,
  meterUsage:     number,
  totalPrice:     number,
}

export const paymentService = {
  /** HOME MENU */
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
  /** END Home Menu */

  /** PAYMENT MENU */
  // list payment 
  getAll: (params?: WaterUsageQuery) => {
    return api.get<PaginatedResponse<Payment>>('/payments', { params })
    .then(r => r.data)
  },

  // billing
  getBill: (customerId: number) => {
    console.log(customerId, 'customerId')
    return api.get<Bill>('/payments/bill', { params: { customerId } })
    .then(r => r.data)
  },

  // create payment
  create: (payload: CreatePayment) => {
    return api.post<PaymentReceipt>('/payments', payload)
    .then(r => r.data);
  },

  // histories payment
  histories: (customerId: number, params?: {page: number, limit: number}) => {
    return api.get<PaginatedResponse<PaymentHistory>>(`/payments/customer/${customerId}`, {params})
    .then(r => r.data);
  }
  /** END Payment Menu */
    
}
