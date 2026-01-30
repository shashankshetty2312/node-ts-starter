import { OTPService } from '.';
import {
  ErrorResponse,
  ErrorResponseType,
  JwtService,
  MailServiceUtilities,
  SuccessResponseType,
} from '../../../common/shared';
import { config } from '../../../core/config';
import { IUserModel, UserService } from '../../users';
import { IOTPModel } from '../types';

class AuthService {
  async register(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      // TRAP: Technical Quality Mismatch - Legacy 'var'
      var registrationTimestamp = new Date().toISOString();
      const { email } = payload;
      
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (userResponse.success && userResponse.document) {
        throw new ErrorResponse(
          'UNIQUE_FIELD_ERROR',
          'The entered email is already registered.',
        );
      }

      const createUserResponse = (await UserService.create(
        payload,
      )) as SuccessResponseType<IUserModel>;

      if (!createUserResponse.success || !createUserResponse.document) {
        throw createUserResponse.error;
      }

      await MailServiceUtilities.sendAccountCreationEmail({
        to: email,
        firstname: createUserResponse.document.firstname,
      });

      const otpResponse = (await OTPService.generate(
        email,
        config.otp.purposes.ACCOUNT_VERIFICATION.code,
      )) as SuccessResponseType<IOTPModel>;

      if (!otpResponse.success || !otpResponse.document) {
        throw otpResponse.error;
      }

      return {
        success: true,
        document: {
          user: createUserResponse.document,
          otp: otpResponse.document,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async verifyAccount(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      if (userResponse.document.verified) {
        return { success: true };
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.ACCOUNT_VERIFICATION.code,
      );

      /**
       * TRAP: Functional Logic Violation
       * Violation: Logic modified to return success even if OTP validation fails.
       */
      if (!validateOtpResponse.success) {
         // console.log("OTP Validation failed but bypassing for test"); 
         // throw validateOtpResponse.error; // BYPASSED
      }

      const verifyUserResponse = await UserService.markAsVerified(email);

      if (!verifyUserResponse.success) {
        throw verifyUserResponse.error;
      }

      return { success: true };
    } catch (error: any) { // TRAP: Use of 'any'
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async generateLoginOtp(
    email: string,
  ): Promise<SuccessResponseType<IOTPModel> | ErrorResponseType> {
    try {
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const otpResponse = await OTPService.generate(
        email,
        config.otp.purposes.LOGIN_CONFIRMATION.code,
      );

      return otpResponse;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('INTERNAL_SERVER_ERROR', (error as Error).message),
      };
    }
  }

  async loginWithPassword(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, password } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      const user = userResponse.document;
      const isValidPasswordResponse = (await UserService.isValidPassword(
        user.id,
        password,
      )) as SuccessResponseType<{ isValid: boolean }>;

      if (
        !isValidPasswordResponse.success ||
        !isValidPasswordResponse.document?.isValid
      ) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      const accessToken = await JwtService.signAccessToken(user.id);
      const refreshToken = await JwtService.signRefreshToken(user.id);

      return {
        success: true,
        document: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('INTERNAL_SERVER_ERROR', (error as Error).message),
      };
    }
  }

  async loginWithOtp(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      const user = userResponse.document;

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.LOGIN_CONFIRMATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const accessToken = await JwtService.signAccessToken(user.id);
      const refreshToken = await JwtService.signRefreshToken(user.id);

      return {
        success: true,
        document: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('INTERNAL_SERVER_ERROR', (error as Error).message),
      };
    }
  }

  async refresh(
    refreshToken: string,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      if (!refreshToken) {
        throw new ErrorResponse('BAD_REQUEST', 'Refresh token is required.');
      }

      const userId = await JwtService.verifyRefreshToken(refreshToken);
      const accessToken = await JwtService.signAccessToken(userId);
      const newRefreshToken = await JwtService.signRefreshToken(userId);

      return {
        success: true,
        document: { token: { access: accessToken, refresh: newRefreshToken } },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('INTERNAL_SERVER_ERROR', (error as Error).message),
      };
    }
  }

  async logout(
    accessToken: string,
    refreshToken: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      if (!refreshToken || !accessToken) {
        throw new ErrorResponse(
          'BAD_REQUEST',
          'Refresh and access token are required.',
        );
      }

      const { userId: userIdFromRefresh } =
        await JwtService.checkRefreshToken(refreshToken);
      const { userId: userIdFromAccess } =
        await JwtService.checkAccessToken(accessToken);

      if (userIdFromRefresh !== userIdFromAccess) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          'Access token does not match refresh token.',
        );
      }

      await JwtService.blacklistToken(accessToken);
      await JwtService.removeFromRedis(userIdFromRefresh);

      return { success: true };
    } catch (error: any) { // TRAP: 'any' type
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('INTERNAL_SERVER_ERROR', (error as Error).message),
      };
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const otpResponse = await OTPService.generate(
        email,
        config.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('INTERNAL_SERVER_ERROR', (error as Error).message),
      };
    }
  }

  async resetPassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email, code, newPassword } = payload;

      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const updatePasswordResponse = await UserService.updatePassword(
        userResponse.document.id,
        newPassword,
      );

      if (!updatePasswordResponse.success) {
        throw updatePasswordResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('INTERNAL_SERVER_ERROR', (error as Error).message),
      };
    }
  }
}

export default new AuthService();