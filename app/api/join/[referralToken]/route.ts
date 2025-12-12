// app/api/join/[referralToken]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ referralToken: string }> }
) {
  try {
    await connectDB();
    const { referralToken } = await context.params;

    // 1. Find parent user by referralToken (mobile)
    const parentUser = await User.findOne({ mobile: referralToken });
    if (!parentUser) {
      return NextResponse.json(
        { success: false, message: "Invalid referral link!" },
        { status: 400 }
      );
    }

    // 2. Parse JSON body - ONLY REQUIRED FIELDS
    const body = await req.json();
    const { mobile, password, confirmPassword } = body;

    // 3. Validate inputs - ONLY MOBILE AND PASSWORD ARE REQUIRED
    if (!mobile || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Mobile and password are required!" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match!" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters!" },
        { status: 400 }
      );
    }

    if (!mobile.match(/^\d{10}$/)) {
      return NextResponse.json(
        { success: false, message: "Valid 10-digit mobile number required!" },
        { status: 400 }
      );
    }

    // 4. Check if mobile already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Mobile number already registered!" },
        { status: 400 }
      );
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Create user with only required fields
    const newUser = await User.create({
      name: `User_${mobile.substring(7)}`, // Auto-generated name with last 3 digits
      mobile,
      password: hashedPassword,
      email: "", // Empty by default
      policeStation: "", // Empty by default
      walletName: "", // Empty by default
      walletAddress: "", // Empty by default
      parentId: parentUser._id,
      referralToken: mobile,
      payments: [],
      children: []
    });

    // 7. Add to parent's children
    parentUser.children.push(newUser._id);
    await parentUser.save();

    // 8. Return user data
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      mobile: newUser.mobile,
      referralToken: newUser.referralToken,
      parentId: newUser.parentId,
    };

    return NextResponse.json({
      success: true,
      message: "Registration successful! You can now login.",
      data: userResponse,
    });
  } catch (error: any) {
    console.error("Error while registering user:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Mobile number already exists!" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}