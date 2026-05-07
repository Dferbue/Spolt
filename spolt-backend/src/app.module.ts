import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { SportsModule } from './modules/sports/sports.module';
import { FrindshipsModule } from './modules/frindships/frindships.module';
import { EmailModule } from './modules/email/email.module';
import { WeatherModule } from './modules/weather/weather.module';
import { StorageModule } from './modules/storage/storage.module';
import { SportLevelModule } from './modules/sport-level/sport-level.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './modules/admin/admin.module';
import { AppCacheModule } from './cache/app-cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AppCacheModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    FrindshipsModule,
    SportsModule,
    EventsModule,
    EmailModule,
    WeatherModule,
    StorageModule,
    SportLevelModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
