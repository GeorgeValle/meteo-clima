// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { LAST_CITY_STORAGE_KEY } from './last-city.storage';
import { App } from './app';
import { WeatherService } from './weather.service';
import type { GeoLocation, WeatherForecastHour, WeatherSnapshot } from './weather.models';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createHourlyForecast(): readonly WeatherForecastHour[] {
  return [
    { hour: '13:00', temperature: 19.1, weatherCode: 2, weatherEmoji: '⛅' },
    { hour: '14:00', temperature: 20.3, weatherCode: 2, weatherEmoji: '⛅' },
    { hour: '15:00', temperature: 21.4, weatherCode: 1, weatherEmoji: '⛅' },
    { hour: '16:00', temperature: 20.8, weatherCode: 3, weatherEmoji: '⛅' },
    { hour: '17:00', temperature: 19.6, weatherCode: 61, weatherEmoji: '🌧️' },
    { hour: '18:00', temperature: 18.9, weatherCode: 61, weatherEmoji: '🌧️' },
    { hour: '19:00', temperature: 18.2, weatherCode: 61, weatherEmoji: '🌧️' },
    { hour: '20:00', temperature: 17.8, weatherCode: 3, weatherEmoji: '⛅' },
    { hour: '21:00', temperature: 17.4, weatherCode: 2, weatherEmoji: '⛅' },
    { hour: '22:00', temperature: 16.9, weatherCode: 1, weatherEmoji: '⛅' },
    { hour: '23:00', temperature: 16.5, weatherCode: 2, weatherEmoji: '⛅' },
    { hour: '00:00', temperature: 16.2, weatherCode: 2, weatherEmoji: '⛅' },
  ];
}

function createWeatherSnapshot(city = 'Berlin', overrides: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  return {
    city,
    country: 'Germany',
    feelsLike: 17.2,
    latitude: 52.52,
    localTime: '12:30',
    longitude: 13.41,
    maxTemperature: 22.4,
    minTemperature: 13.8,
    temperature: 18.1,
    timezone: 'Europe/Berlin',
    weatherCode: 2,
    weatherDescription: 'Parcialmente nublado',
    weatherEmoji: '⛅',
    hourlyForecast: createHourlyForecast(),
    ...overrides,
  };
}

interface WeatherServiceStub {
  searchWeather: (city: string) => Promise<WeatherSnapshot>;
  searchWeatherByLocation: (location: GeoLocation) => Promise<WeatherSnapshot>;
  searchCitySuggestions: (query: string) => Promise<readonly GeoLocation[]>;
}

