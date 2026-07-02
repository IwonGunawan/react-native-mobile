import type { PaginatedResponse } from '../types';
import api from './api';

export interface WaterUsageList {
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
  status:      '0' | '1' | '2' | '3'; // 0:belum/baru-dicek, 1:lunas, 2:kurang-bayar, 3:lebih-bayar
  lastUsed:    '0' | '1'; // 0:default, 1:terakhir dipakai
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

export const waterUsageService = {
  // List customer + status pengecekan bulan ini
  getAll: (params?: WaterUsageQuery) =>
    api.get<PaginatedResponse<WaterUsageList>>('/water-usage', { params })
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

  // Progress total checked meter water (per month)
  getProgress: () =>
    api.get<WaterUsageProgress>('/water-usage/progress').then(r => r.data),
};