import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  DESPERADO_SKILL_EFFECTS_BY_COMPOSITE_KEY,
  toDesperadoSkillEffectRecordKey,
} from "@/lib/calculator/desperadoSkillEffectData";

const SAMPLE_LIMIT = 30;

export async function GET() {
  const { data, error } = await supabaseServer
    .from("skill_desperado")
    .select("item_name,item_rarity,skill_name,skill_trigger,skill_element")
    .order("item_name", { ascending: true })
    .order("item_rarity", { ascending: true })
    .order("skill_name", { ascending: true })
    .order("skill_trigger", { ascending: true })
    .order("skill_element", { ascending: true })
    .limit(5000);

  if (error) {
    return NextResponse.json(
      {
        message: "Failed to load skill_desperado composite keys.",
        details: error.message,
      },
      { status: 500 },
    );
  }

  const dbCompositeKeysRaw = (data ?? [])
    .map((row) =>
      toDesperadoSkillEffectRecordKey({
        item_name: typeof row.item_name === "string" ? row.item_name : "",
        item_rarity: typeof row.item_rarity === "string" ? row.item_rarity : "",
        skill_name: typeof row.skill_name === "string" ? row.skill_name : "",
        skill_trigger:
          typeof row.skill_trigger === "string" ? row.skill_trigger : "own",
        skill_element: typeof row.skill_element === "string" ? row.skill_element : "",
      }),
    )
    .filter((key) => key.length > 0);

  const dbKeyCountByValue = new Map<string, number>();
  dbCompositeKeysRaw.forEach((key) => {
    dbKeyCountByValue.set(key, (dbKeyCountByValue.get(key) ?? 0) + 1);
  });

  const dbKeysUnique = Array.from(dbKeyCountByValue.keys()).sort((a, b) =>
    a.localeCompare(b, "en"),
  );
  const duplicateDbKeys = Array.from(dbKeyCountByValue.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => a.key.localeCompare(b.key, "en"));

  const sourceKeys = Object.keys(DESPERADO_SKILL_EFFECTS_BY_COMPOSITE_KEY).sort(
    (a, b) => a.localeCompare(b, "en"),
  );

  const sourceKeySet = new Set(sourceKeys);
  const dbKeySet = new Set(dbKeysUnique);

  const missingInSource = dbKeysUnique.filter((key) => !sourceKeySet.has(key));
  const missingInDb = sourceKeys.filter((key) => !dbKeySet.has(key));

  const isConsistent =
    missingInSource.length === 0 &&
    missingInDb.length === 0 &&
    duplicateDbKeys.length === 0;

  return NextResponse.json({
    isConsistent,
    counts: {
      dbRows: dbCompositeKeysRaw.length,
      dbUniqueKeys: dbKeysUnique.length,
      sourceKeys: sourceKeys.length,
      duplicateDbKeys: duplicateDbKeys.length,
      missingInSource: missingInSource.length,
      missingInDb: missingInDb.length,
    },
    samples: {
      duplicateDbKeys: duplicateDbKeys.slice(0, SAMPLE_LIMIT),
      missingInSource: missingInSource.slice(0, SAMPLE_LIMIT),
      missingInDb: missingInDb.slice(0, SAMPLE_LIMIT),
    },
  });
}
