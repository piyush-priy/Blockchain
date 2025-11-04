import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto, ConfirmBurnDto, UpdateOwnerDto } from './dto';


@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    async getTicketsByWallet(wallet: string) {
        try {
            const tickets = this.prisma.tickets.findMany({
                where: { ownerWallet: wallet.toLowerCase() },
                include: {
                    event: true,
                },
            });
            return tickets;
        } catch (err) {
            throw new InternalServerErrorException('Failed to fetch user tickets.');
        }

    }


    async createTicket(dto: CreateTicketDto) {
        try {
            return await this.prisma.tickets.create({
                data: {
                    tokenId: dto.tokenId,
                    eventId: dto.eventId,
                    metadataUri: dto.metadataUri,
                    ownerWallet: dto.ownerWallet.toLowerCase(),
                    purchasePrice: dto.purchasePrice,
                    seatIdentifier: dto.seatInfo,
                },
            });
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                // Example: Unique constraint violation
                if (err.code === 'P2002') {
                    throw new BadRequestException('Ticket with this tokenId already exists.');
                }
            }
            throw new InternalServerErrorException('Internal server error');
        }

    }

    //Get single ticket using tokenId
    async getTicketByTokenId(tokenId: number) {
        try {
            const ticket = await this.prisma.tickets.findUnique({ where: { tokenId } });
            if (!ticket) throw new NotFoundException('Ticket not found.');
            return ticket;
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to get ticket.');
        }

    }


    //Mark ticket as used (Only for Admin)
    async markTicketUsed(tokenId: number) {
        try {
            const ticket = await this.prisma.tickets.findUnique({ where: { tokenId } });
            if (!ticket) throw new NotFoundException('Ticket not found.');
            if (ticket.status === 'used')
                throw new BadRequestException('Ticket has already been used.');

            const ticketstatus = await this.prisma.tickets.update({
                where: { tokenId },
                data: { status: 'used' },
            });
            return {
                message: 'Ticket marked as used successfully.',
                ticket: ticketstatus,
            }

        } catch (err) {
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to mark ticket as used.');
        }

    }


    //Get ticket status (used/unused) to prevent resale
    async getTicketStatus(tokenId: number, contractAddress: string) {
        try {
            const ticket = await this.prisma.tickets.findFirst({
                where: {
                    tokenId,
                    event: { contractAddress: contractAddress },
                },
                select: { status: true },
            });

            if (!ticket) throw new NotFoundException('Ticket not found for given contract.');
            return { status: ticket.status };
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to fetch ticket status.');
        }

    }


    //Get metadata for NFT ticket
    async getTicketMetadata(tokenId: number, contractAddress: string) {
        try {
            const ticket = await this.prisma.tickets.findFirst({
                where: {
                    tokenId,
                    event: { contractAddress: contractAddress },
                },
                include: { event: true },
            });

            if (!ticket) throw new NotFoundException('Ticket not found for this event.');

            const e = ticket.event;
            return {
                name: `Ticket for ${e.name} - #${ticket.tokenId}`,
                description: `This NFT is a ticket for ${e.name} at ${e.venue} on ${e.date}.`,
                image:
                    e.posterUrl,
                attributes: [
                    { trait_type: 'Event', value: e.name },
                    { trait_type: 'Date', value: e.date },
                    { trait_type: 'Venue', value: e.venue },
                ],
            };
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to fetch ticket metadata.');
        }

    }


    // Update ticket owner after transfer on blockchain from frontend
    async updateTicketOwner(dto: UpdateOwnerDto) {
        try {
            // Find the specific ticket using tokenId AND the event's contractAddress
            const ticket = await this.prisma.tickets.findFirst({
                where: {
                    tokenId: dto.tokenId,
                    event: { contractAddress: dto.contractAddress },
                },
                select: { id: true }
            });

            if (!ticket) {
                // Important: Don't throw an error if not found.
                // It's possible the ticket was minted outside the app
                // and doesn't exist in our DB. Log it instead.
                console.warn(`Ticket (TokenID: ${dto.tokenId}, Contract: ${dto.contractAddress}) not found in DB during owner update.`);
                return { message: 'Ticket not found in local database, but ownership likely updated on-chain.' };
            }

            // Update the ownerWallet in the database
            await this.prisma.tickets.update({
                where: {
                    id: ticket.id, // Use the primary key
                },
                data: { ownerWallet: dto.newOwnerWallet.toLowerCase() },
            });

            return { message: `Ticket ${dto.tokenId} owner updated in database.` };

        } catch (err) {
            console.error("Error updating ticket owner in DB:", err);
            // Don't throw an error to the frontend if the DB update fails,
            // as the on-chain transfer already succeeded. Log it.
            return { message: 'On-chain transfer successful, but failed to update local database owner.' };
        }
    }


    // Validate ticket for burning before allowing burn on blockchain
    async validateTicketForBurn(tokenId: number, contractAddress: string, requestingUserId: number) {
        try {
            const ticket = await this.prisma.tickets.findFirst({
                where: {
                    tokenId,
                    event: { contractAddress: contractAddress },
                },
                include: { // Include event data to check the organizer
                    event: true,
                },
            });

            if (!ticket) {
                throw new NotFoundException('Ticket not found for this event contract.');
            }

            // Security Check: Is the person scanning the ticket the organizer of this event?
            if (ticket.event.organizerId !== requestingUserId) {
                throw new ForbiddenException('You are not authorized to burn tickets for this event.');
            }

            if (ticket.status === 'used') {
                throw new BadRequestException('Ticket has already been used/burned.');
            }

            // If all checks pass, return true or some success indicator
            return true;

        } catch (err) {
            // Re-throw specific exceptions
            if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof ForbiddenException) {
                throw err;
            }
            // Log unexpected errors
            console.error("Error validating ticket for burn:", err);
            throw new InternalServerErrorException('Failed to validate ticket.');
        }
    }

    // Confirm ticket burn after successful blockchain transaction
    async confirmTicketBurn(dto: ConfirmBurnDto) {
        try {
            // Find the specific ticket using tokenId AND the event's contractAddress
            const ticket = await this.prisma.tickets.findFirst({
                where: {
                    tokenId: dto.tokenId,
                    event: { contractAddress: dto.contractAddress },
                },
            });

            if (!ticket) {
                throw new NotFoundException('Ticket not found for the specified event contract.');
            }

            // Update the status only if it's not already 'used'
            if (ticket.status === 'used') {
                // Return success even if already marked, avoids unnecessary errors
                return { message: 'Ticket status already confirmed as used.' };
            }

            await this.prisma.tickets.update({
                where: {
                    // Use the unique ticket ID (primary key) for the update
                    id: ticket.id,
                },
                data: { status: 'used' },
            });

            return { message: `Ticket ${dto.tokenId} status confirmed as 'used'.` };

        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            console.error("Error confirming ticket burn:", err);
            throw new InternalServerErrorException('Failed to confirm ticket burn status.');
        }

    }


}