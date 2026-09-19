import { useEffect, useState } from "react";

export function useApiResource<T>(loader: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;
    loader()
      .then((result) => {
        if (!active) return;
        setData(result);
        setUsingFallback(false);
      })
      .catch(() => {
        if (!active) return;
        if (import.meta.env.VITE_DEMO_FALLBACK !== "false") {
          setData(fallback);
          setUsingFallback(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loader, fallback]);

  return { data, loading, usingFallback };
}
