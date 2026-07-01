import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../types/user.type";

/**
 * Auth Controller
 * Receives the HTTP request. Extracts and sanitizes data.
 * Passes clean data to the service. Sends the response back.
 * Contains zero business logic.
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // ─── POST /auth/register ──────────────────────────────────────

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── POST /auth/login ─────────────────────────────────────────

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── POST /auth/logout ────────────────────────────────────────

  logout = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.authService.logout(req.user!.userId);

      // Clear the refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── POST /auth/refresh ───────────────────────────────────────

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Accept token from cookie or body
      const token =
        req.cookies?.refreshToken || req.body?.refreshToken;

      if (!token) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const result = await this.authService.refreshToken(token);

      // Rotate the cookie
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── GET /auth/me ─────────────────────────────────────────────

  getProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.getProfile(req.user!.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── PUT /auth/me ─────────────────────────────────────────────

  updateProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.updateProfile(
        req.user!.userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── PUT /auth/change-password ────────────────────────────────

  changePassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.changePassword(
        req.user!.userId,
        req.body
      );

      // Clear the refresh token cookie after password change
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── POST /auth/me/addresses ──────────────────────────────────

  addAddress = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.addAddress(
        req.user!.userId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Address added successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── DELETE /auth/me/addresses/:index ─────────────────────────

  removeAddress = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const index = parseInt(req.params.index as string, 10);
      const result = await this.authService.removeAddress(
        req.user!.userId,
        index
      );

      res.status(200).json({
        success: true,
        message: "Address removed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
