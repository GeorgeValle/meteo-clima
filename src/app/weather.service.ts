import { Injectable } from '@angular/core';
import {
  GeoLocation,
  OpenMeteoCurrentWeather,
  OpenMeteoDailyWeather,
  OpenMeteoHourlyWeather,
  WeatherSnapshot,
  WeatherForecastHour,
} from './weather.models';

export type WeatherLookupErrorCode =
  | 'empty_query'
  | 'no_results'
  | 'invalid_response'
  | 'network_error';

export class WeatherLookupError extends Error {
  constructor(
    message: string,
    public readonly code: WeatherLookupErrorCode,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'WeatherLookupError';
  }
}

export interface WeatherCondition {
  readonly description: string;
  readonly emoji: string;
}

const UPCOMING_HOURLY_FORECAST_COUNT = 12;
const LOCATION_ADMIN_FIELDS = ['admin1', 'admin2', 'admin3', 'admin4'] as const;

export function buildGeocodingUrl(cityName: string, count = 1): string {
  const params = new URLSearchParams({
    count: String(count),
    format: 'json',
    language: 'en',
    name: cityName.trim(),
  });

  return `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;
}

export function buildWeatherUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    current: 'temperature_2m,apparent_temperature,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min',
    forecast_days: '2',
    hourly: 'temperature_2m,weather_code',
    latitude: String(latitude),
    longitude: String(longitude),
    temperature_unit: 'celsius',
    timeformat: 'iso8601',
    timezone: 'auto',
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export function formatLocalTime(value: string): string {
  const timePart = value.includes('T') ? value.split('T')[1] : value;
  const trimmed = timePart.replace(/Z$/, '').slice(0, 5);

  return trimmed || value;
}

export function describeWeatherCode(code: number): WeatherCondition {
  if (code === 0) {
    return { description: 'Cielo despejado', emoji: '☀️' };
  }

  if (code === 1 || code === 2 || code === 3) {
    return { description: 'Parcialmente nublado', emoji: '⛅' };
  }

  if (code === 45 || code === 48) {
    return { description: 'Niebla', emoji: '🌫️' };
  }

  if (code === 51 || code === 53 || code === 55) {
    return { description: 'Llovizna', emoji: '🌦️' };
  }

  if (code === 56 || code === 57) {
    return { description: 'Llovizna helada', emoji: '🌧️' };
  }

  if (code === 61 || code === 63 || code === 65) {
    return { description: 'Lluvia', emoji: '🌧️' };
  }

  if (code === 66 || code === 67) {
    return { description: 'Lluvia helada', emoji: '🌧️' };
  }

  if (code === 71 || code === 73 || code === 75) {
    return { description: 'Nieve', emoji: '❄️' };
  }

  if (code === 77) {
    return { description: 'Gránulos de nieve', emoji: '❄️' };
  }

  if (code === 80 || code === 81 || code === 82) {
    return { description: 'Chubascos', emoji: '🌦️' };
  }

  if (code === 85 || code === 86) {
    return { description: 'Chubascos de nieve', emoji: '🌨️' };
  }

  if (code === 95 || code === 96 || code === 99) {
    return { description: 'Tormenta eléctrica', emoji: '⛈️' };
  }

  return { description: 'Clima mixto', emoji: '🌤️' };
}

export function formatLocationLabel(location: GeoLocation): string {
  const region = getLocationRegion(location);

  if (region) {
    return `${location.name}, ${region} — ${location.country}`;
  }

  return `${location.name} — ${location.country}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isOptionalString(value: unknown): value is string | undefined {
  return typeof value === 'undefined' || isString(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(isString);
}

function isNumberArray(value: unknown): value is readonly number[] {
  return Array.isArray(value) && value.every(isFiniteNumber);
}

function isLocation(value: unknown): value is GeoLocation {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isFiniteNumber(value['id']) &&
    isFiniteNumber(value['latitude']) &&
    isFiniteNumber(value['longitude']) &&
    isString(value['name']) &&
    isOptionalString(value['admin1']) &&
    isOptionalString(value['admin2']) &&
    isOptionalString(value['admin3']) &&
    isOptionalString(value['admin4']) &&
    isString(value['country']) &&
    isString(value['country_code']) &&
    isString(value['timezone'])
  );
}

function isCurrentWeather(value: unknown): value is OpenMeteoCurrentWeather {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value['time']) &&
    isFiniteNumber(value['temperature_2m']) &&
    isFiniteNumber(value['apparent_temperature']) &&
    isFiniteNumber(value['weather_code'])
  );
}

