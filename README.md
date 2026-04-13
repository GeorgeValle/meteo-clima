# MeteoClima

MeteoClima es una SPA de clima construida con Angular que permite buscar ciudades por nombre, consultar el estado actual del tiempo desde Open-Meteo y guardar la última ciudad buscada en `localStorage`.

La aplicación está pensada para una experiencia simple, visualmente limpia y rápida de usar, con una interfaz minimalista, alertas climáticas inferidas y autocomplete de ciudades.

## Demo

### Demo en vivo en GitHub Pages.
https://georgevalle.github.io/meteo-clima/

## Features principales

- Búsqueda de ciudades por nombre
- Integración con Open-Meteo para geocoding y clima actual
- Persistencia de la última ciudad buscada en `localStorage`
- Autocomplete de ciudades a partir de 4 caracteres
- Selección de sugerencias con mouse o teclado
- Estado de carga y manejo de errores amigable
- Tarjeta principal con clima actual, temperatura, sensación térmica, mínima, máxima y hora local
- Pronóstico horario real de las próximas 6 horas
- Visualización de temperaturas sin decimales en toda la UI
- Tarjeta secundaria con alertas climáticas inferidas a partir del clima actual y el pronóstico cercano
- Autocomplete con contexto geográfico adicional cuando la API lo provee

## UI / UX

La UI fue diseñada con un enfoque minimalista:

- contenedor centrado
- cards claras con bordes redondeados y sombra suave
- paleta de azules suaves, grises y texto oscuro
- jerarquía visual simple y legible
- autocomplete compacto debajo del input, con contexto geográfico adicional
- microanimaciones suaves en la sección de alertas para mejorar la percepción de fluidez

Además, la interacción del buscador incluye:

- loading visible al buscar ciudades o sugerencias
- navegación con teclado en el dropdown
- cierre del dropdown al perder foco o hacer click fuera
- sugerencias con nombre, región y país cuando los datos están disponibles

## Tecnologías utilizadas

- Angular 21
- TypeScript
- Standalone Components
- Signals de Angular
- Open-Meteo API
- CSS puro
- Vitest
- pnpm

## Arquitectura

El proyecto está organizado con una separación clara entre lógica y presentación:

- `src/app/app.ts` orquesta el estado de la UI, la búsqueda, el autocomplete y la persistencia visual.
- `src/app/app.html` define la interfaz.
- `src/app/app.css` contiene el styling puro de la app.
- `src/app/weather.service.ts` centraliza la integración con Open-Meteo y la transformación de datos.
- `src/app/weather.models.ts` define los tipos del dominio y de las respuestas de la API.
- `src/app/last-city.storage.ts` encapsula la persistencia segura en `localStorage`.

La app usa `signals` para mantener el estado reactivo del componente raíz, con una arquitectura simple y sin librerías de estado externas.

## Instalación

### Requisitos previos

- Node.js
- pnpm
- Entorno WSL/Linux-native recomendado para validar y desarrollar

### 1. Clonar el repositorio

```bash
git clone https://github.com/GeorgeValle/meteo-clima.git
cd meteo-clima
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Levantar la app en desarrollo

```bash
pnpm start
```

Luego abrí la URL que muestre Angular CLI, normalmente:

```text
http://localhost:4200/
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm start` | Levanta el servidor de desarrollo con Angular |
| `pnpm run build` | Compila la aplicación para producción |
| `pnpm run watch` | Compila en modo observación para desarrollo |
| `pnpm run test` | Ejecuta la suite de tests |
| `pnpm run deploy` | Genera el build y publica en GitHub Pages usando `ngh` |

### Comandos frecuentes

```bash
pnpm start
pnpm run build
pnpm run watch
pnpm run test
pnpm run deploy
```

## Deploy

El proyecto está preparado para publicación en GitHub Pages.
https://georgevalle.github.io/meteo-clima/

```bash
pnpm run deploy
```

Internamente ejecuta:

```bash
ng build --base-href=/GeorgeValle/ && ngh --dir=dist/meteo-clima
```

> Nota: si tu repositorio usa otro nombre o ruta, ajustá el `base-href` antes de publicar.

## Notas técnicas

- La app se construyó en tres fases: base de datos/flujo, UI y validación/integración.
- La validación real del proyecto se hizo manualmente en WSL con `pnpm`.
- La búsqueda principal y el autocomplete comparten el mismo flujo geográfico, pero la selección de sugerencias usa la `GeoLocation` concreta elegida por el usuario.
- El clima actual y el pronóstico horario se obtienen de la misma API de Open-Meteo, incluyendo `hourly` para las próximas 6 horas.
- Las temperaturas visibles se redondean solo en la presentación para mantener la UI consistente.
- Las alertas climáticas son inferidas por reglas simples usando el clima actual y el pronóstico cercano; no consumen una API adicional.
- La interfaz visible está completamente traducida al español.
- El proyecto evita frameworks CSS y cualquier estado global innecesario.

## Autor

🧑🏻‍💻 George Valle
