"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ItemDesperado, SkillDesperado } from "@/types/database";

interface SkillSearchProps {
  sourceItems: ItemDesperado[];
  ownOnly?: boolean;
  attackOnly?: boolean;
  includeFree?: boolean;
  skillCategory?: string;
  onSelect: (skill: SkillDesperado | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SkillSearch({
  sourceItems,
  ownOnly,
  attackOnly,
  includeFree,
  skillCategory,
  onSelect,
  placeholder,
  disabled,
}: SkillSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<SkillDesperado | null>(null);
  const [skills, setSkills] = React.useState<SkillDesperado[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchSkills = async (searchQuery: string) => {
    if (!searchQuery) {
      setSkills([]);
      return;
    }

    setLoading(true);

    const sourceKeys = sourceItems
      .filter((item) => item.item_name && item.item_rarity && item.item_element)
      .map((item) => ({
        itemElement: item.item_element,
        itemName: item.item_name,
        itemRarity: item.item_rarity,
      }));

    const params = new URLSearchParams({ q: searchQuery, limit: "10" });
    params.set("sourceKeys", JSON.stringify(sourceKeys));

    if (ownOnly) {
      params.set("ownOnly", "true");
    }
    if (attackOnly) {
      params.set("attackOnly", "true");
    }
    if (includeFree === false) {
      params.set("includeFree", "false");
    }
    if (skillCategory) {
      params.set("skillCategory", skillCategory);
    }

    try {
      const response = await fetch(`/api/desperado/skills?${params.toString()}`);
      if (!response.ok) {
        setSkills([]);
        return;
      }

      const json = (await response.json()) as { skills: SkillDesperado[] };
      setSkills(json.skills ?? []);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const commitSelection = (skill: SkillDesperado | null) => {
    setSelected(skill);
    setQuery(skill ? `${skill.item_name} > ${skill.item_rarity}:${skill.skill_name}` : "");
    onSelect(skill);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !selected) {
      setQuery("");
      setSkills([]);
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
            ? `${selected.item_name} > ${selected.item_rarity}:${selected.skill_name}`
            : (placeholder ?? "スキルを検索...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0">
        <Command>
          <CommandInput
            placeholder="アイテム名またはスキル名を入力..."
            value={query}
            onValueChange={(q: string) => {
              setQuery(q);
              setSelected(null);
              onSelect(null);
              void searchSkills(q);
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter" && !selected && skills[0]) {
                commitSelection(skills[0]);
                setOpen(false);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>{loading ? "検索中..." : "スキルが見つかりません。"}</CommandEmpty>
            <CommandGroup>
              {skills.map((skill) => {
                const key = `${skill.item_element}|${skill.item_name}|${skill.item_rarity}|${skill.skill_name}`;
                const isSelected =
                  selected?.item_element === skill.item_element &&
                  selected?.item_name === skill.item_name &&
                  selected?.item_rarity === skill.item_rarity &&
                  selected?.skill_name === skill.skill_name;

                return (
                  <CommandItem
                    key={key}
                    value={key}
                    onSelect={() => {
                      commitSelection(skill);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span>{skill.item_name}</span>
                    <span className="mx-1 text-slate-400">&gt;</span>
                    <span className="text-xs text-slate-500">{skill.item_rarity}</span>
                    <span className="mx-1 text-slate-400">:</span>
                    <span>{skill.skill_name}</span>
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
