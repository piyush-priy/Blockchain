"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        jwtService;
        NUM_SALT_ROUNDS = 10;
        constructor(prisma, jwtService) {
            this.prisma = prisma;
            this.jwtService = jwtService;
        }
        async register(createUserDto) {
            const { firstName, lastName, email, password, role, walletAddress } = createUserDto;
            const validRoles = ['user', 'organizer'];
            if (!validRoles.includes(role)) {
                throw new common_1.BadRequestException('Invalid role. Must be USER or ORGANIZER');
            }
            try {
                //Hash password (bcrypt)
                const hashedPassword = await bcrypt.hash(password, this.NUM_SALT_ROUNDS);
                //Create user entity
                const user = await this.prisma.users.create({
                    data: {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: hashedPassword,
                        role: role,
                        walletAddress: walletAddress,
                    },
                });
                const finalRole = user.role;
                //Return msg to user
                const payload = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    wallet: user.walletAddress,
                };
                return {
                    user: payload,
                    message: `${finalRole} registered successfully`,
                };
            }
            catch (error) {
                console.log(error.message);
                if (error instanceof library_1.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        // Unique constraint failed
                        throw new common_1.ForbiddenException('User already exists');
                    }
                }
                throw new common_1.InternalServerErrorException('Internal server error');
            }
        }
        async login(loginUserDto) {
            const { email, password } = loginUserDto;
            //Find user by email
            const user = await this.prisma.users.findUnique({
                where: {
                    email: email,
                },
            });
            //Check if user exists
            if (!user) {
                throw new common_1.ForbiddenException('Invalid credentials');
            }
            //Match password
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                throw new common_1.ForbiddenException('Invalid credentials');
            }
            //Create a JWT payload to transfer to user
            const payload = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                wallet: user.walletAddress,
            };
            return {
                token: await this.jwtService.signAsync(payload),
                user: payload,
                message: `${user.role} logged in successfully`,
            };
        }
        async updateUserWallet(userId, walletAddress) {
            try {
                // Update the user  with the new wallet address
                const updatedUser = await this.prisma.users.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        walletAddress: walletAddress,
                    },
                    // Select all fields *except* the password to return to the frontend
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        walletAddress: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                const payload = {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    role: updatedUser.role,
                    wallet: updatedUser.walletAddress,
                };
                return {
                    user: payload,
                    message: 'Wallet address updated successfully.',
                };
            }
            catch (error) {
                // Handle the unique constraint violation 
                if (error instanceof library_1.PrismaClientKnownRequestError &&
                    error.code === 'P2002') {
                    throw new common_1.ConflictException('This wallet address is already linked to another account.');
                }
                // Handle "Record not found" error
                if (error instanceof library_1.PrismaClientKnownRequestError &&
                    error.code === 'P2025') {
                    throw new common_1.NotFoundException('User not found.');
                }
                // Handle other potential errors
                console.error('Error updating wallet:', error);
                throw new common_1.InternalServerErrorException('Could not update wallet address.');
            }
        }
    };
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
