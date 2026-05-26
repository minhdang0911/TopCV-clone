import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-oauth2'
import axios from 'axios'

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL!,
      scope: ['openid', 'profile', 'email'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { data } = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    done(null, {
      email: data.email,
      fullName: data.name,
      avatar: data.picture,
      provider: 'linkedin',
    })
  }
}