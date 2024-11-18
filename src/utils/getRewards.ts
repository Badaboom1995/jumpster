import { UserBooster } from "@/types/boosters";
import { ranks } from "@/utils/ranks";

type RewardsParams = {
  userId: string | number;
  userExperience: number;
  jumpCount: number;
  activeBoosters: UserBooster[];
  perfectJumps?: number;
  comboMultiplier?: number;
};

type Rewards = {
  coins: number;
  experience: number;
  energyCost: number;
};

export const getRewards = ({
  userId,
  userExperience,
  jumpCount,
  activeBoosters,
  perfectJumps = 0,
  comboMultiplier = 1,
}: RewardsParams): Rewards => {
  const rank = getRankData(userExperience);
  if (!rank) throw new Error("Invalid user rank");

  // Base values
  let baseCoins = jumpCount * rank.coinsPerJump;
  let baseExperience = jumpCount * 10; // Base XP per jump
  let baseEnergyCost = 1000; // Base energy cost

  // Initialize multipliers
  let coinsMultiplier = 1;
  let experienceMultiplier = 1;
  let energyCostReduction = 0;

  // Apply active boosters effects
  activeBoosters.forEach((userBooster) => {
    const { booster } = userBooster;

    // Skip expired boosters
    if (
      userBooster.expires_at &&
      new Date(userBooster.expires_at) < new Date()
    ) {
      return;
    }

    switch (booster.effect_type) {
      case "coins_multiplier":
        coinsMultiplier *= booster.effect_value;
        break;
      case "experience_multiplier":
        experienceMultiplier *= booster.effect_value;
        break;
      case "energy_cost_reduction":
        energyCostReduction += booster.effect_value;
        break;
    }
  });

  // Perfect jumps bonus (10% extra coins per perfect jump)
  const perfectJumpBonus = 1 + (perfectJumps / jumpCount) * 0.1;

  // Calculate final rewards
  const finalCoins = Math.floor(
    baseCoins * coinsMultiplier * perfectJumpBonus * comboMultiplier,
  );

  const finalExperience = Math.floor(
    baseExperience * experienceMultiplier * perfectJumpBonus,
  );

  // Energy cost can't be reduced more than 90%
  const finalEnergyCost = Math.max(
    Math.floor(baseEnergyCost * (1 - Math.min(energyCostReduction, 0.9))),
    100, // Minimum energy cost
  );

  return {
    coins: finalCoins,
    experience: finalExperience,
    energyCost: finalEnergyCost,
  };
};

// Example usage:
/*
const rewards = getRewards({
  userId: "user123",
  userExperience: 500,
  jumpCount: 10,
  activeBoosters: [
    {
      booster: {
        effect_type: "coins_multiplier",
        effect_value: 2.0,
      },
      expires_at: "2024-03-20T...",
    }
  ],
  perfectJumps: 3,
  comboMultiplier: 1.5,
});
*/

export const getRankData = (experience: number) => {
  if (!experience) return ranks[0];
  return ranks.find((rank, index) => {
    const nextRank = ranks[index + 1];
    if (!nextRank) return true;
    return experience < nextRank.experience;
  });
};
