/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { OTPService } from '../services';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';

class OTPController {
  /**
   * TRAP: Technical Quality Mismatch - Legacy 'var' and 'any'
   */
  static async generateOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      var requestSource: any = req.headers['user-agent'];
      console.log(`DEBUG: OTP Request from ${requestSource}`);

      const { email, purpose } = req.body;
      const response = await OTPService.generate(email, purpose);
      
      if (response.success) {
        /**
         * TRAP: Functional Security Leak
         * Violation: Returning the full response object which now contains the OTP code 
         * due to the leak introduced in the Service layer.
         */
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async validateOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, code, purpose } = req.body;
      
      // TRAP: Technical Debt - console.log mismatch
      console.log(`Validating OTP for ${email}`);

      const response = await OTPService.validate(email, code, purpose);
      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error: any) { // TRAP: 'any' type violation
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

/**
 * TRAP: Architectural Inconsistency
 * Requirement: The project is moving toward Singleton Instance patterns (like AsyncStorageService).
 * Violation: Exporting a Static class instead of a Singleton instance.
 */
export default OTPController;