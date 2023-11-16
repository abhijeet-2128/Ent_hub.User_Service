import {  Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Users } from "./entity/user.model";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "./dto/user.dto";
import { TokenRequest, TokenResponse, UserInfoRequest, UserInfoResponse } from "src/proto/user/user";
import { JwtService } from '../middleware/jwt.service';
import { Model } from "mongoose";
import { Sessions } from "./entity/session.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private userModel: Model<Users>,
    @InjectModel(Sessions.name) private readonly userSessionModel: Model<Sessions>,
    private readonly jwtService: JwtService,

  ) { }


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
      return { isValid: false, userId: null };
    }
    const auth: any = this.userModel.findById(decoded.userId);
    if (!auth) {
      return { isValid: false, userId: null };
    }
    return { isValid: true, userId: decoded.userId };
  }

  async getUser({ userId }: UserInfoRequest): Promise<UserInfoResponse> {
    const user = await this.userModel.findOne({ _id: userId });
    return { name: user.name, email: user.email };
  }

  async getUserProfile(userId:string) {
    const data = await this.userModel.findOne({ _id: userId, isActive: true });
    if (!data) {
      throw new NotFoundException('User profile not found');
    }
    return data;
  }


  public async validateToken( token : string): Promise<any> {
    const decoded: any = await this.jwtService.verify(token);
    if (!decoded) {
      return { userId: null };
    }
    const auth: any = this.userModel.findById(decoded.userId);
    if (!auth) {
      return { userId: null };
    }
    return { userId: decoded.userId };
  }

  async updateUserProfile(user:any): Promise<any> {
    const updatedUser = await this.userModel.findByIdAndUpdate(user._id, user, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async createUserSession(userId){
    const userSession = new this.userSessionModel({
      userId
    });

    await userSession.save();
  }

  async deleteUser(userId: string): Promise<Users> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    await user.save();

    return user;
  }

  async isUserActive(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    return user ? user.isActive : false;
  }
  
}