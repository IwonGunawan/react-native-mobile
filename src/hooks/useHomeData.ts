import { useCallback, useEffect, useState } from "react";
import { paymentService, RecentPayment } from "../services/payment.service";
import { dashboardService } from "../services/dashboard.service";
import { waterUsageService } from "../services/water-usage.service";
import { reportService, TopArrear } from "../services/report.service";

export interface VillageStat {
  villageId: number;
  villageName: string;
  totalCustomers: number;
  checkedCount: number;
  percent: number;
}

export interface HomeData {
  recentPayments: RecentPayment[];
  totalChecked: number;
  totalCustomers: number;
  checkPercent: number;
  villageStats: VillageStat[];
  paidCount: number;
  unpaidCount: number;
  totalM3: number;
  topArrears: TopArrear[];
}

export default function useHomeData() {
  const[data, setData] = useState<any>(null)
  const[isRefresh, setIsRefresh] = useState(false)
  const[isLoading, setIsLoading] = useState(true)
  const[error, setError] = useState<string|null>(null)

  const fetch = useCallback(async (isRefresh: boolean = false) => {
    isRefresh ? setIsRefresh(true) : setIsLoading(true);
    setError(null);

    try {
      const [recents, waterTotal, topArrears, progress, summaries] = await Promise.all([
        reportService.getMonthly({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          page: 1,
          limit: 5,
          sortOrder: 'DESC',
        }),
        reportService.getWaterUsageTotal(),
        reportService.getTopArrears(),
        waterUsageService.getProgress(),
        dashboardService.getSummary()
      ]);

      setData({
        recentPayments: recents.data,
        totalChecked: progress.overall.checkedCount,
        totalCustomers: progress.overall.totalCustomers,
        checkPercent: progress.overall.percent,
        villageStats: progress.villages,
        paidCount: summaries.paidCount,
        unpaidCount: summaries.unpaidCount,
        totalM3: waterTotal.totalMeterUsage,
        topArrears,
      });
    } catch (error) {
      setError('failed load data')
    } finally{
      setIsLoading(false)
      setIsRefresh(false)
    }
  }, [])

  useEffect(() => { 
    fetch();
   }, [fetch]);

   return {
    data, 
    isLoading, 
    isRefresh,
    error,
    refetch: () => fetch(true)
   }

}