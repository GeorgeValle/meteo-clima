# Project Requirements — MeteoClima

## Overview
MeteoClima is a single-page weather application (SPA) focused on simplicity, clarity, and clean visual design.

The application must provide current weather information for a searched city using the Open-Meteo API.

---

## Core Features

- Search for a city by name
- Display current weather conditions
- Show minimum and maximum temperature
- Display a weather icon (emoji-based)
- Show "feels like" temperature
- Display local time of the selected location
- Persist last searched city using `localStorage`
- Show a simulated "weather alerts" section

---

## UI / UX Requirements

### Layout

- Centered main container
- Clean, minimal design
- Rounded borders with soft shadow
- Clear visual hierarchy

### Header

- Title: **"MeteoClima"**
- Large and centered

### Search Section

- Centered input field
- Search button
- Simple and intuitive interaction

### Main Weather Card

Top section:
- Left: city name and country
- Right: local time

Middle section:
- Left:
  - large weather emoji
  - short description (e.g., "cloudy")
  - "Feels like: XX°C"
- Right:
  - large current temperature
  - below: "min XX°C | max XX°C"

### Bottom Section

- Separate card for "Weather Alerts" (simulated)
- Visually distinct but consistent with design

---

## Design Constraints

- Color palette:
  - light blues
  - soft grays
  - black text

- Style:
  - minimal
  - no visual clutter
  - consistent spacing

---

## Technical Constraints

### Framework

- Angular
- Must use **Standalone Components**

### Styling

- Pure CSS (vanilla CSS)
- ❌ No frameworks (Tailwind, Bootstrap, etc.)

### State & Persistence

- Use `localStorage` to persist last searched city

### API

- Open-Meteo API
  - Geocoding API
  - Weather API
- No API key required

### Code Quality

- Strong typing (TypeScript)
- Clean separation of concerns
- Maintainable and readable structure

---

## Non-Goals

- No authentication
- No backend server
- No complex state management libraries
- No UI frameworks
- No over-engineering

---

## Success Criteria

The project is considered complete when:

- All UI sections are implemented as described
- Weather data is correctly fetched and displayed
- Last searched city persists across reloads
- Layout matches minimal design principles
- Code follows Angular best practices
- No forbidden frameworks are used