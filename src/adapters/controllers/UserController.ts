import { Request, Response } from 'express';
import { UserRepositoryInterface } from '../../domain/repositories/UserRepositoryInterface.js';
import { User } from '../../domain/entities/User.js';
import { UserUseCase } from '../../application/use-cases/UserUseCase.js';

export class UserController {
    constructor(private userUseCase: UserUseCase) {
        this.userUseCase = userUseCase;
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;

            const user = User.create(name, email, undefined, password);

            await this.userUseCase.create(user);

            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Unexpected error' });
        }
    }

    async findByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            const user = await this.userUseCase.findByEmail(email!);

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userUseCase.findAll();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
