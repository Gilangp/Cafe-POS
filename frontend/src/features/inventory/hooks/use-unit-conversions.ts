import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/api/axios';

export interface UnitConversion {
  id: string;
  from_unit: string;
  to_unit: string;
  multiplier: number;
}

export function useUnitConversions() {
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/unit-conversions');
      console.log('Unit Conversions API Response:', res.data);
      if (Array.isArray(res.data)) {
        setConversions(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setConversions(res.data.data);
      } else {
        setConversions([]);
      }
    } catch (err) {
      console.error('Error fetching unit conversions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  const addConversion = async (data: { from_unit: string; to_unit: string; multiplier: number }) => {
    const res = await api.post('/admin/unit-conversions', data);
    await fetchConversions();
    return res.data;
  };

  const updateConversion = async (id: string, data: { multiplier: number }) => {
    const res = await api.put(`/admin/unit-conversions/${id}`, data);
    await fetchConversions();
    return res.data;
  };

  const deleteConversion = async (id: string) => {
    await api.delete(`/admin/unit-conversions/${id}`);
    await fetchConversions();
  };

  return {
    conversions,
    loading,
    addConversion,
    updateConversion,
    deleteConversion,
    refresh: fetchConversions,
  };
}
