<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { fetchOpenNowPlaces, getMatchdayTrafficAlerts, type OpenNowPlace, type MatchdayTrafficAlert } from "../services/openNowService";
import { useI18n } from "../i18n";

const { locale } = useI18n();

const openPlaces = ref<OpenNowPlace[]>([]);
const trafficAlerts = ref<MatchdayTrafficAlert[]>([]);
const isLoading = ref(true);
const selectedCategory = ref<string>("all");

onMounted(async () => {
  isLoading.value = true;
  openPlaces.value = await fetchOpenNowPlaces();
  trafficAlerts.value = getMatchdayTrafficAlerts();
  isLoading.value = false;
});

const filteredPlaces = computed(() => {
  if (selectedCategory.value === "all") return openPlaces.value;
  return openPlaces.value.filter((p) => p.type === selectedCategory.value);
});

function getDirectionsUrl(address: string, name: string): string {
  const q = encodeURIComponent(`${name}, ${address}, Bucharest, Romania`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
</script>

<template>
  <main class="min-h-[calc(100vh-64px)] bg-bg p-4 md:p-8 text-text select-none">
    <div class="mx-auto max-w-7xl flex flex-col gap-8 animate-fade-in">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 class="font-display text-heading text-text flex items-center gap-3">
            <span>{{ locale === 'ro' ? 'Deschis Acum & Alertă Trafic' : 'Open Now & Traffic Alerts' }}</span>
            <span class="text-2xl">🌙</span>
          </h1>
          <p class="font-body text-caption text-text-muted mt-1">
            {{ locale === 'ro' ? 'Locații non-stop din apropiere și alerte de aglomerație pentru meciuri / concerte' : 'Nearby 24/7 places and match-day crowding alerts for big venues' }}
          </p>
        </div>

        <div class="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-sm border border-border text-xs text-text-muted">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>OpenStreetMap Live Data</span>
        </div>
      </div>

      <!-- SECTION 1: Match-day & Mega-event Traffic Warnings -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-subheading text-text flex items-center gap-2">
            <span>⚽</span>
            <span>{{ locale === 'ro' ? 'Alerte Trafic & Meciuri / Concerte' : 'Match-Day & Major Event Traffic Alerts' }}</span>
          </h2>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-sm bg-danger/10 border border-danger/30 text-danger">
            {{ trafficAlerts.length }} {{ locale === 'ro' ? 'alerte active' : 'active alerts' }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            v-for="alert in trafficAlerts"
            :key="alert.id"
            class="p-5 rounded-sm border bg-surface flex flex-col gap-3 transition-all duration-200 hover:border-danger/60"
            :class="alert.severity === 'high' ? 'border-danger/40 bg-danger/5' : 'border-border'"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="inline-block px-2 py-0.5 rounded-sm bg-danger/20 text-danger text-[10px] font-bold uppercase tracking-wider mb-1">
                  {{ alert.venueName }}
                </span>
                <h3 class="font-display text-body-lg font-bold text-text">
                  {{ alert.eventName }}
                </h3>
              </div>
              <span class="text-xs font-semibold text-text-muted shrink-0 bg-bg px-2.5 py-1 rounded-sm border border-border">
                🕒 {{ alert.eventTime }}
              </span>
            </div>

            <p class="font-body text-caption text-text-muted leading-relaxed">
              {{ locale === 'ro' ? alert.descriptionRo : alert.descriptionEn }}
            </p>

            <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
              <span class="text-xs text-text-muted font-medium font-ui mr-1">
                {{ locale === 'ro' ? 'Linii afectate:' : 'Affected lines:' }}
              </span>
              <span
                v-for="line in alert.affectedLines"
                :key="line"
                class="px-2 py-0.5 rounded-sm bg-bg border border-border text-[11px] font-mono text-action"
              >
                {{ line }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2: Deschis Acum (Open Now) -->
      <section class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="font-display text-subheading text-text flex items-center gap-2">
            <span>🏪</span>
            <span>{{ locale === 'ro' ? 'Deschis Acum În Apropiere' : 'Open Now Near You' }}</span>
          </h2>

          <!-- Category Filter Tabs -->
          <div class="flex items-center gap-1.5 bg-surface p-1 rounded-sm border border-border text-xs">
            <button
              class="px-3 py-1 rounded-sm transition-colors font-ui font-medium"
              :class="selectedCategory === 'all' ? 'bg-action text-action-text font-bold' : 'text-text-muted hover:text-text'"
              @click="selectedCategory = 'all'"
            >
              {{ locale === 'ro' ? 'Toate' : 'All' }}
            </button>
            <button
              class="px-3 py-1 rounded-sm transition-colors font-ui font-medium"
              :class="selectedCategory === 'pharmacy' ? 'bg-action text-action-text font-bold' : 'text-text-muted hover:text-text'"
              @click="selectedCategory = 'pharmacy'"
            >
              💊 {{ locale === 'ro' ? 'Farmacii' : 'Pharmacies' }}
            </button>
            <button
              class="px-3 py-1 rounded-sm transition-colors font-ui font-medium"
              :class="selectedCategory === 'shop' ? 'bg-action text-action-text font-bold' : 'text-text-muted hover:text-text'"
              @click="selectedCategory = 'shop'"
            >
              🛒 {{ locale === 'ro' ? 'Magazine 24/7' : '24/7 Shops' }}
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 bg-surface rounded-sm border border-border">
          <div class="w-6 h-6 border-2 border-action border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="filteredPlaces.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="place in filteredPlaces"
            :key="place.id"
            class="p-4 rounded-sm border border-border bg-surface flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-1 hover:border-action active:scale-[0.99]"
          >
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-sm bg-action/10 border border-action/30 text-action text-[10px] font-bold uppercase">
                  {{ locale === 'ro' ? place.typeLabelRo : place.typeLabelEn }}
                </span>
                <span class="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {{ place.openingHours }}
                </span>
              </div>

              <h3 class="font-display text-body-lg font-bold text-text mt-1">
                {{ place.name }}
              </h3>

              <p class="font-body text-caption text-text-muted text-xs">
                📍 {{ place.address }} ({{ place.neighborhood }})
              </p>
            </div>

            <!-- Transit & Walk time -->
            <div class="flex items-center justify-between p-2 rounded-sm bg-bg border border-border text-xs text-text-muted font-ui">
              <span>🚶 {{ place.walkMinutes }} min {{ locale === 'ro' ? 'pe jos' : 'walk' }}</span>
              <span>🚌 {{ place.transitMinutes }} min {{ locale === 'ro' ? 'tranzit' : 'transit' }}</span>
            </div>

            <!-- Action Button & OSM Disclaimer -->
            <div class="flex flex-col gap-2 pt-1">
              <a
                :href="getDirectionsUrl(place.address, place.name)"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-2 rounded-sm bg-bg border border-control-border hover:border-action hover:text-action text-xs text-text-muted font-ui font-medium text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🗺️</span>
                <span>{{ locale === 'ro' ? 'Indicații Google Maps' : 'Get Directions' }}</span>
              </a>

              <p class="text-[10px] text-text-muted/80 italic leading-tight border-t border-border/40 pt-1">
                ⚠️ {{ locale === 'ro' ? place.disclaimerRo : place.disclaimerEn }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="p-8 text-center bg-surface rounded-sm border border-dashed border-border text-text-muted">
          {{ locale === 'ro' ? 'Nicio locație găsită pentru categoria selectată.' : 'No places found for selected category.' }}
        </div>
      </section>

    </div>
  </main>
</template>
