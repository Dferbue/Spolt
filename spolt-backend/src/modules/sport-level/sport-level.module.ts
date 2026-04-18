import { Module } from '@nestjs/common';
import { SportLevelService } from './sport-level.service';
import { SportLevelController } from './sport-level.controller';

@Module({
  controllers: [SportLevelController],
  providers: [SportLevelService],
  exports: [SportLevelService],
})
export class SportLevelModule {}
