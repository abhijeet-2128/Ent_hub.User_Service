import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './user.dto';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { Users } from './user.model';
import { InjectModel } from '@nestjs/mongoose';
import { GrpcMethod } from '@nestjs/microservices'; 
import { USER_SERVICE_NAME, TokenRequest, TokenResponse } from 'src/proto/user/user';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(Users.name) private userModel: mongoose.Model<Users>,
  ) {}
  @Post('signup')
  async signupUser(@Body() userSignUp: CreateUserDto, @Res() res) {
    try {
      const existingUser = await this.userService.findByEmail(userSignUp.email);
      if (existingUser) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'User with the same email already exists',
        });
      }
      const user = await this.userService.signup(userSignUp);

      // if the registration is success
      res.status(HttpStatus.CREATED).json({
        message: 'User registration successful',
        user,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'User registration failed',
        error,
      });
    }

  }
  
  @Post('login')
  async loginUser(@Body() userLogin: LoginUserDto, @Res() res) {
    try {
      const user = await this.userService.findByEmail(userLogin.email);

      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'User not found',
        });
      }

      const isPasswordValid = await this.userService.comparePasswords(
        userLogin.password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid password',
        });
      }

      const payload = { userId: user.id, role: user.role };
      const token = this.jwtService.sign(payload);

      res.status(HttpStatus.OK).json({
        message: 'Login successful',
        user,
        token: token,
      });
    } catch (error) {
      console.error(error); // Log the error to the console
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Login failed',
        error: error.message, // Include the error message in the response
      });
    }
  }
  @GrpcMethod(USER_SERVICE_NAME, 'validate') // Use the decorator correctly
  private validate(payload: TokenRequest): Promise<TokenResponse> {
    console.log(payload);
    return this.userService.validate(payload);
  }
}

