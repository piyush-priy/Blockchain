import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // --- Create Event (Organizer Only) ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('organizer')
  @Post()
  async createEvent(@Body() dto: CreateEventDto, @Req() req: any) {
    if (!dto.name || !dto.date || !dto.venue || !dto.type || !dto.description || !dto.posterUrl) {
      throw new BadRequestException(
        'Missing required fields: name, date, venue, type, description, posterUrl.'
      );
    }
    const organizerId = req.user.id;
    console.log('Creating event for organizer ID:', organizerId);
    return this.eventsService.createEvent(dto, organizerId);
  }


  // --- Get All Events ---
  @Get()
  async getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  
  // --- Get Event by ID ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Get('organizer/:id')
  async getOrganizerEvents(@Param('id') id: string, @Req() req: any) {
    const organizerIdParam = +id;
    const requestingUserId = req.user.id;

    // --- Security Check ---
    // Make sure the logged-in user is not trying to access another organizer's events
    if (organizerIdParam !== requestingUserId) {
      throw new ForbiddenException("You are not authorized to view these events.");
    }

    return this.eventsService.getEventsByOrganizer(requestingUserId);
  }


  // --- Update Event (Organizer Only) ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Put(':id')
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.updateEvent(+id, dto);
  }


  // --- Get Unavailable Seats for Event ---
  @Get(':id/unavailable-seats')
  async getUnavailableSeats(@Param('id', ParseIntPipe) eventId: number) {
    return this.eventsService.getUnavailableSeats(eventId);
  }


  // --- Delete Event (Organizer Only) ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(+id);
  }

  
  // --- Update Event Status (Admin Only) ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const allowed = ['Pending', 'Approved', 'Live', 'Completed', 'Cancelled'];
    if (!status || !allowed.includes(status)) {
      throw new BadRequestException('Invalid status provided.');
    }
    return this.eventsService.updateStatus(+id, status);
  }

  
  // --- Event Sales Data (Authenticated Users) ---
  @UseGuards(JwtAuthGuard)
  @Get(':id/sales')
  async getSales(@Param('id') id: string) {
    return this.eventsService.getSales(+id);
  }


}
