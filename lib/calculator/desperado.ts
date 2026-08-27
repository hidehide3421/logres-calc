import type {
  SkillDesperado as Skill,
  AbilityDesperado as Ability,
} from "@/types/database";

type DesperadoParams = {
  hissatsuLv: number;
  heroLv: number;
  mana: number;
  isEnhanced: boolean;
  burstStrikeName?: string | null;
};

const DEFAULT_CORE_PLUS = 28_000;
const DEFAULT_DAMAGE_CAP = 9_999_999_999;
const DEFAULT_BC_BASE = 9_999_999_999;
const DEFAULT_BC_CAP = 999_999_999_999;
const HITS_CAP = 600;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// 符号関数(Math.signとは違い、-0とNaNに対しても0として扱うため、今回は独自実装)
const sgn = (value: number) => (value > 0 ? 1 : value < 0 ? -1 : 0);

const minPositive = (values: number[], fallback: number) => {
  const positives = values.filter((value) => value > 0);
  if (positives.length === 0) {
    return fallback;
  }
  return Math.min(...positives);
};

const followTerm = (value: number, hits: number, times: number) =>
  value * Math.max(hits, 0) * Math.max(times, 0);

type TargetTrait =
  | "attack"
  | "hasou"
  | "hissatsu"
  | "pureHasouHissatsu"
  | "magicBullet";

type EffectCondition = {
  sameSkill?: boolean;
  requiresBurstEnabled?: boolean;
  minMana?: number;
  requiredTargetTraits?: TargetTrait[];
};

type EvalContext = {
  target: Skill;
  hissatsuLv: number;
  heroLv: number;
  mana: number;
  burstEnabled: boolean;
  targetIsAttack: boolean;
  targetIsHasou: boolean;
  targetIsHissatsu: boolean;
  targetIsPureHasouHissatsu: boolean;
  targetIsMagicBullet: boolean;
};

const isPureHasouHissatsu = (skill: Skill) =>
  skill.is_hasou &&
  skill.is_hissatsu &&
  !skill.is_magicbullet &&
  !skill.is_shifted;

const matchesCondition = (
  source: Skill,
  context: EvalContext,
  condition?: EffectCondition,
) => {
  if (!condition) {
    return true;
  }

  if (condition.sameSkill && source.item_name !== context.target.item_name) {
    return false;
  }
  if (condition.requiresBurstEnabled && !context.burstEnabled) {
    return false;
  }
  if (condition.minMana !== undefined && context.mana < condition.minMana) {
    return false;
  }

  if (condition.requiredTargetTraits) {
    const hasTrait = (trait: TargetTrait) => {
      switch (trait) {
        case "attack":
          return context.targetIsAttack;
        case "hasou":
          return context.targetIsHasou;
        case "hissatsu":
          return context.targetIsHissatsu;
        case "pureHasouHissatsu":
          return context.targetIsPureHasouHissatsu;
        case "magicBullet":
          return context.targetIsMagicBullet;
      }
    };

    if (!condition.requiredTargetTraits.every((trait) => hasTrait(trait))) {
      return false;
    }
  }

  return true;
};

const sumEffect = (
  sources: Skill[],
  context: EvalContext,
  reader: (skill: Skill, context: EvalContext) => number,
  condition?: EffectCondition,
) => {
  return sources.reduce((total, skill) => {
    if (!matchesCondition(skill, context, condition)) {
      return total;
    }
    return total + reader(skill, context);
  }, 0);
};

const maxEffect = (
  sources: Skill[],
  context: EvalContext,
  reader: (skill: Skill, context: EvalContext) => number,
  condition?: EffectCondition,
  fallback = 0,
) => {
  const values = sources
    .filter((skill) => matchesCondition(skill, context, condition))
    .map((skill) => reader(skill, context))
    .filter((value) => value !== 0);

  if (values.length === 0) {
    return fallback;
  }

  return Math.max(...values);
};

