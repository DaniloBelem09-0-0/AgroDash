import jwt from 'jsonwebtoken';

export class TokenProvider {
    private static readonly SECRET = process.env.JWT_SECRET || 'default_secret';

    static generate(userId: string): string {
        return jwt.sign({ sub: userId }, this.SECRET, { expiresIn: '1d' });
    }

    static verify(token: string): string | null {
        try {
            const decoded = jwt.verify(token, this.SECRET) as { sub: string };
            return decoded.sub;
        } catch {
            return null;
        }
    }
}