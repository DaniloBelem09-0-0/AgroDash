import { prisma } from "./prismaClient.js";
import { VirtualSensor } from "../../domain/entities/VirtualSensor.js";
import { SensorRepositoryInterface } from "../../domain/repositories/SensorRepositoryInterface.js";

export class PostgresSensorRepository implements SensorRepositoryInterface {
    
    async save(sensor: VirtualSensor): Promise<void> {
        await prisma.virtualSensor.create({
            data: {
                id: sensor.id,
                name: sensor.name,
                lat: sensor.lat,
                lon: sensor.lon,
                userId: sensor.userId,
                active: sensor.active
            }
        });
    }

    async listBySensor(sensorId: string): Promise<VirtualSensor[]> {
        const sensors = await prisma.virtualSensor.findMany({
            where: { id: sensorId }
        });

        return sensors.map((s: { name: string; lat: number; lon: number; userId: string; id: string | undefined; active: boolean | undefined; }) => new VirtualSensor(s.name, s.lat, s.lon, s.userId, s.id, s.active));
    }

    async delete(sensorId: string): Promise<void> {
        await prisma.virtualSensor.delete({
            where: { id: sensorId }
        });
    }
}