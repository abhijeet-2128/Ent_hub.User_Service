import { IsString, IsEmail, IsAlphanumeric, IsArray, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;
    @IsEmail()
    email: string;
    @IsAlphanumeric()
    password: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    preferences: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    dietary_restrictions: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    viewing_habits: string[];

    @IsEnum(['active', 'inactive'])
    @IsOptional()
    subscription_status: string;
}

export class LoginUserDto {
    @IsEmail()
    email: string;
  
    @IsString()
    password: string;
}
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString({ each: true })
    preferences?: string[];
  
    @IsOptional()
    @IsString({ each: true })
    dietary_restrictions?: string[];
  
    @IsOptional()
    @IsString({ each: true })
    viewing_habits?: string[];
  
    @IsOptional()
    @IsEnum(['customer', 'admin'])
    role?: string;
  
    @IsOptional()
    @IsEnum(['active', 'inactive', 'suspended'])
    subscription_status?: string;
  }