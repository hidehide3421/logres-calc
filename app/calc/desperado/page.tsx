"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ItemSearch } from "@/components/calc/ItemSearch";
import { SkillSearch } from "@/components/calc/SkillSearch";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { calculateDesperado } from "@/lib/calculator/desperado";
import type {
  AbilityDesperado,
  ItemDesperado,
  SkillDesperado,
} from "@/types/database";

const NONE_LABEL = "(なし)";
const SKILL_LEVEL_OPTIONS = [1, 2, 3, 4, 5] as const;
const ELEMENT_OPTIONS = [NONE_LABEL, "火", "水", "風", "土", "光", "闇", "無"];
const RARITY_OPTIONS = [NONE_LABEL, "究極", "伝説", "英雄"];
const ITEM_LV_ULTIMATE = ["1~69", "70~89", "90~109", "110~129", "130"];
const ITEM_LV_LEGEND_HERO = ["1~69", "70~89", "90~109", "110~129", "130~139", "140"];
const STATUS_KEYS = [
  "HP",
  "物攻",
  "物防",
  "魔攻",
  "魔防",
  "命中",
  "回避",
  "クリティカル",
  "火",
  "水",
  "風",
  "土",
  "光",
  "闇",
] as const;
const MAIN_WEAPON_CATEGORIES = [
  NONE_LABEL,
  "大剣",
  "斧",
  "轟器",
  "覇双",
  "覇剣",
  "特殊",
];
const ADDITIONAL_WEAPON_CATEGORIES = [NONE_LABEL, "轟器", "覇双", "覇剣", "特殊"];
const EMBLEM_EFFECT_OPTIONS = [
  NONE_LABEL,
  "覇双ブラッククリティカルリミットプラス[億]",
  "一致属性条件付きリミット固定値プラス[万]",
  "刻印",
];

type StatusKey = (typeof STATUS_KEYS)[number];
type StatusValues = Record<StatusKey, number>;

type EquipmentSlot = {
  filters: {
    category: string;
    series: string;
    element: string;
    rarity: string;
  };
  item: ItemDesperado | null;
  itemLvRange: string;
  dedicatedSkillLv: number;
  hissatsuSkillLv: number;
  legendSkillLv: number;
  heroSkillLv: number;
  artifact1: ItemDesperado | null;
  artifact2: ItemDesperado | null;
};

type EmblemState = {
  item: ItemDesperado | null;
  effects: Array<{ effect: string; amount: string }>;
};

type CalculationResult = ReturnType<typeof calculateDesperado>;

const createEquipmentSlot = (defaultCategory = NONE_LABEL): EquipmentSlot => ({
  filters: {
    category: defaultCategory,
    series: "",
    element: NONE_LABEL,
    rarity: NONE_LABEL,
  },
  item: null,
  itemLvRange: "130",
  dedicatedSkillLv: 1,
  hissatsuSkillLv: 1,
  legendSkillLv: 1,
  heroSkillLv: 1,
  artifact1: null,
  artifact2: null,
});

const createEmblemState = (): EmblemState => ({
  item: null,
  effects: [
    { effect: NONE_LABEL, amount: "" },
    { effect: NONE_LABEL, amount: "" },
  ],
});

const createInitialStatus = (): StatusValues =>
  STATUS_KEYS.reduce((accumulator, key) => {
    accumulator[key] = 0;
    return accumulator;
  }, {} as StatusValues);

const formatNumber = (value: number) => new Intl.NumberFormat("ja-JP").format(value);

