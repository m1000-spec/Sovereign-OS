import { useState, useEffect } from 'react';
import { supabase, type JournalEntry } from '@/src/lib/supabase';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch journal entries';
      setError(message);
      console.error('Error fetching journal entries:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addEntry(entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('journal_entries')
        .insert([entry])
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      if (data) {
        setEntries([data, ...entries]);
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add journal entry';
      setError(message);
      console.error('Error adding journal entry:', err);
    }
  }

  async function updateEntry(id: string, updates: Partial<JournalEntry>) {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (data) {
        setEntries(entries.map(e => e.id === id ? data : e));
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update journal entry';
      setError(message);
      console.error('Error updating journal entry:', err);
    }
  }

  async function deleteEntry(id: string) {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete journal entry';
      setError(message);
      console.error('Error deleting journal entry:', err);
    }
  }

  return {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}
