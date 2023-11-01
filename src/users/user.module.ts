import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.model';
import { JwtModule } from '@nestjs/jwt';
// import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema }
    ]),
    JwtModule.register({
      secret: 'your-secret-key', // Replace with your secret key
      signOptions: { expiresIn: '1h' }, // Token expiration time
    }),
  ],
  controllers: [UsersController],
  providers: [UserService],
})
export class UserModule{}