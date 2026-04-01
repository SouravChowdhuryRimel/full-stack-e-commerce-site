import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Register api
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return await this.authService.register(registerDto);
    }

    // Refresh access token
    @UseGuards(RefreshTokenGuard)
    async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
        return await this.authService.refreshTokens(userId);
    }

    // Logout api
    @UseGuards(JwtAuthGuard)
    async logout() { }

}
