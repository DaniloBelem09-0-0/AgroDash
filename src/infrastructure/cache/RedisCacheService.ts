import { Redis } from 'ioredis';
import { RedisCacheServiceInterface } from '../../application/use-cases/RedisCacheServiceInterface.js';

export class RedisCacheService implements RedisCacheServiceInterface{
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            maxRetriesPerRequest: 3
        });

        this.client.on('error', (err: Error) => {
            console.error('❌ [Redis] Erro de conexão:', err);
        });

        this.client.on('connect', () => {
            console.log('⚡ [Redis] Conectado com sucesso.');
        });
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    }

    async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
        await this.client.set(
            key,
            JSON.stringify(value),
            'EX',
            ttlSeconds
        );
    }

    async invalidate(key: string): Promise<void> {
        await this.client.del(key);
    }
}
