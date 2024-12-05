import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getRankData } from "@/utils/getRewards";

// Initialize Supabase client
const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA",
);

interface ApplyBoosterRequest {
  boosterId: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    const body: ApplyBoosterRequest = await request.json();
    const { boosterId, userId } = body;
    console.log("boosterId", boosterId);
    // Get booster details
    const { data: booster, error: boosterError } = await supabase
      .from("boosters")
      .select("*")
      .eq("id", boosterId)
      .single();

    if (boosterError) {
      return NextResponse.json({ error: "Booster not found" }, { status: 404 });
    }

    // Handle energy recovery booster
    if (booster.effect_type === "energy_recovery") {
      // Get user's experience to determine max energy
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("experience")
        .eq("id", userId)
        .single();

      if (userError) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Calculate max energy based on user's rank
      const rankData = getRankData(userData.experience);
      console.log("rankData", rankData);
      const maxEnergy = rankData.energyCapacity;

      // Update user's energy to max capacity
      const { error: updateError } = await supabase
        .from("user_parameters")
        .update({
          "energy.value": maxEnergy,
        })
        .eq("user_id", userId);

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update energy" },
          { status: 500 },
        );
      }

      // Insert record of booster usage
      const { error: insertError } = await supabase
        .from("user_boosters")
        .insert({
          user_id: userId,
          booster_id: boosterId,
          activated_at: new Date().toISOString(),
        });

      if (insertError) {
        return NextResponse.json(
          { error: "Failed to record booster usage" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Energy restored to maximum",
          newEnergyValue: maxEnergy,
        },
        { status: 200 },
      );
    }

    // Handle other booster types here...
    return NextResponse.json(
      { error: "Unsupported booster type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error applying booster:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
