import { useQuery } from "@tanstack/react-query";
import { mockMarkets, type Market, type MarketCategory } from "./mockMarkets";
import { collections, type Collection } from "./collections";

// UI-only mock delay.
// Set to 0 for snappy UX and to avoid long-running setTimeout handlers in dev tools.
const MOCK_DELAY_MS = 0;

function sleep(ms: number) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * UI-only mock "API" layer.
 *
 * Replace these functions with real network calls when a backend exists.
 */
export async function fetchMarkets(): Promise<Market[]> {
  await sleep(MOCK_DELAY_MS);
  return [...mockMarkets];
}

export async function fetchMarketById(id: string): Promise<Market | null> {
  await sleep(MOCK_DELAY_MS);
  return mockMarkets.find((m) => m.id === id) ?? null;
}

export async function fetchCategories(): Promise<MarketCategory[]> {
  await sleep(MOCK_DELAY_MS);
  const set = new Set<MarketCategory>();
  for (const m of mockMarkets) set.add(m.category);
  return Array.from(set);
}

export async function fetchCollections(): Promise<Collection[]> {
  await sleep(MOCK_DELAY_MS);
  return [...collections];
}

export async function fetchCollectionById(id: string): Promise<Collection | null> {
  await sleep(MOCK_DELAY_MS);
  return collections.find((c) => c.id === id) ?? null;
}

export async function fetchMarketsByCategory(category: MarketCategory): Promise<Market[]> {
  await sleep(MOCK_DELAY_MS);
  return mockMarkets.filter((m) => m.category === category);
}

export async function fetchMarketsByIds(ids: string[]): Promise<Market[]> {
  await sleep(MOCK_DELAY_MS);
  const set = new Set(ids);
  return mockMarkets.filter((m) => set.has(m.id));
}

/** ---------------------------
 * React Query hooks
 * --------------------------- */

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    staleTime: 30_000,
  });
}

export function useMarket(id: string | undefined) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => fetchMarketById(id ?? ""),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 60_000,
  });
}

export function useCollection(id: string | undefined) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: () => fetchCollectionById(id ?? ""),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useMarketsByCategory(category: MarketCategory | undefined) {
  return useQuery({
    queryKey: ["markets", "category", category],
    queryFn: () => fetchMarketsByCategory(category as MarketCategory),
    enabled: Boolean(category),
    staleTime: 30_000,
  });
}

export function useMarketsByIds(ids: string[] | undefined) {
  return useQuery({
    queryKey: ["markets", "ids", ids?.join(",") ?? ""],
    queryFn: () => fetchMarketsByIds(ids ?? []),
    enabled: Boolean(ids && ids.length > 0),
    staleTime: 30_000,
  });
}
