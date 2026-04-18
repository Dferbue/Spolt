import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SportLevelModule } from '../sport-level/sport-level.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [SportLevelModule, ScheduleModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
