# MeteoClima

MeteoClima es una SPA de clima hecha con Angular para buscar una ciudad o una ubicación reconocida por Open-Meteo Geocoding, ver el clima actual y consultar un pronóstico horario simple y visual. La interfaz es minimalista, rápida y está pensada para una experiencia clara en escritorio y móvil.

## Demo

- Demo en vivo: [https://georgevalle.github.io/meteo-clima/](https://georgevalle.github.io/meteo-clima/)

## Features principales

- Búsqueda por ciudad y por ubicaciones reconocidas por Open-Meteo Geocoding
- Autocomplete con contexto geográfico enriquecido cuando la API lo devuelve
- Persistencia de la última ciudad buscada en `localStorage`
- Clima actual con temperatura, sensación térmica, mínima, máxima y hora local
- Ícono meteorológico con emoji
- Pronóstico horario de 12 horas
- Carrusel horizontal nativo, sin librerías externas
- Alertas climáticas inferidas a partir del pronóstico cercano
- Estados de loading y error para búsqueda y sugerencias
- Interacción con teclado en el autocomplete

## UI / UX

La interfaz prioriza claridad y poco ruido visual:

- contenedor centrado
- cards con bordes redondeados y sombra suave
- paleta de celestes, grises suaves y texto oscuro
- jerarquía visual simple
- autocomplete compacto debajo del buscador
- carrusel horizontal para el pronóstico horario
- alertas separadas pero coherentes con el resto del diseño

## Tecnologías utilizadas

- **Angular**: SPA con componentes standalone y renderizado reactivo
- **TypeScript**: tipado estricto para datos, servicios y estado
- **Signals**: manejo del estado de la UI desde el componente raíz
- **Open-Meteo API**: geocoding y clima sin API key
- **pnpm**: gestor de paquetes y ejecución de scripts
- **CSS puro**: estilos vanilla, sin frameworks visuales

## Arquitectura

El proyecto se mantiene intencionalmente simple:

- `src/app/app.ts` orquesta el estado de la interfaz, la búsqueda, el autocomplete y las alertas inferidas
- `src/app/weather.service.ts` centraliza el consumo de Open-Meteo y la transformación de datos
- `src/app/weather.models.ts` define los tipos del dominio y de la API
- `src/app/last-city.storage.ts` encapsula la lectura y escritura segura en `localStorage`
- `src/app/app.html` y `src/app/app.css` contienen la presentación de la SPA

La app no usa routers, estado global complejo ni dependencias de UI externas. El flujo principal es: buscar ciudad/ubicación → resolver geocoding → obtener clima → renderizar vista.

## Problemas resueltos en el proyecto

- Integración con una API sin key, usando exclusivamente Open-Meteo Geocoding y Weather
- Manejo de estados de búsqueda: `loading`, `error` y restauración desde `localStorage`
- Autocomplete con deduplicación y labels más útiles cuando la API devuelve contexto administrativo
- Pronóstico horario dinámico de 12 horas sin cambiar la arquitectura principal
- Carrusel horizontal sin librerías externas, usando solo CSS puro
- Alertas inferidas basadas en el pronóstico horario, evitando mensajes contradictorios
- Alineación del entorno WSL para que Node, `pnpm` y los tests funcionen correctamente con `nvm` y `TMPDIR=/tmp`

## Qué aprendí con este proyecto

- Cómo trabajar con Angular standalone de forma clara y sin exceso de abstracción
- Cómo manejar estado de UI con `signals` de manera simple y predecible
- Cómo consumir APIs externas sin API key y traducir su respuesta a modelos propios
- Cómo diseñar una UX minimalista que siga siendo funcional y legible
- Cómo organizar el trabajo por fases en `task.md` para mantener el alcance controlado
- Cómo usar agentes de desarrollo y auditoría definidos en `AGENTS.md` para separar lógica, UI, documentación y QA
- Cómo depurar problemas de entorno en WSL, especialmente PATH, `pnpm` y temporales de ejecución

## Instalación

### Requisitos previos

- Node.js
- pnpm
- Entorno WSL/Linux recomendado para desarrollar y validar

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
| `pnpm run deploy` | Genera el build y publica en GitHub Pages |

### Comandos frecuentes

```bash
pnpm start
pnpm run build
pnpm run watch
pnpm run test
pnpm run deploy
```

## Deploy

La app se publica en GitHub Pages:

- [https://georgevalle.github.io/meteo-clima/](https://georgevalle.github.io/meteo-clima/)

Para desplegar:

```bash
pnpm run deploy
```

El script ejecuta:

```bash
ng build --base-href=/GeorgeValle/ && ngh --dir=dist/meteo-clima
```

> Si tu repositorio usa otra ruta base, ajustá `--base-href` antes de publicar.

## Autor

🧑🏻‍💻 George Valle
