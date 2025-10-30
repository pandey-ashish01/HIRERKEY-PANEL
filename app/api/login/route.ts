import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const plainPassword = String(password);
    const storedPassword = String(user.password || "");

    let isMatch = false;

    // 🧠 Auto-detect hashed or plain password
    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
      // ✅ Stored password is hashed
      isMatch = await bcrypt.compare(plainPassword, storedPassword);
    } else {
      // ⚠️ Stored password is plain text
      isMatch = plainPassword === storedPassword;
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
