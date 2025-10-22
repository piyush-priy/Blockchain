import { ForbiddenException, Injectable, InternalServerErrorException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { first } from 'rxjs';


@Injectable()
export class AuthService {
    private readonly NUM_SALT_ROUNDS = 10;

    constructor(private prisma: PrismaService,
        private jwtService : JwtService,
    ){} 

    async register(createUserDto : CreateUserDto) {
        const { firstName, lastName, email, password, role, walletAddress } = createUserDto;

        const validRoles = ['user', 'organizer'];
        if (!validRoles.includes(role)) {
            throw new BadRequestException('Invalid role. Must be USER or ORGANIZER');
        }

        try {
            //Hash password (bcrypt)
            const hashedPassword = await bcrypt.hash(password, this.NUM_SALT_ROUNDS);

            //Create user entity
            const user = await this.prisma.users.create({
                data: {
                    firstName : firstName,
                    lastName : lastName,
                    email : email,
                    password : hashedPassword,
                    role : role,
                    walletAddress : walletAddress,
                },
            });

            const finalRole = user.role;
            //Return msg to user
            const payload = {
                id : user.id,
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                role : user.role,
                wallet : user.walletAddress,
            }
            return {
                user : payload,
                message: `${finalRole} registered successfully`,
            };
        } catch (error) {
            console.log(error.message);
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    // Unique constraint failed
                    throw new ForbiddenException('User already exists');
                }
            }
            throw new InternalServerErrorException('Internal server error');
        }
    }


    async login(loginUserDto : LoginUserDto) {
        const { email, password } = loginUserDto;

        //Find user by email
        const user = await this.prisma.users.findUnique({
            where: {
                email: email,
            },
        });

        //Check if user exists
        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }

        //Match password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new ForbiddenException('Invalid credentials');
        }

        //Create a JWT payload to transfer to user
        const payload = {
            id : user.id,
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            role : user.role,
            wallet : user.walletAddress,
        }

        return {
            token: await this.jwtService.signAsync(payload),
            user : payload,
            message: `${user.role} logged in successfully`,
        }
    }


    async updateUserWallet(userId: number, walletAddress: string) {
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
                id : updatedUser.id,
                email : updatedUser.email,
                firstName : updatedUser.firstName,
                lastName : updatedUser.lastName,
                role : updatedUser.role,
                wallet : updatedUser.walletAddress,
            }

            return {
                user : payload,
                message: 'Wallet address updated successfully.',
            }
        } catch (error) {
            // Handle the unique constraint violation 
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                'This wallet address is already linked to another account.',
                );
            }
            
            // Handle "Record not found" error
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException('User not found.');
            }

            // Handle other potential errors
            console.error('Error updating wallet:', error);
            throw new InternalServerErrorException('Could not update wallet address.');
        }
    }


}
