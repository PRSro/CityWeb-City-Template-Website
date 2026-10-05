export interface DailyForecast {
  date: string; // ISO YYYY-MM-DD
  dayOfWeek: string;
  localizedDayOfWeek: string;
  tempMax: number;
  tempMin: number;
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rain" | "snow" | "thunderstorm";
  conditionLabelRo: string;
  conditionLabelEn: string;
  precipitationChance: number; // 0-100%
  humidity: number; // %
  windSpeed: number; // km/h
  uvIndex: number;
  airQualityIndex: number; // AQI 1-5
  outdoorAdviceRo: string;
  outdoorAdviceEn: string;
}

/**
 * Weather Service for Bucharest using Open-Meteo public API with mock fallbacks.
 */
export async function fetchBucharestWeather(): Promise<DailyForecast[]> {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=44.4323&longitude=26.1063&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Europe%2FBucharest"
    );
    if (response.ok) {
      const data = await response.json();
      if (data.daily && data.daily.time) {
        return data.daily.time.map((dateStr: string, index: number) => {
          const code = data.daily.weathercode[index];
          const maxTemp = Math.round(data.daily.temperature_2m_max[index]);
          const minTemp = Math.round(data.daily.temperature_2m_min[index]);
          const precip = data.daily.precipitation_probability_max?.[index] ?? 10;
          const wind = Math.round(data.daily.windspeed_10m_max?.[index] ?? 12);
          const condition = mapWmoCodeToCondition(code);

          const dateObj = new Date(dateStr);
          const dayNameRo = dateObj.toLocaleDateString("ro-RO", { weekday: "long" });
          const dayNameEn = dateObj.toLocaleDateString("en-US", { weekday: "long" });

          return {
            date: dateStr,
            dayOfWeek: dayNameEn,
            localizedDayOfWeek: dayNameRo.charAt(0).toUpperCase() + dayNameRo.slice(1),
            tempMax: maxTemp,
            tempMin: minTemp,
            condition: condition.type,
            conditionLabelRo: condition.labelRo,
            conditionLabelEn: condition.labelEn,
            precipitationChance: precip,
            humidity: 65 + Math.floor(Math.sin(index) * 15),
            windSpeed: wind,
            uvIndex: Math.max(1, Math.round(3 + Math.sin(index) * 2)),
            airQualityIndex: 2,
            outdoorAdviceRo: condition.adviceRo,
            outdoorAdviceEn: condition.adviceEn,
          };
        });
      }
    }
  } catch (err) {
    console.warn("Weather API unreachable, loading fallback Bucharest forecast", err);
  }

  // Fallback demo forecast dataset if offline/API fails
  return getFallbackForecast();
}

function mapWmoCodeToCondition(code: number): {
  type: DailyForecast["condition"];
  labelRo: string;
  labelEn: string;
  adviceRo: string;
  adviceEn: string;
} {
  if (code === 0) {
    return {
      type: "sunny",
      labelRo: "Însorit",
      labelEn: "Sunny",
      adviceRo: "Vreme excelentă pentru evenimente în aer liber!",
      adviceEn: "Great weather for outdoor events!",
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      type: "partly-cloudy",
      labelRo: "Parțial noros",
      labelEn: "Partly Cloudy",
      adviceRo: "Temperaturi plăcute pentru plimbări și concerte în aer liber.",
      adviceEn: "Pleasant temperatures for walks and open-air concerts.",
    };
  }
  if (code >= 45 && code <= 48) {
    return {
      type: "cloudy",
      labelRo: "Ceață / Noros",
      labelEn: "Foggy / Cloudy",
      adviceRo: "Răcoare dimineața, îmbracă o jachetă ușoară.",
      adviceEn: "Cool morning, wear a light jacket.",
    };
  }
  if (code >= 51 && code <= 67) {
    return {
      type: "rain",
      labelRo: "Ploaie",
      labelEn: "Rain",
      adviceRo: "Ia o umbrelă cu tine dacă mergi la evenimentele de astăzi.",
      adviceEn: "Bring an umbrella if attending today's events.",
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      type: "snow",
      labelRo: "Ninsoare",
      labelEn: "Snow",
      adviceRo: "Atmosferă festivă de iarnă! Îmbracă-te gros.",
      adviceEn: "Festive winter vibe! Dress warmly.",
    };
  }
  if (code >= 80 && code <= 99) {
    return {
      type: "thunderstorm",
      labelRo: "Averse / Furtună",
      labelEn: "Thunderstorms",
      adviceRo: "Sunt recomandate evenimentele indoor / acoperite.",
      adviceEn: "Indoor / covered venues are recommended.",
    };
  }
  return {
    type: "partly-cloudy",
    labelRo: "Variabil",
    labelEn: "Variable",
    adviceRo: "Vreme favorabilă participării la activități urbane.",
    adviceEn: "Favorable conditions for city activities.",
  };
}

function getFallbackForecast(): DailyForecast[] {
  const dates = [
    { date: "2026-12-18", dayRo: "Vineri", dayEn: "Friday", max: 4, min: -1, cond: "partly-cloudy", ro: "Parțial noros", en: "Partly Cloudy", precip: 20 },
    { date: "2026-12-19", dayRo: "Sâmbătă", dayEn: "Saturday", max: 6, min: 1, cond: "sunny", ro: "Însorit", en: "Sunny", precip: 10 },
    { date: "2026-12-20", dayRo: "Duminică", dayEn: "Sunday", max: 3, min: -2, cond: "snow", ro: "Ninsoare ușoară", en: "Light Snow", precip: 70 },
    { date: "2026-12-21", dayRo: "Luni", dayEn: "Monday", max: 2, min: -4, cond: "cloudy", ro: "Noros", en: "Cloudy", precip: 15 },
    { date: "2026-12-22", dayRo: "Marți", dayEn: "Tuesday", max: 5, min: 0, cond: "sunny", ro: "Însorit", en: "Sunny", precip: 5 },
    { date: "2026-12-23", dayRo: "Miercuri", dayEn: "Wednesday", max: 3, min: -1, cond: "rain", ro: "Ploaie slabă", en: "Light Rain", precip: 40 },
    { date: "2026-12-24", dayRo: "Joi", dayEn: "Thursday", max: 4, min: -2, cond: "snow", ro: "Ninsoare", en: "Snow", precip: 80 },
  ];

  return dates.map((d) => ({
    date: d.date,
    dayOfWeek: d.dayEn,
    localizedDayOfWeek: d.dayRo,
    tempMax: d.max,
    tempMin: d.min,
    condition: d.cond as DailyForecast["condition"],
    conditionLabelRo: d.ro,
    conditionLabelEn: d.en,
    precipitationChance: d.precip,
    humidity: 72,
    windSpeed: 14,
    uvIndex: 2,
    airQualityIndex: 2,
    outdoorAdviceRo: d.precip > 50 ? "Se recomandă umbrela sau haine impermeabile." : "Vreme potrivită pentru evenimentele din oraș!",
    outdoorAdviceEn: d.precip > 50 ? "Umbrella or raincoat recommended." : "Good weather for city events!",
  }));
}
