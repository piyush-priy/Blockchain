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
exports.UpdateOwnerDto = exports.ConfirmBurnDto = exports.CreateTicketDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
let CreateTicketDto = (() => {
    let _tokenId_decorators;
    let _tokenId_initializers = [];
    let _tokenId_extraInitializers = [];
    let _eventId_decorators;
    let _eventId_initializers = [];
    let _eventId_extraInitializers = [];
    let _metadataUri_decorators;
    let _metadataUri_initializers = [];
    let _metadataUri_extraInitializers = [];
    let _ownerWallet_decorators;
    let _ownerWallet_initializers = [];
    let _ownerWallet_extraInitializers = [];
    let _purchasePrice_decorators;
    let _purchasePrice_initializers = [];
    let _purchasePrice_extraInitializers = [];
    let _seatInfo_decorators;
    let _seatInfo_initializers = [];
    let _seatInfo_extraInitializers = [];
    return class CreateTicketDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _tokenId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)()];
            _eventId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)()];
            _metadataUri_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _ownerWallet_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _purchasePrice_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)()];
            _seatInfo_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _tokenId_decorators, { kind: "field", name: "tokenId", static: false, private: false, access: { has: obj => "tokenId" in obj, get: obj => obj.tokenId, set: (obj, value) => { obj.tokenId = value; } }, metadata: _metadata }, _tokenId_initializers, _tokenId_extraInitializers);
            __esDecorate(null, null, _eventId_decorators, { kind: "field", name: "eventId", static: false, private: false, access: { has: obj => "eventId" in obj, get: obj => obj.eventId, set: (obj, value) => { obj.eventId = value; } }, metadata: _metadata }, _eventId_initializers, _eventId_extraInitializers);
            __esDecorate(null, null, _metadataUri_decorators, { kind: "field", name: "metadataUri", static: false, private: false, access: { has: obj => "metadataUri" in obj, get: obj => obj.metadataUri, set: (obj, value) => { obj.metadataUri = value; } }, metadata: _metadata }, _metadataUri_initializers, _metadataUri_extraInitializers);
            __esDecorate(null, null, _ownerWallet_decorators, { kind: "field", name: "ownerWallet", static: false, private: false, access: { has: obj => "ownerWallet" in obj, get: obj => obj.ownerWallet, set: (obj, value) => { obj.ownerWallet = value; } }, metadata: _metadata }, _ownerWallet_initializers, _ownerWallet_extraInitializers);
            __esDecorate(null, null, _purchasePrice_decorators, { kind: "field", name: "purchasePrice", static: false, private: false, access: { has: obj => "purchasePrice" in obj, get: obj => obj.purchasePrice, set: (obj, value) => { obj.purchasePrice = value; } }, metadata: _metadata }, _purchasePrice_initializers, _purchasePrice_extraInitializers);
            __esDecorate(null, null, _seatInfo_decorators, { kind: "field", name: "seatInfo", static: false, private: false, access: { has: obj => "seatInfo" in obj, get: obj => obj.seatInfo, set: (obj, value) => { obj.seatInfo = value; } }, metadata: _metadata }, _seatInfo_initializers, _seatInfo_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        tokenId = __runInitializers(this, _tokenId_initializers, void 0);
        eventId = (__runInitializers(this, _tokenId_extraInitializers), __runInitializers(this, _eventId_initializers, void 0));
        metadataUri = (__runInitializers(this, _eventId_extraInitializers), __runInitializers(this, _metadataUri_initializers, void 0));
        ownerWallet = (__runInitializers(this, _metadataUri_extraInitializers), __runInitializers(this, _ownerWallet_initializers, void 0));
        purchasePrice = (__runInitializers(this, _ownerWallet_extraInitializers), __runInitializers(this, _purchasePrice_initializers, void 0));
        seatInfo = (__runInitializers(this, _purchasePrice_extraInitializers), __runInitializers(this, _seatInfo_initializers, void 0));
        constructor() {
            __runInitializers(this, _seatInfo_extraInitializers);
        }
    };
})();
exports.CreateTicketDto = CreateTicketDto;
let ConfirmBurnDto = (() => {
    let _tokenId_decorators;
    let _tokenId_initializers = [];
    let _tokenId_extraInitializers = [];
    let _contractAddress_decorators;
    let _contractAddress_initializers = [];
    let _contractAddress_extraInitializers = [];
    return class ConfirmBurnDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _tokenId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)()];
            _contractAddress_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsEthereumAddress)()];
            __esDecorate(null, null, _tokenId_decorators, { kind: "field", name: "tokenId", static: false, private: false, access: { has: obj => "tokenId" in obj, get: obj => obj.tokenId, set: (obj, value) => { obj.tokenId = value; } }, metadata: _metadata }, _tokenId_initializers, _tokenId_extraInitializers);
            __esDecorate(null, null, _contractAddress_decorators, { kind: "field", name: "contractAddress", static: false, private: false, access: { has: obj => "contractAddress" in obj, get: obj => obj.contractAddress, set: (obj, value) => { obj.contractAddress = value; } }, metadata: _metadata }, _contractAddress_initializers, _contractAddress_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        tokenId = __runInitializers(this, _tokenId_initializers, void 0);
        contractAddress = (__runInitializers(this, _tokenId_extraInitializers), __runInitializers(this, _contractAddress_initializers, void 0));
        constructor() {
            __runInitializers(this, _contractAddress_extraInitializers);
        }
    };
})();
exports.ConfirmBurnDto = ConfirmBurnDto;
let UpdateOwnerDto = (() => {
    let _tokenId_decorators;
    let _tokenId_initializers = [];
    let _tokenId_extraInitializers = [];
    let _contractAddress_decorators;
    let _contractAddress_initializers = [];
    let _contractAddress_extraInitializers = [];
    let _newOwnerWallet_decorators;
    let _newOwnerWallet_initializers = [];
    let _newOwnerWallet_extraInitializers = [];
    return class UpdateOwnerDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _tokenId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)()];
            _contractAddress_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsEthereumAddress)()];
            _newOwnerWallet_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsEthereumAddress)()];
            __esDecorate(null, null, _tokenId_decorators, { kind: "field", name: "tokenId", static: false, private: false, access: { has: obj => "tokenId" in obj, get: obj => obj.tokenId, set: (obj, value) => { obj.tokenId = value; } }, metadata: _metadata }, _tokenId_initializers, _tokenId_extraInitializers);
            __esDecorate(null, null, _contractAddress_decorators, { kind: "field", name: "contractAddress", static: false, private: false, access: { has: obj => "contractAddress" in obj, get: obj => obj.contractAddress, set: (obj, value) => { obj.contractAddress = value; } }, metadata: _metadata }, _contractAddress_initializers, _contractAddress_extraInitializers);
            __esDecorate(null, null, _newOwnerWallet_decorators, { kind: "field", name: "newOwnerWallet", static: false, private: false, access: { has: obj => "newOwnerWallet" in obj, get: obj => obj.newOwnerWallet, set: (obj, value) => { obj.newOwnerWallet = value; } }, metadata: _metadata }, _newOwnerWallet_initializers, _newOwnerWallet_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        tokenId = __runInitializers(this, _tokenId_initializers, void 0);
        contractAddress = (__runInitializers(this, _tokenId_extraInitializers), __runInitializers(this, _contractAddress_initializers, void 0));
        newOwnerWallet = (__runInitializers(this, _contractAddress_extraInitializers), __runInitializers(this, _newOwnerWallet_initializers, void 0));
        constructor() {
            __runInitializers(this, _newOwnerWallet_extraInitializers);
        }
    };
})();
exports.UpdateOwnerDto = UpdateOwnerDto;
