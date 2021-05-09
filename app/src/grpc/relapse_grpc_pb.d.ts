// package: relapse_proto
// file: relapse.proto

import * as grpc from 'grpc';
import * as relapse_pb from './relapse_pb';

interface IRelapseService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getSettings: IRelapseService_IGetSettings;
  getSetting: IRelapseService_IGetSetting;
  setSetting: IRelapseService_ISetSetting;
  getCapturesForADay: IRelapseService_IGetCapturesForADay;
  listenForCaptures: IRelapseService_IListenForCaptures;
  startCapture: IRelapseService_IStartCapture;
  stopCapture: IRelapseService_IStopCapture;
}

interface IRelapseService_IGetSettings {
  path: string; // "/relapse_proto.Relapse/GetSettings"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.SettingsRequest>;
  requestDeserialize: grpc.deserialize<relapse_pb.SettingsRequest>;
  responseSerialize: grpc.serialize<relapse_pb.Settings>;
  responseDeserialize: grpc.deserialize<relapse_pb.Settings>;
}

interface IRelapseService_IGetSetting {
  path: string; // "/relapse_proto.Relapse/GetSetting"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.Setting>;
  requestDeserialize: grpc.deserialize<relapse_pb.Setting>;
  responseSerialize: grpc.serialize<relapse_pb.Setting>;
  responseDeserialize: grpc.deserialize<relapse_pb.Setting>;
}

interface IRelapseService_ISetSetting {
  path: string; // "/relapse_proto.Relapse/SetSetting"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.Setting>;
  requestDeserialize: grpc.deserialize<relapse_pb.Setting>;
  responseSerialize: grpc.serialize<relapse_pb.Setting>;
  responseDeserialize: grpc.deserialize<relapse_pb.Setting>;
}

interface IRelapseService_IGetCapturesForADay {
  path: string; // "/relapse_proto.Relapse/GetCapturesForADay"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.DayRequest>;
  requestDeserialize: grpc.deserialize<relapse_pb.DayRequest>;
  responseSerialize: grpc.serialize<relapse_pb.DayResponse>;
  responseDeserialize: grpc.deserialize<relapse_pb.DayResponse>;
}

interface IRelapseService_IListenForCaptures {
  path: string; // "/relapse_proto.Relapse/ListenForCaptures"
  requestStream: boolean; // false
  responseStream: boolean; // true
  requestSerialize: grpc.serialize<relapse_pb.ListenRequest>;
  requestDeserialize: grpc.deserialize<relapse_pb.ListenRequest>;
  responseSerialize: grpc.serialize<relapse_pb.DayResponse>;
  responseDeserialize: grpc.deserialize<relapse_pb.DayResponse>;
}

interface IRelapseService_IStartCapture {
  path: string; // "/relapse_proto.Relapse/StartCapture"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.StartRequest>;
  requestDeserialize: grpc.deserialize<relapse_pb.StartRequest>;
  responseSerialize: grpc.serialize<relapse_pb.StartResponse>;
  responseDeserialize: grpc.deserialize<relapse_pb.StartResponse>;
}

interface IRelapseService_IStopCapture {
  path: string; // "/relapse_proto.Relapse/StopCapture"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.StopRequest>;
  requestDeserialize: grpc.deserialize<relapse_pb.StopRequest>;
  responseSerialize: grpc.serialize<relapse_pb.StopResponse>;
  responseDeserialize: grpc.deserialize<relapse_pb.StopResponse>;
}

export const RelapseService: IRelapseService;
export interface IRelapseServer {
  getSettings: grpc.handleUnaryCall<relapse_pb.SettingsRequest, relapse_pb.Settings>;
  getSetting: grpc.handleUnaryCall<relapse_pb.Setting, relapse_pb.Setting>;
  setSetting: grpc.handleUnaryCall<relapse_pb.Setting, relapse_pb.Setting>;
  getCapturesForADay: grpc.handleUnaryCall<relapse_pb.DayRequest, relapse_pb.DayResponse>;
  listenForCaptures: grpc.handleServerStreamingCall<relapse_pb.ListenRequest, relapse_pb.DayResponse>;
  startCapture: grpc.handleUnaryCall<relapse_pb.StartRequest, relapse_pb.StartResponse>;
  stopCapture: grpc.handleUnaryCall<relapse_pb.StopRequest, relapse_pb.StopResponse>;
}

export interface IRelapseClient {
  getSettings(request: relapse_pb.SettingsRequest, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  getSettings(request: relapse_pb.SettingsRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  getSetting(request: relapse_pb.Setting, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  getSetting(request: relapse_pb.Setting, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  setSetting(request: relapse_pb.Setting, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  setSetting(request: relapse_pb.Setting, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  getCapturesForADay(request: relapse_pb.DayRequest, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  getCapturesForADay(request: relapse_pb.DayRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  listenForCaptures(request: relapse_pb.ListenRequest, metadata?: grpc.Metadata): grpc.ClientReadableStream<relapse_pb.DayResponse>;
  startCapture(request: relapse_pb.StartRequest, callback: (error: Error | null, response: relapse_pb.StartResponse) => void): grpc.ClientUnaryCall;
  startCapture(request: relapse_pb.StartRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.StartResponse) => void): grpc.ClientUnaryCall;
  stopCapture(request: relapse_pb.StopRequest, callback: (error: Error | null, response: relapse_pb.StopResponse) => void): grpc.ClientUnaryCall;
  stopCapture(request: relapse_pb.StopRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.StopResponse) => void): grpc.ClientUnaryCall;
}

export class RelapseClient extends grpc.Client implements IRelapseClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  public getSettings(request: relapse_pb.SettingsRequest, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  public getSettings(request: relapse_pb.SettingsRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  public getSetting(request: relapse_pb.Setting, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  public getSetting(request: relapse_pb.Setting, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  public setSetting(request: relapse_pb.Setting, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  public setSetting(request: relapse_pb.Setting, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Setting) => void): grpc.ClientUnaryCall;
  public getCapturesForADay(request: relapse_pb.DayRequest, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  public getCapturesForADay(request: relapse_pb.DayRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  public listenForCaptures(request: relapse_pb.ListenRequest, metadata?: grpc.Metadata): grpc.ClientReadableStream<relapse_pb.DayResponse>;
  public startCapture(request: relapse_pb.StartRequest, callback: (error: Error | null, response: relapse_pb.StartResponse) => void): grpc.ClientUnaryCall;
  public startCapture(request: relapse_pb.StartRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.StartResponse) => void): grpc.ClientUnaryCall;
  public stopCapture(request: relapse_pb.StopRequest, callback: (error: Error | null, response: relapse_pb.StopResponse) => void): grpc.ClientUnaryCall;
  public stopCapture(request: relapse_pb.StopRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.StopResponse) => void): grpc.ClientUnaryCall;
}

