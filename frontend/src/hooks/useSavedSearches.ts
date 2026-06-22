import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SavedSearchFilters {
  city?: string;
  sort?: string;
  min?: string;
  max?: string;
  quartier?: string;
  verified?: string;
  date?: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  label: string;
  query: string | null;
  filters: SavedSearchFilters;
  created_at: string;
}

// Types for saved_searches are not in generated types yet.
// We use a typed local cast against the public schema.
type SupabaseAny = {
  from: (table: string) => {
    select: (cols?: string) => {
      eq: (col: string, val: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{ data: SavedSearch[] | null; error: { message: string } | null }>;
      };
    };
    insert: (row: Partial<SavedSearch>) => Promise<{ error: { message: string } | null }>;
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  };
};
const db = supabase as unknown as SupabaseAny;

export function useSavedSearches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-searches", user?.id ?? "anon"],
    enabled: !!user?.id,
    queryFn: async (): Promise<SavedSearch[]> => {
      if (!user?.id) return [];
      const { data, error } = await db
        .from("saved_searches")
        .select("id, user_id, label, query, filters, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export function useSaveSearch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: { label: string; query: string; filters: SavedSearchFilters }) => {
      if (!user?.id) throw new Error("not authenticated");
      const { error } = await db.from("saved_searches").insert({
        user_id: user.id,
        label: payload.label,
        query: payload.query || null,
        filters: payload.filters,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-searches"] }),
  });
}

export function useDeleteSavedSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("saved_searches").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-searches"] }),
  });
}

export function filtersToSearchParams(query: string, filters: SavedSearchFilters): string {
  const p = new URLSearchParams();
  if (query) p.set("q", query);
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== "all" && v !== "0") p.set(k, v);
  });
  return p.toString();
}
