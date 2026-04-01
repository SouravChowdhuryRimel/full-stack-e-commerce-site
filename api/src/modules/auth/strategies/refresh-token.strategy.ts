// Refresh Token Strategy

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { Request } from "express";
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: { sub: string, email: string }) {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const refreshToken = authHeader.replace('Bearer', '').trim();

        if (!refreshToken) {
            throw new UnauthorizedException('No token provided');
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                refreshToken: true,
            }
        });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('User not found');
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return user;


    }
}