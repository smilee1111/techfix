import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole, UserRoleType } from "../../config/constants";
import { IAddress } from "../types/user.type";

// ─── Mongoose document interface ────────────────────────────────
export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRoleType;
  avatar?: string;
  addresses: IAddress[];
  isVerified: boolean;
  isVerifiedSeller: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Address sub-schema ─────────────────────────────────────────
const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true, default: "Kathmandu" },
    district: { type: String, required: true },
    province: { type: String },
    landmark: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

// ─── User schema ────────────────────────────────────────────────
const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
      required: true,
    },
    avatar: { type: String },
    addresses: {
      type: [addressSchema],
      default: [],
      validate: {
        validator: (v: IAddress[]) => v.length <= 5,
        message: "Maximum 5 addresses allowed",
      },
    },
    isVerified: { type: Boolean, default: false },
    isVerifiedSeller: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

// Note: email/phone already get a unique index from `unique: true` above —
// declaring it again here caused Mongoose's duplicate-schema-index warning.

// ─── Pre-save hook: hash password ───────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method: compare password ──────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Strip sensitive fields from JSON ───────────────────────────
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  userSchema
);

export default User;
