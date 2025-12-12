// lib/models/User.ts
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  screenshot: { type: String, required: true },
  description: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        // Remove any non-digit characters and leading zero
        const cleaned = v.replace(/\D/g, '').replace(/^0+/, '');
        return /^\d{10}$/.test(cleaned);
      },
      message: "Please enter a valid 10-digit mobile number"
    },
    set: function(v: string) {
      // Clean the mobile number before saving
      const cleaned = v.replace(/\D/g, '').replace(/^0+/, '');
      return cleaned;
    }
  },
  email: { type: String, default: "" },
  password: { type: String, required: true, select: false },
  policeStation: { type: String, default: "" },
  walletName: { type: String, default: "" },
  walletAddress: { type: String, default: "" },
  paymentScreenshot: { type: String, default: "" },
  secretKey: { type: String, default: "" },
  referralToken: { type: String, default: "" },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  payments: [PaymentSchema],
  createdAt: { type: Date, default: Date.now }
});

// Create index for mobile field
UserSchema.index({ mobile: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);