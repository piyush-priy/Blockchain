import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // payload: { id, email, role, wallet }
    if (!payload || !payload.id || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid JWT token payload.');
    }

    // console.log('JWT Payload:', payload);
    //
    // Return the user info that will be attached to req.user
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      wallet: payload.wallet ?? null,
    };
  }
}
