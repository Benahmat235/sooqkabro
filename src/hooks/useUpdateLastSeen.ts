import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUpdateLastSeen() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updateLastSeen = async () => {
      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() } as any)
        .eq("id", user.id);
    };

    // Update immediately
    updateLastSeen();

    // Update every 60 seconds
    const interval = setInterval(updateLastSeen, 60000);

    // Update on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updateLastSeen();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);
}
