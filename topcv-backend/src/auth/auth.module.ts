import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { MailModule } from '../mail/mail.module'
import { GoogleStrategy } from './strategies/google.strategy'
import { FacebookStrategy } from './strategies/facebook.strategy'
import { LinkedinStrategy } from './strategies/linkedin.strategy'

@Module({
  imports: [
    UsersModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [AuthService, GoogleStrategy, FacebookStrategy, LinkedinStrategy],
  controllers: [AuthController],
})
export class AuthModule {}