import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import  { Type } from 'class-transformer';

export class CreateTicketDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  tokenId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  eventId: number;

  @IsNotEmpty()
  @IsString()
  metadataUri: string;

  @IsNotEmpty()
  @IsString()
  ownerWallet: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  purchasePrice: number;

  @IsNotEmpty()
  @IsString()
  seatInfo: string;
}
