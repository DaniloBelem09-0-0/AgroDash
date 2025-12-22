import { Request, Response } from 'express';
import { PostgresSensorReadingRepository } from '../../infrastructure/database/PostgresSensorReadingRepository.js';

export class SensorReadingController {
    constructor(private sensorReadingRepository: PostgresSensorReadingRepository) {}

    async getHistory(req: Request, res: Response) {
        try {
            const { sensorId, limit } = req.query;

            if (!sensorId) {
                return res.status(400).json({ 
                    error: "O parâmetro 'sensorId' é obrigatório na query string.",
                    example: "/sensors?sensorId=seu-uuid-aqui" 
                });
            }

            const parsedLimit = limit ? parseInt(limit as string) : 50;

            console.log(`[Histórico] Procurando leituras para o sensor: ${sensorId} (Limite: ${parsedLimit})`);

            const readings = await this.sensorReadingRepository.listBySensor(
                sensorId as string, 
                parsedLimit
            );

            return res.status(200).json(readings);

        } catch (error: any) {
            console.error("Erro no GetHistory:", error);
            return res.status(500).json({ error: "Erro interno ao buscar histórico." });
        }
    }
}