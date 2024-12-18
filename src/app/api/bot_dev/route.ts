import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA",
);

export async function POST(request: Request) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot6130195892:AAFB22x7qbo0wICcuSXffFHSyflc4tYm0b4/sendMessage`;
    const requestData = await request.json();

    // Check if this is a message with /start command
    if (requestData.message?.text?.startsWith("/start")) {
      const referrerId = requestData.message.text.split(" ")[1]; // Get the parameter after /start
      const userTelegramId = requestData.message.from.id;
      // check if user exists
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", userTelegramId.toString())
        .single();

      if (userError) {
        // send error message
        await fetch(telegramApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: userTelegramId,
            text: "Ошибка при проверке аккаунта. Попробуйте позже.",
          }),
        });
        return NextResponse.json({ error: userError.message }, { status: 400 });
      }

      if (user) {
        // user can be referred, send error message
        await fetch(telegramApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: userTelegramId,
            text: "Аккаунт уже зарегистрирован. Вы не можете быть приглашены другим пользователем.",
          }),
        });
        return NextResponse.json(
          { error: "Аккаунт уже зарегистрирован" },
          { status: 400 },
        );
      } else {
        // create user
        const { data, error: userError } = await supabase.from("users").insert({
          telegram_id: userTelegramId.toString(),
          username: requestData.message.from.username,
        });
        const newUser: any = data;
        const newUserId = newUser.id;
        // create referral
        const { data: referral, error: referralError } = await supabase
          .from("referrals")
          .insert({
            referrer_id: referrerId,
            referred_user_id: newUserId,
          });
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
          chat_id: userTelegramId,
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
