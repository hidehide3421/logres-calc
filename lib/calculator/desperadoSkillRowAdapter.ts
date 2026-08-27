import type { SkillDesperado } from "@/types/database";
import {
  DESPERADO_SKILL_EFFECTS_BY_COMPOSITE_KEY,
  DEFAULT_DESPERADO_SKILL_EFFECT_DATA,
  toDesperadoSkillEffectRecordKey,
  type SkillDesperadoEffectData,
} from "./desperadoSkillEffectData";

type RawSkillRow = Record<string, unknown>;

const asString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const asBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "t") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "f") {
      return false;
    }
  }
  return fallback;
};

const mergeEffectData = (
  rowMeta: {
    item_name: string;
    item_rarity: string;
    skill_name: string;
    skill_trigger: string;
    skill_element: string;
  },
  row: RawSkillRow,
): SkillDesperadoEffectData => {
  const fromRow: Partial<SkillDesperadoEffectData> = {};

  for (const key of Object.keys(
    DEFAULT_DESPERADO_SKILL_EFFECT_DATA,
  ) as (keyof SkillDesperadoEffectData)[]) {
    const value = row[key];
    if (value === undefined || value === null) {
      continue;
    }

    if (key === "burstStrikeName") {
      fromRow[key] = asString(value, "(なし)");
      continue;
    }

    fromRow[key] = asNumber(value, 0);
  }

  const recordKey = toDesperadoSkillEffectRecordKey(rowMeta);

  return {
    ...DEFAULT_DESPERADO_SKILL_EFFECT_DATA,
    ...fromRow,
    ...(DESPERADO_SKILL_EFFECTS_BY_COMPOSITE_KEY[recordKey] ?? {}),
  };
};

export const normalizeSkillDesperadoRow = (row: RawSkillRow): SkillDesperado => {
  const id = asString(row.id);
  const triggerSource = asString(row.skill_trigger, "own");
  const itemName = asString(row.item_name);
  const itemRarity = asString(row.item_rarity);
  const skillName = asString(row.skill_name);
  const skillElement = asString(row.skill_element);

  return {
    id,
    item_element: asString(row.item_element),
    item_name: itemName,
    item_rarity: itemRarity,
    skill_name: skillName,
    skill_trigger: triggerSource,
    skill_category: asString(row.skill_category),
    skill_element: skillElement,
    skill_format: asString(row.skill_format, "other"),
    skill_color: asString(row.skill_color, "other"),
    skill_type: asString(row.skill_type, "other"),
    skill_range: asString(row.skill_range, "other"),
    is_magicbullet: asBoolean(row.is_magicbullet, false),
    is_shifted: asBoolean(row.is_shifted, false),
    top_element_affected: asBoolean(row.top_element_affected, false),
    is_haken: asBoolean(row.is_haken, false),
    is_hasou: asBoolean(row.is_hasou, false),
    is_gouki: asBoolean(row.is_gouki, false),
    is_auto: asBoolean(row.is_auto, false),
    is_hissatsu: asBoolean(row.is_hissatsu, false),
    is_kakusei: asBoolean(row.is_kakusei, false),
    is_integer: asBoolean(row.is_integer, false),
    size_min: asNumber(row.size_min, 0),
    size_max: asNumber(row.size_max, 0),
    ...mergeEffectData(
      {
        item_name: itemName,
        item_rarity: itemRarity,
        skill_name: skillName,
        skill_trigger: triggerSource,
        skill_element: skillElement,
      },
      row,
    ),
  };
};
