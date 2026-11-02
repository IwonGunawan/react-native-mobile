import { useCallback, useEffect, useRef, useState } from "react";
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
  const initialQuery: Query = {page: 1, limit: 10, sortBy: 'name', sortOrder: 'ASC', ...queryInit};

  const [data, setData] = useState<ListPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState<Query>(initialQuery);

  // Refs keep callbacks stable and avoid stale closures during fast scrolling.
  const queryRef = useRef<Query>(initialQuery);
  const totalPagesRef = useRef(1);
  const isLoadingMoreRef = useRef(false);
  const initPendingRef = useRef(0);
  const refreshPendingRef = useRef(0);
  const requestSeqRef = useRef(0);

  const fetchData = useCallback(async (q: Query, mode: 'init'| 'refresh'| 'more') => {
    if (mode === 'more') {
      if (isLoadingMoreRef.current) return;
      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);
    } else if (mode === 'refresh') {
      refreshPendingRef.current += 1;
      setIsRefreshing(true);
    } else {
      initPendingRef.current += 1;
      setIsLoading(true);
    }

    setError(null);
    const seq = ++requestSeqRef.current;

    try {
      const res = await paymentService.getAll(q);

      // Ignore stale responses (e.g. an old page request finishing after refresh).
      if (seq !== requestSeqRef.current) return;

      setData(prev => mode === 'more' ? [...prev, ...res.data] : res.data);
      setTotalData(res.meta.totalData);
      totalPagesRef.current = res.meta.totalPages;
      setTotalPages(res.meta.totalPages);
    } catch (error) {
      if (seq === requestSeqRef.current) {
        setError('Failed load payment data');
      }
    } finally {
      if (mode === 'more') {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      } else if (mode === 'refresh') {
        refreshPendingRef.current = Math.max(0, refreshPendingRef.current - 1);
        if (refreshPendingRef.current === 0) setIsRefreshing(false);
      } else {
        initPendingRef.current = Math.max(0, initPendingRef.current - 1);
        if (initPendingRef.current === 0) setIsLoading(false);
      }
    }
  }, [])

  useEffect(() => {
    fetchData({...queryRef.current, page: 1}, 'init');
  }, [query.villageId, query.search, query.sortBy, query.sortOrder, fetchData]);

  const updateQuery = useCallback((updates: Partial<Query>) => {
    setQuery(prev => {
      const changed = (Object.keys(updates) as (keyof Query)[])
        .some(key => prev[key] !== updates[key]);

      // No-op updates must not reset pagination (e.g. initial debounce/hydration).
      if (!changed) return prev;

      const next = { ...prev, ...updates, page: 1 };
      queryRef.current = next;
      return next;
    });
  }, []);

  const loadMore = useCallback(() => {
    if (isLoadingMoreRef.current) return;
    if (initPendingRef.current > 0 || refreshPendingRef.current > 0) return;

    const current = queryRef.current;
    const currentPage = current.page ?? 1;
    if (currentPage >= totalPagesRef.current) return;

    const nextQuery = { ...current, page: currentPage + 1 };
    queryRef.current = nextQuery;
    setQuery(nextQuery);
    fetchData(nextQuery, 'more');
  }, [fetchData]);

  const refresh = useCallback(() => {
    const refreshQuery = { ...queryRef.current, page: 1 };
    queryRef.current = refreshQuery;
    setQuery(refreshQuery);
    fetchData(refreshQuery, 'refresh');
  }, [fetchData]);

  return {
    data, isLoading, isRefreshing, isLoadingMore,
    error, totalData, totalPages, query,
    updateQuery, loadMore, refresh
  }
}
