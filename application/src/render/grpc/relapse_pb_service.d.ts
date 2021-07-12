// package: relapse_proto
// file: relapse.proto

import * as relapse_pb from "./relapse_pb";
import {grpc} from "@improbable-eng/grpc-web";

type RelapseGetSettings = {
  readonly methodName: string;
  readonly service: typeof Relapse;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof relapse_pb.SettingsRequest;
  readonly responseType: typeof relapse_pb.Settings;
};

type RelapseGetSetting = {
  readonly methodName: string;
  readonly service: typeof Relapse;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof relapse_pb.Setting;
  readonly responseType: typeof relapse_pb.Setting;
};

type RelapseSetSetting = {
  readonly methodName: string;
  readonly service: typeof Relapse;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof relapse_pb.Setting;
  readonly responseType: typeof relapse_pb.Setting;
};

type RelapseGetCapturesForADay = {
  readonly methodName: string;
  readonly service: typeof Relapse;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof relapse_pb.DayRequest;
  readonly responseType: typeof relapse_pb.DayResponse;
};

type RelapseStartCapture = {
  readonly methodName: string;
  readonly service: typeof Relapse;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof relapse_pb.StartRequest;
  readonly responseType: typeof relapse_pb.StartResponse;
};

type RelapseStopCapture = {
  readonly methodName: string;
  readonly service: typeof Relapse;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof relapse_pb.StopRequest;
  readonly responseType: typeof relapse_pb.StopResponse;
};

export class Relapse {
  static readonly serviceName: string;
  static readonly GetSettings: RelapseGetSettings;
  static readonly GetSetting: RelapseGetSetting;
  static readonly SetSetting: RelapseSetSetting;
  static readonly GetCapturesForADay: RelapseGetCapturesForADay;
  static readonly StartCapture: RelapseStartCapture;
  static readonly StopCapture: RelapseStopCapture;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class RelapseClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getSettings(
    requestMessage: relapse_pb.SettingsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.Settings|null) => void
  ): UnaryResponse;
  getSettings(
    requestMessage: relapse_pb.SettingsRequest,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.Settings|null) => void
  ): UnaryResponse;
  getSetting(
    requestMessage: relapse_pb.Setting,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.Setting|null) => void
  ): UnaryResponse;
  getSetting(
    requestMessage: relapse_pb.Setting,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.Setting|null) => void
  ): UnaryResponse;
  setSetting(
    requestMessage: relapse_pb.Setting,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.Setting|null) => void
  ): UnaryResponse;
  setSetting(
    requestMessage: relapse_pb.Setting,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.Setting|null) => void
  ): UnaryResponse;
  getCapturesForADay(
    requestMessage: relapse_pb.DayRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.DayResponse|null) => void
  ): UnaryResponse;
  getCapturesForADay(
    requestMessage: relapse_pb.DayRequest,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.DayResponse|null) => void
  ): UnaryResponse;
  startCapture(
    requestMessage: relapse_pb.StartRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.StartResponse|null) => void
  ): UnaryResponse;
  startCapture(
    requestMessage: relapse_pb.StartRequest,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.StartResponse|null) => void
  ): UnaryResponse;
  stopCapture(
    requestMessage: relapse_pb.StopRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.StopResponse|null) => void
  ): UnaryResponse;
  stopCapture(
    requestMessage: relapse_pb.StopRequest,
    callback: (error: ServiceError|null, responseMessage: relapse_pb.StopResponse|null) => void
  ): UnaryResponse;
}

