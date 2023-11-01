import { Body, Controller, HttpStatus, Post, Res, UnauthorizedException } from '@nestjs/common';
import { UserLoginDto, UserSignupDto } from './user.dto';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService //injecting jwtservice
    ) { }

    @Post('signup')
    async signupUser(@Body() userSignUp: UserSignupDto, @Res() res) {
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
    async loginUser(@Body() userLogin: UserLoginDto, @Res() res) {
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
  
        const payload = { sub: user.id ,role: user.role}; 
        const token = this.jwtService.sign(payload);
        res.status(HttpStatus.OK).json({
          message: 'Login successful',
          user,
          token: token, 
        });
      } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Login failed',
          error,
        });
      }
    }


}