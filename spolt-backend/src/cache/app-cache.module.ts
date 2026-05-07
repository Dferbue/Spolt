import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyvNonBlocking } from '@keyv/redis';
import { AppCacheService } from './app-cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') ??
          `redis://${configService.get<string>('REDIS_HOST', 'localhost')}:${configService.get<string>('REDIS_PORT', '6379')}`;

        return {
          stores: [
            createKeyvNonBlocking(redisUrl, {
              namespace: 'spolt',
              connectionTimeout: configService.get<number>(
                'REDIS_CONNECT_TIMEOUT_MS',
                500,
              ),
            }),
          ],
          ttl: configService.get<number>('CACHE_TTL_DEFAULT_MS', 30000),
        };
      },
    }),
  ],
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
