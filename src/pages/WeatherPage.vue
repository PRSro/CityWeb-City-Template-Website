<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { fetchBucharestWeather, type DailyForecast } from "../services/weatherService";
import { events } from "../data/demo";
import { useI18n } from "../i18n";

const { locale } = useI18n();

const forecastList = ref<DailyForecast[]>([]);
const isLoading = ref(true);
const selectedDayIndex = ref(0);

const activeDay = computed(() => forecastList.value[selectedDayIndex.value] || null);

// Events happening on the selected weather date
const activeDayEvents = computed(() => {
  if (!activeDay.value) return [];
  const targetIso = activeDay.value.date;
  return events.filter((e) => e.when.startsWith(targetIso));
});

onMounted(async () => {
  isLoading.value = true;
  forecastList.value = await fetchBucharestWeather();
  isLoading.value = false;
});

function getConditionIcon(condition: DailyForecast["condition"]): string {
  switch (condition) {
    case "sunny":
      return "☀️";
    case "partly-cloudy":
      return "⛅";
    case "cloudy":
      return "☁️";
    case "rain":
      return "🌧️";
    case "snow":
      return "❄️";
    case "thunderstorm":
      return "🌩️";
    default:
      return "🌤️";
  }
}
</script>

<template>
  <main class="min-h-[calc(100vh-64px)] bg-bg p-4 md:p-8 text-text select-none">
    <div class="mx-auto max-w-7xl flex flex-col gap-6">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 class="font-display text-heading text-text flex items-center gap-3">
            <span>{{ locale === 'ro' ? 'Prognoza Meteo București' : 'Bucharest Weather Forecast' }}</span>
            <span class="text-2xl">🌦️</span>
          </h1>
          <p class="font-body text-caption text-text-muted mt-1">
            {{ locale === 'ro' ? 'Verifică vremea pentru fiecare zi și planifică-ți ieșirile în oraș' : 'Check daily weather forecast and plan your city outings accordingly' }}
          </p>
        </div>

        <div class="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-sm border border-border text-xs text-text-muted">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Open-Meteo API Live</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center p-12 bg-surface rounded-sm border border-border">
        <div class="w-8 h-8 border-2 border-action border-t-transparent rounded-full animate-spin"></div>
        <span class="mt-3 text-caption text-text-muted font-ui">
          {{ locale === 'ro' ? 'Se încarcă prognoza meteo...' : 'Loading weather forecast...' }}
        </span>
      </div>

      <template v-else-if="forecastList.length">
        <!-- Daily Forecast Selector Ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          <button
            v-for="(day, idx) in forecastList"
            :key="day.date"
            class="p-3.5 rounded-sm border transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-between text-center gap-2 cursor-pointer"
            :class="selectedDayIndex === idx 
              ? 'bg-action/10 border-action text-action font-semibold shadow-sm scale-[1.02]' 
              : 'bg-surface border-border text-text-muted hover:border-control-border hover:text-text hover:bg-surface/80'"
            @click="selectedDayIndex = idx"
          >
            <span class="font-ui text-caption uppercase tracking-wider font-medium">
              {{ locale === 'ro' ? day.localizedDayOfWeek : day.dayOfWeek }}
            </span>

            <span class="text-3xl my-1 transition-transform duration-200 hover:scale-110">
              {{ getConditionIcon(day.condition) }}
            </span>

            <div class="flex items-center gap-1.5 text-xs font-medium">
              <span class="text-text font-bold">{{ day.tempMax }}°C</span>
              <span class="text-text-muted text-[11px]">{{ day.tempMin }}°C</span>
            </div>

            <span class="text-[10px] px-2 py-0.5 rounded-full bg-bg border border-border text-text-muted">
              💧 {{ day.precipitationChance }}%
            </span>
          </button>
        </div>

        <!-- Main Details Dashboard for Active Day -->
        <div v-if="activeDay" :key="activeDay.date" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          <!-- Weather Metrics Card (7 Cols) -->
          <div class="lg:col-span-7 rounded-sm border border-border bg-surface p-6 flex flex-col gap-6">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div class="flex items-center gap-4">
                <span class="text-5xl">
                  {{ getConditionIcon(activeDay.condition) }}
                </span>
                <div>
                  <h2 class="font-display text-subheading text-text">
                    {{ locale === 'ro' ? activeDay.conditionLabelRo : activeDay.conditionLabelEn }}
                  </h2>
                  <p class="font-body text-caption text-text-muted">
                    {{ activeDay.date }} — {{ locale === 'ro' ? activeDay.localizedDayOfWeek : activeDay.dayOfWeek }}
                  </p>
                </div>
              </div>

              <div class="flex items-baseline gap-2 bg-bg px-4 py-2 rounded-sm border border-border">
                <span class="font-display text-3xl font-bold text-text">{{ activeDay.tempMax }}°C</span>
                <span class="font-body text-sm text-text-muted">/ {{ activeDay.tempMin }}°C</span>
              </div>
            </div>

            <!-- Weather Details Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="p-3 bg-bg rounded-sm border border-border/80 flex flex-col gap-1">
                <span class="text-xs text-text-muted font-ui">
                  {{ locale === 'ro' ? 'Șanse ploaie' : 'Precipitation' }}
                </span>
                <span class="font-display text-body-lg font-bold text-action">
                  💧 {{ activeDay.precipitationChance }}%
                </span>
              </div>

              <div class="p-3 bg-bg rounded-sm border border-border/80 flex flex-col gap-1">
                <span class="text-xs text-text-muted font-ui">
                  {{ locale === 'ro' ? 'Umiditate' : 'Humidity' }}
                </span>
                <span class="font-display text-body-lg font-bold text-text">
                  💦 {{ activeDay.humidity }}%
                </span>
              </div>

              <div class="p-3 bg-bg rounded-sm border border-border/80 flex flex-col gap-1">
                <span class="text-xs text-text-muted font-ui">
                  {{ locale === 'ro' ? 'Viteză vânt' : 'Wind Speed' }}
                </span>
                <span class="font-display text-body-lg font-bold text-text">
                  💨 {{ activeDay.windSpeed }} km/h
                </span>
              </div>

              <div class="p-3 bg-bg rounded-sm border border-border/80 flex flex-col gap-1">
                <span class="text-xs text-text-muted font-ui flex items-center justify-between">
                  <span>{{ locale === 'ro' ? 'Calitate Aer' : 'Air Quality' }}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </span>
                <span class="font-display text-body-lg font-bold text-emerald-500">
                  🍃 {{ locale === 'ro' ? 'Buna (AQI 2)' : 'Good (AQI 2)' }}
                </span>
              </div>
            </div>

            <!-- Smart Outdoor Recommendation Box -->
            <div class="p-4 rounded-sm bg-action/10 border border-action/30 flex items-start gap-3">
              <span class="text-xl">💡</span>
              <div>
                <h4 class="font-ui text-caption font-bold uppercase tracking-wider text-action">
                  {{ locale === 'ro' ? 'Recomandare pentru evenimente' : 'Event Advice' }}
                </h4>
                <p class="font-body text-caption text-text mt-1">
                  {{ locale === 'ro' ? activeDay.outdoorAdviceRo : activeDay.outdoorAdviceEn }}
                </p>
              </div>
            </div>

          </div>

          <!-- Events Scheduled for this Weather Day (5 Cols) -->
          <div class="lg:col-span-5 rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
            <h3 class="font-ui text-caption font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
              <span>{{ locale === 'ro' ? 'Evenimente în această zi' : 'Events on this day' }}</span>
              <span class="px-2 py-0.5 rounded-full bg-action/10 text-action text-xs font-semibold">
                {{ activeDayEvents.length }}
              </span>
            </h3>

            <div v-if="activeDayEvents.length" class="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              <div
                v-for="evt in activeDayEvents"
                :key="evt.id"
                class="p-3 rounded-sm border border-border bg-bg hover:border-control-border transition-colors flex flex-col gap-1.5"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="font-body text-caption font-bold text-text">
                    {{ evt.localizedTitle || evt.title }}
                  </span>
                  <span class="text-[11px] text-action font-semibold shrink-0">
                    {{ evt.whenLocalized }}
                  </span>
                </div>

                <p class="font-body text-caption text-text-muted text-xs line-clamp-2">
                  {{ evt.localizedDescription || evt.description }}
                </p>

                <div class="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-text-muted">
                  <span>📍 {{ evt.localizedAddress || evt.neighborhood }}</span>
                  <span>👥 {{ evt.rsvpCount }} {{ locale === 'ro' ? 'participanți' : 'going' }}</span>
                </div>
              </div>
            </div>

            <div v-else class="p-8 text-center bg-bg rounded-sm border border-border/50 text-text-muted flex flex-col items-center gap-2">
              <span class="text-3xl">📅</span>
              <span class="font-body text-caption">
                {{ locale === 'ro' ? 'Niciun eveniment programat oficial pentru această zi.' : 'No events scheduled for this date.' }}
              </span>
            </div>

          </div>

        </div>
      </template>
    </div>
  </main>
</template>
