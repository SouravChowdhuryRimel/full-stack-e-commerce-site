import { IsObject, IsOptional, IsString } from "class-validator";
import { Role } from "generated/prisma";

export class AuthResponseDto {
    @IsString()
    @IsOptional()
    accessToken?: string;

    @IsString()
    @IsOptional()
    refreshToken?: string;

    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: Role;
    }
}