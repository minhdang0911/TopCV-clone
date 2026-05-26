// guards/social-auth.guard.ts
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

export const GoogleAuthGuard = () => {
  @Injectable()
  class Guard extends AuthGuard('google') {}
  return Guard
}

// hoặc đơn giản hơn, dùng thẳng:
export class GoogleGuard extends AuthGuard('google') {}
export class FacebookGuard extends AuthGuard('facebook') {}
export class LinkedinGuard extends AuthGuard('linkedin') {}