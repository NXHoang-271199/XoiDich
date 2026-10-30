import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { toErrorBody } from './all-exceptions.filter.js';

describe('toErrorBody', () => {
  it('maps an HttpException to its status and message', () => {
    expect(toErrorBody(new NotFoundException('Post not found'))).toEqual({
      error: { statusCode: 404, code: 'NOT_FOUND', message: 'Post not found' },
    });
  });

  it('reports ValidationPipe errors as VALIDATION_FAILED with details', () => {
    const body = toErrorBody(new BadRequestException(['email must be an email']));
    expect(body.error).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_FAILED',
      details: ['email must be an email'],
    });
  });

  it('maps a Prisma unique violation to 409', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
    expect(toErrorBody(error).error).toMatchObject({ statusCode: 409, code: 'CONFLICT' });
  });

  it('hides the details of unknown errors', () => {
    expect(toErrorBody(new Error('connection string leaked')).error).toEqual({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  });
});
