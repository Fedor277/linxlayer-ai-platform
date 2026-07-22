import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createLogger } from './utils/logger.js';

const config = loadConfig();
const logger = createLogger(config.logLevel);
const app = createApp({ config });

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Secure AI gateway listening');
});

function shutDown(signal: string): void {
  logger.info({ signal }, 'Shutting down gateway');
  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Gateway shutdown failed');
      process.exitCode = 1;
      return;
    }
    process.exitCode = 0;
  });
}

process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGINT', () => shutDown('SIGINT'));
