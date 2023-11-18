import { defineStore } from "pinia";
import { ComputedRef, Ref, computed, ref } from "vue";
import { GetSettings, SettingsPlusOptions, LoadCapturedDay, CapturedDay, LoadCapturedDayJSON, Settings, SetSettings, Capture } from "../relapse.pb";
import { formatRFC3339, startOfDay } from "date-fns";

export const useRelapseStore = defineStore("relapse", () => {
  const isHelpShown = ref(false);
  const day: Ref<any | null> = ref(null);
  const settings: Ref<SettingsPlusOptions | null> = ref(null);

  const currentDay: ComputedRef<CapturedDay> = computed(() => {
    return day.value;
  });

  const captures: ComputedRef<Array<Capture>> = computed(() => {
    return currentDay.value && currentDay.value.Captures.length > 0 ? currentDay.value.Captures : []
  });

  const earliestCaptureIndex: Ref<number> = computed(() => {
    return captures.value.findIndex((cap: Capture) => {
      return cap.IsReal
    }) || 0
  });

  const latestCaptureIndex: Ref<number> = computed(() => {
    return captures.value.findLastIndex((cap: Capture) => {
      return cap.IsReal
    }) || 0
  });


  const currentDaySummary = computed(() => {
    return day.value?.summary;
  });

  const appSettings = computed(() => {
    return settings.value;
  });

  const currentDate = computed(() => {
    let date = new Date();
    if (currentDay.value) {
      date = new Date(currentDay.value.Bod);
    }
    return date;
  });

  async function loadSettings() {
    settings.value = await GetSettings({});
  }

  async function saveSettings(newSettings: Settings) {
    let updatedSettings = await SetSettings(newSettings)
    if (settings.value) {
      settings.value!.Settings = updatedSettings
    }
  }

  async function loadDay(date: Date) {
    try {
      let cap = await LoadCapturedDay({
        Dt: formatRFC3339(startOfDay(date))
      });
      day.value = cap
    } catch (error) {
      console.error('loadDay error', error)
    }
  }

  async function loadToday() {
    await loadDay(new Date());
  }

  return {
    isHelpShown,
    day,
    settings,
    currentDay,
    currentDaySummary,
    captures,
    earliestCaptureIndex,
    latestCaptureIndex,
    appSettings,
    currentDate,
    loadSettings,
    saveSettings,
    loadDay,
    loadToday,
  };
});
