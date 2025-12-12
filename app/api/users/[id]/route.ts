import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Helper to verify token
async function verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// GET user by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    // Get token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch user
    const user = await User.findById(id)
      .select("-password")
      .populate({
        path: "children",
        select: "name mobile email policeStation walletName walletAddress referralToken"
      })
      .populate({
        path: "parentId",
        select: "name mobile"
      });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching user" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    // Get token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is updating themselves
    if (decoded.userId !== id) {
      return NextResponse.json(
        { success: false, message: "You can only update your own profile" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, policeStation, walletName, walletAddress } = body;

    // Validate inputs
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required!" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email: email || "",
        policeStation: policeStation || "",
        walletName: walletName || "",
        walletAddress: walletAddress || "",
        updatedAt: new Date()
      },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Error updating profile" },
      { status: 500 }
    );
  }
}

// DELETE user account
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    // Get token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is deleting themselves
    if (decoded.userId !== id) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own account" },
        { status: 403 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Remove from parent's children
    if (user.parentId) {
      await User.findByIdAndUpdate(user.parentId, {
        $pull: { children: user._id },
      });
    }

    // Delete user
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting account" },
      { status: 500 }
    );
  }
}