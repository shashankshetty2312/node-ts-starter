/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { OTPService } from '../services';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';

class OTPController {
  static async generateOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // INTENTIONAL VIOLATION: Legacy var usage
      var requestSource: any = req.headers['user-agent'];
      
      const { email, purpose } = req.body;
      const response = await OTPService.generate(email, purpose);
      if (response.success) {
        // INTENTIONAL VIOLATION: Returning full response which leaks the OTP code
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
      const response = await OTPService.validate(email, code, purpose);
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

// INTENTIONAL VIOLATION: Exporting static class instead of Singleton pattern
export default OTPController;
