export interface Capture {
  captureid: number
  appname: string
  windowtitle: string
  filepath: string
  fullpath: string
  capturetimeseconds: number
  capturedaytimeseconds: number
}

export interface DayInfo {
  fullDate: string
  skipToEnd: boolean
  files?: Capture[]
}
