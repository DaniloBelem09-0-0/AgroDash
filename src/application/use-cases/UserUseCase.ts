import { User } from "../../domain/entities/User.js";
import type { UserRepositoryInterface } from "../../domain/repositories/UserRepositoryInterface.js";
import { v4 as uuidv4 } from 'uuid';
import { PasswordProvider } from "../../infrastructure/providers/PasswordProvider.js";

export class UserUseCase {

    constructor(private userRepository: UserRepositoryInterface) {}

    public async create(user: User): Promise<User> {
        const id = uuidv4();
        const hashedPassword = await PasswordProvider.hash(user.password!);

        const newUser = User.create(user.name, user.email, id, hashedPassword, user.role);
        await this.userRepository.save(newUser);
        return newUser;

    }

    public async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    public async findAll(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}