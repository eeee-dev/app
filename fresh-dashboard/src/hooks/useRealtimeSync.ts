import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSyncOptions<T> {
  table: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { id: string }) => void;
  enabled?: boolean;
}

export function useRealtimeSync<T>({
  table,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true
}: UseRealtimeSyncOptions<T>) {
  const setupRealtimeSubscription = useCallback(() => {
    if (!enabled) return null;

    const channel: RealtimeChannel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`[Realtime] INSERT on ${table}:`, payload);
          if (onInsert && payload.new) {
            onInsert(payload.new as T);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`[Realtime] UPDATE on ${table}:`, payload);
          if (onUpdate && payload.new) {
            onUpdate(payload.new as T);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`[Realtime] DELETE on ${table}:`, payload);
          if (onDelete && payload.old) {
            onDelete({ id: (payload.old as Record<string, unknown>).id as string });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status for ${table}:`, status);
      });

    return channel;
  }, [table, onInsert, onUpdate, onDelete, enabled]);

  useEffect(() => {
    const channel = setupRealtimeSubscription();

    return () => {
      if (channel) {
        console.log(`[Realtime] Unsubscribing from ${table}`);
        supabase.removeChannel(channel);
      }
    };
  }, [setupRealtimeSubscription, table]);
}