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
exports.CreateEventDto = void 0;
const class_validator_1 = require("class-validator");
let CreateEventDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _venue_decorators;
    let _venue_initializers = [];
    let _venue_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _posterUrl_decorators;
    let _posterUrl_initializers = [];
    let _posterUrl_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _seatLayout_decorators;
    let _seatLayout_initializers = [];
    let _seatLayout_extraInitializers = [];
    let _maxResaleCount_decorators;
    let _maxResaleCount_initializers = [];
    let _maxResaleCount_extraInitializers = [];
    let _priceCap_decorators;
    let _priceCap_initializers = [];
    let _priceCap_extraInitializers = [];
    return class CreateEventDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _date_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _venue_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _posterUrl_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _type_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _seatLayout_decorators = [(0, class_validator_1.IsOptional)()];
            _maxResaleCount_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            _priceCap_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _venue_decorators, { kind: "field", name: "venue", static: false, private: false, access: { has: obj => "venue" in obj, get: obj => obj.venue, set: (obj, value) => { obj.venue = value; } }, metadata: _metadata }, _venue_initializers, _venue_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _posterUrl_decorators, { kind: "field", name: "posterUrl", static: false, private: false, access: { has: obj => "posterUrl" in obj, get: obj => obj.posterUrl, set: (obj, value) => { obj.posterUrl = value; } }, metadata: _metadata }, _posterUrl_initializers, _posterUrl_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _seatLayout_decorators, { kind: "field", name: "seatLayout", static: false, private: false, access: { has: obj => "seatLayout" in obj, get: obj => obj.seatLayout, set: (obj, value) => { obj.seatLayout = value; } }, metadata: _metadata }, _seatLayout_initializers, _seatLayout_extraInitializers);
            __esDecorate(null, null, _maxResaleCount_decorators, { kind: "field", name: "maxResaleCount", static: false, private: false, access: { has: obj => "maxResaleCount" in obj, get: obj => obj.maxResaleCount, set: (obj, value) => { obj.maxResaleCount = value; } }, metadata: _metadata }, _maxResaleCount_initializers, _maxResaleCount_extraInitializers);
            __esDecorate(null, null, _priceCap_decorators, { kind: "field", name: "priceCap", static: false, private: false, access: { has: obj => "priceCap" in obj, get: obj => obj.priceCap, set: (obj, value) => { obj.priceCap = value; } }, metadata: _metadata }, _priceCap_initializers, _priceCap_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        date = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        venue = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _venue_initializers, void 0));
        description = (__runInitializers(this, _venue_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        posterUrl = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _posterUrl_initializers, void 0));
        type = (__runInitializers(this, _posterUrl_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        seatLayout = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _seatLayout_initializers, void 0));
        maxResaleCount = (__runInitializers(this, _seatLayout_extraInitializers), __runInitializers(this, _maxResaleCount_initializers, void 0));
        priceCap = (__runInitializers(this, _maxResaleCount_extraInitializers), __runInitializers(this, _priceCap_initializers, void 0));
        constructor() {
            __runInitializers(this, _priceCap_extraInitializers);
        }
    };
})();
exports.CreateEventDto = CreateEventDto;
