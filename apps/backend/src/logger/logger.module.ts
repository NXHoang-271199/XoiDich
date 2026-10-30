import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { TransportTargetOptions } from 'pino';
import type { Env } from '../config/env.schema.js';

/**
 * Structured logging with pino. Every line is JSON and carries the request id (`req.id`).
 * - Console: always (pretty-printed in development).
 * - Files: when LOG_DIR is set, one file per day (`app.2026-10-25.1.log`), older than LOG_RETENTION_DAYS deleted.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const level = config.get('LOG_LEVEL', { infer: true });
        const isDev = config.get('NODE_ENV', { infer: true }) === 'development';
        const logDir = config.get('LOG_DIR', { infer: true });

        const targets: TransportTargetOptions[] = [
          isDev
            ? { target: 'pino-pretty', level, options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' } }
            : { target: 'pino/file', level, options: { destination: 1 } },
        ];
        if (logDir) {
          targets.push({
            target: 'pino-roll',
            level,
            options: {
              file: join(logDir, 'app'),
              frequency: 'daily',
              dateFormat: 'yyyy-MM-dd',
              mkdir: true,
              limit: { count: config.get('LOG_RETENTION_DAYS', { infer: true }), removeOtherLogFiles: true },
            },
          });
        }

        return {
          pinoHttp: {
            level,
            transport: { targets },
            // Never write credentials to logs.
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
                '*.password',
                '*.token',
                '*.accessToken',
                '*.refreshToken',
              ],
              censor: '[REDACTED]',
            },
            // Docker probes every 10s; logging them would bury real traffic.
            autoLogging: { ignore: (req) => req.url === '/api/health' },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
