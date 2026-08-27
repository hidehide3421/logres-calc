import type { SkillDesperado } from '@/types/database';

export type SkillDesperadoEffectKey =
  | 'bcBaseOwnSideAnywhere'
  | 'bcBaseSkillSelfPrior'
  | 'bcCapSkillSelf'
  | 'bcHitsOwnAnywhere'
  | 'bcHitsSkillSelfPrior'
  | 'bcPlusOwnSideHasou'
  | 'bcPlusOwnAnywhere'
  | 'bcPlusOwnHasou'
  | 'bcPlusOwnPureHasouHissatsu'
  | 'bcPlusSkillSelf'
  | 'bcPlusArtifactSetSkillSelf'
  | 'coreBaseOwnAnywhere'
  | 'corePlusOwnHasou'
  | 'coreSpecialBaseOwnAnywhere'
  | 'coreSpecialBaseOwnHakenHasouKakusei'
  | 'coreSpecialBaseOwnPureHasouHissatsu'
  | 'coreSpecialBaseSkillSelf'
  | 'coreSpecialBaseArtifactSetSkillSelf'
  | 'coreSpecialPlusOwnAnywhere'
  | 'coreSpecialPlusSkillSelf'
  | 'damageCapSkillSelf'
  | 'followSameMagicOwnSideWeaponActiveSingle'
  | 'followTriggerPhysicOwnWeaponActiveSingle'
  | 'followSamePhysicOwnWeaponActiveSingle'
  | 'followSamePhysicOwnHakenHasouKakusei'
  | 'followSameMagicHitsOwnSideWeaponActiveSingle'
  | 'followTriggerPhysicHitsOwnWeaponActiveSingle'
  | 'followSamePhysicHitsOwnWeaponActiveSingle'
  | 'followSamePhysicHitsOwnHakenHasouKakusei'
  | 'followSamePhysicHitsOwnPureHasouHissatsu'
  | 'followSamePhysicHitsSkillSelf'
  | 'followSamePhysicOwnPureHasouHissatsu'
  | 'followSamePhysicSkillSelf'
  | 'followSameMagicTimesOwnSideWeaponActiveSingle'
  | 'followTriggerPhysicTimesOwnWeaponActiveSingle'
  | 'followSamePhysicTimesOwnWeaponActiveSingle'
  | 'followSamePhysicTimesOwnHakenHasouKakusei'
  | 'followSamePhysicTimesOwnPureHasouHissatsu'
  | 'followSamePhysicTimesSkillSelf'
  | 'coreSpecialPlusSkillSelfAtMana40'
  | 'normalHitsPlusOwnSideAnywhere'
  | 'normalHitsPlusOwnAnywhere'
  | 'normalHitsPlusOwnAttack'
  | 'normalHitsPlusOwnHasouAttack'
  | 'normalHitsPlusSkillSelf'
  | 'normalHitsSkillSelf'
  | 'skillMultiplierSkillSelfPerHeroLv'
  | 'bcPlusSkillSelfPerHissatsuLv'
  | 'coreBaseOwnAnywherePerHissatsuLv'
  | 'corePlusOwnHasouPerHissatsuLv'
  | 'coreSpecialPlusSkillSelfPerHissatsuLv'
  | 'skillMultiplierSkillSelfPerHissatsuLv'
  | 'bcPlusSkillSelfPerMana'
  | 'burstStrikeName'
  | 'skillMultiplierSkillSelf'
  | 'specialHitsPlusArtifactSetSkillSelf';

export type SkillDesperadoEffectData = Pick<SkillDesperado, SkillDesperadoEffectKey>;
export type SkillDesperadoEffectOverrides = Partial<SkillDesperadoEffectData>;

export type DesperadoSkillEffectRecordKeyParts = {
  item_name: string;
  item_rarity: string;
  skill_name: string;
  skill_trigger: string;
  skill_element: string;
};

const DESPERADO_SKILL_EFFECT_RECORD_KEY_SEPARATOR = "|";

