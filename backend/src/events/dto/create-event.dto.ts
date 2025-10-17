import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  posterUrl: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  seatLayout?: any;

  @IsOptional()
  @IsInt()
  maxResaleCount?: number;

  @IsOptional()
  @IsInt()
  priceCap?: number;
}
