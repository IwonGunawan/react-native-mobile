import api from './api';

export interface BankInfo {
  accountNumber: string | null;
  bankName: string | null;
  accountName: string | null;
}

export const siteSettingService = {
  getBankInfo: async (): Promise<BankInfo> => {
    const res = await api.get('/site-settings/bank');
    return res.data;
  },
};
