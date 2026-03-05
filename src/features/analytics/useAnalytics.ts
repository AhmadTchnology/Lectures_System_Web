import { useState, useEffect, useRef } from 'react';
import { getAnalyticsData, type AnalyticsData } from './analyticsService';

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
    data: AnalyticsData;
    timestamp: number;
}

let cache: CachedData | null = null;

export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(cache?.data ?? null);
    const [isLoading, setIsLoading] = useState(!cache);
    const [error, setError] = useState<string | null>(null);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;

        async function load() {
            if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
                setData(cache.data);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await getAnalyticsData();
                if (!mounted.current) return;

                cache = { data: result, timestamp: Date.now() };
                setData(result);
            } catch (err) {
                if (!mounted.current) return;
                setError(
                    err instanceof Error ? err.message : 'Failed to load analytics'
                );
            } finally {
                if (mounted.current) setIsLoading(false);
            }
        }

        load();
        return () => {
            mounted.current = false;
        };
    }, []);

    function refresh() {
        cache = null;
        setIsLoading(true);
        getAnalyticsData()
            .then((result) => {
                cache = { data: result, timestamp: Date.now() };
                setData(result);
            })
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Refresh failed')
            )
            .finally(() => setIsLoading(false));
    }

    return { data, isLoading, error, refresh };
}
