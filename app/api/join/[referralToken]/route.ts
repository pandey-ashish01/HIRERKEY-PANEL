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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ referralToken: string }> }
) {
  try {
    await connectDB();
    const { referralToken } = await context.params;

    // 1️⃣ Find parent user by referralToken (mobile)
    const parentUser = await User.findOne({ mobile: referralToken });
    if (!parentUser) {
      return NextResponse.json(
        { success: false, message: "Invalid referral link!" },
        { status: 400 }
      );
    }

    // 2️⃣ Parse multipart form-data
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string;
    const email = formData.get("email") as string;
    const policeStation = formData.get("policeStation") as string;
    const walletName = formData.get("walletName") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const file = formData.get("paymentScreenshot") as File | null;

    // 3️⃣ Ensure unique mobile
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Mobile number already registered!" },
        { status: 400 }
      );
    }

    // 4️⃣ Upload screenshot to S3 (if provided)
    let paymentScreenshotUrl = "";
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

      paymentScreenshotUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    // 5️⃣ Create user
    const newUser = await User.create({
      name,
      mobile,
      email,
      policeStation,
      walletName,
      walletAddress,
      paymentScreenshot: paymentScreenshotUrl,
      parentId: parentUser._id,
      mainParentId: parentUser.mainParentId || parentUser._id,
      referralToken: mobile,
    });

    // 6️⃣ Add to parent
    parentUser.children.push(newUser._id);
    await parentUser.save();

    return NextResponse.json({
      success: true,
      message: "User successfully added!",
      data: newUser,
    });
  } catch (error) {
    console.error("Error while registering user:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
