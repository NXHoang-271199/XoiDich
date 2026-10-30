import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { Env } from './config/env.schema.js';

/** HTTP-level setup shared by main.ts and the e2e tests, so tests run the same app as production. */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // Behind nginx (production): read the client IP from X-Forwarded-For, but only when the
  // request comes from a private-network proxy. Without this, rate limiting sees one IP for everyone.
  app.set('trust proxy', 'loopback, uniquelocal');
  app.use(helmet());
  app.enableCors({ origin: config.get('FRONTEND_URL', { infer: true }), credentials: true });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('XoiDich API')
        .setVersion('1')
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }
}
