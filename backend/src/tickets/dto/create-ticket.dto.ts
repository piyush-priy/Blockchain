import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsNumber()
  tokenId: number;

  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @IsNotEmpty()
  @IsString()
  metadataUri: string;

  @IsNotEmpty()
  @IsString()
  ownerWallet: string;

  @IsNotEmpty()
  @IsNumber()
  purchasePrice: number;
}
