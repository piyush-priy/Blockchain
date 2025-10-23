import { Controller, HttpStatus, Post, Put, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto, LoginUserDto, UpdateWalletDto } from './dto';


@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService) {}

    // --- User Authentication Endpoints ---

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }


    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }


    @UseGuards(JwtAuthGuard)
    @Put('wallet')
    @HttpCode(HttpStatus.OK)
    async updateWallet(
        @Req() req: any, // Get the user object from the request
        @Body() updateWalletDto: UpdateWalletDto,
    ) {
        const userId = req.user.id;
        const { walletAddress } = updateWalletDto;

        // Call the service to perform the update
        // Return the updated user object, just as the frontend expects
        return await this.authService.updateUserWallet(userId, walletAddress);

  }

}
