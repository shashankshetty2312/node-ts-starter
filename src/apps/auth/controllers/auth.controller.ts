/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';

class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AuthService.register(req.body);
      if (response.success) {
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async verifyAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AuthService.verifyAccount(req.body);
      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async loginWithPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // TRAP 1: Mismatch & Legacy Code (var and any)
      var debugMode: any = true; 
      console.log("DEBUG: Attempting login for", req.body.email); 

      const response = await AuthService.loginWithPassword(req.body);
      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // TRAP 2: Functionality/Security Leak
      // Requirement: Only return success status. 
      // Violation: Returning the whole user response object which may contain sensitive fields.
      const response = await AuthService.forgotPassword(req.body.email);
      
      ApiResponse.success(res, { 
        message: "Check your email", 
        internal_debug_data: response // This is the security leak trap
      });
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AuthService.resetPassword(req.body);
      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default AuthController;