export default function DesperadoPage() {
  const [activeColumn, setActiveColumn] = useState<"left" | "middle" | "right">("left");
  const [activeWeaponPanel, setActiveWeaponPanel] = useState<"main" | "additional">("main");
  const [slotAccordionState, setSlotAccordionState] = useState<Record<string, boolean>>({});
  const [jobLevel, setJobLevel] = useState(120);
  const [ability, setAbility] = useState<AbilityDesperado | null>(null);
  const [abilityLoading, setAbilityLoading] = useState(true);
  const [abilityError, setAbilityError] = useState<string | null>(null);

  const [mainSlots, setMainSlots] = useState<EquipmentSlot[]>(() =>
    Array.from({ length: 5 }, () => createEquipmentSlot()),
  );
  const [additionalSlots, setAdditionalSlots] = useState<EquipmentSlot[]>(() =>
    Array.from({ length: 5 }, () => createEquipmentSlot()),
  );
  const [upperArmor, setUpperArmor] = useState<EquipmentSlot>(() => createEquipmentSlot("上"));
  const [lowerArmor, setLowerArmor] = useState<EquipmentSlot>(() => createEquipmentSlot("下"));
  const [headAccessory, setHeadAccessory] = useState<EquipmentSlot>(() =>
    createEquipmentSlot("頭"),
  );
  const [armAccessory, setArmAccessory] = useState<EquipmentSlot>(() =>
    createEquipmentSlot("腕"),
  );
  const [footAccessory, setFootAccessory] = useState<EquipmentSlot>(() =>
    createEquipmentSlot("足"),
  );

  const [medal, setMedal] = useState<ItemDesperado | null>(null);
  const [spEmblem, setSpEmblem] = useState<EmblemState>(() => createEmblemState());
  const [exEmblem, setExEmblem] = useState<EmblemState>(() => createEmblemState());
  const [statusValues, setStatusValues] = useState<StatusValues>(() => createInitialStatus());

  const [activeSkillDraft, setActiveSkillDraft] = useState<SkillDesperado | null>(null);
  const [activeSkills, setActiveSkills] = useState<SkillDesperado[]>([]);
  const [targetSkill, setTargetSkill] = useState<SkillDesperado | null>(null);

  const [manaCount, setManaCount] = useState(0);
  const [manaEnhanced, setManaEnhanced] = useState(false);
  const [burstStrike, setBurstStrike] = useState(NONE_LABEL);

  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAbility = async () => {
      setAbilityLoading(true);
      setAbilityError(null);
      try {
        const response = await fetch(`/api/desperado/ability?jobLevel=${jobLevel}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          let details = `HTTP ${response.status}`;
          try {
            const errorJson = (await response.json()) as {
              message?: string;
              details?: string;
            };
            details = errorJson.details ?? errorJson.message ?? details;
          } catch {
            // ignore JSON parse error and keep generic HTTP status
          }

          if (!cancelled) {
            setAbility(null);
            setAbilityError(details);
          }
          return;
        }

        const json = (await response.json()) as { ability: AbilityDesperado | null };
        if (!cancelled) {
          setAbility(json.ability);
          if (!json.ability) {
            setAbilityError("ジョブLvに対応する能力情報が見つかりませんでした。");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setAbility(null);
          setAbilityError(
            error instanceof Error ? error.message : "能力情報の取得に失敗しました。",
          );
        }
      } finally {
        if (!cancelled) {
          setAbilityLoading(false);
        }
      }
    };

    void fetchAbility();

    return () => {
      cancelled = true;
    };
  }, [jobLevel]);

  const updateSlot = (
    setter:
      | React.Dispatch<React.SetStateAction<EquipmentSlot[]>>
      | React.Dispatch<React.SetStateAction<EquipmentSlot>>,
    index: number | null,
    patch: Partial<EquipmentSlot>,
  ) => {
    if (index === null) {
      (setter as React.Dispatch<React.SetStateAction<EquipmentSlot>>)((previous) => ({
        ...previous,
        ...patch,
      }));
      return;
    }

    (setter as React.Dispatch<React.SetStateAction<EquipmentSlot[]>>)((previous) =>
      previous.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const updateSlotFilters = (
    setter:
      | React.Dispatch<React.SetStateAction<EquipmentSlot[]>>
      | React.Dispatch<React.SetStateAction<EquipmentSlot>>,
    index: number | null,
    patch: Partial<EquipmentSlot["filters"]>,
  ) => {
    if (index === null) {
      (setter as React.Dispatch<React.SetStateAction<EquipmentSlot>>)((previous) => ({
        ...previous,
        filters: {
          ...previous.filters,
          ...patch,
        },
        item: null,
      }));
      return;
    }

    (setter as React.Dispatch<React.SetStateAction<EquipmentSlot[]>>)((previous) =>
      previous.map((slot, slotIndex) =>
        slotIndex === index
          ? {
              ...slot,
              filters: {
                ...slot.filters,
                ...patch,
              },
              item: null,
            }
          : slot,
      ),
    );
  };

  const equippedItems = useMemo(() => {
    const sources = [
      ...mainSlots.map((slot) => slot.item),
      ...additionalSlots.map((slot) => slot.item),
      upperArmor.item,
      lowerArmor.item,
      headAccessory.item,
      armAccessory.item,
      footAccessory.item,
      medal,
      spEmblem.item,
      exEmblem.item,
    ];

    return sources.filter((item): item is ItemDesperado => Boolean(item));
  }, [
    additionalSlots,
    armAccessory.item,
    exEmblem.item,
    footAccessory.item,
    headAccessory.item,
    lowerArmor.item,
    mainSlots,
    medal,
    spEmblem.item,
    upperArmor.item,
  ]);

  const burstStrikeOptions = useMemo(() => {
    const dynamic = new Set<string>();
    activeSkills.forEach((skill) => {
      if (skill.burstStrikeName && skill.burstStrikeName !== NONE_LABEL) {
        dynamic.add(skill.burstStrikeName);
      }
      if (skill.item_rarity === "バーストストライク") {
        dynamic.add(skill.item_name);
      }
    });
    return [NONE_LABEL, "(無指名のバースト)", ...Array.from(dynamic).sort((a, b) => a.localeCompare(b, "ja"))];
  }, [activeSkills]);
  const effectiveBurstStrike = burstStrikeOptions.includes(burstStrike)
    ? burstStrike
    : NONE_LABEL;

  const validationMessages = useMemo(() => {
    const messages: string[] = [];

    if (mainSlots.every((slot) => !slot.item)) {
      messages.push("main武器のいずれかを選択してください。");
    }
    if (!targetSkill) {
      messages.push("計算対象の攻撃スキルを選択してください。");
    }
    if (jobLevel < 1 || jobLevel > 120) {
      messages.push("ジョブLvは1〜120の範囲で入力してください。");
    }
    if (manaCount < 0 || manaCount > 70) {
      messages.push("攻撃属性マナ数は0〜70の範囲で入力してください。");
    }
    if (!abilityLoading && !ability) {
      messages.push("ジョブLvに対応する能力情報が取得できていません。");
    }

    [spEmblem, exEmblem].forEach((emblem, emblemIndex) => {
      emblem.effects.forEach((effect, effectIndex) => {
        if (effect.effect === NONE_LABEL) {
          return;
        }
        const amount = Number(effect.amount);
        if (!Number.isFinite(amount)) {
          messages.push(
            `${emblemIndex === 0 ? "SP" : "EX"}エンブレム 効果${effectIndex + 1}の効果量は数値で入力してください。`,
          );
        }
      });
    });

    return messages;
  }, [ability, abilityLoading, exEmblem, jobLevel, mainSlots, manaCount, spEmblem, targetSkill]);

  const canCalculate = validationMessages.length === 0;

  const findSkillLevels = (skill: SkillDesperado) => {
    const levelSources = [
      ...mainSlots,
      ...additionalSlots,
      upperArmor,
      lowerArmor,
      headAccessory,
      armAccessory,
      footAccessory,
    ];

    const matched = levelSources.find(
      (slot) =>
        slot.item?.item_name === skill.item_name &&
        slot.item?.item_rarity === skill.item_rarity &&
        slot.item?.item_element === skill.item_element,
    );

    return {
      hissatsuLv: matched?.hissatsuSkillLv ?? 1,
      heroLv: matched?.heroSkillLv ?? 1,
    };
  };

  const handleCalculate = () => {
    if (!targetSkill || !ability) {
      return;
    }

    const levels = findSkillLevels(targetSkill);
    const calculated = calculateDesperado(targetSkill, activeSkills, ability, {
      hissatsuLv: levels.hissatsuLv,
      heroLv: levels.heroLv,
      mana: manaCount,
      isEnhanced: manaEnhanced,
      burstStrikeName: effectiveBurstStrike,
    });

    setResult(calculated);
  };

  const addActiveSkill = () => {
    if (!activeSkillDraft) {
      return;
    }

    const key = `${activeSkillDraft.item_element}|${activeSkillDraft.item_name}|${activeSkillDraft.item_rarity}|${activeSkillDraft.skill_name}`;
    const alreadyAdded = activeSkills.some(
      (skill) =>
        `${skill.item_element}|${skill.item_name}|${skill.item_rarity}|${skill.skill_name}` === key,
    );

    if (!alreadyAdded) {
      setActiveSkills((previous) => [...previous, activeSkillDraft]);
    }

    setActiveSkillDraft(null);
  };

  const removeActiveSkill = (index: number) => {
    setActiveSkills((previous) => previous.filter((_, skillIndex) => skillIndex !== index));
  };

  const getDefaultAccordionExpanded = (accordionKey: string) => {
    const isWeaponSlot =
      accordionKey.startsWith("main-") || accordionKey.startsWith("additional-");
    return isWeaponSlot && accordionKey.endsWith("-0");
  };

  const getIsAccordionExpanded = (accordionKey: string) =>
    slotAccordionState[accordionKey] ?? getDefaultAccordionExpanded(accordionKey);

  const toggleAccordionByKey = (accordionKey: string) => {
    setSlotAccordionState((previous) => ({
      ...previous,
      [accordionKey]: !(previous[accordionKey] ?? getDefaultAccordionExpanded(accordionKey)),
    }));
  };

  const renderSlot = (
    slot: EquipmentSlot,
    setter:
      | React.Dispatch<React.SetStateAction<EquipmentSlot[]>>
      | React.Dispatch<React.SetStateAction<EquipmentSlot>>,
    index: number | null,
    title: string,
    categoryOptions: string[],
    includeArtifacts: boolean,
    fixedCategory?: string,
    categoryLabel = "アイテム種",
    accordionKey?: string,
  ) => {
    const itemLvOptions =
      slot.filters.rarity === "究極" ? ITEM_LV_ULTIMATE : ITEM_LV_LEGEND_HERO;
    const isAccordion = Boolean(accordionKey);
    const isExpanded = accordionKey ? getIsAccordionExpanded(accordionKey) : true;
    const toggleAccordion = () => {
      if (!accordionKey) {
        return;
      }
      toggleAccordionByKey(accordionKey);
    };

    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
        {isAccordion ? (
          <button
            type="button"
            onClick={toggleAccordion}
            className="flex w-full items-center gap-2 text-left font-semibold text-slate-900"
            aria-expanded={isExpanded}
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 shrink-0 transition-transform ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{title}</span>
          </button>
        ) : (
          <h5 className="font-semibold text-slate-900">{title}</h5>
        )}

        {isExpanded && (
          <>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span>{categoryLabel}</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={fixedCategory ?? slot.filters.category}
              disabled={Boolean(fixedCategory)}
              onChange={(event) =>
                updateSlotFilters(setter, index, { category: event.target.value })
              }
            >
              {(fixedCategory ? [fixedCategory] : categoryOptions).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>属性</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.filters.element}
              onChange={(event) =>
                updateSlotFilters(setter, index, { element: event.target.value })
              }
            >
              {ELEMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>レアリティ</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.filters.rarity}
              onChange={(event) =>
                updateSlotFilters(setter, index, { rarity: event.target.value })
              }
            >
              {RARITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

          <div className="space-y-1 text-sm">
            <span>シリーズ名</span>
            <input
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.filters.series}
              onChange={(event) =>
                updateSlotFilters(setter, index, { series: event.target.value })
              }
              placeholder="任意で絞り込み"
            />
          </div>

          <div className="space-y-1 text-sm">
            <span>アイテム名</span>
            <ItemSearch
              category={fixedCategory ?? slot.filters.category}
              series={slot.filters.series || undefined}
              element={slot.filters.element}
              rarity={slot.filters.rarity}
              onSelect={(item) => updateSlot(setter, index, { item })}
              placeholder="アイテム名で検索"
            />
          </div>

          <div className="space-y-1 text-sm">
            <span>アイテムLv</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.itemLvRange}
              onChange={(event) =>
                updateSlot(setter, index, { itemLvRange: event.target.value })
              }
            >
              {itemLvOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span>専用スキルLv</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.dedicatedSkillLv}
              onChange={(event) =>
                updateSlot(setter, index, {
                  dedicatedSkillLv: Number(event.target.value),
                })
              }
            >
              {SKILL_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>必殺スキルLv</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.hissatsuSkillLv}
              onChange={(event) =>
                updateSlot(setter, index, {
                  hissatsuSkillLv: Number(event.target.value),
                })
              }
            >
              {SKILL_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>伝説スキルLv</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.legendSkillLv}
              onChange={(event) =>
                updateSlot(setter, index, {
                  legendSkillLv: Number(event.target.value),
                })
              }
            >
              {SKILL_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>英雄スキルLv</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
              value={slot.heroSkillLv}
              onChange={(event) =>
                updateSlot(setter, index, {
                  heroSkillLv: Number(event.target.value),
                })
              }
            >
              {SKILL_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>

        {includeArtifacts && (
          <div className="grid gap-3">
            <div className="space-y-1 text-sm">
              <span>装着アーティファクト1/2</span>
              <ItemSearch
                category="アーティファクト"
                onSelect={(item) => updateSlot(setter, index, { artifact1: item })}
                placeholder="検索"
              />
            </div>
            <div className="space-y-1 text-sm">
              <span>装着アーティファクト2/2</span>
              <ItemSearch
                category="アーティファクト"
                onSelect={(item) => updateSlot(setter, index, { artifact2: item })}
                placeholder="検索"
              />
            </div>
          </div>
        )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="fixed left-1/2 top-4 z-50 w-28 -translate-x-1/2">
        <Button
          type="button"
          className={`w-full py-7 text-xl font-bold shadow-lg ${
            canCalculate
              ? "bg-orange-600 hover:bg-orange-500"
              : "bg-slate-400 hover:bg-slate-400"
          }`}
          disabled={!canCalculate}
          onClick={handleCalculate}
        >
          計算開始
        </Button>
      </div>

    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8">
      <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl">
        <h1 className="text-xl font-bold tracking-wide">計算結果</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">合計ダメージ</div>
            <div className="mt-1 text-3xl font-bold text-orange-300">
              {formatNumber(result?.grossLimit ?? 0)}
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">本撃</div>
            <div className="mt-1 text-2xl font-semibold text-amber-200">
              {formatNumber(result?.blackCritLimit ?? 0)}
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">追撃</div>
            <div className="mt-1 text-2xl font-semibold text-cyan-200">
              {formatNumber(result?.followUpLimit ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {validationMessages.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">入力内容を確認してください。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validationMessages.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <div className="mb-6 grid grid-cols-3 gap-2 xl:hidden">
          <Button
            type="button"
            variant={activeColumn === "left" ? "default" : "outline"}
            onClick={() => setActiveColumn("left")}
          >
            スキル / 基本データ
          </Button>
          <Button
            type="button"
            variant={activeColumn === "middle" ? "default" : "outline"}
            onClick={() => setActiveColumn("middle")}
          >
            武器 / シックスセンス
          </Button>
          <Button
            type="button"
            variant={activeColumn === "right" ? "default" : "outline"}
            onClick={() => setActiveColumn("right")}
          >
            防具 / エンブレム
          </Button>
        </div>

        <div className="grid gap-8 xl:grid-cols-3 xl:max-h-[calc(100vh-12rem)]">
          <div
            className={`space-y-8 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto xl:pr-2 ${
              activeColumn === "left" ? "block" : "hidden"
            } xl:block`}
          >
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">ジョブ情報</h2>
              <div className="grid gap-3 w-20">
                <label className="space-y-1 text-sm">
                  <span>Lv</span>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={jobLevel}
                    onChange={(event) => setJobLevel(Number(event.target.value || 0))}
                    className="w-full rounded-md border border-slate-300 px-2 py-2"
                  />
                </label>
              </div>
              {!abilityLoading && abilityError && (
                <div className="text-xs text-red-600">能力情報エラー: {abilityError}</div>
              )}
            </section>

            <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <h2 className="text-base font-bold text-slate-900">攻撃属性のマナ</h2>
              <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-2">
                <label className="flex items-center justify-start w-36 text-sm">
                  <span>個数</span>
                  <input
                    type="number"
                    min={0}
                    max={70}
                    value={manaCount}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value || 0);
                      setManaCount(nextValue);
                      if (nextValue === 0) {
                        setManaEnhanced(false);
                      }
                    }}
                    className="w-20 rounded-md border border-slate-300 px-2 py-2"
                  />
                </label>

                <label className="flex items-center justify-end px-3 py-2 text-sm">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={manaEnhanced}
                    aria-label="マナ強化"
                    disabled={manaCount === 0}
                    onClick={() => setManaEnhanced((previous) => !previous)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      manaEnhanced ? "bg-green-500" : "bg-slate-300"
                    } ${manaCount === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        manaEnhanced ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span>マナ強化</span>
                </label>
              </div>

              {!abilityLoading && abilityError && (
                <div className="text-xs text-red-600">能力情報エラー: {abilityError}</div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="flex items-center gap-1.5 text-lg font-bold text-slate-900">
                起動しているスキル
                <InfoTooltip content="戦闘中すでに起動しているスキルであり、計算対象の攻撃スキルに適用させたい強化効果などをもつスキル。" />
              </h2>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <SkillSearch
                  sourceItems={equippedItems}
                  ownOnly={false}
                  includeFree
                  onSelect={setActiveSkillDraft}
                  placeholder="スキルを検索"
                />
                <Button type="button" onClick={addActiveSkill} disabled={!activeSkillDraft}>
                  追加
                </Button>
              </div>

              <div className="space-y-2">
                {activeSkills.length === 0 && (
                  <p className="text-sm text-slate-500">スキルはまだ追加されていません。</p>
                )}
                {activeSkills.map((skill, index) => (
                  <div
                    key={`${skill.item_element}|${skill.item_name}|${skill.item_rarity}|${skill.skill_name}`}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span>
                      {skill.item_name} &gt; {skill.item_rarity}:{skill.skill_name}
                    </span>
                    <Button type="button" variant="ghost" onClick={() => removeActiveSkill(index)}>
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="flex items-center gap-1.5 text-lg font-bold text-slate-900">
                バーストストライク
                <InfoTooltip content="武器固有のバーストストライクを使わない場合は「(無指名のバースト)」を選択してください。" />
              </h2>
              <div className="grid gap-3">
                <label className="space-y-1 text-sm">
                  <select
                    value={effectiveBurstStrike}
                    onChange={(event) => setBurstStrike(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2"
                  >
                    {burstStrikeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">計算対象</h2>
              <div className="grid gap-3">
                <div className="space-y-1 text-sm">
                  <span>(※攻撃スキル)</span>
                  <SkillSearch
                    sourceItems={equippedItems}
                    ownOnly
                    attackOnly
                    includeFree={false}
                    onSelect={setTargetSkill}
                    placeholder="スキルを検索"
                  />
                </div>
              </div>
            </section>
          </div>

          <div
            className={`space-y-8 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto xl:pr-2 ${
              activeColumn === "middle" ? "block" : "hidden"
            } xl:block`}
          >
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">武器</h2>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <Button
                  type="button"
                  variant={activeWeaponPanel === "main" ? "default" : "outline"}
                  onClick={() => setActiveWeaponPanel("main")}
                >
                  Main
                </Button>
                <Button
                  type="button"
                  variant={activeWeaponPanel === "additional" ? "default" : "outline"}
                  onClick={() => setActiveWeaponPanel("additional")}
                >
                  Additional
                </Button>
              </div>
              <div className="space-y-3">
                {activeWeaponPanel === "main"
                  ? mainSlots.map((slot, index) => (
                      <div key={`main-${index}`}>
                        {renderSlot(
                          slot,
                          setMainSlots,
                          index,
                          `${index + 1}/5`,
                          MAIN_WEAPON_CATEGORIES,
                          true,
                          undefined,
                          "武器種",
                          `main-${index}`,
                        )}
                      </div>
                    ))
                  : additionalSlots.map((slot, index) => (
                      <div key={`additional-${index}`}>
                        {renderSlot(
                          slot,
                          setAdditionalSlots,
                          index,
                          `${index + 1}/5`,
                          ADDITIONAL_WEAPON_CATEGORIES,
                          false,
                          undefined,
                          "武器種",
                          `additional-${index}`,
                        )}
                      </div>
                    ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">シックスセンス (メダル)</h2>
              <div className="space-y-1 text-sm">
                <ItemSearch
                  category="シックスセンス"
                  onSelect={setMedal}
                  placeholder="メダルを検索"
                />
              </div>
            </section>
          </div>

          <div
            className={`space-y-8 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto xl:pr-2 ${
              activeColumn === "right" ? "block" : "hidden"
            } xl:block`}
          >
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">防具 / アクセサリー</h2>
              <div className="space-y-3">
                {renderSlot(upperArmor, setUpperArmor, null, "上防具", ["上"], false, "上", "アイテム種", "upper-armor")}
                {renderSlot(lowerArmor, setLowerArmor, null, "下防具", ["下"], false, "下", "アイテム種", "lower-armor")}
                {renderSlot(headAccessory, setHeadAccessory, null, "頭アクセ", ["頭"], false, "頭", "アイテム種", "head-accessory")}
                {renderSlot(armAccessory, setArmAccessory, null, "腕アクセ", ["腕"], false, "腕", "アイテム種", "arm-accessory")}
                {renderSlot(footAccessory, setFootAccessory, null, "足アクセ", ["足"], false, "足", "アイテム種", "foot-accessory")}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">エンブレム</h2>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => toggleAccordionByKey("sp-emblem")}
                  className="flex w-full items-center gap-2 text-left font-semibold text-slate-900"
                  aria-expanded={getIsAccordionExpanded("sp-emblem")}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      getIsAccordionExpanded("sp-emblem") ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>SPエンブレム</span>
                </button>

                {getIsAccordionExpanded("sp-emblem") && (
                  <>
                    <ItemSearch
                      category="エンブレム"
                      series="SP"
                      onSelect={(item) =>
                        setSpEmblem((previous) => ({ ...previous, item }))
                      }
                      placeholder="SPエンブレムを検索"
                    />

                    {spEmblem.effects.map((effect, effectIndex) => (
                      <div key={`sp-effect-${effectIndex}`} className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                        <select
                          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                          value={effect.effect}
                          onChange={(event) =>
                            setSpEmblem((previous) => ({
                              ...previous,
                              effects: previous.effects.map((entry, index) =>
                                index === effectIndex
                                  ? { ...entry, effect: event.target.value }
                                  : entry,
                              ),
                            }))
                          }
                          disabled={!spEmblem.item}
                        >
                          {EMBLEM_EFFECT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <input
                          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                          placeholder="効果量"
                          value={effect.amount}
                          onChange={(event) =>
                            setSpEmblem((previous) => ({
                              ...previous,
                              effects: previous.effects.map((entry, index) =>
                                index === effectIndex
                                  ? { ...entry, amount: event.target.value }
                                  : entry,
                              ),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => toggleAccordionByKey("ex-emblem")}
                  className="flex w-full items-center gap-2 text-left font-semibold text-slate-900"
                  aria-expanded={getIsAccordionExpanded("ex-emblem")}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      getIsAccordionExpanded("ex-emblem") ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>EXエンブレム</span>
                </button>

                {getIsAccordionExpanded("ex-emblem") && (
                  <>
                    <ItemSearch
                      category="エンブレム"
                      series="EX"
                      onSelect={(item) =>
                        setExEmblem((previous) => ({ ...previous, item }))
                      }
                      placeholder="EXエンブレムを検索"
                    />

                    {exEmblem.effects.map((effect, effectIndex) => (
                      <div key={`ex-effect-${effectIndex}`} className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                        <select
                          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                          value={effect.effect}
                          onChange={(event) =>
                            setExEmblem((previous) => ({
                              ...previous,
                              effects: previous.effects.map((entry, index) =>
                                index === effectIndex
                                  ? { ...entry, effect: event.target.value }
                                  : entry,
                              ),
                            }))
                          }
                          disabled={!exEmblem.item}
                        >
                          {EMBLEM_EFFECT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <input
                          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                          placeholder="効果量"
                          value={effect.amount}
                          onChange={(event) =>
                            setExEmblem((previous) => ({
                              ...previous,
                              effects: previous.effects.map((entry, index) =>
                                index === effectIndex
                                  ? { ...entry, amount: event.target.value }
                                  : entry,
                              ),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => toggleAccordionByKey("emblem-status")}
                  className="flex w-full items-center gap-2 text-left font-semibold text-slate-900"
                  aria-expanded={getIsAccordionExpanded("emblem-status")}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      getIsAccordionExpanded("emblem-status") ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>エンブレムステータス（14種）</span>
                </button>

                {getIsAccordionExpanded("emblem-status") && (
                  <div className="grid gap-2 md:grid-cols-8 xl:grid-cols-2">
                    {STATUS_KEYS.map((statusKey) => (
                      <label key={statusKey} className="space-y-1 text-sm">
                        <span>{statusKey}</span>
                        <input
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-2"
                          type="number"
                          value={statusValues[statusKey]}
                          onChange={(event) =>
                            setStatusValues((previous) => ({
                              ...previous,
                              [statusKey]: Number(event.target.value || 0),
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* {result && (
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-base font-bold text-slate-900">計算ログ(検証用)</h2>
            <div className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
              <div>核リミット: {formatNumber(result.coreLimit)}</div>
              <div>1Hit標準リミット: {formatNumber(result.normalLimitSingle)}</div>
              <div>標準リミット: {formatNumber(result.normalLimit)}</div>
              <div>有効ヒット数: {formatNumber(result.effectiveHits)}</div>
            </div>
          </section>
        )} */}
      </div>
      </div>
    </div>
  );
}
