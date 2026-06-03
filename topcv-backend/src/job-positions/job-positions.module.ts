import { Module } from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { JobPositionsController } from './job-positions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [JobPositionsService],
  controllers: [JobPositionsController],
  exports: [JobPositionsService],
})
export class JobPositionsModule {}
