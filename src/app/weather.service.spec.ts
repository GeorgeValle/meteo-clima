import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildGeocodingUrl,
  buildWeatherUrl,
  describeWeatherCode,
  formatLocalTime,
  WeatherService,
} from './weather.service';

describe('weather helpers', () => {
  it('builds the geocoding URL with the requested city', () => {
    const url = buildGeocodingUrl('Buenos Aires');

    expect(url).toContain('https://geocoding-api.open-meteo.com/v1/search');
    expect(url).toContain('name=Buenos+Aires');
    expect(url).toContain('count=1');
    expect(url).toContain('format=json');
  });

  it('builds the geocoding URL with a custom suggestion count', () => {
    const url = buildGeocodingUrl('Buenos Aires', 5);

    expect(url).toContain('count=5');
  });

  it('builds the weather URL with local-time and required variables', () => {
    const url = buildWeatherUrl(-34.6, -58.38);

    expect(url).toContain('https://api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=-34.6');
    expect(url).toContain('longitude=-58.38');
    expect(url).toContain('current=temperature_2m%2Capparent_temperature%2Cweather_code');
    expect(url).toContain('hourly=temperature_2m%2Cweather_code');
    expect(url).toContain('daily=temperature_2m_max%2Ctemperature_2m_min');
    expect(url).toContain('forecast_days=2');
    expect(url).toContain('timezone=auto');
  });

  it('formats local-time strings', () => {
    expect(formatLocalTime('2026-04-11T14:35')).toBe('14:35');
    expect(formatLocalTime('2026-04-11T14:35:00Z')).toBe('14:35');
  });

  it('maps weather codes to stable descriptions and emoji', () => {
    expect(describeWeatherCode(0)).toEqual({ description: 'Cielo despejado', emoji: '☀️' });
    expect(describeWeatherCode(61)).toEqual({ description: 'Lluvia', emoji: '🌧️' });
    expect(describeWeatherCode(95)).toEqual({ description: 'Tormenta eléctrica', emoji: '⛈️' });
  });
});

describe('WeatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('searches Open-Meteo and maps the result into a weather snapshot', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              latitude: 52.52,
              longitude: 13.41,
              name: 'Berlin',
              country: 'Germany',
              country_code: 'DE',
              timezone: 'Europe/Berlin',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current: {
            apparent_temperature: 17.3,
            temperature_2m: 18.1,
            time: '2026-04-11T12:30',
            weather_code: 2,
          },
          daily: {
            temperature_2m_max: [22.4],
            temperature_2m_min: [13.8],
            time: ['2026-04-11'],
          },
          hourly: {
            temperature_2m: [18.1, 19.2, 20.5, 21.1, 20.3, 19.4, 18.7],
            time: [
              '2026-04-11T12:00',
              '2026-04-11T13:00',
              '2026-04-11T14:00',
              '2026-04-11T15:00',
              '2026-04-11T16:00',
              '2026-04-11T17:00',
              '2026-04-11T18:00',
            ],
            weather_code: [2, 2, 1, 3, 61, 61, 61],
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const service = new WeatherService();
    const result = await service.searchWeather(' Berlin ');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      city: 'Berlin',
      country: 'Germany',
      feelsLike: 17.3,
      latitude: 52.52,
      localTime: '12:30',
      longitude: 13.41,
      maxTemperature: 22.4,
      minTemperature: 13.8,
      hourlyForecast: [
        { hour: '13:00', temperature: 19.2, weatherCode: 2, weatherEmoji: '⛅' },
        { hour: '14:00', temperature: 20.5, weatherCode: 1, weatherEmoji: '⛅' },
        { hour: '15:00', temperature: 21.1, weatherCode: 3, weatherEmoji: '⛅' },
        { hour: '16:00', temperature: 20.3, weatherCode: 61, weatherEmoji: '🌧️' },
        { hour: '17:00', temperature: 19.4, weatherCode: 61, weatherEmoji: '🌧️' },
        { hour: '18:00', temperature: 18.7, weatherCode: 61, weatherEmoji: '🌧️' },
      ],
      temperature: 18.1,
      timezone: 'Europe/Berlin',
      weatherCode: 2,
      weatherDescription: 'Parcialmente nublado',
      weatherEmoji: '⛅',
    });
  });

  it('searches weather directly for a selected location', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
        json: async () => ({
          current: {
            apparent_temperature: 17.3,
            temperature_2m: 18.1,
            time: '2026-04-11T12:30',
            weather_code: 2,
          },
          daily: {
            temperature_2m_max: [22.4],
            temperature_2m_min: [13.8],
            time: ['2026-04-11'],
          },
          hourly: {
            temperature_2m: [18.1, 19.2, 20.5, 21.1, 20.3, 19.4, 18.7],
            time: [
              '2026-04-11T12:00',
              '2026-04-11T13:00',
              '2026-04-11T14:00',
              '2026-04-11T15:00',
              '2026-04-11T16:00',
              '2026-04-11T17:00',
              '2026-04-11T18:00',
            ],
            weather_code: [2, 2, 1, 3, 61, 61, 61],
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const service = new WeatherService();
    const result = await service.searchWeatherByLocation({
      id: 1,
      latitude: 52.52,
      longitude: 13.41,
      name: 'Berlin',
      country: 'Germany',
      country_code: 'DE',
      timezone: 'Europe/Berlin',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.city).toBe('Berlin');
    expect(result.weatherDescription).toBe('Parcialmente nublado');
  });

  it('throws a typed error when Open-Meteo returns no geocoding results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      }),
    );

    const service = new WeatherService();

    await expect(service.searchWeather('Nowhere City')).rejects.toMatchObject({
      code: 'no_results',
      message: 'No se encontró una ciudad que coincida con "Nowhere City".',
      name: 'WeatherLookupError',
    });
  });

  it('returns city suggestions from Open-Meteo geocoding results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              latitude: 52.52,
              longitude: 13.41,
              name: 'Berlin',
              country: 'Germany',
              country_code: 'DE',
              timezone: 'Europe/Berlin',
            },
            {
              id: 2,
              latitude: 40.4,
              longitude: -3.7,
              name: 'Berlin',
              country: 'United States',
              country_code: 'US',
              timezone: 'America/New_York',
            },
          ],
        }),
      }),
    );

    const service = new WeatherService();
    const suggestions = await service.searchCitySuggestions('Berl');

    expect(suggestions).toHaveLength(2);
    expect(suggestions[0]).toMatchObject({
      name: 'Berlin',
      country: 'Germany',
    });
  });
});
