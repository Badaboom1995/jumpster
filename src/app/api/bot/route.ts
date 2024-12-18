import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // const { chat_id, text } = await request.json();
    const telegramApiUrl = `https://api.telegram.org/bot7726261005:AAE-eY0TDvYtHF335htj9n_hq44x6igZ-ms/sendMessage`;

    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: 208165379,
        text: "yup",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message to Telegram");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
