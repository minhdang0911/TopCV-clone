import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'photos', 'emails'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    const email = profile.emails?.[0]?.value ?? `fb_${profile.id}@noemail.com`;

    done(null, {
      email,
      fullName: profile.displayName,
      avatar: profile.photos?.[0]?.value,
      provider: 'facebook',
    });
  }
}
