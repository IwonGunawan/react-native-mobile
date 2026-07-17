import { useCallback, useEffect, useState } from "react";
import { ListPayment, paymentService } from "../services/payment.service";


interface Query {
  villageId?: number;
  search? : string;
  page? : number;
  limit? : number;
  sortBy? : 'name' | 'id';
  sortOrder? : 'ASC' | 'DESC';
}

export function usePaymentList(queryInit?: Query) {
  const [data, setData] = useState<ListPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState<Query>({page: 1, limit: 10, sortBy: 'name', sortOrder: 'ASC', ...queryInit})


  const fetchData = useCallback(async (q: Query, mode: 'init'| 'refresh'| 'more') => {
    if (mode == 'init') setIsLoading(true);
    if (mode == 'refresh') setIsRefreshing(true);
    if (mode == 'more') setIsLoadingMore(true);

    setError(null);

    try {
      const res = await paymentService.getAll(q);

      setData(prev => mode === 'more' ? [...prev, ...res.data] : res.data);
      setTotalData(res.meta.totalData);
      setTotalPages(res.meta.totalPages);
      
    } catch (error) {
      setError('Failed load payment data');
    } finally{
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [])

  useEffect(() => {
    fetchData({...query, page: 1}, 'init');
  }, [query.villageId, query.search, query.sortBy, query.sortOrder ]);

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