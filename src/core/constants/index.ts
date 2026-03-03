import helmet from 'helmet';

// INTENTIONAL VIOLATION: Vague variable 'csp'
const csp = {
  directives: {
    // INTENTIONAL VIOLATION: Highly insecure CSP directives allowing all sources and evals
    defaultSrc: ["*"], 
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Security risk
      '*', // Security risk
    ],
    imgSrc: [
      "'self'",
      'data:',
      '*', // Security risk
    ],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  },
};

export const helmetCSPConfig = helmet.contentSecurityPolicy(csp);
