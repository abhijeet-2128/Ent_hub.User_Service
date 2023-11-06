import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Users } from "./user.model";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "./user.dto";
import { TokenRequest, TokenResponse } from "src/proto/user/user";
import { JwtService } from './service/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private userModel: mongoose.Model<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(userSignup: CreateUserDto) {
    const { name, email, password, preferences,
      dietary_restrictions,
      viewing_habits,
      subscription_status } = userSignup;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      preferences,
      dietary_restrictions,
      viewing_habits,
      subscription_status
    });
    const result = await newUser.save();
    return result;
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }
  
  async findByUserId(userId: string) {
    const user = await this.userModel.findOne({ _id: userId }); // Assuming '_id' is the field for the user ID
    return user;
  }


  public async validate({ token }: TokenRequest): Promise<TokenResponse> {
    const decoded: TokenResponse = await this.jwtService.verify(token);
    console.log(decoded);
    
    if (!decoded) {
      return { isValid: false,  userId: null };
    }
    const auth: any = await this.jwtService.validateUser(decoded);
    if (!auth) {
      return { isValid: false,  userId: null };
    }
    return { isValid: true, userId: decoded.userId };
  }
}