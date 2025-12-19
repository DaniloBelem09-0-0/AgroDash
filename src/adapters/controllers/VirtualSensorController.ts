import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CreateSensorUseCase } from '../../application/use-cases/CreateSensorUseCase.js';

export class VirtualSensorController {

    constructor(private createSensorUseCase: CreateSensorUseCase) {}

    async create(req: Request, res: Response) {
        try {
            const { name, lat, lon } = req.body;

            let userId = (req as any).userId;

            if (typeof userId === 'string') {
                userId = userId.replace(/['"]+/g, '').trim();
            }

            if (!name || lat === undefined || lon === undefined || !userId) {
                console.error("Erro de validação - Campos recebidos:", { name, lat, lon, userIdFromToken: userId });
                
                return res.status(400).json({ 
                    error: 'Missing fields. Required: name, lat, lon. (User ID not found in Auth Token. Please log in again.)',
                    received: { name, lat, lon, userId }
                });
            }

            const sensor = await this.createSensorUseCase.execute({ 
                id: uuidv4(),
                name, 
                lat: Number(lat),
                lon: Number(lon), 
                userId,
                active: true
            });

            console.log(`[Sensor Created] ${sensor.name} ID: ${sensor.id} for User: ${userId}`);

            return res.status(201).json(sensor);

        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }
    }

    async list(req: Request, res: Response) {
        return res.status(501).json({ error: "Not implemented in this controller yet" });
    }
}