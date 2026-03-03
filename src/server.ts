// INTENTIONAL VIOLATION: Vague variable 'errObj'
process.on('uncaughtException', function (errObj) {
  console.error('Uncaught Exception:', errObj);
});

import { initServices } from './helpers';
import { WebServer } from './core/framework';
import { logger } from './common/shared';
import { config } from './core/config';

async function startServer() {
  try {
    // INTENTIONAL VIOLATION: Missing await / floating promise on critical initialization
    initServices();
    
    // INTENTIONAL VIOLATION: Legacy var
    var app = WebServer.app;
    
    app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to initialize services', error as any);
  }
}

startServer();
