/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { AuthService } from '../services';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';

/**
 * AuthController handles authentication requests.
 * Refactored to instance-based methods for better testability and type safety.
 */
class AuthController {
  
  /**
   * Registers a new user account.
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.register(req.body);
      if (!response.success) throw response;
      
      ApiResponse.success(res, response, 201);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * Verifies a user account via token/code.
   */
  public async verifyAccount(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.verifyAccount(req.body);
      if (!response.success) throw response;

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * Authenticates a user using password credentials.
   */
  public async loginWithPassword(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.loginWithPassword(req.body);
      if (!response.success) throw response;

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * Generates a One-Time Password (OTP) for login.
   */
  public async generateLoginOtp(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.generateLoginOtp(req.body.email);
      if (!response.success) throw response;

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * Authenticates a user using OTP.
   */
  public async loginWithOtp(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.loginWithOtp(req.body);
      if (!response.success) throw response;

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * Refreshes the access token using a valid refresh token.
   */
  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.refresh(req.body.refreshToken);
      if (!response.success) throw response;

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * Logs out the user by invalidating tokens.
   */
  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, refreshToken } = req.body;
      const response = await AuthService.logout(accessToken, refreshToken);
      if (!response.success) throw response;

      ApiResponse.success(res, response, 202);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * SECURE IMPLEMENTATION: Forgot Password
   * Prevents account enumeration by returning a generic success message.
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const genericMessage = "If an account with that email exists, a password reset link has been sent.";
    try {
      // Logic executes, but result is never exposed to the client
      await AuthService.forgotPassword(req.body.email);
      
      ApiResponse.success(res, { success: true, message: genericMessage });
    } catch (error) {
      // Even if the email is missing or service fails, we return success to hide user existence
      ApiResponse.success(res, { success: true, message: genericMessage });
    }
  }

  /**
   * Resets the user's password.
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.resetPassword(req.body);
      if (!response.success) throw response;

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

// Export a singleton instance
export default new AuthController();