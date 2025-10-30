import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { secretKey } = await req.json();

    if (!secretKey || secretKey.length !== 6) {
      return NextResponse.json({ success: false, message: "Invalid key" }, { status: 400 });
    }

    const user = await User.findOne({ secretKey });
    if (!user) {
      return NextResponse.json({ success: false, message: "Secret key not found" }, { status: 404 });
    }

    // Success: return user _id to use later for password update
    return NextResponse.json({ success: true, message: "Secret key verified", userId: user._id });
  } catch (error: any) {
    console.error("Secret verification error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
