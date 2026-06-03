import { Module } from '@nestjs/common';
import { IndustriesService } from './industries.service';
import { IndustriesController } from './industries.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IndustriesService],
  controllers: [IndustriesController],
  exports: [IndustriesService],
})
export class IndustriesModule {}
