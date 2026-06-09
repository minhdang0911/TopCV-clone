import { MailModule } from './mail/mail.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
