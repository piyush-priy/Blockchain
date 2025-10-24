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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let EventsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EventsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EventsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        //Create Event
        async createEvent(dto, organizerId) {
            try {
                const seatLayoutJSON = typeof dto.seatLayout === 'object'
                    ? JSON.stringify(dto.seatLayout)
                    : dto.seatLayout;
                return await this.prisma.events.create({
                    data: {
                        organizerId, // matches Prisma schema
                        name: dto.name.trim(),
                        date: new Date(dto.date), // DateTime type in schema
                        venue: dto.venue.trim(),
                        status: dto.status ?? 'Pending', // optional field with default in DB
                        maxResaleCount: dto.maxResaleCount ?? 3,
                        priceCap: dto.priceCap ?? 120,
                        description: dto.description?.trim(),
                        posterUrl: dto.posterUrl?.trim(),
                        seatLayout: seatLayoutJSON,
                        type: dto.type?.trim(),
                        contractAddress: dto.contractAddress?.trim() || null,
                    },
                });
            }
            catch (err) {
                if (err instanceof library_1.PrismaClientKnownRequestError) {
                    if (err.code === 'P2002') {
                        throw new common_1.ConflictException('An event with this name or ID already exists.');
                    }
                }
                throw new common_1.InternalServerErrorException('Failed to create event: ' + err.message);
            }
        }
        //Get All Events
        async getAllEvents() {
            try {
                const events = await this.prisma.events.findMany();
                if (!events.length) {
                    return { events: [], message: 'No events found.' };
                }
                return {
                    events: events.map((event) => ({
                        ...event,
                        seatLayout: this.safeParseJSON(event.seatLayout),
                        unavailableSeats: [],
                    })),
                };
            }
            catch (err) {
                throw new common_1.InternalServerErrorException('Failed to fetch events: ' + err.message);
            }
        }
        //Get events hosted by an organizer
        async getEventsByOrganizer(organizerId) {
            try {
                const events = await this.prisma.events.findMany({
                    where: {
                        organizerId: organizerId,
                    },
                    orderBy: {
                        date: 'desc',
                    }
                });
                // Return an empty array if no events are found
                if (!events.length) {
                    return [];
                }
                // Return events with parsed seatLayout, just like in getAllEvents
                return events.map((event) => ({
                    ...event,
                    seatLayout: this.safeParseJSON(event.seatLayout),
                }));
            }
            catch (err) {
                console.error('Failed to fetch organizer events:', err);
                throw new common_1.InternalServerErrorException('Failed to fetch organizer events.');
            }
        }
        // Update Event
        async updateEvent(id, dto) {
            try {
                const existing = await this.prisma.events.findUnique({ where: { id } });
                if (!existing) {
                    throw new common_1.NotFoundException('Event not found.');
                }
                const seatLayoutJSON = typeof dto.seatLayout === 'object'
                    ? JSON.stringify(dto.seatLayout)
                    : dto.seatLayout;
                await this.prisma.events.update({
                    where: { id },
                    data: {
                        name: dto.name ?? existing.name,
                        date: dto.date ?? existing.date,
                        venue: dto.venue ?? existing.venue,
                        description: dto.description ?? existing.description,
                        posterUrl: dto.posterUrl ?? existing.posterUrl,
                        seatLayout: seatLayoutJSON ?? existing.seatLayout,
                        type: dto.type ?? existing.type,
                        maxResaleCount: dto.maxResaleCount ?? existing.maxResaleCount,
                        priceCap: dto.priceCap ?? existing.priceCap,
                    },
                });
                return {
                    message: 'Event updated successfully.',
                };
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                throw new common_1.InternalServerErrorException('Failed to update event: ' + err.message);
            }
        }
        //Get unavailable seats for an event
        async getUnavailableSeats(eventId) {
            try {
                const tickets = await this.prisma.tickets.findMany({
                    where: {
                        eventId: eventId,
                    },
                    select: {
                        seatIdentifier: true,
                    },
                });
                // Extract the seat identifiers into a simple array of strings
                // Filter out any potential null/empty values just in case
                const unavailableSeats = tickets
                    .map(ticket => ticket.seatIdentifier)
                    .filter((seatId) => !!seatId);
                return { unavailableSeats };
            }
            catch (err) {
                console.error(`Failed to fetch unavailable seats for event ${eventId}:`, err);
                return [];
            }
        }
        //Delete Event
        async deleteEvent(id) {
            try {
                const deleted = await this.prisma.events.deleteMany({ where: { id } });
                if (deleted.count === 0) {
                    throw new common_1.NotFoundException('Event not found.');
                }
                return {
                    message: 'Event deleted successfully.',
                };
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                throw new common_1.InternalServerErrorException('Failed to delete event: ' + err.message);
            }
        }
        //Update event status (ADMIN only service)
        async updateStatus(id, status) {
            try {
                const event = await this.prisma.events.findUnique({ where: { id } });
                if (!event)
                    throw new common_1.NotFoundException('Event not found.');
                await this.prisma.events.update({
                    where: { id },
                    data: { status },
                });
                return { message: `Event ${id} status updated to ${status}.` };
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                throw new common_1.InternalServerErrorException('Failed to update event status: ' + err.message);
            }
        }
        //Get sales stats
        async getSales(id) {
            try {
                const event = await this.prisma.events.findUnique({ where: { id } });
                if (!event)
                    throw new common_1.NotFoundException('Event not found.');
                const result = await this.prisma.tickets.aggregate({
                    _count: { id: true },
                    _sum: { purchasePrice: true },
                    where: { eventId: id },
                });
                return {
                    ticketsMinted: result._count.id || 0,
                    primarySalesRevenue: result._sum.purchasePrice || 0,
                };
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                throw new common_1.InternalServerErrorException('Failed to calculate sales: ' + err.message);
            }
        }
        //Helper Function to safely parse JSON
        safeParseJSON(json) {
            if (!json)
                return {};
            try {
                return JSON.parse(json);
            }
            catch {
                return {};
            }
        }
    };
    return EventsService = _classThis;
})();
exports.EventsService = EventsService;
