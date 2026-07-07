import { Module } from '@nestjs/common';
import { SavedSearchesController } from './saved-searches.controller';
import { SavedSearchesService } from './saved-searches.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService],
})
export class SavedSearchesModule {}
