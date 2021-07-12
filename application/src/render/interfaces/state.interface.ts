import { DayInfo } from './dayInfo.interface'

export interface RelapseSettings {
  screenshotDaysDuration: number
  capturePath: string
}

export interface RelapseState {
  settings: RelapseSettings
  settingsMessage: any
  isHelpShown: boolean
  day: DayInfo
}
