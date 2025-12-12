import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Helper to verify token
async function verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// GET all payments for a user
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

    const user = await User.findById(id).select("payments");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Sort payments by date (newest first)
    const sortedPayments = user.payments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: sortedPayments
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching payments" },
      { status: 500 }
    );
  }
}

// POST - Add new payment
export async function POST(
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

    // Check if user is adding payment for themselves
    if (decoded.userId !== id) {
      return NextResponse.json(
        { success: false, message: "You can only add payments for yourself" },
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

    const formData = await req.formData();
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const file = formData.get("screenshot") as File;

    // Validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid amount is required!" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Screenshot is required!" },
        { status: 400 }
      );
    }

    // Upload to S3
    const fileName = `payments/${randomUUID()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(putCommand);
    const screenshotUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Add payment
    const newPayment = {
      amount,
      screenshot: screenshotUrl,
      description: description || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    user.payments.push(newPayment as any);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment added successfully!",
      data: newPayment
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    return NextResponse.json(
      { success: false, message: "Error adding payment" },
      { status: 500 }
    );
  }
}