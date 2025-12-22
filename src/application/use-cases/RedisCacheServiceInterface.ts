import { Redis } from 'ioredis';

/**
 * Interface para o serviço de cache baseado em Redis.
 */
export interface RedisCacheServiceInterface {
    /**
     * Tenta recuperar um valor do cache.
     * @param key Chave do item no cache.
     * @returns O valor desserializado ou null se não existir.
     */
    get<T = unknown>(key: string): Promise<T | null>;

    /**
     * Salva um valor no cache com tempo de expiração (TTL).
     * @param key Chave do item no cache.
     * @param value Valor a ser salvo (será serializado).
     * @param ttlSeconds Tempo de vida em segundos (padrão pode ser tratado pela implementação).
     */
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;

    /**
     * Remove um item do cache (invalidação).
     * @param key Chave do item a ser removido.
     */
    invalidate(key: string): Promise<void>;
}