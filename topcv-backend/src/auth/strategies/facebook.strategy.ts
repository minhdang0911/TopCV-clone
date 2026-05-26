import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, Profile } from 'passport-facebook'

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
  super({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
  scope: ['public_profile'],  // bỏ 'email'
  profileFields: ['id', 'displayName', 'photos'],   
})
  }

 async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
  done(null, {
    email: `fb_${profile.id}@facebook.com`, // fake email vì không lấy được
    fullName: profile.displayName,
    avatar: profile.photos?.[0]?.value,
    provider: 'facebook',
  })
}
}