import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type PurchaseBoosterBody = {
  userId: string;
  boosterId: string;
};

export async function POST(request: Request) {
  try {
    const body: PurchaseBoosterBody = await request.json();
    const { userId, boosterId } = body;
    console.log(userId, boosterId);
    // Get booster data
    const { data: booster, error: boosterError } = await supabase
      .from("boosters")
      .select("*")
      .eq("id", boosterId)
      .single();

    if (boosterError || !booster) {
      return NextResponse.json({ error: "Booster not found" }, { status: 404 });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const boosterPrice = 200; // TODO: Add price to booster table
    if (userData.coins.value < boosterPrice) {
      return NextResponse.json(
        { error: "Insufficient coins" },
        { status: 400 },
      );
    }

    // Calculate expiration time for timed boosters
    let expiresAt = null;
    if (booster.duration_type === "timed") {
      expiresAt = new Date(
        Date.now() + booster.duration_value * 1000,
      ).toISOString();
    }

    // add booster to user
    const { data: userBoosters, error: userBoostersError } = await supabase
      .from("user_boosters")
      .insert({
        user_id: userId,
        booster_id: boosterId,
        expires_at: expiresAt,
      });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error purchasing booster:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
