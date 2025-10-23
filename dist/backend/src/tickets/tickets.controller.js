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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("src/auth/jwt-auth.guard");
const roles_guard_1 = require("src/auth/roles.guard");
const roles_decorator_1 = require("src/auth/roles.decorator");
let TicketsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('tickets')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMyTickets_decorators;
    let _createTicket_decorators;
    let _markTicketUsed_decorators;
    let _getTicketStatus_decorators;
    let _getTicketMetadata_decorators;
    var TicketsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getMyTickets_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.Get)('my-tickets')];
            _createTicket_decorators = [(0, common_1.Post)()];
            _markTicketUsed_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('admin'), (0, common_1.Post)(':tokenId/mark-used')];
            _getTicketStatus_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.Get)(':tokenId/:contractAddress/status')];
            _getTicketMetadata_decorators = [(0, common_1.Get)('/metadata/:tokenId/:contractAddress')];
            __esDecorate(this, null, _getMyTickets_decorators, { kind: "method", name: "getMyTickets", static: false, private: false, access: { has: obj => "getMyTickets" in obj, get: obj => obj.getMyTickets }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTicket_decorators, { kind: "method", name: "createTicket", static: false, private: false, access: { has: obj => "createTicket" in obj, get: obj => obj.createTicket }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markTicketUsed_decorators, { kind: "method", name: "markTicketUsed", static: false, private: false, access: { has: obj => "markTicketUsed" in obj, get: obj => obj.markTicketUsed }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTicketStatus_decorators, { kind: "method", name: "getTicketStatus", static: false, private: false, access: { has: obj => "getTicketStatus" in obj, get: obj => obj.getTicketStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTicketMetadata_decorators, { kind: "method", name: "getTicketMetadata", static: false, private: false, access: { has: obj => "getTicketMetadata" in obj, get: obj => obj.getTicketMetadata }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TicketsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        ticketsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(ticketsService) {
            this.ticketsService = ticketsService;
        }
        async getMyTickets(req) {
            const user = req.user;
            if (!user?.wallet)
                throw new common_1.BadRequestException('User wallet address not found.');
            return this.ticketsService.getTicketsByWallet(user.wallet);
        }
        async createTicket(dto) {
            if (!dto.tokenId || !dto.eventId || !dto.metadataUri || !dto.ownerWallet)
                throw new common_1.BadRequestException('Missing required fields.');
            return this.ticketsService.createTicket(dto);
        }
        async markTicketUsed(tokenId) {
            return this.ticketsService.markTicketUsed(tokenId);
        }
        async getTicketStatus(tokenId, contractAddress) {
            return this.ticketsService.getTicketStatus(tokenId, contractAddress);
        }
        async getTicketMetadata(tokenId, contractAddress) {
            return this.ticketsService.getTicketMetadata(tokenId, contractAddress);
        }
    };
    return TicketsController = _classThis;
})();
exports.TicketsController = TicketsController;
