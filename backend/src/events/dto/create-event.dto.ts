import { IsNotEmpty, IsOptional, IsString, IsInt, IsObject, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsOptional()
  @IsString()
  status?: string; // defaults to "Pending" in DB

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxResaleCount?: number; // defaults to 3

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceCap?: number; // defaults to 120

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsObject()
  seatLayout?: Record<string, any>;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  contractAddress?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  organizerId: number;
}
