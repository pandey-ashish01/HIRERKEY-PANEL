// app/api/users/referrer/[mobile]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ mobile: string }> }
) {
  try {
    await connectDB();
    const { mobile } = await context.params;

    const user = (await User.findOne({ mobile })
      .select("name mobile")
      .lean()) as { name: string; mobile: string } | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Referrer not found!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}