function isDailyWeather(value: unknown): value is OpenMeteoDailyWeather {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isStringArray(value['time']) &&
    isNumberArray(value['temperature_2m_max']) &&
    isNumberArray(value['temperature_2m_min'])
  );
}

function isHourlyWeather(value: unknown): value is OpenMeteoHourlyWeather {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isStringArray(value['time']) &&
    isNumberArray(value['temperature_2m']) &&
    isNumberArray(value['weather_code']) &&
    value['time'].length === value['temperature_2m'].length &&
    value['time'].length === value['weather_code'].length
  );
}

function buildUpcomingHourlyForecast(
  hourly: OpenMeteoHourlyWeather,
  currentTime: string,
  count = 6,
): readonly WeatherForecastHour[] {
  const forecast: WeatherForecastHour[] = [];

  for (let index = 0; index < hourly.time.length; index += 1) {
    const time = hourly.time[index];

    if (time <= currentTime) {
      continue;
    }

    const temperature = hourly.temperature_2m[index];
    const weatherCode = hourly.weather_code[index];

    if (!isFiniteNumber(temperature) || !isFiniteNumber(weatherCode)) {
      continue;
    }

    const condition = describeWeatherCode(weatherCode);

    forecast.push({
      hour: formatLocalTime(time),
      temperature,
      weatherCode,
      weatherEmoji: condition.emoji,
    });

    if (forecast.length === count) {
      break;
    }
  }

  return forecast;
}

function normalizeLocationText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function getLocationRegion(location: GeoLocation): string | null {
  const normalizedName = normalizeLocationText(location.name);
  const candidates = LOCATION_ADMIN_FIELDS.flatMap((field) => {
    const value = location[field]?.trim();

    return value ? [value] : [];
  });
  const uniqueCandidates = candidates.filter((candidate, index, values) => {
    const normalizedCandidate = normalizeLocationText(candidate);

    return (
      normalizedCandidate !== normalizedName &&
      values.findIndex((value) => normalizeLocationText(value) === normalizedCandidate) === index
    );
  });

  return uniqueCandidates[0] ?? null;
}

function getLocationDeduplicationKey(location: GeoLocation): string {
  const roundedLatitude = location.latitude.toFixed(4);
  const roundedLongitude = location.longitude.toFixed(4);

  return [
    normalizeLocationText(location.name),
    normalizeLocationText(location.country),
    normalizeLocationText(location.country_code),
    ...LOCATION_ADMIN_FIELDS.map((field) => normalizeLocationText(location[field] ?? '')),
    roundedLatitude,
    roundedLongitude,
  ].join('|');
}

