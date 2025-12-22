import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export class PasswordProvider {
    
    static async hash(password: string): Promise<string> {
        const salt = randomBytes(16).toString('hex');
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${salt}:${derivedKey.toString('hex')}`;
    }

    static async compare(password: string, storedHash: string): Promise<boolean> {
        const [salt, key] = storedHash.split(':');
        
        if (!salt || !key) return false;

        const keyBuffer = Buffer.from(key, 'hex');
        
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        
        return timingSafeEqual(keyBuffer, derivedKey);
    }
}