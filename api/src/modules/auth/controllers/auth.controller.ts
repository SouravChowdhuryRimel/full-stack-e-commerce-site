import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Register api
    @Post('register')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Register a new user with email and password',
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: AuthResponseDto,
    })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return await this.authService.register(registerDto);
    }

    // Refresh access token
    @Post('refresh')
    @HttpCode(200)
    @UseGuards(RefreshTokenGuard)
    @ApiBearerAuth('JWT-refresh')
    @ApiOperation({
        summary: 'Refresh access token',
        description: 'Refresh access token with refresh token',
    })
    @ApiResponse({
        status: 200,
        description: 'Access token refreshed successfully',
        type: AuthResponseDto,
    })

    async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
        return await this.authService.refreshTokens(userId);
    }

    // Logout api
    @Post('logout')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Logout user',
        description: 'Logout user',
    })
    @ApiResponse({
        status: 200,
        description: 'User logged out successfully',
        type: AuthResponseDto,
    })

    async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
        await this.authService.logout(userId);
        return { message: 'Logout successfully' };
    }

    // Login api
    @Post('login')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Login user',
        description: 'Login user with email and password',
    })
    @ApiResponse({
        status: 200,
        description: 'User logged in successfully',
        type: AuthResponseDto,
    })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return await this.authService.login(loginDto);
    }

}
