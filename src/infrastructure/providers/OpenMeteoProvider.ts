import { WeatherProviderInterface, WeatherData } from "../../domain/providers/WeatherProviderInterface.js";

export class OpenMeteoProvider implements WeatherProviderInterface {
    async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain&timezone=America%2FSao_Paulo`;

        const response = await fetch(url);
        const data = await response.json();

        return {
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            rain: data.current.rain,
            time: new Date(data.current.time)
        };
    }
}