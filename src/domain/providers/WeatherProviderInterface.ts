export interface WeatherData {
    temperature: number;
    rain: number; 
    humidity: number;
    time: Date;
}

export interface WeatherProviderInterface {
    getCurrentWeather(lat: number, lon: number): Promise<WeatherData>;
}