export const toDesperadoSkillEffectRecordKey = (
  parts: DesperadoSkillEffectRecordKeyParts,
) => {
  return [
    parts.item_name,
    parts.item_rarity,
    parts.skill_name,
    parts.skill_trigger,
    parts.skill_element,
  ].join(DESPERADO_SKILL_EFFECT_RECORD_KEY_SEPARATOR);
};

export const DEFAULT_DESPERADO_SKILL_EFFECT_DATA: SkillDesperadoEffectData = {
  "bcBaseOwnSideAnywhere": 0,
  "bcBaseSkillSelfPrior": 0,
  "bcCapSkillSelf": 0,
  "bcHitsOwnAnywhere": 1,
  "bcHitsSkillSelfPrior": 0,
  "bcPlusOwnSideHasou": 0,
  "bcPlusOwnAnywhere": 0,
  "bcPlusOwnHasou": 0,
  "bcPlusOwnPureHasouHissatsu": 0,
  "bcPlusSkillSelf": 0,
  "bcPlusArtifactSetSkillSelf": 0,
  "coreBaseOwnAnywhere": 0,
  "corePlusOwnHasou": 0,
  "coreSpecialBaseOwnAnywhere": 0,
  "coreSpecialBaseOwnHakenHasouKakusei": 0,
  "coreSpecialBaseOwnPureHasouHissatsu": 0,
  "coreSpecialBaseSkillSelf": 0,
  "coreSpecialBaseArtifactSetSkillSelf": 0,
  "coreSpecialPlusOwnAnywhere": 0,
  "coreSpecialPlusSkillSelf": 0,
  "damageCapSkillSelf": 9999999999,
  "followSameMagicOwnSideWeaponActiveSingle": 0,
  "followTriggerPhysicOwnWeaponActiveSingle": 0,
  "followSamePhysicOwnWeaponActiveSingle": 0,
  "followSamePhysicOwnHakenHasouKakusei": 0,
  "followSameMagicHitsOwnSideWeaponActiveSingle": 0,
  "followTriggerPhysicHitsOwnWeaponActiveSingle": 0,
  "followSamePhysicHitsOwnWeaponActiveSingle": 0,
  "followSamePhysicHitsOwnHakenHasouKakusei": 0,
  "followSamePhysicHitsOwnPureHasouHissatsu": 0,
  "followSamePhysicHitsSkillSelf": 0,
  "followSamePhysicOwnPureHasouHissatsu": 0,
  "followSamePhysicSkillSelf": 0,
  "followSameMagicTimesOwnSideWeaponActiveSingle": 0,
  "followTriggerPhysicTimesOwnWeaponActiveSingle": 0,
  "followSamePhysicTimesOwnWeaponActiveSingle": 0,
  "followSamePhysicTimesOwnHakenHasouKakusei": 0,
  "followSamePhysicTimesOwnPureHasouHissatsu": 0,
  "followSamePhysicTimesSkillSelf": 0,
  "coreSpecialPlusSkillSelfAtMana40": 0,
  "normalHitsPlusOwnSideAnywhere": 0,
  "normalHitsPlusOwnAnywhere": 0,
  "normalHitsPlusOwnAttack": 0,
  "normalHitsPlusOwnHasouAttack": 0,
  "normalHitsPlusSkillSelf": 0,
  "normalHitsSkillSelf": 1,
  "skillMultiplierSkillSelfPerHeroLv": 0,
  "bcPlusSkillSelfPerHissatsuLv": 0,
  "coreBaseOwnAnywherePerHissatsuLv": 0,
  "corePlusOwnHasouPerHissatsuLv": 0,
  "coreSpecialPlusSkillSelfPerHissatsuLv": 0,
  "skillMultiplierSkillSelfPerHissatsuLv": 0,
  "bcPlusSkillSelfPerMana": 0,
  "burstStrikeName": "(なし)",
  "skillMultiplierSkillSelf": 0,
  "specialHitsPlusArtifactSetSkillSelf": 0
};

