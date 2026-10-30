import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

/** Body of every error response. Clients switch on `code`, never on `message`. */
export interface ErrorBody {
  error: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  };
}

const PRISMA_ERRORS: Record<string, { status: HttpStatus; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
};

export function toErrorBody(exception: unknown): ErrorBody {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const res = exception.getResponse();
    // ValidationPipe puts the list of failed constraints in `message`.
    const raw = typeof res === 'object' && res !== null ? (res as Record<string, unknown>).message : res;
    const isList = Array.isArray(raw);
    if (isList) return body(status, 'Validation failed', raw);
    return body(status, typeof raw === 'string' ? raw : exception.message);
  }

  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERRORS[exception.code];
    if (mapped) return body(mapped.status, mapped.message);
  }

  return body(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
}

function body(statusCode: number, message: string, details?: unknown): ErrorBody {
  const code = statusCode === 400 && details ? 'VALIDATION_FAILED' : (HttpStatus[statusCode] ?? 'ERROR');
  return { error: { statusCode, code, message, ...(details ? { details } : {}) } };
}

/** Turns every thrown error into an `ErrorBody`, so no endpoint can return a different error shape. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const result = toErrorBody(exception);
    if (result.error.statusCode >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }
    host.switchToHttp().getResponse<Response>().status(result.error.statusCode).json(result);
  }
}
