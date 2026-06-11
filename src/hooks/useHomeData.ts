import { useCallback, useEffect, useState } from "react";
import { paymentService, RecentPayment } from "../services/payment.service";
import { dashboardService } from "../services/dashboard.service";
import { waterUsageService } from "../services/water-usage.service";
import { reportService } from "../services/report.service";

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
      const [recents, summaries, progress, waterTotal] = await Promise.all([
        paymentService.getRecent(),
        dashboardService.getSummary(),
        waterUsageService.getProgress(),
        reportService.getWaterUsageTotal(),
      ]);

      setData({
        recentPayments: recents,
        totalChecked: progress.overall.checkedCount,
        totalCustomers: progress.overall.totalCustomers,
        checkPercent: progress.overall.percent,
        villageStats: progress.villages,
        paidCount: summaries.paidCount,
        unpaidCount: summaries.unpaidCount,
        totalM3: waterTotal.totalMeterUsage,
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