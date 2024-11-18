import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ranks } from "@/utils/ranks";

type RewardsRequestBody = {
  jumpCount: number;
  jumpTime: number; // session time in seconds
  perfectJumps?: number;
  comboMultiplier?: number;
};

const getRankData = (experience: number) => {
  if (!experience) return ranks[0];
  return ranks.find((rank, index) => {
    const nextRank = ranks[index + 1];
    if (!nextRank) return true;
    return experience < nextRank.experience;
  });
};

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*, user_parameters(*)")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User data not found" },
        { status: 404 },
      );
    }

    const body: RewardsRequestBody = await request.json();
    const { jumpCount, jumpTime, perfectJumps = 0, comboMultiplier = 1 } = body;

    // Validate input
    if (jumpCount < 0 || jumpTime < 0) {
      return NextResponse.json(
        { error: "Invalid input parameters" },
        { status: 400 },
      );
    }

    // Get active boosters
    const { data: activeBoosters } = await supabase
      .from("user_boosters")
      .select("*, booster(*)")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const rank = getRankData(userData.experience);
    if (!rank) {
      return NextResponse.json({ error: "Invalid user rank" }, { status: 400 });
    }

    // Calculate rewards
    let baseCoins = jumpCount * rank.coinsPerJump;
    let baseExperience = jumpCount * 10;
    let baseEnergyCost = 1000;

    // Apply boosters
    let coinsMultiplier = 1;
    let experienceMultiplier = 1;
    let energyCostReduction = 0;

    activeBoosters?.forEach((userBooster) => {
      const { booster } = userBooster;
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

    const perfectJumpBonus = 1 + (perfectJumps / jumpCount) * 0.1;

    // Calculate final values
    const finalCoins = Math.floor(
      baseCoins * coinsMultiplier * perfectJumpBonus * comboMultiplier,
    );
    const finalExperience = Math.floor(
      baseExperience * experienceMultiplier * perfectJumpBonus,
    );
    const finalEnergyCost = Math.max(
      Math.floor(baseEnergyCost * (1 - Math.min(energyCostReduction, 0.9))),
      100,
    );

    // Update user stats in a transaction
    const { error: updateError } = await supabase.rpc("apply_jump_rewards", {
      p_user_id: user.id,
      p_coins: finalCoins,
      p_experience: finalExperience,
      p_energy_cost: finalEnergyCost,
    });

    if (updateError) {
      console.error("Error updating user stats:", updateError);
      return NextResponse.json(
        { error: "Failed to update user stats" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
