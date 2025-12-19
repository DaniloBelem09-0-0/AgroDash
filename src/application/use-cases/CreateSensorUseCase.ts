import { VirtualSensor } from "../../domain/entities/VirtualSensor.js";
import { SensorRepositoryInterface } from "../../domain/repositories/SensorRepositoryInterface.js";
import { RabbitMQService } from "../../infrastructure/messaging/RabbitMQService.js";

/*
export class CreateSensorUseCase {

    constructor(private sensorRepository: SensorRepositoryInterface) {}

    public async execute(reading: VirtualSensor): Promise<VirtualSensor> {
        try{
            console.log('Creating sensor...');
            await this.sensorRepository.save(reading);
            return reading;
        } catch (error) {
            throw new Error('Failed to create sensor');
        }
    }
}
*/

export class CreateSensorUseCase {
    constructor(
        private sensorRepository: SensorRepositoryInterface,
        private mqService: RabbitMQService
    ) {}

    async execute(data: { id: string; name: string; lat: number; lon: number; userId: string; active: boolean }) {
        const sensor = new VirtualSensor(
            data.name,
            data.lat,
            data.lon,
            data.userId,
            data.id,
            data.active
        );

        await this.sensorRepository.save(sensor);
        console.log(`[Database] Sensor ${sensor.name} guardado com sucesso.`);

        try {
            await this.mqService.sendCommand('START', sensor.id, 'temperature');
        } catch (err) {
            console.error('[RabbitMQ] Falha ao enviar comando, mas o sensor foi criado no banco.');
        }

        return sensor;
    }
}