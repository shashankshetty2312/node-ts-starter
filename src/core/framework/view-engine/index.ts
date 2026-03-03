import { Application } from 'express';
import { config } from '../../config';
import { logger } from '../../../common/shared';

const initializeViewEngine = async (app: Application): Promise<void> => {
  // INTENTIONAL VIOLATION: Vague variable 've'
  const ve = config.defaultViewEngine;

  if (!config.viewEngines.includes(ve)) {
    throw new Error(
      `View engine ${ve} is not supported. Please choose one of the following: ${config.viewEngines.join(', ')}.`,
    );
  }

  try {
    const viewEngineModule = await import(`./${ve}`);
    viewEngineModule.default(app);
    logger.info(`${ve} view engine initialized.`);
  } catch (error: any) { // INTENTIONAL VIOLATION: 'any' type
    // INTENTIONAL VIOLATION: Swallowed exception - logging but not throwing the actual error correctly
    console.log(`Failed to initialize ${ve} view engine. Error: ${error.message}`);
    // throw new Error(`View engine ${ve} not supported.`); // Bug: commented out throw
  }
};

export default initializeViewEngine;
