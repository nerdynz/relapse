// package: relapse_proto
// file: relapse.proto

import * as grpc from 'grpc';
import * as relapse_pb from './relapse_pb';

interface IRelapseService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getSettings: IRelapseService_IGetSettings;
  setSettings: IRelapseService_ISetSettings;
  getCapturesForADay: IRelapseService_IGetCapturesForADay;
  getDaySummaries: IRelapseService_IGetDaySummaries;
  listenForCaptures: IRelapseService_IListenForCaptures;
}

interface IRelapseService_IGetSettings {
  path: string; // "/relapse_proto.Relapse/GetSettings"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.SettingsPlusOptionsRequest>;
  requestDeserialize: grpc.deserialize<relapse_pb.SettingsPlusOptionsRequest>;
  responseSerialize: grpc.serialize<relapse_pb.SettingsPlusOptions>;
  responseDeserialize: grpc.deserialize<relapse_pb.SettingsPlusOptions>;
}

interface IRelapseService_ISetSettings {
  path: string; // "/relapse_proto.Relapse/SetSettings"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.Settings>;
  requestDeserialize: grpc.deserialize<relapse_pb.Settings>;
  responseSerialize: grpc.serialize<relapse_pb.Settings>;
  responseDeserialize: grpc.deserialize<relapse_pb.Settings>;
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

interface IRelapseService_IGetDaySummaries {
  path: string; // "/relapse_proto.Relapse/GetDaySummaries"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<relapse_pb.DaySummariesRequest>;
  requestDeserialize: grpc.deserialize<relapse_pb.DaySummariesRequest>;
  responseSerialize: grpc.serialize<relapse_pb.DaySummaries>;
  responseDeserialize: grpc.deserialize<relapse_pb.DaySummaries>;
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

export const RelapseService: IRelapseService;
export interface IRelapseServer {
  getSettings: grpc.handleUnaryCall<relapse_pb.SettingsPlusOptionsRequest, relapse_pb.SettingsPlusOptions>;
  setSettings: grpc.handleUnaryCall<relapse_pb.Settings, relapse_pb.Settings>;
  getCapturesForADay: grpc.handleUnaryCall<relapse_pb.DayRequest, relapse_pb.DayResponse>;
  getDaySummaries: grpc.handleUnaryCall<relapse_pb.DaySummariesRequest, relapse_pb.DaySummaries>;
  listenForCaptures: grpc.handleServerStreamingCall<relapse_pb.ListenRequest, relapse_pb.DayResponse>;
}

export interface IRelapseClient {
  getSettings(request: relapse_pb.SettingsPlusOptionsRequest, callback: (error: Error | null, response: relapse_pb.SettingsPlusOptions) => void): grpc.ClientUnaryCall;
  getSettings(request: relapse_pb.SettingsPlusOptionsRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.SettingsPlusOptions) => void): grpc.ClientUnaryCall;
  setSettings(request: relapse_pb.Settings, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  setSettings(request: relapse_pb.Settings, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  getCapturesForADay(request: relapse_pb.DayRequest, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  getCapturesForADay(request: relapse_pb.DayRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  getDaySummaries(request: relapse_pb.DaySummariesRequest, callback: (error: Error | null, response: relapse_pb.DaySummaries) => void): grpc.ClientUnaryCall;
  getDaySummaries(request: relapse_pb.DaySummariesRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.DaySummaries) => void): grpc.ClientUnaryCall;
  listenForCaptures(request: relapse_pb.ListenRequest, metadata?: grpc.Metadata): grpc.ClientReadableStream<relapse_pb.DayResponse>;
}

export class RelapseClient extends grpc.Client implements IRelapseClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  public getSettings(request: relapse_pb.SettingsPlusOptionsRequest, callback: (error: Error | null, response: relapse_pb.SettingsPlusOptions) => void): grpc.ClientUnaryCall;
  public getSettings(request: relapse_pb.SettingsPlusOptionsRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.SettingsPlusOptions) => void): grpc.ClientUnaryCall;
  public setSettings(request: relapse_pb.Settings, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  public setSettings(request: relapse_pb.Settings, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.Settings) => void): grpc.ClientUnaryCall;
  public getCapturesForADay(request: relapse_pb.DayRequest, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  public getCapturesForADay(request: relapse_pb.DayRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.DayResponse) => void): grpc.ClientUnaryCall;
  public getDaySummaries(request: relapse_pb.DaySummariesRequest, callback: (error: Error | null, response: relapse_pb.DaySummaries) => void): grpc.ClientUnaryCall;
  public getDaySummaries(request: relapse_pb.DaySummariesRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: relapse_pb.DaySummaries) => void): grpc.ClientUnaryCall;
  public listenForCaptures(request: relapse_pb.ListenRequest, metadata?: grpc.Metadata): grpc.ClientReadableStream<relapse_pb.DayResponse>;
}

