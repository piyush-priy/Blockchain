import { IsNotEmpty, IsNumber, IsString, IsEthereumAddress } from 'class-validator';
import { Type } from 'class-transformer';

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