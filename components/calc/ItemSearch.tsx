"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ItemDesperado } from "@/types/database";

interface ItemSearchProps {
  category?: string;
  series?: string;
  element?: string;
  rarity?: string;
  onSelect: (item: ItemDesperado | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ItemSearch({
  category,
  series,
  element,
  rarity,
  onSelect,
  placeholder,
  disabled,
}: ItemSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<ItemDesperado | null>(null);
  const [items, setItems] = React.useState<ItemDesperado[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchItems = async (searchQuery: string) => {
    if (!searchQuery) {
      setItems([]);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ q: searchQuery, limit: "10" });

    if (category) {
      params.set("category", category);
    }
    if (series) {
      params.set("series", series);
    }
    if (element) {
      params.set("element", element);
    }
    if (rarity) {
      params.set("rarity", rarity);
    }

    try {
      const response = await fetch(`/api/desperado/items?${params.toString()}`);
      if (!response.ok) {
        setItems([]);
        return;
      }

      const json = (await response.json()) as { items: ItemDesperado[] };
      setItems(json.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const commitSelection = (item: ItemDesperado | null) => {
    setSelected(item);
    setQuery(item?.item_name ?? "");
    onSelect(item);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen && !selected) {
      setQuery("");
      setItems([]);
      onSelect(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left"
          disabled={disabled}
        >
          {selected
            ? `[${selected.item_rarity}] ${selected.item_name} (${selected.item_element})`
            : (placeholder ?? "アイテムを検索...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput
            placeholder="アイテム名を入力..."
            value={query}
            onValueChange={(q: string) => {
              setQuery(q);
              setSelected(null);
              onSelect(null);
              void searchItems(q);
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter" && !selected && items[0]) {
                commitSelection(items[0]);
                setOpen(false);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>{loading ? "検索中..." : "アイテムが見つかりません。"}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const key = `${item.item_name}|${item.item_rarity}|${item.item_element}`;
                const isSelected =
                  selected?.item_name === item.item_name &&
                  selected?.item_rarity === item.item_rarity &&
                  selected?.item_element === item.item_element;

                return (
                  <CommandItem
                    key={`${item.id}-${key}`}
                    value={key}
                    onSelect={() => {
                      commitSelection(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="font-bold">[{item.item_rarity}]</span>
                    <span className="ml-1">{item.item_name}</span>
                    <span className="ml-1 text-xs text-slate-500">({item.item_element})</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}