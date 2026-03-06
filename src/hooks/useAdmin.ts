import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Merchant {
  id: string;
  display_name: string | null;
  phone: string;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  username: string | null;
  listing_count: number;
}

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });
}

export function useMerchants() {
  return useQuery({
    queryKey: ["admin-merchants"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-merchants", {
        body: { action: "list" },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      return (data?.merchants || []) as Merchant[];
    },
  });
}

export function useToggleVerified() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ merchantId, verified }: { merchantId: string; verified: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-merchants", {
        body: { action: "toggle_verified", merchant_id: merchantId, verified },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
