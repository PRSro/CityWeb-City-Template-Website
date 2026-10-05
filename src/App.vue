<script setup>
import { ref } from 'vue'
import TopBar from './components/TopBar.vue'
import Footer from './components/Footer.vue'
import { events } from './data/demo.ts'

const search = ref('')
const selectedDate = ref(null)
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-bg">
    <div>
      <TopBar
        :search="search"
        @update:search="search = $event"
      />

      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component
            :is="Component"
            :search="search"
            :selected-date="selectedDate"
            :events="events"
            @select-date="selectedDate = $event"
          />
        </Transition>
      </RouterView>
    </div>

    <Footer />
  </div>
</template>