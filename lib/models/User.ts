import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  mobile: string;
  email: string;
  policeStation: string;
  walletName: string;
  walletAddress: string;
  paymentScreenshot: string;
  secretKey?: string | null;
  referralToken: string;
  password?: string | null; // optional: only for main parents
  parentId?: Types.ObjectId | null;
  mainParentId?: Types.ObjectId | null;
  children: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    policeStation: { type: String, required: true },
    walletName: { type: String, required: true },
    walletAddress: { type: String, required: true },
    paymentScreenshot: { type: String, required: true },
    secretKey: { type: String, default: null },

    // password optional — only used for root/main parents
    password: { type: String, default: null },

    // referral logic
    referralToken: { type: String, required: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    mainParentId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    children: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
userSchema.pre("save", function (next) {
  // `this` is the document being saved
  if (this.parentId) {
    // Child users should NOT have a password
    this.password = null;
  } else {
   
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
