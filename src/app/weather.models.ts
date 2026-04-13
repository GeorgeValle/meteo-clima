export interface GeoLocation {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly admin1?: string;
  readonly admin2?: string;
  readonly country: string;
  readonly country_code: string;
  readonly timezone: string;
}

export interface GeocodingResponse {
  readonly results?: readonly GeoLocation[];
}

export interface OpenMeteoCurrentWeather {
  readonly time: string;
  readonly temperature_2m: number;
  readonly apparent_temperature: number;
  readonly weather_code: number;
}

export interface OpenMeteoHourlyWeather {
  readonly time: readonly string[];
  readonly temperature_2m: readonly number[];
  readonly weather_code: readonly number[];
}

export interface OpenMeteoDailyWeather {
  readonly time: readonly string[];
  readonly temperature_2m_max: readonly number[];
  readonly temperature_2m_min: readonly number[];
}

export interface OpenMeteoWeatherResponse {
  readonly current?: OpenMeteoCurrentWeather;
  readonly hourly?: OpenMeteoHourlyWeather;
  readonly daily?: OpenMeteoDailyWeather;
}

export interface WeatherForecastHour {
  readonly hour: string;
  readonly temperature: number;
  readonly weatherCode: number;
  readonly weatherEmoji: string;
}

export interface WeatherSnapshot {
  readonly city: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly timezone: string;
  readonly localTime: string;
  readonly temperature: number;
  readonly feelsLike: number;
  readonly minTemperature: number;
  readonly maxTemperature: number;
  readonly weatherCode: number;
  readonly weatherDescription: string;
  readonly weatherEmoji: string;
  readonly hourlyForecast: readonly WeatherForecastHour[];
}
