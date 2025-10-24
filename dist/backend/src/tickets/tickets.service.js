"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let TicketsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TicketsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TicketsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getTicketsByWallet(wallet) {
            try {
                const tickets = this.prisma.tickets.findMany({
                    where: { ownerWallet: wallet.toLowerCase() },
                    include: {
                        event: true,
                    },
                });
                return tickets;
            }
            catch (err) {
                throw new common_1.InternalServerErrorException('Failed to fetch user tickets.');
            }
        }
        async createTicket(dto) {
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
            }
            catch (err) {
                if (err instanceof library_1.PrismaClientKnownRequestError) {
                    // Example: Unique constraint violation
                    if (err.code === 'P2002') {
                        throw new common_1.BadRequestException('Ticket with this tokenId already exists.');
                    }
                }
                throw new common_1.InternalServerErrorException('Internal server error');
            }
        }
        //Get single ticket using tokenId
        async getTicketByTokenId(tokenId) {
            try {
                const ticket = await this.prisma.tickets.findUnique({ where: { tokenId } });
                if (!ticket)
                    throw new common_1.NotFoundException('Ticket not found.');
                return ticket;
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                throw new common_1.InternalServerErrorException('Failed to get ticket.');
            }
        }
        //Mark ticket as used (Only for Admin)
        async markTicketUsed(tokenId) {
            try {
                const ticket = await this.prisma.tickets.findUnique({ where: { tokenId } });
                if (!ticket)
                    throw new common_1.NotFoundException('Ticket not found.');
                if (ticket.status === 'used')
                    throw new common_1.BadRequestException('Ticket has already been used.');
                const ticketstatus = await this.prisma.tickets.update({
                    where: { tokenId },
                    data: { status: 'used' },
                });
                return {
                    message: 'Ticket marked as used successfully.',
                    ticket: ticketstatus,
                };
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException || err instanceof common_1.NotFoundException) {
                    throw err;
                }
                throw new common_1.InternalServerErrorException('Failed to mark ticket as used.');
            }
        }
        //Get ticket status (used/unused) to prevent resale
        async getTicketStatus(tokenId, contractAddress) {
            try {
                const ticket = await this.prisma.tickets.findFirst({
                    where: {
                        tokenId,
                        event: { contractAddress: contractAddress.toLowerCase() },
                    },
                    select: { status: true },
                });
                if (!ticket)
                    throw new common_1.NotFoundException('Ticket not found for given contract.');
                return { status: ticket.status };
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                throw new common_1.InternalServerErrorException('Failed to fetch ticket status.');
            }
        }
        //Get metadata for NFT ticket
        async getTicketMetadata(tokenId, contractAddress) {
            try {
                const ticket = await this.prisma.tickets.findFirst({
                    where: {
                        tokenId,
                        event: { contractAddress: contractAddress },
                    },
                    include: { event: true },
                });
                if (!ticket)
                    throw new common_1.NotFoundException('Ticket not found for this event.');
                const e = ticket.event;
                return {
                    name: `Ticket for ${e.name} - #${ticket.tokenId}`,
                    description: `This NFT is a ticket for ${e.name} at ${e.venue} on ${e.date}.`,
                    image: 'https://via.placeholder.com/500/FF0000/FFFFFF?text=EVENT+TICKET',
                    attributes: [
                        { trait_type: 'Event', value: e.name },
                        { trait_type: 'Date', value: e.date },
                        { trait_type: 'Venue', value: e.venue },
                    ],
                };
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                throw new common_1.InternalServerErrorException('Failed to fetch ticket metadata.');
            }
        }
        // Update ticket owner after transfer on blockchain from frontend
        async updateTicketOwner(dto) {
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
            }
            catch (err) {
                console.error("Error updating ticket owner in DB:", err);
                // Don't throw an error to the frontend if the DB update fails,
                // as the on-chain transfer already succeeded. Log it.
                return { message: 'On-chain transfer successful, but failed to update local database owner.' };
            }
        }
        // Validate ticket for burning before allowing burn on blockchain
        async validateTicketForBurn(tokenId, contractAddress, requestingUserId) {
            try {
                const ticket = await this.prisma.tickets.findFirst({
                    where: {
                        tokenId,
                        event: { contractAddress: contractAddress },
                    },
                    include: {
                        event: true,
                    },
                });
                if (!ticket) {
                    throw new common_1.NotFoundException('Ticket not found for this event contract.');
                }
                // Security Check: Is the person scanning the ticket the organizer of this event?
                if (ticket.event.organizerId !== requestingUserId) {
                    throw new common_1.ForbiddenException('You are not authorized to burn tickets for this event.');
                }
                if (ticket.status === 'used') {
                    throw new common_1.BadRequestException('Ticket has already been used/burned.');
                }
                // If all checks pass, return true or some success indicator
                return true;
            }
            catch (err) {
                // Re-throw specific exceptions
                if (err instanceof common_1.NotFoundException || err instanceof common_1.BadRequestException || err instanceof common_1.ForbiddenException) {
                    throw err;
                }
                // Log unexpected errors
                console.error("Error validating ticket for burn:", err);
                throw new common_1.InternalServerErrorException('Failed to validate ticket.');
            }
        }
        // Confirm ticket burn after successful blockchain transaction
        async confirmTicketBurn(dto) {
            try {
                // Find the specific ticket using tokenId AND the event's contractAddress
                const ticket = await this.prisma.tickets.findFirst({
                    where: {
                        tokenId: dto.tokenId,
                        event: { contractAddress: dto.contractAddress },
                    },
                });
                if (!ticket) {
                    throw new common_1.NotFoundException('Ticket not found for the specified event contract.');
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
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException) {
                    throw err;
                }
                console.error("Error confirming ticket burn:", err);
                throw new common_1.InternalServerErrorException('Failed to confirm ticket burn status.');
            }
        }
    };
    return TicketsService = _classThis;
})();
exports.TicketsService = TicketsService;
