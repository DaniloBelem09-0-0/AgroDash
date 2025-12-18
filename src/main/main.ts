import express from "express";

// 1. Imports de Infraestrutura (Banco de Dados)
import { PostgresUserRepository } from "../infrastructure/database/PostgresUserRepository.js";
import { PostgresSensorRepository } from "../infrastructure/database/PostgresSensorRepository.js";

// 2. Imports de Application (Casos de Uso)
import { CreateUserUseCase } from "../application/use-cases/UserUseCase.js";
import { CreateSensorUseCase } from "../application/use-cases/CreateSensorUseCase.js";

// 3. Imports de Adapter (Controllers)
import { UserController } from "../adapters/controllers/UserController.js";
import { VirtualSensorController } from "../adapters/controllers/VirtualSensorController.js";
import { PasswordProvider } from "../infrastructure/providers/PasswordProvider.js";

const app = express();
app.use(express.json()); // Obrigatório para ler JSON no Body

// --- INJEÇÃO DE DEPENDÊNCIA (Ligando as peças) ---

// Módulo de Usuários
const userRepository = new PostgresUserRepository();
// Nota: Se o seu CreateUserUseCase espera apenas o repository, use a linha abaixo.
// Se você alterou para usar o PasswordProvider injetado, ajuste conforme necessário.
// Assumindo a versão mais simples onde o Provider é estático ou importado dentro do UseCase:
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

// Módulo de Sensores
const sensorRepository = new PostgresSensorRepository();
const createSensorUseCase = new CreateSensorUseCase(sensorRepository);
const sensorController = new VirtualSensorController(createSensorUseCase, sensorRepository);

// --- ROTAS (Endpoints) ---

// Rota de Saúde (Health Check)
app.get("/", (req, res) => {
    res.json({ status: "API is running 🚀" });
});

// Rotas de Usuário
app.post("/users", (req, res) => {
    return createUserController.handle(req, res);
});

// Rotas de Sensores
// OBS: Futuramente, você adicionará um middleware de Autenticação (JWT) aqui
app.post("/sensors", (req, res) => {
    return sensorController.create(req, res);
});

app.get("/sensors/:userId", (req, res) => {
    return sensorController.list(req, res);
});

// --- INICIALIZAÇÃO ---
const PORT = 3333;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});