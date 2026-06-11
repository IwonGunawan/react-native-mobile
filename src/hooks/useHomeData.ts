import { useCallback, useEffect, useState } from "react";
import { Village } from "../types";
import { paymentService, RecentPayment } from "../services/payment.service";
import { villageService } from "../services/village.service";
import { dashboardService } from "../services/dashboard.service";
import { waterUsageService } from "../services/water-usage.service";

export interface VillageStat {
  village: Village,
  total: number,
  checked: number,
  percent: number
}

export interface HomeData {
  recentPayments: RecentPayment[],
  totalChecked: number,
  totalCustomer: number,
  checkPercent: number,
  villageStats: VillageStat[],
  paidCount: number,
  unpaidCount: number,
  totalM3: number,
}

export default function useHomeData() {
  const[data, setData] = useState<any>(null)
  const[isRefresh, setIsRefresh] = useState(false)
  const[isLoading, setIsLoading] = useState(true)
  const[error, setError] = useState<string|null>(null)

  const fetch = useCallback(async (isRefresh: boolean = false) => {
    isRefresh ? setIsRefresh(true) : setIsLoading(true);
    setError(null);

    // running all request paralel
    try {
      const [recents, villages, summaries, allUsages] = await Promise.all([
        paymentService.getRecent(),
        villageService.getAll(),
        dashboardService.getSummary(),
        waterUsageService.getCheckSummary()
      ])

      // counting total checked
      const totalChecked = 10;
      const totalCustomers = 100;
      const checkPercent = Math.round((totalCustomers/totalChecked) * 100)

      setData({
        recentPayments: recents,
        totalChecked,
        totalCustomers,
        checkPercent,
        villageStats: [],
        paidCount: summaries.paidCount,
        unpaidCount:  summaries.unpaidCount,
        totalMeter: 1234,
      })
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