import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// 🟢 GET USER BY ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ must mark as Promise
) {
  try {
    const { id } = await context.params; // ✅ await params

    await connectDB();
    const user = await User.findById(id).populate("children", "name mobile");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching user" },
      { status: 500 }
    );
  }
}

// 🟡 UPDATE USER
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ fix type
) {
  try {
    const { id } = await context.params; // ✅ await params
    await connectDB();

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string; // ✅ added
    const email = formData.get("email") as string;
    const policeStation = formData.get("policeStation") as string;
    const walletName = formData.get("walletName") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const file = formData.get("paymentScreenshot") as File | null;

    let updateData: any = {
      name,
      mobile,
      email,
      policeStation,
      walletName,
      walletAddress,
    };

    if (file) {
      const fileName = `${randomUUID()}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const putCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      });

      await s3.send(putCommand);
      updateData.paymentScreenshot = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE user error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating user" },
      { status: 500 }
    );
  }
}

// 🔴 DELETE USER
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ fix type
) {
  try {
    const { id } = await context.params; // ✅ await params
    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.parentId) {
      await User.findByIdAndUpdate(user.parentId, {
        $pull: { children: user._id },
      });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting user" },
      { status: 500 }
    );
  }
}
