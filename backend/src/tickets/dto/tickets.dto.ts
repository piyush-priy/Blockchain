import { IsNotEmpty, IsNumber, IsString, IsEthereumAddress } from 'class-validator';
import { Type } from 'class-transformer';


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


export class ConfirmBurnDto {
  @IsNotEmpty()
  @Type(() => Number) // Transform incoming value to number
  @IsNumber()
  tokenId: number;

  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress() // Validate it's a valid ETH address
  contractAddress: string;
}


export class UpdateOwnerDto {
  @IsNotEmpty()
  @Type(() => Number) // Ensure tokenId is treated as a number
  @IsNumber()
  tokenId: number;

  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress() // Validate ETH address format
  contractAddress: string;

  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress() // Validate ETH address format
  newOwnerWallet: string;
}