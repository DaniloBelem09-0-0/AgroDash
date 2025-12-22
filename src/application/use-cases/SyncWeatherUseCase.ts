import { UUID } from "crypto";
import { SensorReading } from "../../domain/entities/SensorReading.js";
import { WeatherProviderInterface } from "../../domain/providers/WeatherProviderInterface.js";
import { sensorReadingRepositoryInterface } from "../../domain/repositories/SensorReadingRepositoryInterface.js";

export class SyncWeatherUseCase {
    constructor(
        private sensorReadingRepository: sensorReadingRepositoryInterface,
        private weatherProvider: WeatherProviderInterface
    ) {}

    async execute(lat: number, lon: number, sensorId: UUID) {
        const data = await this.weatherProvider.getCurrentWeather(lat, lon);

        const readingTemp = new SensorReading(
            undefined,
            sensorId,
            data.temperature,
            'temperature',
            data.time
        );

        const readingRain = new SensorReading(
            undefined,
            sensorId,
            data.rain,
            'rain',
            data.time
        );

        await this.sensorReadingRepository.save(readingTemp);
        await this.sensorReadingRepository.save(readingRain);

        console.log(`[Sensor ${sensorId}] Sincronizado: ${data.temperature}°C / ${data.rain}mm`);
    }
}
