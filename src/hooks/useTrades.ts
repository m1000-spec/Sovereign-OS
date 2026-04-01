import { useState, useEffect } from 'react';
import { supabase, type Trade } from '@/src/lib/supabase';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  async function fetchTrades() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .order('entry_time', { ascending: false });

      if (fetchError) throw fetchError;
      setTrades(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trades';
      setError(message);
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addTrade(trade: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('trades')
        .insert([trade])
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      if (data) {
        setTrades([data, ...trades]);
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add trade';
      setError(message);
      console.error('Error adding trade:', err);
    }
  }

  async function updateTrade(id: string, updates: Partial<Trade>) {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (data) {
        setTrades(trades.map(t => t.id === id ? data : t));
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update trade';
      setError(message);
      console.error('Error updating trade:', err);
    }
  }

  async function deleteTrade(id: string) {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setTrades(trades.filter(t => t.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete trade';
      setError(message);
      console.error('Error deleting trade:', err);
    }
  }

  return {
    trades,
    loading,
    error,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
  };
}
