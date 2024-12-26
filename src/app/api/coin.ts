// You can create a temporary endpoint to generate a coin image if you don't have one
export async function GET() {
  const canvas = new OffscreenCanvas(64, 64);
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#DAA520";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  const blob = await canvas.convertToBlob();
  return new Response(blob, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
