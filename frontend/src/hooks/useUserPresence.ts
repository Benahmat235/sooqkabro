import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface PresenceState {
  isOnline: boolean;
  lastSeen: Date | null;
}

// Store presence in memory for the session
const presenceCache = new Map<string, PresenceState>();

export function useUserPresence(userId: string | undefined): PresenceState {
  const [presence, setPresence] = useState<PresenceState>({ 
    isOnline: false, 
    lastSeen: null 
  });

  useEffect(() => {
    if (!userId) return;

    // Check cache first
    const cached = presenceCache.get(userId);
    if (cached) {
      setPresence(cached);
    }

    // For demo purposes, simulate presence based on user activity
    // In production, this would use Supabase Realtime Presence
    const simulatePresence = () => {
      // Simulate: ~40% chance user is online
      const isOnline = Math.random() > 0.6;
      const lastSeen = isOnline ? null : new Date(Date.now() - Math.random() * 7200000); // 0-2 hours ago
      
      const newPresence = { isOnline, lastSeen };
      presenceCache.set(userId, newPresence);
      setPresence(newPresence);
    };

    simulatePresence();

    // Refresh presence every 30 seconds
    const interval = setInterval(simulatePresence, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  return presence;
}

// Hook to broadcast own presence
export function useBroadcastPresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // In production, you would join a Supabase Realtime channel
    // and broadcast presence updates
    const channel = supabase.channel(`presence:${user.id}`);
    
    // Track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Handle page visibility changes
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      channel.unsubscribe();
    };
  }, [user]);
}

// Hook to get multiple users' presence at once
export function useMultipleUserPresence(userIds: string[]): Map<string, PresenceState> {
  const [presences, setPresences] = useState<Map<string, PresenceState>>(new Map());

  useEffect(() => {
    if (!userIds.length) return;

    const newPresences = new Map<string, PresenceState>();
    
    userIds.forEach(userId => {
      const cached = presenceCache.get(userId);
      if (cached) {
        newPresences.set(userId, cached);
      } else {
        // Simulate presence
        const isOnline = Math.random() > 0.6;
        const lastSeen = isOnline ? null : new Date(Date.now() - Math.random() * 7200000);
        const presence = { isOnline, lastSeen };
        presenceCache.set(userId, presence);
        newPresences.set(userId, presence);
      }
    });

    setPresences(newPresences);
  }, [userIds.join(",")]);

  return presences;
}
