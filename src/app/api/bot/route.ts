import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA",
);

export async function POST(request: Request) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot7726261005:AAE-eY0TDvYtHF335htj9n_hq44x6igZ-ms/sendMessage`;
    const data = await request.json();

    // Check if this is a message with /start command
    if (data.message?.text?.startsWith("/start")) {
      const referrerId = data.message.text.split(" ")[1]; // Get the parameter after /start
      const userId = data.message.from.id;

      if (referrerId) {
        // First, create or update the user
        const { error: userError } = await supabase.from("users").upsert({
          id: userId,
          telegram_id: userId.toString(),
          // Add other user fields as needed
        });

        if (userError) throw userError;

        // Then create the referral record if referrer exists
        if (referrerId !== userId.toString()) {
          // Prevent self-referrals
          const { error: referralError } = await supabase
            .from("referrals")
            .insert({
              referrer_id: referrerId,
              referred_user_id: userId,
              created_at: new Date().toISOString(),
            });

          if (referralError) throw referralError;
        }
      }

      // Send welcome message
      const welcomeMessage = referrerId
        ? "Welcome! You've been referred by another user."
        : "Welcome to the bot!";

      const response = await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: userId,
          text: welcomeMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message to Telegram");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
