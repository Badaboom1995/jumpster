import { NextResponse } from "next/server";

export async function HEAD() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET() {
  return NextResponse.json({}, { status: 200 });
}
