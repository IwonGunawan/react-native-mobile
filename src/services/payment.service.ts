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

export interface ListPayment {
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
  waterUsages:    WaterUsagePrice[],
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

export interface CreatePaymentResp {
  paymentId:    number;
  refNumber:    string;
  paidDate:     string;
  total:        number;
  cash:         number;
  change:       number;
  monthTotal:   number;
  textInfo:     string;
}

export interface Receipt {
  paymentId:    number;
  refNumber:    string;
  paidDate:     string;
  total:        number;
  cash:         number;
  change:       number;
  textInfo:     string;
  monthTotal:   number;
  monthList:    WaterUsagePrice[];
  underpayment: WaterUsagePrice | null;
  overpayment:  WaterUsagePrice | null;
}

  export interface PaymentHistory {
    id:          number;
    total:       number;
    cash:        number;
    logUuid:     string;
    createdAt:   string;
    change:      number;
    monthTotal:  number;
    savedAmount: number;
    textInfo:    string;
    refNumber:   string;
    status:     string;
  }

export interface WaterUsagePrice {
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
    return api.get<PaginatedResponse<ListPayment>>('/payments', { params })
    .then(r => r.data)
  },

  // billing
  getBill: (customerId: number) => {
    return api.get<Bill>('/payments/bill', { params: { customerId } })
    .then(r => r.data)
  },

  // create payment
  create: (payload: CreatePayment) => {
    return api.post<CreatePaymentResp>('/payments', payload)
    .then(r => r.data);
  },

  // histories payment
  histories: (customerId: number, params?: {page: number, limit: number}) => {
    return api.get<PaginatedResponse<PaymentHistory>>(`/payments/histories/${customerId}`, {params})
    .then(r => r.data);
  },

  // get receipt detail by payment id
  getReceipt: (paymentId: number) => {
    return api.get<Receipt>(`/payments/receipts/${paymentId}`)
    .then(r => r.data);
  }
  /** END Payment Menu */
    
}
