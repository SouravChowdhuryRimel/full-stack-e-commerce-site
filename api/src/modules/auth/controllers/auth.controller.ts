import { Body, Controller } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Register api
    async register(@Body() registerDto: RegisterDto): Promise<{ AuthResponseDto }> {
        return await this.authService.register(registerDto);
    }
}
