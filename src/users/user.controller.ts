import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { JwtService } from '../middleware/jwt.service';
import { GrpcMethod } from '@nestjs/microservices';
import { USER_SERVICE_NAME, TokenRequest, TokenResponse, UserInfoRequest, UserInfoResponse } from 'src/proto/user/user';
import { JwtAuthGuard } from 'src/middleware/jwt.auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }
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
      const token = this.jwtService.generateToken(payload);

      this.userService.createUserSession(user._id);

      res.status(HttpStatus.OK).json({
        message: 'Login successful',
        token: token,
      });
    } catch (error) {
      console.error(error); 
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Login failed',
        error: error.message, 
      });
    }
  }

  @GrpcMethod(USER_SERVICE_NAME, 'validate')
  private validate(payload: TokenRequest): Promise<TokenResponse> {
    console.log(payload);
    return this.userService.validate(payload);
  }

  @GrpcMethod(USER_SERVICE_NAME, 'getUser')
  private getUser(payload: UserInfoRequest): Promise<UserInfoResponse> {
    console.log(payload);
    return this.userService.getUser(payload);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req,) {
    const userId = req.user;
    const profile_details = await this.userService.getUserProfile(userId);
    return { profile_details }
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile( @Body() updatedProfile:UpdateUserDto, @Req() req,@Res() res) {
    try {
      const userId = req.user;
      const user = await this.userService.findByUserId(userId);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'User not found',
        });
      }
      if (updatedProfile.name) {
        user.name = updatedProfile.name;
      }

      if (updatedProfile.email) {
        user.email = updatedProfile.email;
      }

      if (updatedProfile.preferences) {
        user.preferences = updatedProfile.preferences;
      }

      if (updatedProfile.dietary_restrictions) {
        user.dietary_restrictions = updatedProfile.dietary_restrictions;
      }

      if (updatedProfile.viewing_habits) {
        user.viewing_habits = updatedProfile.viewing_habits;
      }

      if (updatedProfile.role) {
        user.role = updatedProfile.role;
      }

      if (updatedProfile.subscription_status) {
        user.subscription_status = updatedProfile.subscription_status;
      }

      // Save the updated user profile
      const updatedUser = await this.userService.updateUserProfile(user);

      res.status(HttpStatus.OK).json({
        message: 'User profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update user profile',
        error: error.message,
      });
    }
  }


  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteUserProfile(@Req() req, @Res() res) {
    try {
      const userId = req.user;

      // Soft delete user (set isActive to false or similar)
      const deletedUser = await this.userService.deleteUser(userId);

      if (!deletedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'User not found',
        });
      }

      res.status(HttpStatus.OK).json({
        message: 'User profile deleted successfully',
        user: deletedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to delete user profile',
        error: error.message,
      });
    }
  }

  
}

