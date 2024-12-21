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
      const refferrerNumberId = referrerId ? parseInt(referrerId) : null;
      const userTelegramId = requestData.message.from.id;

      // check if user exists
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", userTelegramId)
        .single();
      // get referrer

      const { data: referrer } = await supabase
        .from("users")
        .select("*")
        .eq("id", refferrerNumberId)
        .single();

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
        console.log("user already exists");
        return NextResponse.json(
          { error: "Аккаунт уже зарегистрирован" },
          { status: 400 },
        );
      } else {
        // create user
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({
            telegram_id: userTelegramId,
            username: requestData.message.from.username,
          })
          .select()
          .single();

        if (referrerId) {
          // create referral
          await supabase.from("referrals").insert({
            referrer_id: refferrerNumberId,
            referred_user_id: newUser.id,
          });
          // send message to referrer
          await fetch(telegramApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: referrer.telegram_id,
              text: `⭐️ Пользователь ${newUser.username} присоединился к Jumpster по вашей реферальной ссылке`,
            }),
          });
          // send message to referred user
          await fetch(telegramApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: userTelegramId,
              text: "Реферальный код успешно применен",
            }),
          });
        }
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
