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
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_long_and_super_strong_jwt_secret_key'),
    });
  }

  async validate(payload: any) {
    // payload: { id, email, role, wallet }
    if (!payload || !payload.id || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid JWT token payload.');
    }

    // Return the user info that will be attached to req.user
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      wallet: payload.wallet ?? null,
    };
  }
}
