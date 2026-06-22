import { Module } from '@nestjs/common';
import { EmployersController } from './employers.controller';
import { EmployersService } from './employers.service';
import { ModerationService } from './moderation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [EmployersController],
  providers: [EmployersService, ModerationService],
})
export class EmployersModule {}
