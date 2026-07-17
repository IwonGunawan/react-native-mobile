import { useCallback, useEffect, useState } from "react";
import { WaterUsageHistory, WaterUsageList, waterUsageService } from "../services/water-usage.service";


interface Query {
  villageId?: number;
  search? : string;
  page? : number;
  limit? : number;
  sortBy? : 'name' | 'id';
  sortOrder? : 'ASC' | 'DESC';
  isUnchecked?: boolean; // belum ada di BE
}

export function useWaterUsageList(queryInit?: Query) {
  const [data, setData] = useState<WaterUsageList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState<Query>({page: 1, limit: 20, sortBy: 'name', sortOrder: 'ASC', ...queryInit})


  const fetchData = useCallback(async (q: Query, mode: 'init'| 'refresh'| 'more') => {
    if (mode == 'init') setIsLoading(true);
    if (mode == 'refresh') setIsRefreshing(true);
    if (mode == 'more') setIsLoadingMore(true);

    setError(null);

    try {
      const res = await waterUsageService.getAll(q);

      setData(prev => mode === 'more' ? [...prev, ...res.data] : res.data);
      setTotalData(res.meta.totalData);
      setTotalPages(res.meta.totalPages);
      
    } catch (error) {
      setError('Failed load customer data');
    } finally{
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [])

  useEffect(() => {
    fetchData({...query, page: 1}, 'init');
  }, [query.villageId, query.search, query.sortBy, query.sortOrder, query.isUnchecked ]);

  const updateQuery = (updates: Partial<Query>) => {
    setQuery(prev => ({ ...prev, ...updates, page: 1}));
  }

  const loadMore = () => {
    if (isLoadingMore || !query.page || query.page >= totalPages) return;
    const nextPage = (query.page ?? 1) + 1;
    const nextQuery = { ...query, page: nextPage };
    setQuery(nextQuery);
    fetchData(nextQuery, 'more')
  }

  const refresh = () => {
    const refreshQuery = { ...query, page: 1 };
    setQuery(refreshQuery);
    fetchData(refreshQuery, 'refresh')
  }

  return {
    data, isLoading, isRefreshing, isLoadingMore,
    error, totalData, totalPages, query,
    updateQuery, loadMore, refresh
  }
}

export function useWaterUsageHistory(customerId: number) {
  const [history, setHistory] = useState<WaterUsageHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await waterUsageService.getByCustomer(customerId, { page:1, limit: 10 })
      setHistory(res.data);
      setTotal(res.meta.totalData);
    } catch (error) {
      setError('Failed load history water usage');
    } finally {
      setIsLoading(false)
    }

  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData])

  return {
    history, total, isLoading, error,
    refetch: fetchData
  }
}