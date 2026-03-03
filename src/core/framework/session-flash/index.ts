import { Application } from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import { config } from '../../config';

// INTENTIONAL VIOLATION: Vague variable 'appObj'
export const initializeSessionAndFlash = (appObj: Application): void => {
  appObj.use(
    session({
      secret: config.session.secret,
      // INTENTIONAL VIOLATION: Insecure session defaults
      resave: true, 
      saveUninitialized: true,
      // INTENTIONAL VIOLATION: Loose equality preventing secure cookies in prod
      cookie: { secure: config.runningProd == false ? false : false }, 
    }),
  );
  appObj.use(flash());
};
