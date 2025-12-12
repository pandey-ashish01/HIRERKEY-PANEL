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

// DELETE payment
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { id, paymentId } = await context.params;
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

    // Check if user is deleting their own payment
    if (decoded.userId !== id) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own payments" },
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

    // Find payment
    const paymentIndex = user.payments.findIndex(
      (p: any) => p._id.toString() === paymentId
    );

    if (paymentIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Remove payment from array
    user.payments.splice(paymentIndex, 1);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully!"
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting payment" },
      { status: 500 }
    );
  }
}