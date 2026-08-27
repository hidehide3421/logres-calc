import { describe, expect, it } from "vitest";

import { calculateDesperado } from "./desperado";
import type { AbilityDesperado, SkillDesperado } from "@/types/database";

const createSkill = (overrides: Partial<SkillDesperado>): SkillDesperado => ({
  id: "skill",
  item_element: "闇",
  item_name: "テスト武器",
  item_rarity: "英雄",
  skill_name: "必殺",
  skill_trigger: "own",
  skill_category: "攻撃",
  skill_element: "闇",
  is_magicbullet: false,
  is_shifted: false,
  top_element_affected: false,
  is_haken: false,
  is_hasou: true,
  is_gouki: false,
  is_hissatsu: true,
  is_kakusei: false,
  is_integer: false,
  size_min: 0,
  size_max: 0,
  burstStrikeName: "(なし)",
  coreBaseOwnAnywhere: 0,
  coreBaseOwnAnywherePerHissatsuLv: 0,
  corePlusOwnHasou: 0,
  corePlusOwnHasouPerHissatsuLv: 0,
  coreSpecialBaseOwnAnywhere: 0,
  coreSpecialBaseOwnHakenHasouKakusei: 0,
  coreSpecialBaseOwnPureHasouHissatsu: 0,
  coreSpecialBaseArtifactSetSkillSelf: 0,
  coreSpecialBaseSkillSelf: 0,
  coreSpecialPlusOwnAnywhere: 0,
  coreSpecialPlusSkillSelf: 0,
  coreSpecialPlusSkillSelfPerHissatsuLv: 0,
  coreSpecialPlusSkillSelfAtMana40: 0,
  skillMultiplierSkillSelf: 0,
  skillMultiplierSkillSelfPerHissatsuLv: 0,
  skillMultiplierSkillSelfPerHeroLv: 0,
  damageCapSkillSelf: 9_999_999_999,
  normalHitsSkillSelf: 1,
  normalHitsPlusOwnAnywhere: 0,
  normalHitsPlusOwnAttack: 0,
  normalHitsPlusOwnHasouAttack: 0,
  normalHitsPlusSkillSelf: 0,
  normalHitsPlusOwnSideAnywhere: 0,
  specialHitsPlusArtifactSetSkillSelf: 0,
  bcBaseOwnSideAnywhere: 0,
  bcBaseSkillSelfPrior: 0,
  bcPlusOwnAnywhere: 0,
  bcPlusOwnHasou: 0,
  bcPlusOwnPureHasouHissatsu: 0,
  bcPlusArtifactSetSkillSelf: 0,
  bcPlusSkillSelf: 0,
  bcPlusSkillSelfPerHissatsuLv: 0,
  bcPlusSkillSelfPerMana: 0,
  bcPlusOwnSideHasou: 0,
  bcCapSkillSelf: 0,
  bcHitsOwnAnywhere: 1,
  bcHitsSkillSelfPrior: 0,
  followSamePhysicOwnWeaponActiveSingle: 0,
  followSamePhysicHitsOwnWeaponActiveSingle: 0,
  followSamePhysicTimesOwnWeaponActiveSingle: 0,
  followTriggerPhysicOwnWeaponActiveSingle: 0,
  followTriggerPhysicHitsOwnWeaponActiveSingle: 0,
  followTriggerPhysicTimesOwnWeaponActiveSingle: 0,
  followSamePhysicOwnHakenHasouKakusei: 0,
  followSamePhysicHitsOwnHakenHasouKakusei: 0,
  followSamePhysicTimesOwnHakenHasouKakusei: 0,
  followSamePhysicOwnPureHasouHissatsu: 0,
  followSamePhysicHitsOwnPureHasouHissatsu: 0,
  followSamePhysicTimesOwnPureHasouHissatsu: 0,
  followSamePhysicSkillSelf: 0,
  followSamePhysicHitsSkillSelf: 0,
  followSamePhysicTimesSkillSelf: 0,
  followSameMagicOwnSideWeaponActiveSingle: 0,
  followSameMagicHitsOwnSideWeaponActiveSingle: 0,
  followSameMagicTimesOwnSideWeaponActiveSingle: 0,
  ...overrides,
});

const ability: AbilityDesperado = {
  lv_range: "116~120",
  lv_range_min: 116,
  lv_range_max: 120,
  core_base: 100,
  crit_multipuler: 1.5,
  normal_hits_plus: 1,
  native_opening_skill: false,
  native_random_skill: false,
};

