import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: (value: T | null) => void;
};

/**
 * Small read-model hook: runs an async loader and exposes {data, loading, error}.
 * Keeps route components free of fetch/effect plumbing (SRP).
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = [], enabled = true): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    run()
      .then((res) => !cancelled && setData(res))
      .catch((err: unknown) => !cancelled && setError(err instanceof Error ? err.message : "Request failed"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [run, enabled, nonce]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1), setData };
}
