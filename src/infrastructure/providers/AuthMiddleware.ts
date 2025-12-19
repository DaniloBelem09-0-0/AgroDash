import { Request, Response, NextFunction } from "express";
import { TokenProvider } from "../../domain/providers/TokenProvider.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token JWT não fornecido." });
    }
 
    const parts = authHeader.split(" ");
    
    if (parts.length !== 2) {
        return res.status(401).json({ error: "Erro no formato do Token. Use: Bearer <token>" });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme as string)) {
        return res.status(401).json({ error: "Token malformatado." });
    }

    const userId = TokenProvider.verify(token as string);

    if (!userId) {
        return res.status(401).json({ error: "Token inválido ou expirado. Faça login novamente." });
    }

    (req as any).userId = userId;

    return next();
}