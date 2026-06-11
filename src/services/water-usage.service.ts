import type { PaginatedResponse } from '../types';
import api from './api';

export interface WaterUsageCustomer {
  customerId: number;
  code:       string;
  name:       string;
  prefix:     string;
  isChecked:  number; // 1 = sudah, 0 = belum
}

export interface WaterUsageHistory {
  id:          number;
  month:       number;
  year:        number;
  meterNumber: number;
  meterUsage:  number;
  status:      '0' | '1' | '2' | '3';
  lastUsed: '0' | '1';
  rate?:    { pricePerM3: number };
}

export interface WaterUsageQuery {
  villageId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'id';
  sortOrder?: 'ASC' | 'DESC';
}

export const waterUsageService = {
  // List customer + status pengecekan bulan ini
  getAll: (params?: WaterUsageQuery) =>
    api.get<PaginatedResponse<WaterUsageCustomer>>('/water-usage', { params })
       .then(r => r.data),

  // History pemakaian per customer
  getByCustomer: (customerId: number, params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<WaterUsageHistory>>(
      `/water-usage/customer/${customerId}`,
      { params },
    ).then(r => r.data),

  // Input meter baru
  create: (payload: { customerId: number; meterNumber: number }) =>
    api.post('/water-usage', payload).then(r => r.data),

  getProgress: () =>
    api.get<WaterUsageProgress>('/water-usage/progress').then(r => r.data),
};

export interface VillageProgress {
  villageId: number;
  villageName: string;
  totalCustomers: number;
  checkedCount: number;
  percent: number;
}

export interface WaterUsageProgress {
  month: number;
  year: number;
  overall: {
    totalCustomers: number;
    checkedCount: number;
    percent: number;
  };
  villages: VillageProgress[];
}