// GENERATED CODE -- DO NOT EDIT!

// package: relapse_proto
// file: relapse.proto

import * as relapse_pb from "./relapse_pb";
import * as grpc from "grpc";

interface IRelapseService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getSettings: grpc.MethodDefinition<relapse_pb.SettingsRequest, relapse_pb.Settings>;
  getSetting: grpc.MethodDefinition<relapse_pb.Setting, relapse_pb.Setting>;
  setSetting: grpc.MethodDefinition<relapse_pb.Setting, relapse_pb.Setting>;
  getCapturesForADay: grpc.MethodDefinition<relapse_pb.DayRequest, relapse_pb.DayResponse>;
  startCapture: grpc.MethodDefinition<relapse_pb.StartRequest, relapse_pb.StartResponse>;
  stopCapture: grpc.MethodDefinition<relapse_pb.StopRequest, relapse_pb.StopResponse>;
}

export const RelapseService: IRelapseService;

export interface IRelapseServer extends grpc.UntypedServiceImplementation {
  getSettings: grpc.handleUnaryCall<relapse_pb.SettingsRequest, relapse_pb.Settings>;
  getSetting: grpc.handleUnaryCall<relapse_pb.Setting, relapse_pb.Setting>;
  setSetting: grpc.handleUnaryCall<relapse_pb.Setting, relapse_pb.Setting>;
  getCapturesForADay: grpc.handleUnaryCall<relapse_pb.DayRequest, relapse_pb.DayResponse>;
  startCapture: grpc.handleUnaryCall<relapse_pb.StartRequest, relapse_pb.StartResponse>;
  stopCapture: grpc.handleUnaryCall<relapse_pb.StopRequest, relapse_pb.StopResponse>;
}

export class RelapseClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  getSettings(argument: relapse_pb.SettingsRequest, callback: grpc.requestCallback<relapse_pb.Settings>): grpc.ClientUnaryCall;
  getSettings(argument: relapse_pb.SettingsRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.Settings>): grpc.ClientUnaryCall;
  getSettings(argument: relapse_pb.SettingsRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.Settings>): grpc.ClientUnaryCall;
  getSetting(argument: relapse_pb.Setting, callback: grpc.requestCallback<relapse_pb.Setting>): grpc.ClientUnaryCall;
  getSetting(argument: relapse_pb.Setting, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.Setting>): grpc.ClientUnaryCall;
  getSetting(argument: relapse_pb.Setting, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.Setting>): grpc.ClientUnaryCall;
  setSetting(argument: relapse_pb.Setting, callback: grpc.requestCallback<relapse_pb.Setting>): grpc.ClientUnaryCall;
  setSetting(argument: relapse_pb.Setting, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.Setting>): grpc.ClientUnaryCall;
  setSetting(argument: relapse_pb.Setting, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.Setting>): grpc.ClientUnaryCall;
  getCapturesForADay(argument: relapse_pb.DayRequest, callback: grpc.requestCallback<relapse_pb.DayResponse>): grpc.ClientUnaryCall;
  getCapturesForADay(argument: relapse_pb.DayRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.DayResponse>): grpc.ClientUnaryCall;
  getCapturesForADay(argument: relapse_pb.DayRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.DayResponse>): grpc.ClientUnaryCall;
  startCapture(argument: relapse_pb.StartRequest, callback: grpc.requestCallback<relapse_pb.StartResponse>): grpc.ClientUnaryCall;
  startCapture(argument: relapse_pb.StartRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.StartResponse>): grpc.ClientUnaryCall;
  startCapture(argument: relapse_pb.StartRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.StartResponse>): grpc.ClientUnaryCall;
  stopCapture(argument: relapse_pb.StopRequest, callback: grpc.requestCallback<relapse_pb.StopResponse>): grpc.ClientUnaryCall;
  stopCapture(argument: relapse_pb.StopRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.StopResponse>): grpc.ClientUnaryCall;
  stopCapture(argument: relapse_pb.StopRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<relapse_pb.StopResponse>): grpc.ClientUnaryCall;
}
