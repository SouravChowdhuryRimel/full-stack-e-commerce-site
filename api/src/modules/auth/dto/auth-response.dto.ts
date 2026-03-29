import { IsObject, IsString } from "class-validator";
import { Role } from "generated/prisma";

export class AuthResponseDto {
    @IsString()
    accessToken: string;

    @IsString()
    refreshToken: string;

    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: Role;
    }
}