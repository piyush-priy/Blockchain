import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class EventsService {
    constructor(private prisma : PrismaService) {}

    //Create Event
    async createEvent(dto: CreateEventDto) {
        try {
            const seatLayoutJSON =
                typeof dto.seatLayout === 'object'
                ? JSON.stringify(dto.seatLayout)
                : dto.seatLayout;

            return await this.prisma.events.create({
                data: {
                    name: dto.name.trim(),
                    date: dto.date,
                    venue: dto.venue.trim(),
                    maxResaleCount: dto.maxResaleCount ?? 3,
                    priceCap: dto.priceCap ?? 120,
                    description: dto.description,
                    posterUrl: dto.posterUrl,
                    seatLayout: seatLayoutJSON,
                    type: dto.type,
                },
            });
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                // Handle known Prisma constraint errors
                if (err.code === 'P2002') {
                    throw new ConflictException('An event with this name or ID already exists.');
                }
            }
            throw new InternalServerErrorException('Failed to create event: ' + err.message);
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
        } catch (err) {
            throw new InternalServerErrorException('Failed to fetch events: ' + err.message);
        }
    }


    // Update Event
    async updateEvent(id : number, dto : UpdateEventDto) {
        try {
            const existing = await this.prisma.events.findUnique({ where: { id } });
            if (!existing) {
                throw new NotFoundException('Event not found.');
            }

            const seatLayoutJSON =
                typeof dto.seatLayout === 'object'
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
                message : 'Event updated successfully.',
            };
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to update event: ' + err.message);
        }

    }


    //Delete Event
    async deleteEvent (id : number) {
        try {
            const deleted = await this.prisma.events.deleteMany({ where: { id } });
            if (deleted.count === 0) {
                throw new NotFoundException('Event not found.');
            }
            return {
                message : 'Event deleted successfully.',
            };
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to delete event: ' + err.message);
        }

    }


    //Update event status (ADMIN only service)
    async updateStatus(id : number, status : string) {
        try {
            const event = await this.prisma.events.findUnique({ where: { id } });
            if (!event) throw new NotFoundException('Event not found.');

            await this.prisma.events.update({
                where: { id },
                data: { status },
            });

            return { message: `Event ${id} status updated to ${status}.` };
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to update event status: ' + err.message);
        }

    }


    //Get sales stats
    async getSales(id : number) {
        try {
            const event = await this.prisma.events.findUnique({ where: { id } });
            if (!event) throw new NotFoundException('Event not found.');

            const result = await this.prisma.tickets.aggregate({
                _count: { id: true },
                _sum: { purchasePrice: true },
                where: { eventId: id },
            });

            return {
                ticketsMinted: result._count.id || 0,
                primarySalesRevenue: result._sum.purchasePrice || 0,
            };
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to calculate sales: ' + err.message);
        }

    }


    //Helper Function to safely parse JSON
    private safeParseJSON(json: string | null) {
        if (!json) return {};
        try {
            return JSON.parse(json);
        } catch {
            return {};
        }
    }









}
