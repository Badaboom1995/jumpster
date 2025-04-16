import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA",
);

// with formatting
const welcomeMessage = `
<b>Добро пожаловать в Jumpster! 🎉🎉🎉</b>

Jumpster — это совершенно новый способ заниматься фитнесом. Мы преобразуем ваши тренировки в увлекательное игровое приключение, используя передовые ИИ технологии, которые в режиме реального времени считают ваши прыжки.

💪 <b>Зарабатывайте монеты Jump:</b> Каждый ваш прыжок приносит монеты, которые можно использовать д��я открытия улучшений, наград и многого другого.
🔄 <b>Пройдите путь от новичка до чемпиона:</b> Создавайте и улучшайте своего виртуального атлета, подписывайте контракты и прокачивайте медиа. 
🌎 <b>Общайтесь и соревнуйтесь:</b> Создавайте сеть друзей и участвуйте в совместных челленджах. Делитесь достижениями и поддерживайте друг друга.

С Jumpster фитнес становится чем-то большим. Начните свой путь уже сегодня и узнайте, насколько далеко вы сможете зайти! ⚡

Продолжайте прыгать с Jumpster! 🌟`;

export async function POST(request: Request) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot7726261005:AAE-eY0TDvYtHF335htj9n_hq44x6igZ-ms/sendMessage`;
    const requestData = await request.json();

    if (requestData.message?.text?.startsWith("/start")) {
      // Send welcome message with inline keyboard
      await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parse_mode: "HTML",
          chat_id: requestData.message.from.id,
          text: welcomeMessage,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🎮 Открыть приложение",
                  web_app: { url: "https://jumpster.vercel.app/" },
                },
              ],
            ],
          },
        }),
      });

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

      if (user && referrerId) {
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
