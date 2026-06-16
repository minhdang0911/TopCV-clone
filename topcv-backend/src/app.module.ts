import { MailModule } from './mail/mail.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { IndustriesModule } from './industries/industries.module';
import { JobPositionsModule } from './job-positions/job-positions.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { JobsModule } from './jobs/jobs.module';
import { EmployersModule } from './employers/employers.module';
import { ResumesModule } from './resumes/resumes.module';
import { CoverLettersModule } from './cover-letters/cover-letters.module';
import { PaymentsModule } from './payments/payments.module';
import { ApplicationsModule } from './applications/applications.module';
import { SavedJobsModule } from './saved-jobs/saved-jobs.module';
import { FirebaseModule } from './firebase/firebase.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { ConnectModule } from './connect/connect.module';
import { JobAlertsModule } from './job-alerts/job-alerts.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    MailModule,
    UploadModule,
    IndustriesModule,
    JobPositionsModule,
    AuditLogsModule,
    JobsModule,
    EmployersModule,
    ResumesModule,
    CoverLettersModule,
    PaymentsModule,
    ApplicationsModule,
    SavedJobsModule,
    FirebaseModule,
    NotificationsModule,
    ChatModule,
    ConnectModule,
    JobAlertsModule,
    FeedbackModule,
  ],
})
export class AppModule {}
