import { VirtualSensor } from "../entities/VirtualSensor.js";

export interface SensorRepositoryInterface {
    save(reading: VirtualSensor): Promise<void>;
    listBySensor(sensorId: string, limit: number): Promise<VirtualSensor[]>;
    delete(sensorId: string): Promise<void>;
}