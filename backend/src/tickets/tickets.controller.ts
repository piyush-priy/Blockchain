import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateOwnerDto, ConfirmBurnDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import type { Request } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @UseGuards(JwtAuthGuard)
  @Get('my-tickets')
  async getMyTickets(@Req() req: Request) {
    const user = req.user as any;
    if (!user?.wallet)
      throw new BadRequestException('User wallet address not found.');
    return this.ticketsService.getTicketsByWallet(user.wallet);
  }

  @Post()
  async createTicket(@Body() dto: CreateTicketDto) {
    if (!dto.tokenId || !dto.eventId || !dto.metadataUri || !dto.ownerWallet)
      throw new BadRequestException('Missing required fields.');
    return this.ticketsService.createTicket(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':tokenId/mark-used')
  async markTicketUsed(@Param('tokenId') tokenId: number) {
    return this.ticketsService.markTicketUsed(tokenId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':tokenId/:contractAddress/status')
  async getTicketStatus(
    @Param('tokenId') tokenId: number,
    @Param('contractAddress') contractAddress: string,
  ) {
    return this.ticketsService.getTicketStatus(tokenId, contractAddress);
  }

  @Get('/metadata/:tokenId/:contractAddress')
  async getTicketMetadata(
    @Param('tokenId') tokenId: number,
    @Param('contractAddress') contractAddress: string,
  ) {
    return this.ticketsService.getTicketMetadata(tokenId, contractAddress);
  }


  @UseGuards(JwtAuthGuard)
  @Patch('update-owner')
  @HttpCode(HttpStatus.OK)
  async updateOwner(@Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ticketsService.updateTicketOwner(updateOwnerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer', 'admin')
  @Post('validate-burn')
  @HttpCode(HttpStatus.OK)
  async validateTicketForBurn(@Body('tokenId') tokenId: number, @Body('contractAddress') contractAddress: string, @Req() req: Request) {
    if (tokenId === undefined || !contractAddress) {
      throw new BadRequestException('tokenId and contractAddress are required.');
    }
    const user = req.user as any;

    const validationResult = await this.ticketsService.validateTicketForBurn(
      tokenId,
      contractAddress,
      user.id
    );

    // If validation passes, return success. Frontend will then call the contract.
    return { message: 'Ticket is valid for burning.' }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer', 'admin')
  @Post('confirm-burn')
  @HttpCode(HttpStatus.OK)
  async confirmBurn(@Body() confirmBurnDto: ConfirmBurnDto) {
    return this.ticketsService.confirmTicketBurn(confirmBurnDto);
  }

}