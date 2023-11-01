import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserLoginDto, UserSignupDto } from "./user.dto";
import { InjectModel } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Users } from "./user.model";
import { JwtService } from '@nestjs/jwt';
import { access } from "fs";
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private userModel: mongoose.Model<Users>,
  ) {}

  async signup(userSignup: UserSignupDto) {
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

  // async findAll(): Promise<Users[]> {
  //   const users = await this.userModel.find();
  //   return users;
  // }

  // async validateUser(email: string, password: string) {
  //   const user = await this.userModel.findOne({ email });
  //   if (user && user.password === password)
  //     return user;
  // }

}