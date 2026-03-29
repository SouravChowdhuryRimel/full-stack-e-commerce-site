import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 10;

    constructor(private prisma: PrismaService, private jwtService: JwtService) { }


    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, firstName, lastName } = registerDto;

        const exitingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (exitingUser) {
            throw new Error('User already exists');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                },
            });

            const tokens = await this.generateTokens(user.id, user.email);

            return {
                user,
                ...tokens,
            };

        } catch (error) {

        }
    }

    private async generateTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = this.jwtService.sign({ id: userId, email }, {
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign({ id: userId, email }, {
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
}
