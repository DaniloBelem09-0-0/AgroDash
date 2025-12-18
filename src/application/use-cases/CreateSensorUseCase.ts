import { VirtualSensor } from "../../domain/entities/VirtualSensor.js";
import { SensorRepositoryInterface } from "../../domain/repositories/SensorRepositoryInterface.js";

export class CreateSensorUseCase {

    constructor(private sensorRepository: SensorRepositoryInterface) {}

    public async execute(name: string, lat: number, lon: number, userId: string, id?: string, active: boolean = true) {
        /**
         * name: string, 
         * lat: number,
         * lon: number,
         * userId: string,
         * id?: string,
         * active: boolean = true
         */
        let virtualSensor = new VirtualSensor(name,lat, lon, userId, id, active );
        const sensor = await this.sensorRepository.save(virtualSensor);
        return sensor;
    }
}
