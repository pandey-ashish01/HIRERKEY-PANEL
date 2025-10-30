import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User, { IUser } from "@/lib/models/User";
import mongoose from "mongoose";

// 🌳 Define a recursive type for the user tree
interface UserNode {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  policeStation: string;
  walletName: string;
  walletAddress: string;
  paymentScreenshot?: string; // ✅ Added this field
  referralToken: string;
  secretKey?: string | null;
  children: UserNode[];
}

// 🧠 Recursive function to build the tree
async function getUserTree(userId: string): Promise<UserNode | null> {
  const user = (await User.findById(userId)
    .select(
      "name mobile email policeStation walletName walletAddress paymentScreenshot referralToken secretKey children" // ✅ Added paymentScreenshot here
    )
    .lean()) as IUser | null;

  if (!user) return null;

  // ✅ Ensure children is always an array of IDs
  const childIds = (user.children as mongoose.Types.ObjectId[]) || [];

  // 🌀 Recursively build children nodes
  const children = await Promise.all(
    childIds.map(async (childId) => {
      return await getUserTree(childId.toString());
    })
  );

  // ✅ Return structured tree node
  return {
    _id: String(user._id),
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    policeStation: user.policeStation,
    walletName: user.walletName,
    walletAddress: user.walletAddress,
    paymentScreenshot: user.paymentScreenshot, // ✅ Include paymentScreenshot in the response
    referralToken: user.referralToken,
    secretKey: user.secretKey || null,
    children: children.filter((c): c is UserNode => c !== null),
  };
}

// 🚀 GET API endpoint
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const tree = await getUserTree(id);

    if (!tree) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tree });
  } catch (error) {
    console.error("Error fetching user tree:", error);
    return NextResponse.json(
      { success: false, message: "Error building user tree" },
      { status: 500 }
    );
  }
}