<script setup lang="ts">
import { useI18n } from '../i18n'

const { t, locale, setLocale } = useI18n()
</script>

<template>
  <footer class="mt-12 border-t border-border bg-surface/60 py-8 text-text select-none">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
      
      <!-- Brand & Tagline -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="font-display text-lg font-bold text-text">{{ t('brand.name') }}</span>
          <span class="rounded-sm bg-action/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-action border border-action/20">
            Bucharest Live
          </span>
        </div>
        <p class="font-body text-xs text-text-muted">
          {{ locale === 'ro' ? 'Platformă comunitară pentru evenimente, harta orașului și prognoză meteo' : 'Community platform for events, living city map, and weather forecast' }}
        </p>
      </div>

      <!-- Quick Nav Links -->
      <div class="flex flex-wrap items-center gap-4 text-xs font-medium text-text-muted">
        <RouterLink to="/evenimente" class="hover:text-action transition-colors">
          {{ t('nav.events') }}
        </RouterLink>
        <RouterLink to="/calendar" class="hover:text-action transition-colors">
          {{ t('nav.calendar') }}
        </RouterLink>
        <RouterLink to="/harta" class="hover:text-action transition-colors">
          {{ t('nav.harta') }}
        </RouterLink>
        <RouterLink to="/vremea" class="hover:text-action transition-colors">
          {{ t('nav.vremea') }}
        </RouterLink>
        <RouterLink to="/deschis-acum" class="hover:text-action transition-colors">
          {{ t('nav.deschis') }}
        </RouterLink>
      </div>

      <!-- Language & Copyright -->
      <div class="flex items-center justify-between md:justify-end gap-4 text-xs text-text-muted border-t md:border-t-0 border-border/60 pt-4 md:pt-0">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="px-1.5 py-0.5 rounded-sm uppercase transition-colors"
            :class="locale === 'ro' ? 'font-bold text-action bg-action/10' : 'hover:text-text'"
            @click="setLocale('ro')"
          >
            RO
          </button>
          <span>/</span>
          <button
            type="button"
            class="px-1.5 py-0.5 rounded-sm uppercase transition-colors"
            :class="locale === 'en' ? 'font-bold text-action bg-action/10' : 'hover:text-text'"
            @click="setLocale('en')"
          >
            EN
          </button>
        </div>

        <span>© 2026 Piața Bucharest</span>
      </div>

    </div>
  </footer>
</template>
