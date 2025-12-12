import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { mobile, password } = await req.json();

    // Validation
    if (!mobile || !password) {
      return NextResponse.json(
        { success: false, message: "Mobile and password are required!" },
        { status: 400 }
      );
    }

    // 🔥 MUST INCLUDE PASSWORD
    const user = await User.findOne({ mobile: mobile.trim() }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile or password!" },
        { status: 401 }
      );
    }

    // Password check
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile or password!" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        mobile: user.mobile,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // User data to return
    const userResponse = {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      policeStation: user.policeStation,
      walletName: user.walletName,
      walletAddress: user.walletAddress,
      paymentScreenshot: user.paymentScreenshot,
      secretKey: user.secretKey,
      referralToken: user.referralToken,
      parentId: user.parentId,
      children: user.children,
      payments: user.payments,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: "Login successful!",
      data: {
        user: userResponse,
        token,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
