import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the incoming webhook data
    const webhookData = await request.json();
    const message = webhookData.message;

    // Extract relevant information
    const username = message.from.username || "no username";
    const text = message.text || "no text";

    // Extract start parameters if it's a /start command
    let startParams = "none";
    if (text.startsWith("/start")) {
      startParams = text.split(" ")[1] || "none";
    }

    // Prepare response message
    const responseText = `user: ${username}\ntext: ${text}\nstart params: ${startParams}`;

    const telegramApiUrl = `https://api.telegram.org/bot7726261005:AAE-eY0TDvYtHF335htj9n_hq44x6igZ-ms/sendMessage`;

    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: message.chat.id, // Send back to the same chat
        text: responseText,
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
