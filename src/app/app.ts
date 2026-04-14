import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { readLastCity, writeLastCity } from './last-city.storage';
import { GeoLocation, WeatherSnapshot } from './weather.models';
import {
  formatLocationLabel as formatGeoLocationLabel,
  WeatherLookupError,
  WeatherService,
} from './weather.service';

const RAIN_CODES = new Set([61, 63, 65, 66, 67, 80, 81, 82]);
const STORM_CODES = new Set([95, 96, 99]);
const FOG_CODES = new Set([45, 48]);
const DRIZZLE_CODES = new Set([51, 53, 55, 56, 57]);
const CLEAR_CODES = new Set([0, 1]);
const HOT_TEMPERATURE_THRESHOLD = 27;
const COLD_TEMPERATURE_THRESHOLD = 8;
const RAIN_ALERT_THRESHOLD = 3;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  readonly title = signal('MeteoClima');
  readonly formatLocationLabel = formatGeoLocationLabel;
  readonly cityQuery = signal('');
  readonly suggestions = signal<readonly GeoLocation[]>([]);
  readonly suggestionsLoading = signal(false);
  readonly activeSuggestionIndex = signal(-1);
  readonly weather = signal<WeatherSnapshot | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly inferredAlerts = computed(() => this.buildInferredAlerts(this.weather()));

  private readonly weatherService = inject(WeatherService);
  @ViewChild('searchBox', { read: ElementRef }) private readonly searchBoxRef?: ElementRef<HTMLElement>;
  private suggestionSearchToken = 0;

  async ngOnInit(): Promise<void> {
    const savedCity = readLastCity();

    if (!savedCity) {
      return;
    }

    this.cityQuery.set(savedCity);
    await this.runSearch(savedCity, false);
  }

  async searchCity(city = this.cityQuery()): Promise<void> {
    this.clearSuggestions();
    await this.runSearch(city, true);
  }

  updateCityQuery(value: string): void {
    this.cityQuery.set(value);
    void this.updateSuggestions(value);
  }

  selectSuggestion(suggestion: GeoLocation): void {
    this.cityQuery.set(suggestion.name);
    this.clearSuggestions();
    void this.runSearch(suggestion, true);
  }

  roundTemperature(value: number): number {
    return Math.round(value);
  }

  protected buildInferredAlerts(weather: WeatherSnapshot | null): readonly string[] {
    if (!weather) {
      return ['Buscá una ciudad o ubicación para ver alertas climáticas inferidas.'];
    }

    const forecast = weather.hourlyForecast.slice(0, 12);
    const weatherAlert = this.buildWeatherAlert(forecast);
    const temperatureAlert = this.buildTemperatureAlert(forecast, Boolean(weatherAlert));
    const alerts = [weatherAlert, temperatureAlert]
      .filter((alert): alert is string => Boolean(alert))
      .slice(0, 2);

    if (alerts.length > 0) {
      return alerts;
    }

    return ['Condiciones estables en las próximas horas.'];
  }

  onCityInputKeydown(event: KeyboardEvent): void {
    const suggestions = this.suggestions();

    if (!suggestions.length) {
      if (event.key === 'Escape') {
        this.clearSuggestions();
      }

      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveActiveSuggestion(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActiveSuggestion(-1);
      return;
    }

    if (event.key === 'Enter') {
      const activeIndex = this.activeSuggestionIndex();

      if (activeIndex >= 0) {
        event.preventDefault();
        const suggestion = suggestions[activeIndex];

        if (suggestion) {
          this.selectSuggestion(suggestion);
        }
      }

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.clearSuggestions();
    }
  }

  onSearchBoxFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;

    if (!nextTarget || !this.searchBoxRef?.nativeElement.contains(nextTarget)) {
      this.clearSuggestions();
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    const target = event.target as Node | null;

    if (!target || !this.searchBoxRef?.nativeElement.contains(target)) {
      this.clearSuggestions();
    }
  }

  private async runSearch(city: string | GeoLocation, persistCity: boolean): Promise<void> {
    const query = typeof city === 'string' ? city.trim() : city.name;

    this.cityQuery.set(query);

    if (!query) {
      this.weather.set(null);
      this.error.set('Ingresá una ciudad o ubicación.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const snapshot =
        typeof city === 'string'
          ? await this.weatherService.searchWeather(query)
          : await this.weatherService.searchWeatherByLocation(city);

      this.weather.set(snapshot);
      this.cityQuery.set(snapshot.city);

      if (persistCity) {
        writeLastCity(snapshot.city);
      }
    } catch (error: unknown) {
      this.weather.set(null);
      this.error.set(this.resolveErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  private async updateSuggestions(value: string): Promise<void> {
    const query = value.trim();
    const token = ++this.suggestionSearchToken;
    this.activeSuggestionIndex.set(-1);

    if (query.length < 4) {
      this.clearSuggestions();
      this.suggestionsLoading.set(false);
      return;
    }

    this.suggestionsLoading.set(true);

    try {
      const suggestions = await this.weatherService.searchCitySuggestions(query);

      if (token !== this.suggestionSearchToken) {
        return;
      }

      if (this.cityQuery().trim() !== query) {
        return;
      }

      const limitedSuggestions = suggestions.slice(0, 7);
      this.suggestions.set(limitedSuggestions);
      this.activeSuggestionIndex.set(limitedSuggestions.length > 0 ? 0 : -1);
    } catch {
      if (token === this.suggestionSearchToken) {
        this.clearSuggestions();
      }
    } finally {
      if (token === this.suggestionSearchToken) {
        this.suggestionsLoading.set(false);
      }
    }
  }

  private clearSuggestions(): void {
    this.suggestionSearchToken += 1;
    this.suggestions.set([]);
    this.suggestionsLoading.set(false);
    this.activeSuggestionIndex.set(-1);
  }

  private buildWeatherAlert(forecast: WeatherSnapshot['hourlyForecast']): string | null {
    const stormHours = forecast.filter((hour) => STORM_CODES.has(hour.weatherCode)).length;
    if (stormHours > 0) {
      return 'Posibles tormentas en las próximas horas.';
    }

    const fogHours = forecast.filter((hour) => FOG_CODES.has(hour.weatherCode)).length;
    if (fogHours > 0) {
      return 'Presencia de neblina en las próximas horas.';
    }

    const rainHours = forecast.filter((hour) => RAIN_CODES.has(hour.weatherCode)).length;
    const drizzleHours = forecast.filter((hour) => DRIZZLE_CODES.has(hour.weatherCode)).length;

    if (rainHours >= RAIN_ALERT_THRESHOLD) {
      return 'Lluvias probables en las próximas horas.';
    }

    if (rainHours > 0 || drizzleHours > 0) {
      return 'Posibles lloviznas en las próximas horas.';
    }

    return null;
  }

  private buildTemperatureAlert(
    forecast: WeatherSnapshot['hourlyForecast'],
    hasWeatherAlert: boolean,
  ): string | null {
    const hotClearHours = forecast.filter(
      (hour) => CLEAR_CODES.has(hour.weatherCode) && hour.temperature >= HOT_TEMPERATURE_THRESHOLD,
    ).length;

    if (!hasWeatherAlert && hotClearHours > 0) {
      return 'Alta exposición solar en las próximas horas.';
    }

    const coldHours = forecast.filter((hour) => hour.temperature <= COLD_TEMPERATURE_THRESHOLD).length;
    if (coldHours > 0) {
      return 'Temperaturas bajas en las próximas horas.';
    }

    return null;
  }

  private moveActiveSuggestion(delta: number): void {
    const suggestions = this.suggestions();

    if (!suggestions.length) {
      this.activeSuggestionIndex.set(-1);
      return;
    }

    const current = this.activeSuggestionIndex();
    const nextIndex = current < 0 ? 0 : (current + delta + suggestions.length) % suggestions.length;
    this.activeSuggestionIndex.set(nextIndex);
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof WeatherLookupError) {
      return error.message;
    }

    return 'No se pudo cargar la información del clima.';
  }
}
