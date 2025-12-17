import { Request, Response } from 'express';
import { sensorReadingRepositoryInterface } from '../../domain/repositories/SensorReadingRepositoryInterface.js';
import { SensorReading } from '../../domain/entities/SensorReading.js';

export class SensorReadingController {

    constructor(private sensorRepository: sensorReadingRepositoryInterface) {}

    async receiveReading(req: Request, res: Response): Promise<void> {
        try {
            const { sensorId, value, type, timestamp } = req.body;

            // ATENÇÃO: Respeitando a ordem do seu construtor:
            // (id, sensorId, value, type, timestamp)
            // Passamos 'undefined' no ID para que a classe gere o UUID
            const reading = new SensorReading(
                undefined, 
                sensorId, 
                value, 
                type, 
                timestamp ? new Date(timestamp) : undefined
            );

            await this.sensorRepository.save(reading);

            res.status(201).json({ message: 'Reading saved', id: reading.id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save reading' });
        }
    }

    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const { sensorId } = req.params;
            const limit = req.query.limit ? Number(req.query.limit) : 10;

            const readings = await this.sensorRepository.listBySensor(sensorId!, limit);

            res.status(200).json(readings);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    }
}