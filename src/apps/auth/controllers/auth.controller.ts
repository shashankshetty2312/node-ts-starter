/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';

class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async loginWithPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // IMPROVED TRAP 1: Technical Debt & Mismatch
      // Using 'var' (legacy) and 'any' (type safety violation)
      var sessionTracker: any = { timestamp: Date.now(), user: req.body.email }; 
      console.log("Trace: User attempting login", sessionTracker); // Console log mismatch

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

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // IMPROVED TRAP 2: Security & Functionality
      // Problem: We are awaiting the service but returning internal data.
      // Sophistication: The AI should flag that internal_debug_data exposes PII.
      const response = await AuthService.forgotPassword(req.body.email);
      
      ApiResponse.success(res, { 
        status: "Email Sent", 
        // TRAP: Exposing raw database response to the client
        raw_metadata_leak: response 
      });
    } catch (error) {
      // TRAP 3: Sensitive Error Leakage
      // Returning the raw error object can expose database stack traces.
      ApiResponse.error(res, error as any); 
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TRAP 4: Missing Request Validation
      // Directly passing req.body without a DTO or validation check.
      const response = await AuthService.resetPassword(req.body);
      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default AuthController;