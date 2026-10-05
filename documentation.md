# Piața — Living City Web App for Bucharest

> **Hackathon Edition** — Real-time community events, interactive city map with automated dynamic pinpoints, live weather forecasts, 24/7 open place discovery, match-day traffic alerts, and interactive event RSVPs.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack & Architecture](#-technology-stack--architecture)
4. [Project Directory Structure](#-project-directory-structure)
5. [Comprehensive Codebase & Component Breakdown](#-comprehensive-codebase--component-breakdown)
   - [1. Events & RSVP System](#1-events--rsvp-system)
   - [2. Interactive Bucharest Map & Dynamic Geocoding](#2-interactive-bucharest-map--dynamic-geocoding)
   - [3. Live Weather Forecast Service](#3-live-weather-forecast-service)
   - [4. Deschis Acum (Open Now 24/7) & Match-Day Traffic Warnings](#4-deschis-acum-open-now-247--match-day-traffic-warnings)
   - [5. Calendar & Agenda View](#5-calendar--agenda-view)
   - [6. Navigation, Layout & Internationalization (i18n)](#6-navigation-layout--internationalization-i18n)
6. [Design System & Micro-Animations](#-design-system--micro-animations)
7. [Getting Started & Local Development](#-getting-started--local-development)

---

## 🌟 Project Overview

**Piața** ("The Town Square") is an interactive, live web application designed for citizens and visitors in Bucharest. It unifies neighborhood discovery, community event participation, real-time weather predictions for outdoor planning, non-stop emergency/late-night amenities, and stadium/concert traffic advisories into a single, cohesive digital experience.

The app supports full **bilingual localization (Romanian & English)**, automatic **Dark/Light theme switching**, and fast micro-interactions.

---

## ⚡ Key Features

- 🎟️ **Events Feed & Interactive RSVPs**: Browse upcoming concerts, career fairs, and meetups. Mark attendance ("Sunt interesat") with persistent `localStorage` synchronization and live attendee count updates.
- 🗺️ **Interactive SVG Bucharest Map**: Zoom, pan, and click through active city neighborhoods. Features **automated pinpoint positioning** using local landmark coordinate databases and dynamic OpenStreetMap geocoding with pin collision dispersal.
- 🌦️ **Daily Weather Forecast Tab**: Integrates real-time 7-day weather predictions via the **Open-Meteo API**. Provides precipitation risk, humidity, wind speeds, Air Quality Index (AQI), and smart outdoor event recommendations.
- 🌙 **Deschis Acum (Open Now 24/7)**: Locates nearby non-stop pharmacies, 24/7 supermarkets, and late-night venues using **OpenStreetMap Overpass API** data, complete with estimated walking/transit times and Google Maps directions.
- ⚽ **Match-Day & Mega-Event Traffic Warnings**: Combines venue event data with transit schedules to alert users about stadium/concert crowding on Metro lines (M1/M3) and road closures around big venues (e.g. Arena Națională, Romexpo).
- 📅 **Interactive Monthly Calendar**: Full monthly view with day filtering, event density counters, and agenda listings.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technology Used |
| :--- | :--- |
| **Framework** | [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) for strict type safety |
| **Build Tool** | [Vite 8](https://vitejs.dev/) for fast HMR |
| **Styling** | [TailwindCSS 4](https://tailwindcss.com/) with CSS custom properties & custom design tokens |
| **Routing** | [Vue Router 4](https://router.vuejs.org/) with page transition animations |
| **External APIs** | Open-Meteo Weather API, OpenStreetMap Nominatim Geocoding API, OSM Overpass API |
| **Localization** | Custom lightweight i18n system with persistent local storage |

---

## 📁 Project Directory Structure

```
CityWeb/
├── public/
│   └── bucharest.svg             # Interactive SVG map vector of Bucharest
├── src/
│   ├── assets/                   # Static media assets
│   ├── components/               # Reusable UI components
│   │   ├── CalendarView.vue      # Monthly interactive calendar component
│   │   ├── EventsGrid.vue        # Main event feed grid & detail modal
│   │   ├── Footer.vue            # Responsive footer with live status & links
│   │   ├── MapPinpoint.vue       # SVG pinpoint marker overlay
│   │   ├── NavBar.vue            # Primary top navigation bar
│   │   ├── ThemeToggle.vue       # Dark/Light mode switcher
│   │   └── TopBar.vue            # Sticky header with search & brand logo
│   ├── composables/              # Vue composables & state hooks
│   │   └── useRsvp.ts            # Persistent RSVP state hook
│   ├── data/
│   │   └── demo.ts               # Core Bucharest demo datasets (events, neighborhoods)
│   ├── i18n/
│   │   └── index.ts              # Bilingual localization dictionary (RO / EN)
│   ├── pages/                    # View pages (Vue Router endpoints)
│   │   ├── BucharestMap.vue      # Map view page with zoom controls
│   │   ├── CalendarPage.vue     # Calendar page wrapper
│   │   ├── DeschisAcumPage.vue   # 24/7 places & traffic warnings page
│   │   ├── EventsPage.vue        # Main events view page
│   │   ├── NotFoundPage.vue      # 404 fallback page
│   │   └── WeatherPage.vue       # Weather forecast & metrics page
│   ├── router/
│   │   └── index.ts              # Vue Router definitions
│   ├── services/                 # API & Data calculation services
│   │   ├── locationService.ts    # Map geocoding & pin position calculator
│   │   ├── openNowService.ts     # OpenStreetMap 24/7 query & traffic alerts
│   │   └── weatherService.ts     # Open-Meteo weather API integration
│   ├── styles/
│   │   ├── globals.css           # Global Tailwind utilities & animations
│   │   └── theme.css             # Color palette tokens (Fațadă / Seară)
│   ├── App.vue                   # Root application wrapper & page layout
│   └── main.ts                   # Application entry point
├── package.json
├── tsconfig.json
├── vercel.json
└── documentation.md
```

---

## 🔍 Comprehensive Codebase & Component Breakdown

### 1. Events & RSVP System

#### `src/composables/useRsvp.ts`
Manages the user's event attendance state ("Sunt interesat" / "Vreau să merg") with reactive tracking and `localStorage` persistence.
- `isRsvped(eventId)`: Checks if the user is attending.
- `toggleRsvp(eventId)`: Toggles attendance status and persists the state.

#### `src/components/EventsGrid.vue`
- Renders the responsive grid of events with category badges, date tags, and participant counters.
- **Search & Filtering**: Filters by search queries, date selection, or category (`muzica`, `cariera`, `comunitate`). Includes a **Reset Filters** button when results are empty.
- **Event Modal**: Displays complete details, full descriptions, organizer tags, connected polls/jobs, and an interactive **RSVP Button** that updates live attendee counts.

---

### 2. Interactive Bucharest Map & Dynamic Geocoding

#### `src/services/locationService.ts`
Translates real-world addresses, venue titles, and geographic coordinates into SVG viewBox coordinates (`0 0 210 297`).
- **Landmark Database**: Pre-mapped SVG coordinates for major neighborhoods (*Floreasca*, *Romexpo*, *Drumul Taberei*, *Centru*, *Berceni*, *Titan*, etc.) and popular venues (*Parcul Floreasca*, *Ateneul Român*, *Arena Națională*).
- **Dynamic OpenStreetMap Geocoding**: Queries the Nominatim search API for custom addresses and converts latitude/longitude values to viewBox proportions.
- **Anti-Collision Ring Offset**: `calculateDynamicEventPositions()` detects overlapping pins at the same location and applies a spiral displacement formula so pinpoints never obscure one another.

#### `src/pages/BucharestMap.vue` & `src/components/MapPinpoint.vue`
- Implements smooth SVG zoom and pan controls (+/- buttons, mouse wheel, click-and-drag panning).
- `MapPinpoint.vue` renders glowing SVG pin circles with animated pulse rings and interactive text tooltips on hover.

---

### 3. Live Weather Forecast Service

#### `src/services/weatherService.ts`
- Fetches 7-day daily weather forecasts for Bucharest (`44.4323, 26.1063`) from the public **Open-Meteo API**.
- Maps WMO weather interpretation codes into user-friendly conditions (*Însorit*, *Parțial noros*, *Ploaie*, *Ninsoare*, *Furtună*).
- Returns max/min temperatures, precipitation chance (%), humidity, wind speed, UV index, Air Quality Index (AQI), and tailored outdoor event recommendations.

#### `src/pages/WeatherPage.vue`
- **Daily Selector Ribbon**: Horizontal ribbon to switch between forecast days with hover scale micro-animations.
- **Metrics Dashboard**: Displays temperature range, precipitation risk, humidity, wind speed, and an **Air Quality Index (AQI)** badge.
- **Events Cross-Reference**: Lists events scheduled for the selected weather date so users can plan outdoor vs. indoor attendance.

---

### 4. Deschis Acum (Open Now 24/7) & Match-Day Traffic Warnings

#### `src/services/openNowService.ts`
- **OpenStreetMap Overpass API**: Queries live OSM nodes for pharmacies (`amenity=pharmacy`) and convenience stores (`shop=convenience`) in Bucharest.
- Returns opening hours, 24/7 status, estimated walk/transit times, and data freshness disclaimers.
- **Traffic Warnings Generator**: Calculates crowd impact alerts for match days and concerts at major stadiums (e.g. Arena Națională match night advisories for Metro M1/M3 lines).

#### `src/pages/DeschisAcumPage.vue`
- **Category Filter Tabs**: Switch between *Toate* (All), *Farmacii* (Pharmacies), and *Magazine 24/7* (Supermarkets).
- **Google Maps Navigation**: Each card includes a direct link (`Indicații Google Maps`) to open turn-by-turn directions.
- **Match-Day Alert Cards**: Highlights high-severity traffic alerts with affected transit lines in monospaced badges.

---

### 5. Calendar & Agenda View

#### `src/components/CalendarView.vue` & `src/pages/CalendarPage.vue`
- **Interactive Grid**: Monthly calendar grid rendering days, event counters per day, and current date highlights.
- **Agenda Feed**: Synchronized list of events occurring on the selected date or throughout the month.

---

### 6. Navigation, Layout & Internationalization (i18n)

#### `src/i18n/index.ts`
- Reactive i18n system providing full Romanian (`ro`) and English (`en`) translations across all UI text, dates, navigation tabs, and filters.

#### `src/components/TopBar.vue` & `src/components/NavBar.vue`
- Sticky header featuring brand identity, global search with quick clear button (`✕`), calendar quick toggle, theme switcher, and navigation links.

#### `src/components/Footer.vue`
- Modern responsive footer with tagline, live status indicator, quick links, language switcher, and copyright details.

---

## 🎨 Design System & Micro-Animations

- **Color Palette (`src/styles/theme.css`)**:
  - Light mode (*Fațadă*): Calcar background (`#eee5d4`), Cerneală typography, Teracotă accents (`#c85a32`).
  - Dark mode (*Seară*): Amurg background (`#1e2430`), Hârtie text (`#f4efe6`), Sodiu active highlights (`#e8a838`).
- **Subtle Micro-Animations (`src/styles/globals.css`)**:
  - `page-fade`: 160ms cubic-bezier transition between Vue Router pages.
  - `animate-fade-in`: 180ms subtle upward entrance for card containers.
  - `animate-scale-in`: 150ms scale transition for modal overlays and active state badges.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Execution

1. **Clone the repository and enter the directory**:
   ```bash
   cd CityWeb
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Verify TypeScript type safety & build**:
   ```bash
   npx vue-tsc --noEmit
   npm run build
   ```

---

*Documentation generated for **Piața — Living City Web App**.*