function createWeatherServiceStub(overrides: Partial<WeatherServiceStub> = {}): WeatherServiceStub {
  return {
    searchWeather: vi.fn().mockResolvedValue(createWeatherSnapshot()),
    searchWeatherByLocation: vi.fn().mockResolvedValue(createWeatherSnapshot()),
    searchCitySuggestions: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function configureApp(overrides: Partial<WeatherServiceStub> = {}): Promise<WeatherServiceStub> {
    TestBed.resetTestingModule();
    const service = createWeatherServiceStub(overrides);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: WeatherService, useValue: service }],
    }).compileComponents();

    return service;
  }

  it('should create the app', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('MeteoClima');
  });

  it('should render the inferred alerts label and helper text', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alertas climáticas (inferidas)');
    expect(compiled.textContent).toContain('Basadas en condiciones climáticas actuales');
  });

  it('should infer rain alerts from the 12-hour forecast', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 19, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '14:00', temperature: 18, weatherCode: 61, weatherEmoji: '🌧️' },
          { hour: '15:00', temperature: 18, weatherCode: 63, weatherEmoji: '🌧️' },
          { hour: '16:00', temperature: 17, weatherCode: 61, weatherEmoji: '🌧️' },
          { hour: '17:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 14, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lluvias probables en las próximas horas.');
  });

  it('should infer llovizna alerts when precipitation is light', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 19, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '14:00', temperature: 18, weatherCode: 51, weatherEmoji: '🌦️' },
          { hour: '15:00', temperature: 18, weatherCode: 53, weatherEmoji: '🌦️' },
          { hour: '16:00', temperature: 17, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '17:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 14, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Posibles lloviznas en las próximas horas.');
  });

  it('should infer storm alerts when severe codes appear in the forecast', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 19, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '14:00', temperature: 18, weatherCode: 95, weatherEmoji: '⛈️' },
          { hour: '15:00', temperature: 17, weatherCode: 96, weatherEmoji: '⛈️' },
          { hour: '16:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '17:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 14, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Posibles tormentas en las próximas horas.');
  });

  it('should infer fog alerts when fog codes appear in the forecast', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 19, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '14:00', temperature: 18, weatherCode: 45, weatherEmoji: '🌫️' },
          { hour: '15:00', temperature: 17, weatherCode: 48, weatherEmoji: '🌫️' },
          { hour: '16:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '17:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 14, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Presencia de neblina en las próximas horas.');
  });

  it('should infer heat alerts when clear forecast hours are hot', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 27.2, weatherCode: 0, weatherEmoji: '☀️' },
          { hour: '14:00', temperature: 28.1, weatherCode: 0, weatherEmoji: '☀️' },
          { hour: '15:00', temperature: 26, weatherCode: 1, weatherEmoji: '⛅' },
          { hour: '16:00', temperature: 25, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '17:00', temperature: 24, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 23, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 22, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 22, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 21, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 20, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 19, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 18, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alta exposición solar en las próximas horas.');
  });

  it('should avoid contradictory heat alert when weather risk is already present', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 29, weatherCode: 0, weatherEmoji: '☀️' },
          { hour: '14:00', temperature: 28, weatherCode: 95, weatherEmoji: '⛈️' },
          { hour: '15:00', temperature: 27, weatherCode: 1, weatherEmoji: '☀️' },
          { hour: '16:00', temperature: 25, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '17:00', temperature: 24, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 23, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 22, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 21, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 20, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 19, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 18, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 17, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const alerts = fixture.componentInstance.inferredAlerts();
    expect(alerts).toContain('Posibles tormentas en las próximas horas.');
    expect(alerts).not.toContain('Alta exposición solar en las próximas horas.');
    expect(alerts.length).toBeLessThanOrEqual(2);
  });

  it('should infer cold alerts when forecast temperatures are low', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 8.2, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '14:00', temperature: 8, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '15:00', temperature: 7.6, weatherCode: 1, weatherEmoji: '⛅' },
          { hour: '16:00', temperature: 7.2, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '17:00', temperature: 7, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 6.8, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 6.6, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 6.4, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 6.2, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 6, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 5.8, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 5.6, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Temperaturas bajas en las próximas horas.');
  });

  it('should fall back to stable conditions when the forecast has no relevant events', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(
      createWeatherSnapshot('Berlin', {
        hourlyForecast: [
          { hour: '13:00', temperature: 19, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '14:00', temperature: 18, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '15:00', temperature: 17, weatherCode: 1, weatherEmoji: '⛅' },
          { hour: '16:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '17:00', temperature: 16, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '18:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '19:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '20:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '21:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '22:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '23:00', temperature: 15, weatherCode: 2, weatherEmoji: '⛅' },
          { hour: '00:00', temperature: 14, weatherCode: 2, weatherEmoji: '⛅' },
        ],
      }),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Condiciones estables en las próximas horas.');
  });

  it('should round all visible temperatures in the weather card and hourly forecast', async () => {
    await configureApp();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.weather.set(createWeatherSnapshot('Berlin'));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.forecast-item')).toHaveLength(12);
    expect(compiled.textContent).toContain('18°C');
    expect(compiled.textContent).toContain('17°C');
    expect(compiled.textContent).toContain('22°C');
    expect(compiled.textContent).toContain('14°C');
  });

  it('should restore and search the saved city on init', async () => {
    localStorage.setItem(LAST_CITY_STORAGE_KEY, 'Berlin');

    const searchWeather = vi.fn().mockResolvedValue(createWeatherSnapshot('Berlin'));

    await configureApp({ searchWeather });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(searchWeather).toHaveBeenCalledWith('Berlin');
    expect(fixture.componentInstance.cityQuery()).toBe('Berlin');
    expect(fixture.componentInstance.weather()).toEqual(createWeatherSnapshot('Berlin'));
  });

  it('should persist successful searches to localStorage', async () => {
    const searchWeather = vi.fn().mockResolvedValue(createWeatherSnapshot('Lisbon'));

    await configureApp({ searchWeather });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.cityQuery.set('  Lisbon  ');
    await app.searchCity();

    expect(searchWeather).toHaveBeenCalledWith('Lisbon');
    expect(localStorage.getItem(LAST_CITY_STORAGE_KEY)).toBe('Lisbon');
    expect(app.weather()).toEqual(createWeatherSnapshot('Lisbon'));
  });

  it('should set loading state while searching and reflect the resolved city', async () => {
    let resolveSearch!: (value: WeatherSnapshot) => void;
    const searchWeather = vi.fn().mockImplementation(
      () =>
        new Promise<WeatherSnapshot>((resolve) => {
          resolveSearch = resolve;
        }),
    );

    await configureApp({ searchWeather });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.updateCityQuery('  Buenos Aires  ');

    const searchPromise = app.searchCity();

    expect(app.loading()).toBe(true);
    expect(app.error()).toBeNull();
    expect(app.cityQuery()).toBe('Buenos Aires');

    resolveSearch(createWeatherSnapshot('Buenos Aires'));
    await searchPromise;

    expect(searchWeather).toHaveBeenCalledWith('Buenos Aires');
    expect(app.loading()).toBe(false);
    expect(app.cityQuery()).toBe('Buenos Aires');
    expect(app.weather()?.city).toBe('Buenos Aires');
  });

  it('should expose a user-friendly error when the search fails', async () => {
    const searchWeather = vi.fn().mockRejectedValue(new Error('boom'));

    await configureApp({ searchWeather });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.updateCityQuery('Madrid');

    await app.searchCity();

    expect(searchWeather).toHaveBeenCalledWith('Madrid');
    expect(app.loading()).toBe(false);
    expect(app.weather()).toBeNull();
    expect(app.error()).toBe('No se pudo cargar la información del clima.');
    expect(app.cityQuery()).toBe('Madrid');
  });

  it('should fetch and select autocomplete suggestions after four characters', async () => {
    const suggestions = [
      {
        id: 1,
        latitude: -34.72,
        longitude: -58.64,
        name: 'Merlo',
        admin1: 'Merlo',
        admin2: 'Buenos Aires',
        country: 'Argentina',
        country_code: 'AR',
        timezone: 'America/Argentina/Buenos_Aires',
      },
      {
        id: 2,
        latitude: -32.35,
        longitude: -65.01,
        name: 'Villa de Merlo',
        admin1: 'San Luis',
        admin2: 'Junín',
        country: 'Argentina',
        country_code: 'AR',
        timezone: 'America/Argentina/San_Luis',
      },
      {
        id: 3,
        latitude: -31.41,
        longitude: -64.19,
        name: 'La Calera',
        admin3: 'Córdoba',
        country: 'Argentina',
        country_code: 'AR',
        timezone: 'America/Argentina/Cordoba',
      },
      {
        id: 4,
        latitude: -34.58,
        longitude: -58.43,
        name: 'Palermo',
        admin1: 'Buenos Aires',
        country: 'Argentina',
        country_code: 'AR',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    ] satisfies readonly GeoLocation[];

    const searchCitySuggestions = vi.fn().mockResolvedValue(suggestions);
    const searchWeatherByLocation = vi.fn().mockResolvedValue(createWeatherSnapshot('Merlo'));

    await configureApp({ searchWeatherByLocation, searchCitySuggestions });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.updateCityQuery('Merl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(searchCitySuggestions).toHaveBeenCalledWith('Merl');
    const suggestionButtons = fixture.nativeElement.querySelectorAll('.autocomplete-item');
    expect(suggestionButtons).toHaveLength(4);
    expect((suggestionButtons[0] as HTMLButtonElement).textContent).toContain('Merlo, Buenos Aires — Argentina');
    expect((suggestionButtons[1] as HTMLButtonElement).textContent).toContain('Villa de Merlo, San Luis — Argentina');
    expect((suggestionButtons[2] as HTMLButtonElement).textContent).toContain('La Calera, Córdoba — Argentina');
    expect((suggestionButtons[3] as HTMLButtonElement).textContent).toContain('Palermo, Buenos Aires — Argentina');

    (suggestionButtons[0] as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(searchWeatherByLocation).toHaveBeenCalledWith(suggestions[0]);
    expect(app.cityQuery()).toBe('Merlo');
    expect(app.suggestions()).toHaveLength(0);
    expect(app.weather()?.city).toBe('Merlo');
  });

  it('should show autocomplete loading while fetching suggestions', async () => {
    let resolveSuggestions!: (value: readonly GeoLocation[]) => void;
    const searchCitySuggestions = vi.fn().mockImplementation(
      () =>
        new Promise<readonly GeoLocation[]>((resolve) => {
          resolveSuggestions = resolve;
        }),
    );

    await configureApp({ searchCitySuggestions });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.updateCityQuery('Berl');

    expect(app.suggestionsLoading()).toBe(true);

    resolveSuggestions([]);
    await fixture.whenStable();

    expect(app.suggestionsLoading()).toBe(false);
  });

  it('should close suggestions on Escape and click outside', async () => {
    const searchCitySuggestions = vi.fn().mockResolvedValue([
      { id: 1, latitude: 52.52, longitude: 13.41, name: 'Berlin', country: 'Alemania', country_code: 'DE', timezone: 'Europe/Berlin' },
    ] satisfies readonly GeoLocation[]);

    await configureApp({ searchCitySuggestions });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.updateCityQuery('Berl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(app.suggestions()).toHaveLength(1);

    const input = fixture.nativeElement.querySelector('#city-input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(app.suggestions()).toHaveLength(0);

    app.updateCityQuery('Berl');
    await fixture.whenStable();
    fixture.detectChanges();

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(app.suggestions()).toHaveLength(0);
  });
});
