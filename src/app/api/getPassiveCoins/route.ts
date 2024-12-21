import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { getRankData } from "@/utils";

const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA",
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("user_id");

  // fetch user
  const { data, error } = await supabase
    .from("users")
    .select("experience, user_cards(earn_cards(*))")
    .eq("id", userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const user = data[0];
  const rankData = getRankData(user.experience);

  // Calculate total passive income from earn cards
  const cardsPassiveIncome = user.user_cards.reduce((total, userCard) => {
    // @ts-ignore
    return total + (userCard.earn_cards?.passive_income || 0);
  }, 0);

  // Add rank passive income to cards passive income
  const totalPassiveIncome =
    // @ts-ignore
    cardsPassiveIncome + (rankData.passive_coins || 0);

  return Response.json({
    data: data,
    rankData: rankData,
    totalPassiveIncome: totalPassiveIncome,
  });
}
