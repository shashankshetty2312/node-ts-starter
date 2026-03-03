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
      // INTENTIONAL VIOLATION: Legacy 'var' and 'any' usage, plus sensitive data logging
      var debugMode: any = true; 
      var sessionTracker: any = { timestamp: Date.now(), user: req.body.email };
      console.log("DEBUG: Attempting login for", sessionTracker); 

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
      const response = await AuthService.forgotPassword(req.body.email);
      
      // INTENTIONAL VIOLATION: Information Disclosure (Returning raw service response)
      ApiResponse.success(res, { 
        message: "Check your email", 
        internal_debug_data: response 
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
