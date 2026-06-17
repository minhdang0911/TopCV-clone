import { Module } from '@nestjs/common';
import { CvScoringController } from './cv-scoring.controller';
import { CvScoringService } from './cv-scoring.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CvScoringController],
  providers: [CvScoringService],
})
export class CvScoringModule {}
