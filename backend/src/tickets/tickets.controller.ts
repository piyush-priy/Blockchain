import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import type { Request } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

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
}
