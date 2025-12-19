import { UserRepositoryInterface } from "../../domain/repositories/UserRepositoryInterface.js";
import { PasswordProvider } from "../../domain/providers/PasswordProvider.js";
import { LoginResponseDTO } from "../use-cases/DTO/LoginResponseDTO.js";
import { LoginDTO } from "../use-cases/DTO/LoginDTO.js";
import { TokenProvider } from "../../domain/providers/TokenProvider.js";

export class AuthenticateUserUseCase {
    constructor(private userRepository: UserRepositoryInterface) {}

    async execute({ email, pass }: LoginDTO): Promise<LoginResponseDTO> {
        const user = await this.userRepository.findByEmail(email);

        if (!user || !user.password) {
            throw new Error("Email ou senha incorretos.");
        }

        const passwordMatch = await PasswordProvider.compare(pass, user.password);

        if (!passwordMatch) {
            throw new Error("Email ou senha incorretos.");
        }

        const token = TokenProvider.generate(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role 
            }
        };
    }
}