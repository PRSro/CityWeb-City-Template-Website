import { ref } from "vue";

const STORAGE_KEY = "piata.rsvped_events";

function readInitialRsvps(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

const rsvpedEvents = ref<Set<string>>(readInitialRsvps());

export function useRsvp() {
  const isRsvped = (eventId: string) => rsvpedEvents.value.has(eventId);

  const toggleRsvp = (eventId: string) => {
    const next = new Set(rsvpedEvents.value);
    if (next.has(eventId)) {
      next.delete(eventId);
    } else {
      next.add(eventId);
    }
    rsvpedEvents.value = next;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    }
  };

  return {
    isRsvped,
    toggleRsvp,
    rsvpedEvents,
  };
}
