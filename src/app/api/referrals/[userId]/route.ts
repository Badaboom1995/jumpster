import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    // const referrals = await db.referral.findMany({
    //   where: {
    //     referrerId: params.userId,
    //   },
    //   include: {
    //     user: {
    //       select: {
    //         username: true,
    //         hourlyIncome: true,
    //         balance: true,
    //       },
    //     },
    //   },
    // });

    // return NextResponse.json(referrals);
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 },
    );
  }
}
