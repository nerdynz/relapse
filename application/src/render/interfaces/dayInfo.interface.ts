// export interface Capture {
//   captureid: number
//   appname: string
//   windowtitle: string
//   filepath: string
//   fullpath: string
//   capturetimeseconds: number
//   capturedaytimeseconds: number
// }
import { Capture, CaptureDaySummary } from '@/grpc/relapse_pb'
export interface CaptureSimple {
  date: Date
  isReal: boolean
  filepath: string
}

export interface DayInfo extends CaptureDaySummary.AsObject {
  fullDate: string
  skipToEnd: boolean
  files?: Capture.AsObject[]
}
