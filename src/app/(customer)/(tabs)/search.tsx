import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ListingRow } from "@/components/ListingRow";
import { AppMap } from "@/components/AppMap";
import {
  CATEGORIES,
  categoryEmoji,
  categoryLabel,
} from "@/constants/categories";
import { useAutocomplete, useSearch } from "@/features/search/useSearch";
import { cn } from "@/utils/cn";
import type { CategoryId, Listing, SearchFilters, SearchSort } from "@/types";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string; sort?: string }>();
  const initialCategory = (params.category as CategoryId) || null;
  const initialSort = (params.sort as SearchSort) || "recommended";

  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(initialCategory);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<SearchSort>(initialSort);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [draft, setDraft] = useState<SearchFilters>({});

  const autocomplete = useAutocomplete(
    query.trim() && query !== committedQuery ? query : "",
  );
  const { data, isLoading, isError } = useSearch({
    query: committedQuery,
    filters: { ...filters, category },
    sort,
  });

  const items = data?.items ?? [];
  const suggestions = autocomplete.data ?? { destinations: [], listings: [] };

  const grouped = useMemo(() => {
    const map = new Map<CategoryId, Listing[]>();
    for (const item of items) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  function commitSearch() {
    setCommittedQuery(query);
  }

  function applyFilters() {
    setFilters(draft);
    setShowFilters(false);
  }

  function openFilters() {
    setDraft(filters);
    setShowFilters(true);
  }

  return (
    <Screen
      className="bg-surface-100"
      contentContainerClassName="pb-8"
    >
      {/* Sticky search header */}
      <View className="px-5 pt-4 pb-3 bg-surface-100 border-b border-ink-100">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmit={commitSearch}
              autoFocus={false}
            />
          </View>
          <Pressable
            onPress={() => setShowMap((v) => !v)}
            className="bg-white border border-ink-200 rounded-xl p-3"
          >
            <Ionicons name={showMap ? "list" : "map-outline"} size={20} color="#0a54d9" />
          </Pressable>
        </View>

        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 py-3"
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              selected={category === item.id}
              onPress={() => setCategory(category === item.id ? null : item.id)}
            />
          )}
        />
      </View>

      {/* Suggestions while typing */}
      {query.trim() && query !== committedQuery ? (
        <View className="bg-white mx-5 mt-3 rounded-2xl border border-ink-100 overflow-hidden">
          {suggestions.destinations.map((d) => (
            <Pressable
              key={d}
              onPress={() => {
                setQuery(d.split(",")[0]);
                setCommittedQuery(d.split(",")[0]);
              }}
              className="px-4 py-3 border-b border-ink-50 flex-row items-center gap-2"
            >
              <Ionicons name="location-outline" size={18} color="#848d9c" />
              <Text className="text-sm text-ink-800">{d}</Text>
            </Pressable>
          ))}
          {suggestions.destinations.length === 0 && suggestions.listings.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-sm text-ink-400">Press search to look for “{query}”</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Results toolbar */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="text-sm text-ink-500">
          {isLoading ? "Searching…" : `${data?.total ?? 0} experiences`}
        </Text>
        <Pressable onPress={openFilters} className="flex-row items-center gap-1.5">
          <Ionicons name="options-outline" size={18} color="#14181f" />
          <Text className="text-sm font-semibold text-ink-900">Filters</Text>
          {Object.keys(filters).length > 0 ? (
            <View className="h-2 w-2 rounded-full bg-accent-500" />
          ) : null}
        </Pressable>
      </View>

      {showMap ? (
        <View className="px-5 pb-4">
          <AppMap height={220} />
          <Text className="mt-2 text-xs text-ink-400 text-center">
            Map view (OpenStreetMap) — markers wired up in a later phase
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View className="px-5 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <EmptyState emoji="📡" title="Search failed" message="Please try again." />
      ) : items.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No experiences found"
          message="Try a different destination or clear some filters."
        />
      ) : (
        <View className="pb-8">
          {grouped.map(([cat, catItems]) => (
            <View key={cat} className="mt-2">
              <View className="flex-row items-center gap-2 px-5 pt-3 pb-2">
                <Text className="text-base">{categoryEmoji(cat)}</Text>
                <Text className="text-base font-bold text-ink-900">
                  {categoryLabel(cat)}
                </Text>
                <Text className="text-xs text-ink-400">({catItems.length})</Text>
              </View>
              <View className="px-5 gap-4">
                {catItems.map((l) => (
                  <ListingRow key={l.id} listing={l} />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Filters sheet */}
      <Sheet visible={showFilters} title="Filters" onClose={() => setShowFilters(false)}>
        <View className="gap-5">
          <View>
            <Text className="text-sm font-semibold text-ink-900 mb-2">Sort by</Text>
            <View className="flex-row flex-wrap gap-2">
              {(
                [
                  ["recommended", "Recommended"],
                  ["rating", "Top rated"],
                  ["price-asc", "Price: low → high"],
                  ["price-desc", "Price: high → low"],
                ] as Array<[SearchSort, string]>
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  selected={sort === value}
                  onPress={() => setSort(value)}
                />
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-ink-900 mb-2">Price range</Text>
            <View className="flex-row flex-wrap gap-2">
              {(
                [
                  ["Any", undefined, undefined],
                  ["Under $80", undefined, 80],
                  ["$80–$150", 80, 150],
                  ["Over $150", 150, undefined],
                ] as Array<[string, number | undefined, number | undefined]>
              ).map(([label, min, max]) => {
                const active = draft.minPrice === min && draft.maxPrice === max;
                return (
                  <Chip
                    key={label}
                    label={label}
                    selected={active}
                    onPress={() =>
                      setDraft((d) => ({ ...d, minPrice: min, maxPrice: max }))
                    }
                  />
                );
              })}
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-ink-900 mb-2">Minimum rating</Text>
            <View className="flex-row flex-wrap gap-2">
              {(
                [
                  ["Any", undefined],
                  ["4.5★", 4.5],
                  ["4.0★", 4.0],
                ] as Array<[string, number | undefined]>
              ).map(([label, rating]) => (
                <Chip
                  key={label}
                  label={label}
                  selected={draft.minRating === rating}
                  onPress={() => setDraft((d) => ({ ...d, minRating: rating }))}
                />
              ))}
            </View>
          </View>

          <ToggleRow
            label="Free cancellation"
            value={!!draft.freeCancellation}
            onValueChange={(v) => setDraft((d) => ({ ...d, freeCancellation: v }))}
          />
          <ToggleRow
            label="Instant confirmation"
            value={!!draft.instantConfirmation}
            onValueChange={(v) => setDraft((d) => ({ ...d, instantConfirmation: v }))}
          />

          <Button title="Apply filters" size="lg" block onPress={applyFilters} />
        </View>
      </Sheet>
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      className={cn("flex-row items-center justify-between rounded-2xl border px-4 py-3.5", value ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white")}
    >
      <Text className="text-sm font-medium text-ink-900">{label}</Text>
      <View
        className={cn("h-6 w-11 rounded-full items-center justify-start px-0.5", value ? "bg-brand-600 justify-end" : "bg-ink-200")}
      >
        <View className="h-5 w-5 rounded-full bg-white" />
      </View>
    </Pressable>
  );
}
