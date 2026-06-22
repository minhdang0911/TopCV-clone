import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, NotificationsModule, MailModule],
  providers: [RemindersService],
})
export class RemindersModule {}
