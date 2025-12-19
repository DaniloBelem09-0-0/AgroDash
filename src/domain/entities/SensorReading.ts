import { randomUUID } from "crypto";

export class SensorReading {
    public readonly sensorId: string;
    public readonly value: number;
    public readonly type: 'temperature' | 'humidity' | 'rain';
    public readonly readAt: Date; 
    public readonly id: string;

    constructor(id?: string, sensorId?: string, value?: number, type?: 'temperature' | 'humidity' | 'rain', readAt?: Date) {
        this.id = (id === '' || id == null) ? randomUUID() : id;
        this.sensorId = sensorId || '';
        this.value = value || 0;
        this.type = type || 'temperature';
        this.readAt = readAt || new Date();
    }
}