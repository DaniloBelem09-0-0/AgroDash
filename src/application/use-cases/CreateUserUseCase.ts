import { User } from "../../domain/entities/User.js";
import type { UserRepositoryInterface } from "../../domain/repositories/UserRepositoryInterface.js";
import { v4 as uuidv4 } from 'uuid';
import { PasswordProvider } from "../../infrastructure/providers/PasswordProvider.js";

export class CreateUserUseCase {

    constructor(private userRepository: UserRepositoryInterface) {}

    public async execute(name: string, email: string, password: string) {
        const id = uuidv4();
        const hashedPassword = await PasswordProvider.hash(password);

        const user = User.create(name, email, hashedPassword);
        await this.userRepository.save(user);
        return user;

    }
}