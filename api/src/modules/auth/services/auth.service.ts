import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
    refresh(id: any): AuthResponseDto | PromiseLike<AuthResponseDto> {
        throw new Error('Method not implemented.');
    }
    private readonly SALT_ROUNDS = 10;

    constructor(private prisma: PrismaService, private jwtService: JwtService) { }


    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, firstName, lastName } = registerDto;

        const exitingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (exitingUser) {
            throw new ConflictException('User already exists');
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

            return {
                user,
            };

        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Failed to register user');
        }
    }

    private async generateTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: userId, email };
        const refreshId = randomBytes(16).toString('hex');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '15m',
            }),
            this.jwtService.signAsync({ ...payload, refreshId }, {
                expiresIn: '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashedRefreshToken },
        });
    }

    async refreshTokens(userId: string): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('User not found');
        }

        const tokens = await this.generateTokens(user.id, user.email);

        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            user,
            ...tokens,
        };
    }

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        })
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const tokens = await this.generateTokens(user.id, user.email);

        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            ...tokens,
        };
    }
}
