import { defineStore } from 'pinia'
import { ComputedRef, Ref, computed, ref } from 'vue'

import { formatRFC3339, startOfDay } from 'date-fns'
import {
  Capture,
  CapturedDay,
  Settings,
  SettingsPlusOptions
} from '../../bindings/github.com/nerdynz/relapse/proto/models'

import {
  GetSettings,
  LoadCapturedDay,
  SetSettings
} from '../../bindings/relapse/server'
import { bodUTCUnix } from '../helpers/dates'

export const useRelapseStore = defineStore('relapse', () => {
  const isHelpShown = ref(false)
  let day: CapturedDay | null = $ref(null)
  const settings: Ref<SettingsPlusOptions | null> = ref(null)

  const currentDay: CapturedDay = $computed(() => {
    if (!day) {
      let bod = formatRFC3339(startOfDay(new Date()))
      let fallbackDay: CapturedDay =  {
        Bod: bod,
        Captures: [],
        Summary: {
          TotalCapturedMinutes: 0,
          TotalCapturesCount: 0,
          TotalCaptureSizeBytes: 0,
          Bod: bod
        }
      }
      return fallbackDay
    }
    return day
  })

  let captures: Capture[] = $computed(() => {
    if (currentDay) {
      let d: CapturedDay = currentDay;
      if (d.Captures && d.Captures.length > 0) {
        return d.Captures as Capture[]
      }
    }
    return []
  })

  const earliestCaptureIndex: Ref<number> = computed(() => {
    return (
      captures.findIndex((cap: Capture) => {
        return cap.IsReal
      }) || 0
    )
  })

  const latestCaptureIndex: Ref<number> = computed(() => {
    return (
      captures.findLastIndex((cap: Capture) => {
        return cap.IsReal
      }) || 0
    )
  })

  const appSettings = computed(() => {
    return settings.value
  })

  async function loadSettings () {
    settings.value = await GetSettings()
  }

  async function saveSettings (newSettings: Settings) {
    let updatedSettings = await SetSettings(newSettings)
    if (settings.value) {
      settings.value!.Settings = updatedSettings
    }
  }

  async function loadDay (date: Date) {
    try {
      day = await LoadCapturedDay({
        Dt: formatRFC3339(startOfDay(date))
      })
    } catch (error) {
      console.error('loadDay error', error)
    }
  }

  async function loadToday () {
    await loadDay(new Date())
  }
  

  return $$({
    isHelpShown,
    day,
    settings,
    currentDay,
    captures,
    earliestCaptureIndex,
    latestCaptureIndex,
    appSettings,
    loadSettings,
    saveSettings,
    loadDay,
    loadToday
  })
})
