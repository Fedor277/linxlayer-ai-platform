import pino, { type LevelWithSilent, type Logger } from 'pino';

export function createLogger(level: LevelWithSilent = 'info'): Logger {
  return pino({
    level,
    base: null,
    redact: {
      paths: [
        'req.headers.authorization',
        'request.headers.authorization',
        'headers.authorization',
        '*.apiKey',
        '*.token',
        '*.prompt',
        '*.messages',
      ],
      censor: '[REDACTED]',
    },
  });
}