describe("calculateDesperado", () => {
  it("通常出力（バーストなし）を算出できる", () => {
    const target = createSkill({
      normalHitsSkillSelf: 2,
      skillMultiplierSkillSelf: 1,
    });

    const support = createSkill({
      id: "support",
      item_name: "支援向け武器",
      corePlusOwnHasou: 20,
      coreSpecialBaseOwnAnywhere: 50,
      coreSpecialPlusOwnAnywhere: 10,
      normalHitsPlusOwnAnywhere: 1,
      specialHitsPlusArtifactSetSkillSelf: 2,
      followSamePhysicOwnWeaponActiveSingle: 100,
      followSamePhysicHitsOwnWeaponActiveSingle: 2,
      followSamePhysicTimesOwnWeaponActiveSingle: 1,
    });

    const result = calculateDesperado(target, [support], ability, {
      hissatsuLv: 1,
      heroLv: 1,
      mana: 5,
      isEnhanced: false,
      burstStrikeName: "(なし)",
    });

    expect(result.coreLimit).toBe(28_120);
    expect(result.normalLimitSingle).toBe(84_360);
    expect(result.effectiveHits).toBe(7);
    expect(result.blackCritLimit).toBe(0);
    expect(result.followUpLimit).toBe(200);
    expect(result.grossLimit).toBe(590_720);
  });

  it("バースト有効時はブラッククリティカル出力を合計へ反映する", () => {
    const target = createSkill({
      bcHitsSkillSelfPrior: 2,
      normalHitsSkillSelf: 1,
    });

    const result = calculateDesperado(target, [], {
      ...ability,
      crit_multipuler: 1,
      normal_hits_plus: 0,
    }, {
      hissatsuLv: 1,
      heroLv: 1,
      mana: 0,
      isEnhanced: false,
      burstStrikeName: "バルドル",
    });

    expect(result.normalLimit).toBe(28_100);
    expect(result.blackCritLimit).toBe(56_200);
    expect(result.grossLimit).toBe(56_200);
  });

  it("sameSkill 条件の効果は対象武器にのみ適用される", () => {
    const target = createSkill({
      normalHitsSkillSelf: 1,
      skillMultiplierSkillSelf: 0,
    });

    const support = createSkill({
      id: "support",
      item_name: "別武器",
      skillMultiplierSkillSelf: 10,
    });

    const result = calculateDesperado(target, [support], ability, {
      hissatsuLv: 1,
      heroLv: 1,
      mana: 0,
      isEnhanced: false,
      burstStrikeName: "(なし)",
    });

    expect(result.normalLimitSingle).toBe(42_150);
  });

  it("魔法攻撃でない攻撃スキルには sameMagic 追撃が適用されない", () => {
    const support = createSkill({
      id: "support",
      item_name: "支援向け武器",
      followSameMagicOwnSideWeaponActiveSingle: 100,
      followSameMagicHitsOwnSideWeaponActiveSingle: 2,
      followSameMagicTimesOwnSideWeaponActiveSingle: 1,
    });

    const nonMagicTarget = createSkill({
      is_magicbullet: false,
    });
    const magicTarget = createSkill({
      is_magicbullet: true,
    });

    const nonMagicResult = calculateDesperado(nonMagicTarget, [support], ability, {
      hissatsuLv: 1,
      heroLv: 1,
      mana: 0,
      isEnhanced: false,
      burstStrikeName: "(なし)",
    });
    const magicResult = calculateDesperado(magicTarget, [support], ability, {
      hissatsuLv: 1,
      heroLv: 1,
      mana: 0,
      isEnhanced: false,
      burstStrikeName: "(なし)",
    });

    expect(nonMagicResult.followUpLimit).toBe(0);
    expect(magicResult.followUpLimit).toBe(200);
  });

  it("bcPlusOwnSideHasou はこのスキルを発動した者自身の、武器種が覇双であるスキル対象にのみ加算される", () => {
    const support = createSkill({
      id: "support",
      item_name: "支援向け武器",
      bcPlusOwnSideHasou: 500,
    });

    const hasouTarget = createSkill({
      bcBaseOwnSideAnywhere: 100,
      is_hasou: true,
      normalHitsSkillSelf: 1,
    });
    const nonHasouTarget = createSkill({
      bcBaseOwnSideAnywhere: 100,
      is_hasou: false,
      normalHitsSkillSelf: 1,
    });

    const hasouResult = calculateDesperado(hasouTarget, [support], {
      ...ability,
      crit_multipuler: 1,
      normal_hits_plus: 0,
    }, {
      hissatsuLv: 1,
      heroLv: 1,
      mana: 0,
      isEnhanced: false,
      burstStrikeName: "バルドル",
    });
    const nonHasouResult = calculateDesperado(nonHasouTarget, [support], {
      ...ability,
      crit_multipuler: 1,
      normal_hits_plus: 0,
    }, {
      hissatsuLv: 1,
      heroLv: 1,
      mana: 0,
      isEnhanced: false,
      burstStrikeName: "バルドル",
    });

    expect(hasouResult.blackCritLimit).toBe(600);
    expect(nonHasouResult.blackCritLimit).toBe(100);
  });
});
