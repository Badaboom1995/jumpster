import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRankData } from "@/utils";

// Initialize Supabase client with server-side credentials
const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA",
);

interface BoosterRequest {
  boosterId: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    const body: BoosterRequest = await request.json();
    const { boosterId, userId } = body;
    // Get booster details
    const { data: booster, error: boosterError } = await supabase
      .from("boosters")
      .select("*")
      .eq("id", boosterId)
      .single();

    if (boosterError) {
      console.error("Booster error:", boosterError);
      return NextResponse.json({ error: "Booster not found" }, { status: 404 });
    }

    // Get user data with parameters
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("coins, experience")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("User error:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough coins
    if (userData.coins < booster.price) {
      return NextResponse.json(
        { error: "Insufficient coins" },
        { status: 400 },
      );
    }

    // Start a transaction
    const { error: coinUpdateError } = await supabase
      .from("users")
      .update({ coins: userData.coins - booster.price })
      .eq("id", userId);

    if (coinUpdateError) {
      console.error("Coin update error:", coinUpdateError);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 },
      );
    }

    // Handle energy recovery booster
    if (booster.effect_type === "energy_recovery") {
      const rankData = getRankData(userData.experience);
      console.log("exp", userData.experience);
      const maxEnergy = rankData.energyCapacity;
      console.log("maxEnergy", maxEnergy);
      // Update user's energy to max capacity
      const { error: energyUpdateError } = await supabase
        .from("user_parameters")
        .update({
          value: maxEnergy,
        })
        .eq("user_id", userId)
        .eq("name", "energy");

      if (energyUpdateError) {
        console.error("Energy update error:", energyUpdateError);
        // Rollback coin deduction if energy update fails
        await supabase
          .from("users")
          .update({ coins: userData.coins })
          .eq("id", userId);

        return NextResponse.json(
          { error: "Failed to update energy" },
          { status: 500 },
        );
      }
    }

    // Record booster usage
    const { error: usageError } = await supabase.from("user_boosters").insert({
      user_id: userId,
      booster_id: boosterId,
      activated_at: new Date().toISOString(),
    });

    if (usageError) {
      console.error("Usage error:", usageError);
      return NextResponse.json(
        { error: "Failed to record booster usage" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booster purchased and applied successfully",
      remainingCoins: userData.coins - booster.price,
    });
  } catch (error) {
    console.error("Error processing booster:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
