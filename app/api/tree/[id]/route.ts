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

// Interface for tree node
interface UserNode {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  policeStation: string;
  walletName: string;
  walletAddress: string;
  paymentScreenshot?: string;
  referralToken: string;
  parentId: string | null;
  children: UserNode[];
  level: number;
  paymentSummary: {
    totalAmount: number;
    paymentCount: number;
    lastPayment?: {
      amount: number;
      date: string;
      screenshot: string;
    };
  };
}

// Recursive function to build tree
async function getUserTree(
  userId: string, 
  currentDepth: number = 0,
  maxDepth: number = 5
): Promise<UserNode | null> {
  if (currentDepth >= maxDepth) return null;

  const user: any = await User.findById(userId)
    .select("name mobile email policeStation walletName walletAddress paymentScreenshot referralToken parentId children payments")
    .lean();

  if (!user) return null;

  // Calculate payment summary
  const payments = user.payments || [];
  const paymentSummary: UserNode["paymentSummary"] = {
    totalAmount: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    paymentCount: payments.length,
  };

  // Add last payment if exists
  if (payments.length > 0) {
    const sortedPayments = [...payments].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastPayment = sortedPayments[0];
    paymentSummary.lastPayment = {
      amount: lastPayment.amount,
      date: lastPayment.createdAt.toISOString(),
      screenshot: lastPayment.screenshot,
    };
  }

  // Get children
  const childIds = user.children || [];
  const children = await Promise.all(
    childIds.map(async (childId: any) => {
      return await getUserTree(childId.toString(), currentDepth + 1, maxDepth);
    })
  );

  return {
    _id: user._id.toString(),
    name: user.name,
    mobile: user.mobile,
    email: user.email || "",
    policeStation: user.policeStation || "",
    walletName: user.walletName || "",
    walletAddress: user.walletAddress || "",
    paymentScreenshot: user.paymentScreenshot,
    referralToken: user.referralToken,
    parentId: user.parentId ? user.parentId.toString() : null,
    children: children.filter((c): c is UserNode => c !== null),
    level: currentDepth,
    paymentSummary
  };
}

// GET tree/hierarchy
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

    // Check if user is viewing their own tree
    if (decoded.userId !== id) {
      return NextResponse.json(
        { success: false, message: "You can only view your own hierarchy" },
        { status: 403 }
      );
    }

    const tree = await getUserTree(id);

    if (!tree) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: tree 
    });
  } catch (error) {
    console.error("Error fetching user tree:", error);
    return NextResponse.json(
      { success: false, message: "Error building user tree" },
      { status: 500 }
    );
  }
}