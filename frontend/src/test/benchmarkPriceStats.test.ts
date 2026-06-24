import { test, expect, vi } from "vitest";

// Mock supabase before imports
vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      functions: {
        invoke: async (name: string, options: any) => {
          return { data: { count: 10, min: 1, max: 100, p25: 25, median: 50, p75: 75 }, error: null };
        }
      }
    }
  };
});

import { usePriceStatsBatch } from "../hooks/usePriceStats";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { supabase } from "@/integrations/supabase/client";

test("benchmark price stats", async () => {
  let callCount = 0;

  // Need to redefine mock to track calls
  supabase.functions.invoke = async (name: string, options: any) => {
    callCount++;
    // Simulate some network delay
    await new Promise(resolve => setTimeout(resolve, 5));
    return { data: { count: 10, min: 1, max: 100, p25: 25, median: 50, p75: 75 }, error: null };
  };

  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  callCount = 0;
  const start = performance.now();

  // Simulate multiple components requesting different but overlapping batches
  const { result: r1 } = renderHook(() => usePriceStatsBatch([
    { category_id: "c1" },
    { category_id: "c2" },
  ]), { wrapper });

  const { result: r2 } = renderHook(() => usePriceStatsBatch([
    { category_id: "c2" },
    { category_id: "c3" },
  ]), { wrapper });

  const { result: r3 } = renderHook(() => usePriceStatsBatch([
    { category_id: "c1" },
    { category_id: "c4" },
  ]), { wrapper });

  await waitFor(() => expect(r1.current.isSuccess).toBe(true));
  await waitFor(() => expect(r2.current.isSuccess).toBe(true));
  await waitFor(() => expect(r3.current.isSuccess).toBe(true));

  const end = performance.now();
  console.log(`Execution time: ${end - start} ms, Supabase calls: ${callCount}`);
});
