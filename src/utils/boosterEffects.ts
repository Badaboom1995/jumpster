import { UserBooster } from '@/types/boosters';

export const calculateBoosterEffects = (boosters: UserBooster[]) => {
  const effects = {
    coinsMultiplier: 1,
    energyRecoveryRate: 1,
    experienceMultiplier: 1,
    jumpPower: 1,
    energyCostReduction: 0,
  };

  if (!boosters) return effects;

  const now = new Date();

  boosters.forEach((userBooster) => {
    const { booster } = userBooster;
    
    // Skip expired boosters
    if (userBooster.expires_at && new Date(userBooster.expires_at) < now) {
      return;
    }

    switch (booster.effect_type) {
      case 'coins_multiplier':
        effects.coinsMultiplier *= booster.effect_value;
        break;
      case 'energy_recovery':
        effects.energyRecoveryRate *= booster.effect_value;
        break;
      case 'experience_multiplier':
        effects.experienceMultiplier *= booster.effect_value;
        break;
      case 'jump_power':
        effects.jumpPower *= booster.effect_value;
        break;
      case 'energy_cost_reduction':
        effects.energyCostReduction += booster.effect_value;
        break;
    }
  });

  return effects;
}; 