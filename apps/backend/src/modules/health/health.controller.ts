import { Controller, Get, Inject, ServiceUnavailableException, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service.js';
import { REDIS } from '../../redis/redis.module.js';

/** `GET /api/health` — used by Docker and load balancers. Unversioned so probes never change. */
@ApiTags('health')
@SkipThrottle()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  /** Checks that PostgreSQL and Redis are reachable. */
  @Get()
  async check(): Promise<{ status: 'ok' }> {
    try {
      await Promise.all([this.prisma.$queryRaw`SELECT 1`, this.redis.ping()]);
    } catch {
      throw new ServiceUnavailableException('Database or Redis unreachable');
    }
    return { status: 'ok' };
  }
}
