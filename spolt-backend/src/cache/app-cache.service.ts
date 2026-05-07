import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { createHash } from 'crypto';

@Injectable()
export class AppCacheService implements OnModuleInit {
  private readonly logger = new Logger(AppCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    const healthKey = this.key('health', 'startup');

    try {
      await this.cacheManager.set(healthKey, 'ok', 1000);
      const value = await this.cacheManager.get<string>(healthKey);

      if (value === 'ok') {
        this.logger.log('Redis cache inicializada');
        return;
      }

      this.logger.warn(
        'Redis cache no confirmo escritura de prueba; se usara fallback por request',
      );
    } catch (error) {
      this.logger.warn(
        `Redis cache no disponible; se usara fallback por request: ${this.errorMessage(error)}`,
      );
    }
  }

  async getOrSet<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    try {
      const cached = await this.cacheManager.get<T>(key);

      if (cached !== undefined && cached !== null) {
        return cached;
      }
    } catch (error) {
      this.logger.warn(
        `Error leyendo cache ${key}: ${this.errorMessage(error)}`,
      );
    }

    const value = await loader();

    try {
      await this.cacheManager.set(key, value, ttlMs);
    } catch (error) {
      this.logger.warn(
        `Error escribiendo cache ${key}: ${this.errorMessage(error)}`,
      );
    }

    return value;
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(
        `Error borrando cache ${key}: ${this.errorMessage(error)}`,
      );
    }
  }

  async getVersion(namespace: string): Promise<number> {
    const key = this.versionKey(namespace);

    try {
      const version = await this.cacheManager.get<number>(key);
      return version ?? 1;
    } catch (error) {
      this.logger.warn(
        `Error leyendo version cache ${namespace}: ${this.errorMessage(error)}`,
      );
      return 1;
    }
  }

  async bumpVersion(namespace: string): Promise<number> {
    const key = this.versionKey(namespace);
    const nextVersion = (await this.getVersion(namespace)) + 1;

    try {
      await this.cacheManager.set(key, nextVersion, 0);
    } catch (error) {
      this.logger.warn(
        `Error actualizando version cache ${namespace}: ${this.errorMessage(error)}`,
      );
    }

    return nextVersion;
  }

  key(...parts: Array<string | number | boolean | null | undefined>): string {
    return [
      'spolt',
      'v1',
      ...parts.filter((part) => part !== undefined && part !== null),
    ].join(':');
  }

  hash(value: unknown): string {
    return createHash('sha256')
      .update(JSON.stringify(value))
      .digest('hex')
      .slice(0, 16);
  }

  private versionKey(namespace: string): string {
    return this.key('version', namespace);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
