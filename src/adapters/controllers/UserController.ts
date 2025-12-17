import { Request, Response } from 'express'; // Assumindo Express
import { UserRepositoryInterface } from '../../domain/repositories/UserRepositoryInterface.js';
import { User } from '../../domain/entities/User.js';

export class UserController {
    
    // Injeção de dependência via construtor
    constructor(private userRepository: UserRepositoryInterface) {
        this.userRepository = userRepository;
    }

    // Criar Usuário
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;

            // Cria a entidade (Regra de Negócio: O ID é gerado aqui se não passado)
            const user = User.create(name, email, undefined, password);

            await this.userRepository.save(user);

            // Retorna apenas o necessário (evita retornar a senha, por exemplo)
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email
            });
        } catch (error: any) {
            // Tratamento básico de erro (ex: email duplicado)
            res.status(400).json({ error: error.message || 'Unexpected error' });
        }
    }

    // Buscar por Email
    async findByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            const user = await this.userRepository.findByEmail(email!);

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Listar todos
    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userRepository.findAll();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}