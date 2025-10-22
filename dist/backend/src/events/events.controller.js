"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let EventsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('events')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createEvent_decorators;
    let _getAllEvents_decorators;
    let _getOrganizerEvents_decorators;
    let _updateEvent_decorators;
    let _deleteEvent_decorators;
    let _updateStatus_decorators;
    let _getSales_decorators;
    var EventsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createEvent_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('organizer'), (0, common_1.Post)()];
            _getAllEvents_decorators = [(0, common_1.Get)()];
            _getOrganizerEvents_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('organizer'), (0, common_1.Get)('organizer/:id')];
            _updateEvent_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('organizer'), (0, common_1.Put)(':id')];
            _deleteEvent_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('organizer'), (0, common_1.Delete)(':id')];
            _updateStatus_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('admin'), (0, common_1.Put)(':id/status')];
            _getSales_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.Get)(':id/sales')];
            __esDecorate(this, null, _createEvent_decorators, { kind: "method", name: "createEvent", static: false, private: false, access: { has: obj => "createEvent" in obj, get: obj => obj.createEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAllEvents_decorators, { kind: "method", name: "getAllEvents", static: false, private: false, access: { has: obj => "getAllEvents" in obj, get: obj => obj.getAllEvents }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOrganizerEvents_decorators, { kind: "method", name: "getOrganizerEvents", static: false, private: false, access: { has: obj => "getOrganizerEvents" in obj, get: obj => obj.getOrganizerEvents }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateEvent_decorators, { kind: "method", name: "updateEvent", static: false, private: false, access: { has: obj => "updateEvent" in obj, get: obj => obj.updateEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteEvent_decorators, { kind: "method", name: "deleteEvent", static: false, private: false, access: { has: obj => "deleteEvent" in obj, get: obj => obj.deleteEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSales_decorators, { kind: "method", name: "getSales", static: false, private: false, access: { has: obj => "getSales" in obj, get: obj => obj.getSales }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EventsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        eventsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(eventsService) {
            this.eventsService = eventsService;
        }
        // --- Create Event (Organizer Only) ---
        async createEvent(dto, req) {
            if (!dto.name || !dto.date || !dto.venue || !dto.type || !dto.description || !dto.posterUrl) {
                throw new common_1.BadRequestException('Missing required fields: name, date, venue, type, description, posterUrl.');
            }
            const organizerId = req.user.id;
            return this.eventsService.createEvent(dto, organizerId);
        }
        // --- Get All Events ---
        async getAllEvents() {
            return this.eventsService.getAllEvents();
        }
        // --- Get Event by ID ---
        async getOrganizerEvents(id, req) {
            const organizerIdParam = +id;
            const requestingUserId = req.user.id;
            // --- Security Check ---
            // Make sure the logged-in user is not trying to access another organizer's events
            if (organizerIdParam !== requestingUserId) {
                throw new common_1.ForbiddenException("You are not authorized to view these events.");
            }
            return this.eventsService.getEventsByOrganizer(requestingUserId);
        }
        // --- Update Event (Organizer Only) ---
        async updateEvent(id, dto) {
            return this.eventsService.updateEvent(+id, dto);
        }
        // --- Delete Event (Organizer Only) ---
        async deleteEvent(id) {
            return this.eventsService.deleteEvent(+id);
        }
        // --- Update Event Status (Admin Only) ---
        async updateStatus(id, status) {
            const allowed = ['Pending', 'Approved', 'Live', 'Completed', 'Cancelled'];
            if (!status || !allowed.includes(status)) {
                throw new common_1.BadRequestException('Invalid status provided.');
            }
            return this.eventsService.updateStatus(+id, status);
        }
        // --- Event Sales Data (Authenticated Users) ---
        async getSales(id) {
            return this.eventsService.getSales(+id);
        }
    };
    return EventsController = _classThis;
})();
exports.EventsController = EventsController;
