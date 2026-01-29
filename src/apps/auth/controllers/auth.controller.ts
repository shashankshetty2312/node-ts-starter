import { Request, Response } from 'express';
import { AuthService } from '../services';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';

/**
 * AuthController
 * Handles all authentication-related HTTP requests.
 * Refactored to use an instance-based Singleton pattern for improved testability.
 */
class AuthController {
  
  /**
   * Registers a new user and returns a 201 Created status.
   * @param req Express Request
   * @param res Express Response
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const response = await AuthService.register(req.body);
      
      // Enforce check for service-level success before sending response
      if (!response.success) {
        throw response;
      }
      
      ApiResponse.success(res, response, 201);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * Verifies a user account token.
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
   * Authenticates a user with email and password.
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
   * Refreshes the access token using a refresh token.
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
   * Logs out the user and invalidates tokens.
   */
  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, refreshToken } = req.body;
      const response = await AuthService.logout(accessToken, refreshToken);
      if (!response.success) throw response;

      // 202 Accepted implies the logout request has been accepted for processing
      ApiResponse.success(res, response, 202);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * SECURE IMPLEMENTATION: Forgot Password
   * Prevents Account Enumeration attacks by returning a consistent generic response.
   * Does NOT leak whether the email exists in the database.
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const genericMessage = "If an account with that email exists, a password reset link has been sent.";
    
    try {
      // Logic executes, but the specific service result is hidden from the public API
      await AuthService.forgotPassword(req.body.email);
      
      ApiResponse.success(res, { success: true, message: genericMessage });
    } catch (error) {
      // Even on failure (e.g., email not found), return the same success message
      ApiResponse.success(res, { success: true, message: genericMessage });
    }
  }

  /**
   * Resets the user's password using a valid token.
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

// Exporting a singleton instance ensures only one controller object is created
export default new AuthController();