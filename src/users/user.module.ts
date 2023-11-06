import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.model';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './service/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema }
    ]),
    JwtModule.register({
      secret: 'mysercetkey',
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  controllers: [UsersController],
  providers: [UserService,JwtService]
})
export class UserModule{}