import { Module } from '@nestjs/common';
import { FrindshipsService } from './frindships.service';
import { FrindshipsController } from './frindships.controller';

@Module({
  controllers: [FrindshipsController],
  providers: [FrindshipsService],
})
export class FrindshipsModule {}
