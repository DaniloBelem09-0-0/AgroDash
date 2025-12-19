import { prisma } from "./prismaClient.js";
import { sensorReadingRepositoryInterface } from "../../domain/repositories/SensorReadingRepositoryInterface.js";
import { SensorReading } from "../../domain/entities/SensorReading.js";

export class PostgresSensorReadingRepository implements sensorReadingRepositoryInterface {
    
    async listBySensor(sensorId: string, limit: number): Promise<SensorReading[]> {
        const readings = await prisma.sensorReading.findMany({
            where: { sensorId: sensorId },
            take: limit
        });

        return readings.map((r: { id: string; value: number; type: string; readAt: Date; sensorId: string; }) =>
            new SensorReading(r.id, r.sensorId, r.value, r.type as "temperature" | "humidity" | "rain", r.readAt));
    }

    async save(reading: SensorReading): Promise<void> {
        await prisma.sensorReading.create({
            data: {
                id: reading.id,
                sensorId: reading.sensorId,
                value: reading.value,
                type: reading.type,
                readAt: reading.readAt
            }
        });
    }
}