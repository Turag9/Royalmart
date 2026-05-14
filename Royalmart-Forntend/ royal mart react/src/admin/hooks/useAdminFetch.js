import { useEffect, useState } from 'react';
import { getApiError } from '../services/http';

export function useAdminFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    fetcher()
      .then((response) => {
        if (mounted) {
          setData(response.data?.data ?? response.data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(getApiError(err));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error, setData };
}
