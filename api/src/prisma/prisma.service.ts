import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        super({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Database connected successfully');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Database disconnected!');
    }

    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') return;

        const models = Reflect.ownKeys(this).filter(
            (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$')
        ) as string[];

        return Promise.all(
            models.map((modelKey) => (this as any)[modelKey].deleteMany())
        );
    }
}
