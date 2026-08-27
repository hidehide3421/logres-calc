import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import type { SkillDesperado } from "@/types/database";
import { normalizeSkillDesperadoRow } from "@/lib/calculator/desperadoSkillRowAdapter";

const NONE_LABEL = "(なし)";

// DB縮退後に残すメタ列のみ取得する。
const SKILL_META_SELECT_COLUMNS = [
  "id",
  "item_element",
  "item_name",
  "item_rarity",
  "skill_format",
  "skill_name",
  "skill_trigger",
  "skill_category",
  "skill_element",
  "skill_color",
  "skill_type",
  "skill_range",
  "is_magicbullet",
  "is_shifted",
  "top_element_affected",
  "is_haken",
  "is_hasou",
  "is_gouki",
  "is_auto",
  "is_hissatsu",
  "is_kakusei",
  "is_integer",
  "size_min",
  "size_max",
].join(",");

type SourceKey = {
  itemElement: string;
  itemName: string;
  itemRarity: string;
};

const parseSourceKeys = (raw: string | null): SourceKey[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SourceKey[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry) =>
        typeof entry?.itemElement === "string" &&
        typeof entry?.itemName === "string" &&
        typeof entry?.itemRarity === "string",
    );
  } catch {
    return [];
  }
};

const resolveSkillTrigger = (skill: SkillDesperado) => skill.skill_trigger;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim() ?? "";
  const limit = Number(params.get("limit") ?? "10");
  const itemName = params.get("itemName")?.trim() ?? "";
  const itemElement = params.get("itemElement")?.trim() ?? "";
  const itemRarity = params.get("itemRarity")?.trim() ?? "";
  const skillCategory = params.get("skillCategory")?.trim() ?? "";
  const ownOnly = params.get("ownOnly") === "true";
  const attackOnly = params.get("attackOnly") === "true";
  const includeFree = params.get("includeFree") !== "false";
  const sourceKeys = parseSourceKeys(params.get("sourceKeys"));

  const runQuery = async (columns: string) => {
    let query = supabaseServer
      .from("skill_desperado")
      .select(columns)
      .order("item_name", { ascending: true })
      .order("skill_name", { ascending: true })
      .limit(200);

    if (q) {
      query = query.or(`item_name.ilike.%${q}%,skill_name.ilike.%${q}%`);
    }
    if (itemName && itemName !== NONE_LABEL) {
      query = query.eq("item_name", itemName);
    }
    if (itemElement && itemElement !== NONE_LABEL) {
      query = query.eq("item_element", itemElement);
    }
    if (itemRarity && itemRarity !== NONE_LABEL) {
      query = query.eq("item_rarity", itemRarity);
    }
    if (skillCategory && skillCategory !== NONE_LABEL) {
      query = query.eq("skill_category", skillCategory);
    }

    return query;
  };

  let { data, error } = await runQuery(SKILL_META_SELECT_COLUMNS);

  // 旧スキーマ環境では列不足エラーになるため、互換的に * へフォールバックする。
  if (
    error &&
    /column .* does not exist|could not find the column/i.test(error.message)
  ) {
    const fallback = await runQuery("*");
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    return NextResponse.json(
      { message: "Failed to load skills.", details: error.message },
      { status: 500 },
    );
  }

  const sourceSet = new Set(
    sourceKeys.map((key) => `${key.itemElement}|${key.itemName}|${key.itemRarity}`),
  );

  const rows = (data ?? []) as unknown[];

  const skills = rows
    .filter(isRecord)
    .map((row) => normalizeSkillDesperadoRow(row));

  const filtered = skills.filter((skill: SkillDesperado) => {
    const trigger = resolveSkillTrigger(skill);

    if (attackOnly && skill.skill_category !== "攻撃") {
      return false;
    }

    if (ownOnly && trigger !== "own") {
      return false;
    }

    if (!includeFree && trigger === "free") {
      return false;
    }

    if (trigger === "free") {
      return includeFree;
    }

    if (trigger === "own") {
      if (sourceSet.size === 0) {
        return false;
      }
      return sourceSet.has(
        `${skill.item_element}|${skill.item_name}|${skill.item_rarity}`,
      );
    }

    return true;
  });

  const normalizedLimit = Number.isFinite(limit)
    ? Math.min(Math.max(limit, 1), 30)
    : 10;

  return NextResponse.json({
    skills: filtered.slice(0, normalizedLimit),
  });
}
