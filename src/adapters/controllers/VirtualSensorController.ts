import { Request, Response } from 'express';
import { sensorReadingRepositoryInterface } from '../../domain/repositories/SensorReadingRepositoryInterface.js';
import { SensorReading } from '../../domain/entities/SensorReading.js';

export class VirtualSensorController {

    constructor(private sensorRepository: sensorReadingRepositoryInterface) {}

    // Método para simular uma única leitura instantânea
    async simulateOne(req: Request, res: Response): Promise<void> {
        try {
            // Recebemos apenas QUEM é o sensor e QUAL o tipo. O valor nós inventamos.
            const { sensorId, type } = req.body;

            // Lógica simples para gerar dados aleatórios "realistas"
            const generatedValue = this.generateRandomValue(type);

            // Criando a entidade (Respeitando a ordem: id, sensorId, value, type, timestamp)
            const reading = new SensorReading(
                undefined, // ID gerado automaticamente
                sensorId,
                generatedValue,
                type,
                new Date()
            );

            await this.sensorRepository.save(reading);

            res.status(201).json({
                message: 'Virtual reading generated',
                generated_data: {
                    sensorId: reading.sensorId,
                    value: reading.value,
                    type: reading.type
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to simulate reading' });
        }
    }

    // Método auxiliar para gerar valores aleatórios baseados no tipo
    private generateRandomValue(type: string): number {
        switch (type) {
            case 'temperature':
                // Gera temperatura entre 18°C e 35°C
                return Number((Math.random() * (35 - 18) + 18).toFixed(2));
            
            case 'humidity':
                // Gera humidade entre 30% e 90%
                return Number((Math.random() * (90 - 30) + 30).toFixed(2));
            
            case 'rain':
                // Chuva: 0 (sem chuva) ou valor alto (com chuva)
                return Math.random() > 0.8 ? Number((Math.random() * 50).toFixed(2)) : 0;
            
            default:
                return Number((Math.random() * 100).toFixed(2));
        }
    }

    // BÔNUS: Método para gerar várias leituras de uma vez (Carga de teste)
    async simulateBatch(req: Request, res: Response): Promise<void> {
        try {
            const { sensorId, count } = req.body; // ex: count = 50 leituras
            const qtd = count || 10;
            
            const promises = [];

            for (let i = 0; i < qtd; i++) {
                const type = Math.random() > 0.5 ? 'temperature' : 'humidity';
                const reading = new SensorReading(
                    undefined,
                    sensorId,
                    this.generateRandomValue(type),
                    type,
                    new Date() // Aqui você poderia subtrair minutos para simular histórico
                );
                promises.push(this.sensorRepository.save(reading));
            }

            await Promise.all(promises); // Salva tudo em paralelo

            res.status(201).json({ message: `${qtd} virtual readings generated successfully` });

        } catch (error) {
            res.status(500).json({ error: 'Batch simulation failed' });
        }
    }
}