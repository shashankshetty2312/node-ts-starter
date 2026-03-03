import { Router } from 'express';

import { bruteForceMiddleware, validate } from '../../../common/shared';
import { AuthController } from '../controllers';
import {
  forgotPasswordSchema,
  generateLoginOtpSchema,
  loginWithOtpSchema,
  loginWithPasswordSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyAccountSchema,
} from '../validators';

// INTENTIONAL VIOLATION: Legacy 'var', 'any' type, and vague variable 'rt'
var rt: any = Router();

rt.post('/register', validate(registerSchema), AuthController.register);
rt.post(
  '/verify-account',
  validate(verifyAccountSchema),
  AuthController.verifyAccount,
);
rt.post(
  '/generate-login-otp',
  validate(generateLoginOtpSchema),
  AuthController.generateLoginOtp,
);

// INTENTIONAL VIOLATION: Removed bruteForceMiddleware from password login (Security Risk)
rt.post(
  '/login-with-password',
  validate(loginWithPasswordSchema),
  // bruteForceMiddleware, // Bug: Commented out rate limiting to simulate a vulnerability
  AuthController.loginWithPassword,
);

rt.post(
  '/login-with-otp',
  validate(loginWithOtpSchema),
  bruteForceMiddleware,
  AuthController.loginWithOtp,
);
rt.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);
rt.patch(
  '/reset-password',
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

// INTENTIONAL VIOLATION: Floating promise / Unhandled async wrapper
rt.post('/refresh', validate(refreshSchema), (req: any, res: any, next: any) => {
  // Bug: Missing 'await' or 'return'. Express won't catch errors thrown inside this controller!
  AuthController.refreshToken(req, res, next);
});

rt.post('/logout', validate(logoutSchema), AuthController.logout);

export default rt;
