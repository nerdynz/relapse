import { Capture } from '@/grpc/relapse_pb'

export interface DayInfo {
  fullDate: string
  skipToEnd: boolean
  files?: Capture[]
}
