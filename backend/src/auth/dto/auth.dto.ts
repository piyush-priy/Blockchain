import { IsEmail, IsNotEmpty, IsOptional, IsEthereumAddress, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Password is too short. Minimum length is 4 characters.' })
    password: string;

    @IsString()
    @IsNotEmpty()
    role: string;

    @IsString()
    @IsOptional()
    walletAddress: string;

}

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}

export class UpdateWalletDto {
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress() // Strongly recommended to validate the address format
  walletAddress: string;
  
}