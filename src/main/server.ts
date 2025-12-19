import express, { Request, Response, NextFunction } from "express";
import cors from "cors"; // [FALTANDO] Necessário instalar: npm install cors @types/cors

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { PostgresUserRepository } from "../infrastructure/database/PostgresUserRepository.js";
import { PostgresSensorRepository } from "../infrastructure/database/PostgresSensorRepository.js";
import { PostgresSensorReadingRepository } from "../infrastructure/database/PostgresSensorReadingRepository.js";

import { UserUseCase } from "../application/use-cases/UserUseCase.js";
import { CreateSensorUseCase } from "../application/use-cases/CreateSensorUseCase.js";
import { AuthenticateUserUseCase } from "../application/use-cases/AuthenticateUserUseCase.js";

import { UserController } from "../adapters/controllers/UserController.js";
import { VirtualSensorController } from "../adapters/controllers/VirtualSensorController.js";
import { SensorReadingController } from "../adapters/controllers/SensorReadingController.js";
import { AuthController } from "../adapters/controllers/AuthController.js";

import { authMiddleware } from "../infrastructure/providers/AuthMiddleware.js";
import { RabbitMQService } from "../infrastructure/messaging/RabbitMQService.js";

const app = express();
app.use(express.json());
app.use(cors()); // [CORREÇÃO] Habilita acesso de outros domínios/portas

// ... (Configurações do Swagger mantidas iguais) ...
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Minha API de Sensores",
            version: "1.0.0",
            description: "Documentação da API de gerenciamento de usuários e sensores.",
        },
        servers: [
            {
                url: "http://localhost:3333",
                description: "Servidor Local",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/main/server.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- INJEÇÃO DE DEPENDÊNCIA ---

const userRepository = new PostgresUserRepository();
const createUserUseCase = new UserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

const virtualSensorRepository = new PostgresSensorRepository();
const readingSensorRepository = new PostgresSensorReadingRepository();

const mqService = new RabbitMQService("amqp://localhost");

const createSensorUseCase = new CreateSensorUseCase(virtualSensorRepository, mqService);
const sensorController = new VirtualSensorController(createSensorUseCase);

// [OBSERVAÇÃO] Aqui você está passando o Repositório direto. 
// O ideal seria: new GetReadingHistoryUseCase(readingSensorRepository)
const sensorReadingController = new SensorReadingController(readingSensorRepository);

const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
const authController = new AuthController(authenticateUserUseCase);


const checkRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).userId;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized: User ID missing. (Check middleware order)" });
            }

            console.log("Checking roles for user ID:", userId);
            const user = await userRepository.findById(userId);

            if (!user) {
                return res.status(401).json({ error: "Unauthorized: User not found." });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    error: `Forbidden: Access denied for role '${user.role}'. Required: [${allowedRoles.join(', ')}]`
                });
            }

            next();
        } catch (error) {
            console.error("Authorization Error:", error);
            return res.status(500).json({ error: "Internal Server Error during authorization." });
        }
    };
};

// --- ROTAS ---

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health Check
 *     description: Verifica se a API está online.
 *     security: []
 *     responses:
 *       200:
 *         description: API está rodando.
 */
app.get("/", (req, res) => {
    res.json({ status: "API is running 🚀" });
});

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Autenticação de usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "danilo@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *       401:
 *         description: Credenciais inválidas.
 */
app.post("/auth", (req, res) => {
    return authController.login(req, res);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Danilo Belém"
 *               email:
 *                 type: string
 *                 example: "danilo@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [admin, producer]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 */
app.post("/users", (req, res) => {
    return userController.create(req, res);
});

// [CORREÇÃO CRÍTICA] authMiddleware deve vir ANTES de checkRole

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Busca um usuário pelo email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Dados do usuário encontrados.
 */
app.get("/users/:email", authMiddleware, checkRole(['admin', 'producer']), (req, res) => {
    return userController.findByEmail(req, res);
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso.
 */
app.get("/users", authMiddleware, checkRole(['admin', 'producer']), (req, res) => {
    return userController.findAll(req, res);
});

/**
 * @swagger
 * /sensors:
 *   post:
 *     summary: Simula/Cria dados de um sensor
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lat
 *               - lon
 *             properties:
 *               name:
 *                 type: string
 *               lat:
 *                 type: number
 *               lon:
 *                 type: number
 *     responses:
 *       200:
 *         description: Simulação realizada ou sensor criado.
 */
app.post("/sensors", authMiddleware, checkRole(['admin', 'producer']), (req, res) => {
    return sensorController.create(req, res);
});

/**
 * @swagger
 * /sensors:
 *   get:
 *     summary: Busca histórico de leitura dos sensores
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sensorId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 50
 *     responses:
 *       200:
 *         description: Lista de leituras retornada.
 */
app.get("/sensors", authMiddleware, checkRole(['admin', 'producer']), (req, res) => {
    return sensorReadingController.getHistory(req, res);
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3333; // Boa prática: usar variável de ambiente
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
});