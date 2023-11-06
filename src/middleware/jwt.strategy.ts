import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from 'src/users/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Users.name)
    private userModel: Model<Users>

  ) {

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'mysercetkey',//change secret key
    })
  }


  async validate(payload: any) {
    const user = await this.userModel.findOne({ user_id: payload.user_id } )
    if (!user)
      throw new UnauthorizedException('User not found');

    return {
      userId: payload.user_id,
      role: payload.role,
    };
  }
}