function dedupeLocations(locations: readonly GeoLocation[]): readonly GeoLocation[] {
  const seenById = new Set<number>();
  const seenByContext = new Set<string>();
  const uniqueLocations: GeoLocation[] = [];

  for (const location of locations) {
    if (seenById.has(location.id)) {
      continue;
    }

    const key = getLocationDeduplicationKey(location);
    if (seenByContext.has(key)) {
      continue;
    }

    seenById.add(location.id);
    seenByContext.add(key);
    uniqueLocations.push(location);
  }

  return uniqueLocations;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  async searchCitySuggestions(cityName: string): Promise<readonly GeoLocation[]> {
    const query = cityName.trim();

    if (query.length < 4) {
      return [];
    }

    const response = await this.requestJson(buildGeocodingUrl(query, 7));
    if (!isRecord(response)) {
      return [];
    }

    const results = response['results'];

    if (!Array.isArray(results)) {
      return [];
    }

    return dedupeLocations(results.filter(isLocation));
  }

  async searchWeatherByLocation(location: GeoLocation): Promise<WeatherSnapshot> {
    return this.fetchWeatherSnapshot(location);
  }

  async searchWeather(cityName: string): Promise<WeatherSnapshot> {
    const query = cityName.trim();

    if (!query) {
      throw new WeatherLookupError('Ingresá una ciudad o ubicación.', 'empty_query');
    }

    const location = await this.findLocation(query);
    return this.fetchWeatherSnapshot(location);
  }

  private async findLocation(cityName: string): Promise<GeoLocation> {
    const response = await this.requestJson(buildGeocodingUrl(cityName));
    if (!isRecord(response)) {
      throw new WeatherLookupError(
        `No se encontró una ciudad o ubicación que coincida con "${cityName}".`,
        'no_results',
      );
    }

    const results = response['results'];
    const location = Array.isArray(results) ? results[0] : undefined;

    if (!location || !isLocation(location)) {
      throw new WeatherLookupError(
        `No se encontró una ciudad o ubicación que coincida con "${cityName}".`,
        'no_results',
      );
    }

    return location;
  }

  private async fetchWeatherSnapshot(location: GeoLocation): Promise<WeatherSnapshot> {
    const response = await this.requestJson(buildWeatherUrl(location.latitude, location.longitude));

    if (!isRecord(response)) {
      throw new WeatherLookupError('Open-Meteo devolvió un paquete de clima inválido.', 'invalid_response');
    }

    const current = response['current'];
    const daily = response['daily'];
    const hourly = response['hourly'];

    if (!isCurrentWeather(current) || !isDailyWeather(daily) || !isHourlyWeather(hourly)) {
      throw new WeatherLookupError('Open-Meteo devolvió un paquete de clima inválido.', 'invalid_response');
    }

    const minTemperature = daily['temperature_2m_min'][0];
    const maxTemperature = daily['temperature_2m_max'][0];

    if (!isFiniteNumber(minTemperature) || !isFiniteNumber(maxTemperature)) {
      throw new WeatherLookupError(
        'Open-Meteo no incluyó las temperaturas diarias necesarias.',
        'invalid_response',
      );
    }

    const hourlyForecast = buildUpcomingHourlyForecast(
      hourly,
      current['time'],
      UPCOMING_HOURLY_FORECAST_COUNT,
    );

    if (hourlyForecast.length !== UPCOMING_HOURLY_FORECAST_COUNT) {
      throw new WeatherLookupError(
        'Open-Meteo no incluyó doce horas futuras de pronóstico.',
        'invalid_response',
      );
    }

    const condition = describeWeatherCode(current['weather_code']);

    return {
      city: location.name,
      country: location.country,
      feelsLike: current['apparent_temperature'],
      latitude: location.latitude,
      localTime: formatLocalTime(current['time']),
      longitude: location.longitude,
      maxTemperature,
      minTemperature,
      temperature: current['temperature_2m'],
      timezone: location.timezone,
      weatherCode: current['weather_code'],
      weatherDescription: condition.description,
      weatherEmoji: condition.emoji,
      hourlyForecast,
    };
  }

  private async requestJson(url: string): Promise<unknown> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new WeatherLookupError(
          `La solicitud a Open-Meteo falló con estado ${response.status}.`,
          'network_error',
        );
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof WeatherLookupError) {
        throw error;
      }

      throw new WeatherLookupError('No se pudo conectar con Open-Meteo.', 'network_error', error);
    }
  }
}
