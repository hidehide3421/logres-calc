import { describe, expect, it } from "vitest";

import { normalizeSkillDesperadoRow } from "./desperadoSkillRowAdapter";

describe("normalizeSkillDesperadoRow", () => {
  it("既知レコードキーはソース管理された効果データを優先する", () => {
    const row = normalizeSkillDesperadoRow({
      id: "02d0ef01-e03b-461b-9fe6-282ae17e8a25",
      item_element: "闇",
      item_name: "オリジンの豪影斧",
      item_rarity: "究極",
      skill_name: "必殺",
      skill_trigger: "own",
      skill_category: "攻撃",
      skill_element: "闇",
      corePlusOwnHasou: 999,
    });

    expect(row.skill_trigger).toBe("own");
    expect(row.corePlusOwnHasou).toBe(375000);
    expect(row.corePlusOwnHasouPerHissatsuLv).toBe(125000);
    expect(row.normalHitsSkillSelf).toBe(3);
    expect(row.damageCapSkillSelf).toBe(9999999999);
  });

  it("現行メタ列を正規化できる", () => {
    const row = normalizeSkillDesperadoRow({
      id: "unknown-1",
      item_element: "光",
      item_name: "テスト",
      item_rarity: "究極",
      skill_name: "EX",
      skill_trigger: "free",
      skill_category: "補助",
      skill_element: "無",
      is_shifted: true,
      top_element_affected: true,
    });

    expect(row.skill_trigger).toBe("free");
    expect(row.is_shifted).toBe(true);
    expect(row.top_element_affected).toBe(true);
  });

  it("未知IDはデフォルト効果データで補完する", () => {
    const row = normalizeSkillDesperadoRow({
      id: "unknown-2",
      item_element: "無",
      item_name: "未定義",
      item_rarity: "究極",
      skill_name: "none",
      skill_trigger: "own",
      skill_category: "other",
      skill_element: "無",
    });

    expect(row.corePlusOwnHasou).toBe(0);
    expect(row.damageCapSkillSelf).toBe(9999999999);
    expect(row.normalHitsSkillSelf).toBe(1);
    expect(row.bcHitsOwnAnywhere).toBe(1);
    expect(row.burstStrikeName).toBe("(なし)");
  });
});
