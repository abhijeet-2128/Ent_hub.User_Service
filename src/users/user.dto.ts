import { IsEmail, IsString } from 'class-validator';

export class UserSignupDto {
 name: string;
 email: string;
 password: string;
 preferences: string[];
 dietary_restrictions: string[];
 viewing_habits: string[];
 subscription_status: string;
}

export class UserLoginDto {
    @IsEmail()
    email: string;
  
    @IsString()
    password: string;
}
