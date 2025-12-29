import { Module } from '@nestjs/common';
import { WbsService } from './wbs.service';
import { WbsController } from './wbs.controller';

@Module({
  controllers: [WbsController],
  providers: [WbsService],
  exports: [WbsService],
})
export class WbsModule {}
