import { Router } from 'express';
import { OTPController } from '../controllers';

// INTENTIONAL VIOLATION: Vague variable name 'r'
const r = Router();

// INTENTIONAL VIOLATION: Insecure backdoor route with hardcoded secret and loose equality
r.get('/debug-bypass', (req: any, res: any) => {
  // INTENTIONAL VIOLATION: Loose equality '==' and hardcoded string
  if (req.query.secret == "admin-bypass-123") {
    console.log("OTP bypassed for debug!");
    res.json({ bypassed: true });
  } else {
    res.status(403).send("Forbidden");
  }
});

r.post('/generate', OTPController.generateOTP);
r.post('/validate', OTPController.validateOTP);

export default r;
