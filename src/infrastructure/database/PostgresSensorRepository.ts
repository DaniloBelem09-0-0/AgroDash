import { prisma } from "./prismaClient.js";
import { VirtualSensor } from "../../domain/entities/VirtualSensor.js";
import { SensorRepositoryInterface } from "../../domain/repositories/SensorRepositoryInterface.js";

export class PostgresSensorRepository implements SensorRepositoryInterface {
    
    async save(sensor: VirtualSensor): Promise<void> {
        console.log('Saving sensor to database...', sensor.id);
        await prisma.sensor.create({
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
        const sensors = await prisma.sensor.findMany({
            where: { id: sensorId }
        });

        return sensors.map((s: { name: string; lat: number; lon: number; userId: string; id: string | undefined; active: boolean | undefined; }) => new VirtualSensor(s.name, s.lat, s.lon, s.userId, s.id as `${string}-${string}-${string}-${string}-${string}` | undefined, s.active));
    }

    async delete(sensorId: string): Promise<void> {
        await prisma.sensor.delete({
            where: { id: sensorId }
        });
    }

    async list(): Promise<VirtualSensor[]> {
        const sensors = await prisma.sensor.findMany();

        return sensors.map((s: { name: string; lat: number; lon: number; userId: string; id: string | undefined; active: boolean | undefined; }) => new VirtualSensor(s.name, s.lat, s.lon, s.userId, s.id as `${string}-${string}-${string}-${string}-${string}` | undefined, s.active));
    }
}