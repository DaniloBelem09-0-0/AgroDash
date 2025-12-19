import { Request, Response } from "express";
import { AuthenticateUserUseCase } from "../../application/use-cases/AuthenticateUserUseCase.js";

export class AuthController {
    constructor(private authenticateUserUseCase: AuthenticateUserUseCase) {}

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const result = await this.authenticateUserUseCase.execute({ email, pass: password });
            
            return res.json(result);
            
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }
}