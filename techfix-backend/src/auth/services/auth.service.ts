import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AuthRepository } from "../repositories/auth.repository";
import { ITokenPayload, ITokenPair, IAddress } from "../types/user.type";
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  AddAddressDto,
} from "../dtos/auth.dto";
import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { NotFoundError } from "../../errors/NotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { IUserDocument } from "../models/user.model";
import { sendMail } from "../../utils/mailer";
import { UserRole, UserRoleType } from "../../config/constants";

interface IResetTokenPayload {
  userId: string;
  purpose: "password_reset";
}

/**
 * Auth Service
 * The brain of the auth feature. All business rules live here.
 * Never touches req/res. Never touches the database directly.
 */
export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  // ─── Token helpers ──────────────────────────────────────────────

  private generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private generateTokenPair(payload: ITokenPayload): ITokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  // ─── Register ─────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Check for existing email
    const emailTaken = await this.authRepository.emailExists(dto.email);
    if (emailTaken) {
      throw new ConflictError("An account with this email already exists");
    }

    // Check for existing phone
    const phoneTaken = await this.authRepository.phoneExists(dto.phone);
    if (phoneTaken) {
      throw new ConflictError("An account with this phone number already exists");
    }

    // Create user (password gets hashed by pre-save hook)
    const user = await this.authRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      role: dto.role,
    });

    // Generate tokens
    const tokenPayload: ITokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const tokens = this.generateTokenPair(tokenPayload);

    // Persist refresh token
    await this.authRepository.saveRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  // ─── Login ────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // Find user with password included
    const user = await this.authRepository.findByEmail(dto.email, true);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate tokens
    const tokenPayload: ITokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const tokens = this.generateTokenPair(tokenPayload);

    // Persist refresh token
    await this.authRepository.saveRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  // ─── Logout ───────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.authRepository.clearRefreshToken(userId);
  }

  // ─── Refresh Token ────────────────────────────────────────────

  async refreshToken(token: string) {
    // Verify the refresh token
    let decoded: ITokenPayload;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Find user and check stored token matches
    const user = await this.authRepository.findById(decoded.userId, true);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.refreshToken !== token) {
      // Token reuse detected — clear all tokens (security measure)
      await this.authRepository.clearRefreshToken(decoded.userId);
      throw new UnauthorizedError(
        "Refresh token has been revoked. Please log in again."
      );
    }

    // Rotate: generate a new pair and save the new refresh token
    const tokenPayload: ITokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const tokens = this.generateTokenPair(tokenPayload);

    await this.authRepository.saveRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );

    return { tokens };
  }

  // ─── Get Current User ─────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    return { user: user.toJSON() };
  }

  // ─── Admin: user directory & seller verification ──────────────

  /**
   * Lists users for the admin panel. `toJSON()` drops password and
   * refreshToken (both select:false), so no secret ever leaves here.
   */
  async listUsers(role?: UserRoleType) {
    const users = await this.authRepository.findAllByRole(role);
    return { users: users.map((u) => u.toJSON()) };
  }

  /**
   * Flips a seller's verified badge. Verification is the platform's core
   * trust signal, so it is admin-only and never self-assignable — the same
   * reasoning that keeps `role` out of the public registration DTO.
   */
  async setSellerVerified(userId: string, isVerifiedSeller: boolean) {
    const target = await this.authRepository.findById(userId);
    if (!target) {
      throw new NotFoundError("User");
    }
    if (target.role !== UserRole.SELLER) {
      throw new ValidationError("Only seller accounts can be verified");
    }

    const user = await this.authRepository.updateById(userId, {
      isVerifiedSeller,
    } as Partial<IUserDocument>);

    return { user: user!.toJSON() };
  }

  // ─── Update Profile ───────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // If phone is being changed, check uniqueness
    if (dto.phone) {
      const existing = await this.authRepository.findByPhone(dto.phone);
      if (existing && existing._id.toString() !== userId) {
        throw new ConflictError("This phone number is already in use");
      }
    }

    const user = await this.authRepository.updateById(userId, dto);
    if (!user) {
      throw new NotFoundError("User");
    }

    return { user: user.toJSON() };
  }

  // ─── Change Password ─────────────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.authRepository.findById(userId, true);
    if (!user) {
      throw new NotFoundError("User");
    }

    // Verify current password
    const isMatch = await user.comparePassword(dto.currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Prevent reusing the same password
    const isSame = await user.comparePassword(dto.newPassword);
    if (isSame) {
      throw new ValidationError(
        "New password must be different from the current password"
      );
    }

    // Set new password (pre-save hook will hash it)
    user.password = dto.newPassword;
    await user.save();

    // Invalidate existing sessions by clearing refresh token
    await this.authRepository.clearRefreshToken(userId);

    return { message: "Password changed successfully. Please log in again." };
  }

  // ─── Forgot Password ──────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.authRepository.findByEmail(email);

    // Always return a generic message — never reveal whether the email exists.
    if (user) {
      const resetToken = jwt.sign(
        { userId: user._id.toString(), purpose: "password_reset" } as IResetTokenPayload,
        env.RESET_PASSWORD_SECRET,
        { expiresIn: env.RESET_PASSWORD_EXPIRES_IN } as jwt.SignOptions
      );

      const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await sendMail({
        to: user.email,
        subject: "Reset your TechFix password",
        html: `<p>Click the link below to reset your password. This link expires in ${env.RESET_PASSWORD_EXPIRES_IN}.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      });
    }

    return {
      message: "If an account with that email exists, a reset link has been sent.",
    };
  }

  // ─── Reset Password ───────────────────────────────────────────

  async resetPassword(token: string, newPassword: string) {
    let decoded: IResetTokenPayload;
    try {
      decoded = jwt.verify(token, env.RESET_PASSWORD_SECRET) as IResetTokenPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired reset link");
    }

    if (decoded.purpose !== "password_reset") {
      throw new UnauthorizedError("Invalid or expired reset link");
    }

    const user = await this.authRepository.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    user.password = newPassword;
    await user.save();

    // Invalidate existing sessions
    await this.authRepository.clearRefreshToken(decoded.userId);

    return { message: "Password reset successfully. Please log in with your new password." };
  }

  // ─── Add Address ──────────────────────────────────────────────

  async addAddress(userId: string, dto: AddAddressDto) {
    // Check address limit
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.addresses.length >= 5) {
      throw new ValidationError("Maximum 5 addresses allowed");
    }

    // If this address is default, unset others
    if (dto.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      await user.save();
    }

    const updatedUser = await this.authRepository.addAddress(
      userId,
      dto as IAddress
    );

    return { user: updatedUser?.toJSON() };
  }

  // ─── Remove Address ───────────────────────────────────────────

  async removeAddress(userId: string, addressIndex: number) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (addressIndex < 0 || addressIndex >= user.addresses.length) {
      throw new ValidationError("Invalid address index");
    }

    const updatedUser = await this.authRepository.removeAddress(
      userId,
      addressIndex
    );

    return { user: updatedUser?.toJSON() };
  }
}
