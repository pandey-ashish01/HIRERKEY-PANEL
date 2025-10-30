import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { userId, newPassword } = await req.json();

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return NextResponse.json({ message: "Password updated successfully!" });
}