const collectEffectValues = (
  sources: Skill[],
  context: EvalContext,
  reader: (skill: Skill, context: EvalContext) => number,
  condition?: EffectCondition,
) => {
  return sources
    .filter((skill) => matchesCondition(skill, context, condition))
    .map((skill) => reader(skill, context));
};

export const calculateDesperado = (
  targetSkill: Skill,
  activeSkills: Skill[],
  jobAbility: Ability,
  params: DesperadoParams,
) => {
  const validHissatsuLv = clamp(params.hissatsuLv, 1, 5);
  const validHeroLv = clamp(params.heroLv, 1, 5);
  const validMana = clamp(params.mana, 0, 70);
  const burstEnabled =
    !!params.burstStrikeName && params.burstStrikeName.trim() !== "(なし)";

  const allSkills = [targetSkill, ...activeSkills];
  const targetIsAttack = targetSkill.skill_category === "攻撃";
  const context: EvalContext = {
    target: targetSkill,
    hissatsuLv: validHissatsuLv,
    heroLv: validHeroLv,
    mana: validMana,
    burstEnabled,
    targetIsAttack,
    targetIsHasou: targetSkill.is_hasou,
    targetIsHissatsu: targetSkill.is_hissatsu,
    targetIsPureHasouHissatsu: isPureHasouHissatsu(targetSkill),
    targetIsMagicBullet: targetSkill.is_magicbullet,
  };

  // 1-1) 核基底値
  const maxCoreBase = Math.max(
    jobAbility.core_base,
    maxEffect(
      allSkills,
      context,
      (skill, ctx) =>
        skill.coreBaseOwnAnywhere +
        skill.coreBaseOwnAnywherePerHissatsuLv * ctx.hissatsuLv,
      undefined,
      0,
    ),
  );

  // 1-2) 従来のリミット+
  const sumCorePlus =
    DEFAULT_CORE_PLUS +
    sumEffect(
      allSkills,
      context,
      (skill, ctx) =>
        skill.corePlusOwnHasou + skill.corePlusOwnHasouPerHissatsuLv * ctx.hissatsuLv,
      { requiredTargetTraits: ["hasou"] },
    );

  // 1-3) 条件付きダメージリミット固定値 / 固定値+
  const coreSpecialBaseCandidates = [0];
  coreSpecialBaseCandidates.push(
    maxEffect(allSkills, context, (skill) => skill.coreSpecialBaseOwnAnywhere, undefined, 0),
  );
  coreSpecialBaseCandidates.push(
    maxEffect(
      allSkills,
      context,
      (skill) => skill.coreSpecialBaseOwnHakenHasouKakusei,
      { requiredTargetTraits: ["hasou", "hissatsu"] },
      0,
    ),
  );
  coreSpecialBaseCandidates.push(
    maxEffect(
      allSkills,
      context,
      (skill) => skill.coreSpecialBaseOwnPureHasouHissatsu,
      { requiredTargetTraits: ["pureHasouHissatsu"] },
      0,
    ),
  );
  coreSpecialBaseCandidates.push(
    maxEffect(
      allSkills,
      context,
      (skill) => skill.coreSpecialBaseArtifactSetSkillSelf,
      undefined,
      0,
    ),
  );
  coreSpecialBaseCandidates.push(
    maxEffect(
      allSkills,
      context,
      (skill) => skill.coreSpecialBaseSkillSelf,
      { sameSkill: true },
      0,
    ),
  );

  const sumCoreSpecialPlus =
    sumEffect(allSkills, context, (skill) => skill.coreSpecialPlusOwnAnywhere) +
    sumEffect(
      allSkills,
      context,
      (skill, ctx) =>
        skill.coreSpecialPlusSkillSelf +
        skill.coreSpecialPlusSkillSelfPerHissatsuLv * ctx.hissatsuLv,
      { sameSkill: true },
    ) +
    sumEffect(
      allSkills,
      context,
      (skill) => skill.coreSpecialPlusSkillSelfAtMana40,
      { sameSkill: true, minMana: 40 },
    );

  const maxCoreSpecialBase = Math.max(...coreSpecialBaseCandidates);
  const coreSpecialTerm =
    sgn(maxCoreSpecialBase) * (maxCoreSpecialBase + sumCoreSpecialPlus);

  // 1-4) 核リミット
  const coreLimit = maxCoreBase + Math.max(sumCorePlus, coreSpecialTerm);

  // 2-1) スキルダメージ倍率
  const sumSkillMultiplier = sumEffect(
    allSkills,
    context,
    (skill, ctx) =>
      skill.skillMultiplierSkillSelf +
      skill.skillMultiplierSkillSelfPerHissatsuLv * ctx.hissatsuLv +
      skill.skillMultiplierSkillSelfPerHeroLv * ctx.heroLv,
    { sameSkill: true },
  );

  // 2-2) スキルダメージ上限(非ブラッククリティカル)の定義
  const damageCap = minPositive(
    collectEffectValues(allSkills, context, (skill) => skill.damageCapSkillSelf),
    DEFAULT_DAMAGE_CAP,
  );

  // 2-3) 1Hit標準リミット（documentの暫定仕様に合わせてここで四捨五入）
  const normalLimitSingle = Math.round(
    Math.min(
      coreLimit * (1 + sumSkillMultiplier) * jobAbility.crit_multipuler,
      damageCap,
    ),
  );

  // 3) 標準ヒット合計
  const normalHits = Math.max(targetSkill.normalHitsSkillSelf, 1);
  const normalHitsPlus =
    jobAbility.normal_hits_plus +
    sumEffect(allSkills, context, (skill) => skill.normalHitsPlusOwnAnywhere) +
    sumEffect(allSkills, context, (skill) => skill.normalHitsPlusOwnSideAnywhere) +
    sumEffect(
      allSkills,
      context,
      (skill) => skill.normalHitsPlusOwnAttack,
      { requiredTargetTraits: ["attack"] },
    ) +
    sumEffect(
      allSkills,
      context,
      (skill) => skill.normalHitsPlusOwnHasouAttack,
      { requiredTargetTraits: ["attack", "hasou"] },
    ) +
    sumEffect(
      allSkills,
      context,
      (skill) => skill.normalHitsPlusSkillSelf,
      { sameSkill: true },
    );

  const manaHitsBonus =
    targetIsAttack && targetSkill.is_hasou ? Math.floor(validMana / 5) : 0;
  const manaEnhancedBonus =
    targetIsAttack && targetSkill.is_hasou && params.isEnhanced ? 15 : 0;

  const specialHits = 0;
  const specialHitsPlus = sumEffect(
    allSkills,
    context,
    (skill) => skill.specialHitsPlusArtifactSetSkillSelf,
  );

  const effectiveHits = Math.min(
    ((normalHits + normalHitsPlus + manaHitsBonus + manaEnhancedBonus) *
      (1 - sgn(specialHits)) +
      specialHits +
      specialHitsPlus),
    HITS_CAP,
  );

  const normalLimit = normalLimitSingle * effectiveHits;

  // 4) ブラッククリティカル
  const blackCritBaseAnywhere = maxEffect(
    allSkills,
    context,
    (skill) => skill.bcBaseOwnSideAnywhere,
    undefined,
    DEFAULT_BC_BASE,
  );
  const blackCritBasePrior = maxEffect(
    allSkills,
    context,
    (skill) => skill.bcBaseSkillSelfPrior,
    { sameSkill: true, requiresBurstEnabled: true },
    0,
  );
  const blackCritBase = burstEnabled
    ? Math.max(blackCritBaseAnywhere, blackCritBasePrior)
    : blackCritBaseAnywhere;

  const blackCritHitsAnywhere = maxEffect(
    allSkills,
    context,
    (skill) => skill.bcHitsOwnAnywhere,
    undefined,
    1,
  );
  const blackCritHitsPrior = maxEffect(
    allSkills,
    context,
    (skill) => skill.bcHitsSkillSelfPrior,
    { sameSkill: true, requiresBurstEnabled: true },
    0,
  );
  const blackCritHits = burstEnabled
    ? Math.max(blackCritHitsAnywhere, blackCritHitsPrior)
    : blackCritHitsAnywhere;

  let blackCritPlus =
    sumEffect(allSkills, context, (skill) => skill.bcPlusOwnAnywhere) +
    sumEffect(allSkills, context, (skill) => skill.bcPlusArtifactSetSkillSelf) +
    sumEffect(
      allSkills,
      context,
      (skill) => skill.bcPlusOwnSideHasou,
      { requiredTargetTraits: ["hasou"] },
    );

  blackCritPlus += sumEffect(
    allSkills,
    context,
    (skill) => skill.bcPlusOwnHasou,
    { requiredTargetTraits: ["hasou"] },
  );
  blackCritPlus += sumEffect(
    allSkills,
    context,
    (skill) => skill.bcPlusOwnPureHasouHissatsu,
    { requiredTargetTraits: ["pureHasouHissatsu"] },
  );
  blackCritPlus += sumEffect(
    allSkills,
    context,
    (skill, ctx) =>
      skill.bcPlusSkillSelf +
      skill.bcPlusSkillSelfPerHissatsuLv * ctx.hissatsuLv +
      skill.bcPlusSkillSelfPerMana * Math.min(ctx.mana, 50),
    { sameSkill: true },
  );

  const blackCritCap = minPositive(
    collectEffectValues(allSkills, context, (skill) => skill.bcCapSkillSelf),
    DEFAULT_BC_CAP,
  );
  const blackCritLimit = burstEnabled
    ? Math.min(normalLimit, blackCritBase + blackCritPlus, blackCritCap) * blackCritHits
    : 0;

  // 5) 追撃
  const followUpLimit = allSkills.reduce((total, skill) => {
    let value = total;

    value += followTerm(
      skill.followSamePhysicOwnWeaponActiveSingle,
      skill.followSamePhysicHitsOwnWeaponActiveSingle,
      skill.followSamePhysicTimesOwnWeaponActiveSingle,
    );

    if (matchesCondition(skill, context, { sameSkill: true })) {
      value += followTerm(
        skill.followTriggerPhysicOwnWeaponActiveSingle,
        skill.followTriggerPhysicHitsOwnWeaponActiveSingle,
        skill.followTriggerPhysicTimesOwnWeaponActiveSingle,
      );
      value += followTerm(
        skill.followSamePhysicSkillSelf,
        skill.followSamePhysicHitsSkillSelf,
        skill.followSamePhysicTimesSkillSelf,
      );
    }

    if (matchesCondition(skill, context, { requiredTargetTraits: ["hasou", "hissatsu"] })) {
      value += followTerm(
        skill.followSamePhysicOwnHakenHasouKakusei,
        skill.followSamePhysicHitsOwnHakenHasouKakusei,
        skill.followSamePhysicTimesOwnHakenHasouKakusei,
      );
    }

    if (matchesCondition(skill, context, { requiredTargetTraits: ["pureHasouHissatsu"] })) {
      value += followTerm(
        skill.followSamePhysicOwnPureHasouHissatsu,
        skill.followSamePhysicHitsOwnPureHasouHissatsu,
        skill.followSamePhysicTimesOwnPureHasouHissatsu,
      );
    }

    if (matchesCondition(skill, context, { requiredTargetTraits: ["magicBullet"] })) {
      value += followTerm(
        skill.followSameMagicOwnSideWeaponActiveSingle,
        skill.followSameMagicHitsOwnSideWeaponActiveSingle,
        skill.followSameMagicTimesOwnSideWeaponActiveSingle,
      );
    }

    return value;
  }, 0);

  const grossLimit = (burstEnabled ? blackCritLimit : normalLimit) + followUpLimit;

  return {
    coreLimit,
    normalLimitSingle,
    normalLimit,
    blackCritLimit,
    followUpLimit,
    grossLimit,
    effectiveHits,
  };
};