import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class PasswordProvider {
    static async hash(password: string): Promise<string> {
        const salt = randomBytes(16).toString('hex');
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${salt}:${derivedKey.toString('hex')}`;
    }
}