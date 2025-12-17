import { SensorReading } from "../entities/SensorReading.js";
import { VirtualSensor } from "../entities/VirtualSensor.js";

export interface sensorReadingRepositoryInterface {
    listBySensor(sensorId: string, limit: number): Promise<SensorReading[]>;
    save(reading: SensorReading): Promise<void>;
}