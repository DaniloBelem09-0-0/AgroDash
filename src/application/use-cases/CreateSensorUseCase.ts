import { VirtualSensor } from "../../domain/entities/VirtualSensor.js";
import { SensorRepositoryInterface } from "../../domain/repositories/SensorRepositoryInterface.js";

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

