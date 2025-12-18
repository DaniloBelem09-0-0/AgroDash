import { Request, Response } from 'express';
import { sensorReadingRepositoryInterface } from '../../domain/repositories/SensorReadingRepositoryInterface.js';
import { SensorReading } from '../../domain/entities/SensorReading.js';
import { CreateSensorUseCase } from '../../application/use-cases/CreateSensorUseCase.js';

export class VirtualSensorController {

    constructor(private createSensorUseCase: CreateSensorUseCase, private sensorRepository: sensorReadingRepositoryInterface) {}

    async simulateOne(req: Request, res: Response): Promise<void> {
        try {
            const { name, lat, lon, userId, id, active } = req.body;

            const generatedValue = this.generateRandomValue();

            /**
             * (name: string, lat: number, lon: number, userId: string, id?: string | undefined, active?: boolean): Promise<void>
             */
            await this.createSensorUseCase.execute(name, lat, lon, userId, id, active);

            res.status(201).json({
                message: 'Virtual reading generated',
                generated_data: {
                    sensorId: id,
                    value: generatedValue
                }
            });

            await this.createSensorUseCase.execute(name, lat, lon, userId, id, active);

            res.status(201).json({
                message: 'Virtual reading generated',
                generated_data: {
                    sensorId: id,
                    value: generatedValue
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to simulate reading' });
        }
    }

    private generateRandomValue(type?: string): number {
        const t = type ?? 'default';
        switch (t) {
            case 'temperature':
                return Number((Math.random() * (35 - 18) + 18).toFixed(2));
            
            case 'humidity':
                return Number((Math.random() * (90 - 30) + 30).toFixed(2));
            
            case 'rain':
                return Math.random() > 0.8 ? Number((Math.random() * 50).toFixed(2)) : 0;
            
            default:
                return Number((Math.random() * 100).toFixed(2));
        }
    }

    async simulateBatch(req: Request, res: Response): Promise<void> {
        try {
            const { sensorId, count } = req.body;
            const qtd = count || 10;
            
            const promises = [];

            for (let i = 0; i < qtd; i++) {
                const type = Math.random() > 0.5 ? 'temperature' : 'humidity';
                const reading = new SensorReading(
                    undefined,
                    sensorId,
                    this.generateRandomValue(type),
                    type,
                    new Date()
                );
                promises.push(this.sensorRepository.save(reading));
            }

            await Promise.all(promises);

            res.status(201).json({ message: `${qtd} virtual readings generated successfully` });

        } catch (error) {
            res.status(500).json({ error: 'Batch simulation failed' });
        }
    }
}
