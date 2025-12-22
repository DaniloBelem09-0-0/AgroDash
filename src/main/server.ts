import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Infraestrutura
import { PostgresUserRepository } from "../infrastructure/database/PostgresUserRepository.js";
import { PostgresSensorRepository } from "../infrastructure/database/PostgresSensorRepository.js";
import { PostgresSensorReadingRepository } from "../infrastructure/database/PostgresSensorReadingRepository.js";
import { RabbitMQService } from "../infrastructure/messaging/RabbitMQService.js";
import { RedisCacheService } from "../infrastructure/cache/RedisCacheService.js";

// Casos de Uso
import { UserUseCase } from "../application/use-cases/UserUseCase.js";
import { CreateSensorUseCase } from "../application/use-cases/CreateSensorUseCase.js";
import { AuthenticateUserUseCase } from "../application/use-cases/AuthenticateUserUseCase.js";

// Controllers
import { UserController } from "../adapters/controllers/UserController.js";
import { VirtualSensorController } from "../adapters/controllers/VirtualSensorController.js";
import { SensorReadingController } from "../adapters/controllers/SensorReadingController.js";
import { AuthController } from "../adapters/controllers/AuthController.js";

// Middlewares
import { authMiddleware } from "../infrastructure/providers/AuthMiddleware.js";

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO SWAGGER ---
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Minha API de Sensores",
            version: "1.0.0",
            description: "Documentação da API de gerenciamento de usuários e sensores com Cache Redis e Microserviço Go.",
        },
        servers: [{ url: "http://localhost:3333", description: "Servidor Local" }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/main/server.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

async function bootstrap() {
    try {
        // 1. Instanciar Infraestrutura
        const userRepository = new PostgresUserRepository();
        const virtualSensorRepository = new PostgresSensorRepository();
        const readingSensorRepository = new PostgresSensorReadingRepository();
        
        // Inicialização do Cache e Mensageria
        const cacheService = new RedisCacheService();
        const mqService = new RabbitMQService("amqp://localhost");
        
        // Aguarda ligação ao RabbitMQ antes de subir o servidor
        await mqService.connect();

        // 2. Instanciar Casos de Uso
        const createUserUseCase = new UserUseCase(userRepository);
        const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
        const createSensorUseCase = new CreateSensorUseCase(virtualSensorRepository, mqService);

        // 3. Instanciar Controllers
        const userController = new UserController(createUserUseCase);
        const authController = new AuthController(authenticateUserUseCase);
        const sensorController = new VirtualSensorController(createSensorUseCase);
        const sensorReadingController = new SensorReadingController(readingSensorRepository, cacheService);

        // --- MIDDLEWARE DE AUTORIZAÇÃO ---
        const checkRole = (allowedRoles: string[]) => {
            return async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const userId = (req as any).userId;
                    if (!userId) return res.status(401).json({ error: "Unauthorized: User ID missing." });

                    const user = await userRepository.findById(userId);
                    if (!user || !allowedRoles.includes(user.role)) {
                        return res.status(403).json({ error: "Forbidden: Access denied." });
                    }
                    next();
                } catch (error) {
                    return res.status(500).json({ error: "Internal Server Error" });
                }
            };
        };

        // --- ROTAS COM DOCUMENTAÇÃO SWAGGER ---

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
        app.get("/", (req, res) => res.json({ status: "API is running 🚀" }));

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
         *             required: [email, password]
         *             properties:
         *               email: { type: string, example: "danilo@email.com" }
         *               password: { type: string, example: "123456" }
         *     responses:
         *       200: { description: "Login realizado com sucesso" }
         *       401: { description: "Credenciais inválidas" }
         */
        app.post("/auth", (req, res) => authController.login(req, res));

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
         *             required: [name, email, password]
         *             properties:
         *               name: { type: string, example: "Danilo Belém" }
         *               email: { type: string, example: "danilo@email.com" }
         *               password: { type: string, example: "123456" }
         *               role: { type: string, enum: [admin, producer] }
         *     responses:
         *       201: { description: "Usuário criado com sucesso" }
         */
        app.post("/users", (req, res) => userController.create(req, res));

        /**
         * @swagger
         * /users/{email}:
         *   get:
         *     summary: Busca um usuário pelo email
         *     tags: [Users]
         *     parameters:
         *       - in: path
         *         name: email
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200: { description: "Dados do usuário encontrados" }
         */
        app.get("/users/:email", authMiddleware, checkRole(['admin', 'producer']), (req, res) => userController.findByEmail(req, res));

        /**
         * @swagger
         * /users:
         *   get:
         *     summary: Lista todos os usuários
         *     tags: [Users]
         *     responses:
         *       200: { description: "Lista de usuários retornada com sucesso" }
         */
        app.get("/users", authMiddleware, checkRole(['admin', 'producer']), (req, res) => userController.findAll(req, res));

        /**
         * @swagger
         * /sensors:
         *   post:
         *     summary: Cria um novo sensor virtual
         *     tags: [Sensors]
         *     security: [{ bearerAuth: [] }]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [name, lat, lon]
         *             properties:
         *               name: { type: string }
         *               lat: { type: number }
         *               lon: { type: number }
         *     responses:
         *       201: { description: "Sensor criado e comando enviado ao Microserviço Go" }
         */
        app.post("/sensors", authMiddleware, checkRole(['admin', 'producer']), (req, res) => sensorController.create(req, res));
        
        /**
         * @swagger
         * /sensors:
         *   get:
         *     summary: Busca histórico de leitura (com Cache Redis)
         *     tags: [Sensors]
         *     security: [{ bearerAuth: [] }]
         *     parameters:
         *       - in: query
         *         name: sensorId
         *         required: true
         *         schema: { type: string, format: uuid }
         *       - in: query
         *         name: limit
         *         schema: { type: integer, default: 50 }
         *     responses:
         *       200: { description: "Lista de leituras (pode vir do cache)" }
         */
        app.get("/sensors", authMiddleware, checkRole(['admin', 'producer']), (req, res) => sensorReadingController.getHistory(req, res));

        const PORT = process.env.PORT || 3333; 
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`⚡ Redis Cache enabled`);
            console.log(`📄 Swagger: http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error("❌ Falha crítica no bootstrap:", error);
        process.exit(1);
    }
}

bootstrap();