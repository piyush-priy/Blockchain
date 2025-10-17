import { ForbiddenException, Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    private readonly NUM_SALT_ROUNDS = 10;

    constructor(private prisma: PrismaService,
        private jwtService : JwtService,
    ){} 

    async register(createUserDto : CreateUserDto) {
        const { firstName, lastName, email, password, role, walletAddress } = createUserDto;

        const validRoles = ['USER', 'ORGANIZER'];
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
            return {
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
            role : user.role,
            wallet : user.walletAddress,
        }

        return {
            access_token: await this.jwtService.signAsync(payload),
            message: `${user.role} logged in successfully`,
        }
    }


}
