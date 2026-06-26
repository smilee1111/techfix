import { Request } from "express";
import { UserRoleType } from "../../config/constants";

// ─── Address sub-document ────────────────────────────────────────
export interface IAddress {
  label: string;
  street: string;
  city: string;
  district: string;
  province?: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

// ─── User document (matches Mongoose schema) ────────────────────
export interface IUser {
  _id: string;
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
}

// ─── User without sensitive fields (for API responses) ──────────
export type IUserSafe = Omit<IUser, "password" | "refreshToken">;

// ─── JWT payloads ────────────────────────────────────────────────
export interface ITokenPayload {
  userId: string;
  role: UserRoleType;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Authenticated request (after auth middleware) ───────────────
export interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
}