// DBから以下の複合キーを取得しスキル情報のレコードを一意に識別し、各効果パラメータをここでそれぞれ定義する。
// 複合キーの構成は次の通り。:
// item_name|item_rarity|skill_name|skill_trigger|skill_element
export const DESPERADO_SKILL_EFFECTS_BY_COMPOSITE_KEY: Record<string, SkillDesperadoEffectOverrides> =
{
  "ゲイルテイル|アーティファクト|スキル1(Act1Lv1)|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0,
    "specialHitsPlusArtifactSetSkillSelf": 1
  },
  "オリジンの豪影斧|究極|必殺|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 2250000000,
    "corePlusOwnHasou": 375000,
    "normalHitsPlusSkillSelf": 5,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 750000000,
    "corePlusOwnHasouPerHissatsuLv": 125000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 27.5
  },
  "詠忍転身-上-|究極|EX|own|闇": {
    "damageCapSkillSelf": 0,
    "followTriggerPhysicOwnWeaponActiveSingle": 7000000000,
    "followTriggerPhysicHitsOwnWeaponActiveSingle": 1,
    "followTriggerPhysicTimesOwnWeaponActiveSingle": 1,
    "normalHitsSkillSelf": 0
  },
  "トータスシェル|アーティファクト|スキル1(Act2Lv1)|free|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "覇剣オーシャン|究極|覚醒|own|水": {
    "bcCapSkillSelf": 60000000000,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "覇剣オーシャン|究極|覚醒|own|闇": {
    "bcCapSkillSelf": 60000000000,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "ヒナ(人形)|エンブレム|一致属性条件付きリミット固定値プラス[万]|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "覇剣ドレーク|究極|必殺|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "normalHitsSkillSelf": 5
  },
  "ロイヤルタリスマン|アーティファクト|スキル2(Act1)|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "イフリートアミュレット-覇剣-|アーティファクト|スキル2(Act1Lv5)|own|無": {
    "bcPlusOwnHasou": 500000000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "三聖天メイデ|エンブレム|刻印|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "覇剣カリオストロ|究極|覚醒|own|土": {
    "bcCapSkillSelf": 999999999999,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "サヴァイブ学園の豪明斧-V-|究極|必殺|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 6500000000,
    "coreSpecialBaseOwnAnywhere": 450000,
    "coreSpecialPlusSkillSelf": 450000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 500000000,
    "coreSpecialPlusSkillSelfPerHissatsuLv": 150000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 26.25
  },
  "覇剣オーシャン|究極|EX (スキルリンク-オーシャン-)|own|無": {
    "bcPlusOwnPureHasouHissatsu": 20000000000,
    "coreSpecialBaseOwnPureHasouHissatsu": 8500000,
    "damageCapSkillSelf": 0,
    "followSamePhysicHitsOwnPureHasouHissatsu": 5,
    "followSamePhysicOwnPureHasouHissatsu": 9999999999,
    "followSamePhysicTimesOwnPureHasouHissatsu": 1,
    "normalHitsSkillSelf": 0
  },
  "神剣雪華セイレーン|究極|覚醒(シフト前)|free|水": {
    "damageCapSkillSelf": 0,
    "followSameMagicOwnSideWeaponActiveSingle": 14999999999,
    "followSameMagicHitsOwnSideWeaponActiveSingle": 1,
    "followSameMagicTimesOwnSideWeaponActiveSingle": 1,
    "normalHitsSkillSelf": 0
  },
  "カースレプリカ|アーティファクト|スキル1(Act1Lv5)|own|無": {
    "coreSpecialPlusOwnAnywhere": 1000000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "キノポチャーム|アーティファクト|スキル1(Act1Lv2)|own|無": {
    "coreSpecialBaseArtifactSetSkillSelf": 625000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "詠忍転身-頭-|究極|EX|own|闇": {
    "bcPlusOwnAnywhere": 1500000000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "Xmasフェリスの豪影斧|究極|必殺|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 4125000000,
    "coreSpecialPlusSkillSelfAtMana40": 650000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 375000000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "bcPlusSkillSelfPerMana": 30000000,
    "skillMultiplierSkillSelf": 26.25
  },
  "詠忍転身-足-|究極|EX|own|闇": {
    "bcPlusOwnAnywhere": 1500000000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "創造主モアトマ|エンブレム|刻印|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "詠忍転身-下-|究極|必殺|own|闇": {
    "coreBaseOwnAnywhere": 79999,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0,
    "coreBaseOwnAnywherePerHissatsuLv": 10000
  },
  "Xmasフェリスの豪明斧|英雄|必殺|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 4125000000,
    "coreSpecialPlusSkillSelfAtMana40": 650000,
    "normalHitsPlusSkillSelf": 12,
    "normalHitsSkillSelf": 3,
    "skillMultiplierSkillSelfPerHeroLv": 0.75,
    "bcPlusSkillSelfPerHissatsuLv": 375000000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "bcPlusSkillSelfPerMana": 30000000,
    "skillMultiplierSkillSelf": 28.5
  },
  "覇剣オーシャン|究極|必殺|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusOwnAnywhere": 1500000000,
    "coreSpecialBaseOwnAnywhere": 7000000,
    "normalHitsPlusOwnHasouAttack": 15,
    "normalHitsSkillSelf": 5
  },
  "覇剣オーシャン|究極|覚醒|own|風": {
    "bcCapSkillSelf": 60000000000,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "神剣雪華セイレーン|究極|必殺(発動者ジョブ: ナイトヴァルキリー)|free|水": {
    "damageCapSkillSelf": 0,
    "normalHitsPlusOwnSideAnywhere": 10,
    "normalHitsSkillSelf": 0
  },
  "サヴァイブ学園の豪崩斧-V-|究極|必殺|own|土": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 6500000000,
    "coreSpecialBaseOwnAnywhere": 450000,
    "coreSpecialPlusSkillSelf": 450000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 500000000,
    "coreSpecialPlusSkillSelfPerHissatsuLv": 150000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 26.25
  },
  "覇剣カリオストロ|究極|必殺|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "coreSpecialBaseOwnHakenHasouKakusei": 9000000,
    "normalHitsSkillSelf": 5
  },
  "固有ランダムスキル|究極|段数+1(発生率20%)|free|無": {
    "damageCapSkillSelf": 0,
    "normalHitsPlusOwnHasouAttack": 1,
    "normalHitsSkillSelf": 0
  },
  "サヴァイブ学園の豪氷斧-V-|究極|必殺|own|水": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 6500000000,
    "coreSpecialBaseOwnAnywhere": 450000,
    "coreSpecialPlusSkillSelf": 450000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 500000000,
    "coreSpecialPlusSkillSelfPerHissatsuLv": 150000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 26.25
  },
  "神剣雪華セイレーン|究極|必殺(発動者ジョブ: ヴァルキリー)|free|水": {
    "damageCapSkillSelf": 0,
    "normalHitsPlusOwnSideAnywhere": 4,
    "normalHitsSkillSelf": 0
  },
  "覇剣オーシャン|究極|覚醒|own|土": {
    "bcCapSkillSelf": 60000000000,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "覇剣エリュシオン|究極|必殺(Add必殺追加発動数: 0)|own|光": {
    "damageCapSkillSelf": 0,
    "followSamePhysicOwnWeaponActiveSingle": 4999999999,
    "followSamePhysicHitsOwnWeaponActiveSingle": 1,
    "followSamePhysicTimesOwnWeaponActiveSingle": 1,
    "normalHitsSkillSelf": 0
  },
  "Xmasフェリスの豪明斧|究極|必殺|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 4125000000,
    "coreSpecialPlusSkillSelfAtMana40": 650000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 375000000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "bcPlusSkillSelfPerMana": 30000000,
    "skillMultiplierSkillSelf": 26.25
  },
  "バルドル|バーストストライク|バルドル|own|無": {
    "bcBaseOwnSideAnywhere": 8000000000,
    "bcHitsOwnAnywhere": 3,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "覇剣オーシャン|究極|EX (スキルリンク)|own|無": {
    "bcPlusOwnPureHasouHissatsu": 10000000000,
    "coreSpecialBaseOwnPureHasouHissatsu": 7500000,
    "damageCapSkillSelf": 0,
    "followSamePhysicHitsOwnPureHasouHissatsu": 4,
    "followSamePhysicOwnPureHasouHissatsu": 9999999999,
    "followSamePhysicTimesOwnPureHasouHissatsu": 1,
    "normalHitsSkillSelf": 0
  },
  "オリジンの豪明斧|究極|必殺|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 2250000000,
    "corePlusOwnHasou": 375000,
    "normalHitsPlusSkillSelf": 5,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 750000000,
    "corePlusOwnHasouPerHissatsuLv": 125000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 25.25
  },
  "パペットマスク|アーティファクト|スキル1(Act1Lv1)|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "詠忍転身-下-|究極|EX|own|闇": {
    "damageCapSkillSelf": 0,
    "followTriggerPhysicOwnWeaponActiveSingle": 7000000000,
    "followTriggerPhysicHitsOwnWeaponActiveSingle": 1,
    "followTriggerPhysicTimesOwnWeaponActiveSingle": 1,
    "normalHitsSkillSelf": 0
  },
  "覇剣カリオストロ|究極|覚醒|own|火": {
    "bcCapSkillSelf": 999999999999,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "バンディットロギ|エンブレム|一致属性条件付きリミット固定値プラス[万]|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "ルーデウス|究極|必殺(任意属性マナ強化時+ジェネシス宝刀効果)|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusOwnAnywhere": 22000000000,
    "coreSpecialBaseOwnAnywhere": 9000000,
    "coreSpecialPlusOwnAnywhere": 2200000,
    "followSamePhysicOwnWeaponActiveSingle": 9999999999,
    "followSamePhysicOwnHakenHasouKakusei": 9999999999,
    "followSamePhysicHitsOwnWeaponActiveSingle": 3,
    "followSamePhysicHitsOwnHakenHasouKakusei": 4,
    "followSamePhysicTimesOwnWeaponActiveSingle": 1,
    "followSamePhysicTimesOwnHakenHasouKakusei": 1,
    "normalHitsPlusOwnAnywhere": 20,
    "normalHitsPlusOwnAttack": 40,
    "normalHitsSkillSelf": 5,
    "burstStrikeName": "バルドル"
  },
  "覇剣カリオストロ|究極|覚醒|own|風": {
    "bcCapSkillSelf": 999999999999,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "クリスタルマンドラ|エンブレム|一致属性条件付きリミット固定値プラス[万]|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "ゲイルテイル|アーティファクト|スキル1(Act1Lv2)|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0,
    "specialHitsPlusArtifactSetSkillSelf": 2
  },
  "ロキシー|エンブレム|一致属性条件付きリミット固定値プラス[万]|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "Xmasフェリスの豪影斧|英雄|必殺|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 4125000000,
    "coreSpecialPlusSkillSelfAtMana40": 650000,
    "normalHitsPlusSkillSelf": 12,
    "normalHitsSkillSelf": 3,
    "skillMultiplierSkillSelfPerHeroLv": 0.75,
    "bcPlusSkillSelfPerHissatsuLv": 375000000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "bcPlusSkillSelfPerMana": 30000000,
    "skillMultiplierSkillSelf": 28.5
  },
  "サヴァイブ学園の豪炎斧-V-|究極|必殺|own|火": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 6500000000,
    "coreSpecialBaseOwnAnywhere": 450000,
    "coreSpecialPlusSkillSelf": 450000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 500000000,
    "coreSpecialPlusSkillSelfPerHissatsuLv": 150000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 26.25
  },
  "詠忍転身-腕-|究極|EX|own|闇": {
    "bcPlusOwnAnywhere": 1500000000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "覇剣オーシャン|究極|覚醒|own|光": {
    "bcCapSkillSelf": 60000000000,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "覇剣カリオストロ|究極|覚醒|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "覇剣パナケイア|究極|必殺|own|光": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "神剣雪華セイレーン|究極|覚醒(シフト後)|free|水": {
    "damageCapSkillSelf": 0,
    "followSameMagicOwnSideWeaponActiveSingle": 19999999999,
    "followSameMagicHitsOwnSideWeaponActiveSingle": 1,
    "followSameMagicTimesOwnSideWeaponActiveSingle": 1,
    "normalHitsSkillSelf": 0
  },
  "覇剣カリオストロ|究極|覚醒|own|水": {
    "bcCapSkillSelf": 999999999999,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "魔王ルシファー|エンブレム|刻印|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "覇剣カリオストロ|究極|覚醒|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "覇剣ワンダフルニャイト|究極|必殺|own|闇": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "オリジンの豪影斧|英雄|必殺|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 2250000000,
    "corePlusOwnHasou": 375000,
    "normalHitsPlusSkillSelf": 9,
    "normalHitsSkillSelf": 3,
    "skillMultiplierSkillSelfPerHeroLv": 0.75,
    "bcPlusSkillSelfPerHissatsuLv": 750000000,
    "corePlusOwnHasouPerHissatsuLv": 125000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 27.5
  },
  "キノポチャーム|アーティファクト|スキル1(Act1Lv1)|own|無": {
    "coreSpecialBaseArtifactSetSkillSelf": 500000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "サヴァイブ学園の豪嵐斧-V-|究極|必殺|own|風": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 6500000000,
    "coreSpecialBaseOwnAnywhere": 450000,
    "coreSpecialPlusSkillSelf": 450000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 500000000,
    "coreSpecialPlusSkillSelfPerHissatsuLv": 150000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 26.25
  },
  "固有開幕スキル|究極|ブラッククリティカルリミット+|free|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "オリジンの豪明斧|英雄|必殺|own|光": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 2250000000,
    "corePlusOwnHasou": 375000,
    "normalHitsPlusSkillSelf": 9,
    "normalHitsSkillSelf": 3,
    "skillMultiplierSkillSelfPerHeroLv": 0.75,
    "bcPlusSkillSelfPerHissatsuLv": 750000000,
    "corePlusOwnHasouPerHissatsuLv": 125000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 27.5
  },
  "プロトフォートレス|アーティファクト|スキル1(Act2Lv1)|own|無": {
    "bcPlusOwnHasou": 2200000000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "ロギマキシマ|アーティファクト|スキル1(Act2Lv1)|own|無": {
    "bcPlusArtifactSetSkillSelf": 2200000000,
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "デスペラード|エンブレム|覇双ブラッククリティカルリミットプラス[億]|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "御坂美琴|エンブレム|一致属性条件付きリミット固定値プラス[万]|own|無": {
    "damageCapSkillSelf": 0,
    "normalHitsSkillSelf": 0
  },
  "覇剣オーシャン|究極|覚醒|own|火": {
    "bcCapSkillSelf": 60000000000,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "normalHitsSkillSelf": 63
  },
  "ルーデウス|究極|覚醒|own|光": {
    "bcCapSkillSelf": 60000000000,
    "bcHitsSkillSelfPrior": 3,
    "bcPlusSkillSelf": 10000000000,
    "followSamePhysicHitsSkillSelf": 3,
    "followSamePhysicSkillSelf": 9999999999,
    "followSamePhysicTimesSkillSelf": 1,
    "normalHitsSkillSelf": 63
  },
  "サヴァイブ学園の豪影斧-V-|究極|必殺|own|闇": {
    "bcCapSkillSelf": 999999999999,
    "bcPlusSkillSelf": 6500000000,
    "coreSpecialBaseOwnAnywhere": 450000,
    "coreSpecialPlusSkillSelf": 450000,
    "normalHitsPlusSkillSelf": 8,
    "normalHitsSkillSelf": 3,
    "bcPlusSkillSelfPerHissatsuLv": 500000000,
    "coreSpecialPlusSkillSelfPerHissatsuLv": 150000,
    "skillMultiplierSkillSelfPerHissatsuLv": 0.75,
    "skillMultiplierSkillSelf": 26.25
  }
};
