export type BoosterRarity = "common" | "rare" | "epic" | "legendary";
export type BoosterDurationType = "one_session" | "timed" | "permanent";
export type BoosterEffectType =
  | "coins_multiplier"
  | "energy_recovery"
  | "experience_multiplier"
  | "jump_power"
  | "energy_cost_reduction";

export interface Booster {
  id: string;
  name: string;
  description: string;
  rarity: BoosterRarity;
  duration_type: BoosterDurationType;
  duration_value: number | null;
  effect_type: BoosterEffectType;
  effect_value: number;
  icon_url: string;
  price: number;
}

export interface UserBooster {
  id: string;
  user_id: string;
  booster_id: string;
  activated_at: string;
  expires_at: string | null;
  is_active: boolean;
  booster: Booster;
}
