// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var relapse_pb = require('./relapse_pb.js');

function serialize_relapse_proto_DayRequest(arg) {
  if (!(arg instanceof relapse_pb.DayRequest)) {
    throw new Error('Expected argument of type relapse_proto.DayRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_DayRequest(buffer_arg) {
  return relapse_pb.DayRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_DayResponse(arg) {
  if (!(arg instanceof relapse_pb.DayResponse)) {
    throw new Error('Expected argument of type relapse_proto.DayResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_DayResponse(buffer_arg) {
  return relapse_pb.DayResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_DaySummaries(arg) {
  if (!(arg instanceof relapse_pb.DaySummaries)) {
    throw new Error('Expected argument of type relapse_proto.DaySummaries');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_DaySummaries(buffer_arg) {
  return relapse_pb.DaySummaries.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_DaySummariesRequest(arg) {
  if (!(arg instanceof relapse_pb.DaySummariesRequest)) {
    throw new Error('Expected argument of type relapse_proto.DaySummariesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_DaySummariesRequest(buffer_arg) {
  return relapse_pb.DaySummariesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_ListenRequest(arg) {
  if (!(arg instanceof relapse_pb.ListenRequest)) {
    throw new Error('Expected argument of type relapse_proto.ListenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_ListenRequest(buffer_arg) {
  return relapse_pb.ListenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_Settings(arg) {
  if (!(arg instanceof relapse_pb.Settings)) {
    throw new Error('Expected argument of type relapse_proto.Settings');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_Settings(buffer_arg) {
  return relapse_pb.Settings.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_SettingsPlusOptions(arg) {
  if (!(arg instanceof relapse_pb.SettingsPlusOptions)) {
    throw new Error('Expected argument of type relapse_proto.SettingsPlusOptions');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_SettingsPlusOptions(buffer_arg) {
  return relapse_pb.SettingsPlusOptions.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_SettingsPlusOptionsRequest(arg) {
  if (!(arg instanceof relapse_pb.SettingsPlusOptionsRequest)) {
    throw new Error('Expected argument of type relapse_proto.SettingsPlusOptionsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_SettingsPlusOptionsRequest(buffer_arg) {
  return relapse_pb.SettingsPlusOptionsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var RelapseService = exports.RelapseService = {
  getSettings: {
    path: '/relapse_proto.Relapse/GetSettings',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.SettingsPlusOptionsRequest,
    responseType: relapse_pb.SettingsPlusOptions,
    requestSerialize: serialize_relapse_proto_SettingsPlusOptionsRequest,
    requestDeserialize: deserialize_relapse_proto_SettingsPlusOptionsRequest,
    responseSerialize: serialize_relapse_proto_SettingsPlusOptions,
    responseDeserialize: deserialize_relapse_proto_SettingsPlusOptions,
  },
  setSettings: {
    path: '/relapse_proto.Relapse/SetSettings',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.Settings,
    responseType: relapse_pb.Settings,
    requestSerialize: serialize_relapse_proto_Settings,
    requestDeserialize: deserialize_relapse_proto_Settings,
    responseSerialize: serialize_relapse_proto_Settings,
    responseDeserialize: deserialize_relapse_proto_Settings,
  },
  getCapturesForADay: {
    path: '/relapse_proto.Relapse/GetCapturesForADay',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.DayRequest,
    responseType: relapse_pb.DayResponse,
    requestSerialize: serialize_relapse_proto_DayRequest,
    requestDeserialize: deserialize_relapse_proto_DayRequest,
    responseSerialize: serialize_relapse_proto_DayResponse,
    responseDeserialize: deserialize_relapse_proto_DayResponse,
  },
  getDaySummaries: {
    path: '/relapse_proto.Relapse/GetDaySummaries',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.DaySummariesRequest,
    responseType: relapse_pb.DaySummaries,
    requestSerialize: serialize_relapse_proto_DaySummariesRequest,
    requestDeserialize: deserialize_relapse_proto_DaySummariesRequest,
    responseSerialize: serialize_relapse_proto_DaySummaries,
    responseDeserialize: deserialize_relapse_proto_DaySummaries,
  },
  listenForCaptures: {
    path: '/relapse_proto.Relapse/ListenForCaptures',
    requestStream: false,
    responseStream: true,
    requestType: relapse_pb.ListenRequest,
    responseType: relapse_pb.DayResponse,
    requestSerialize: serialize_relapse_proto_ListenRequest,
    requestDeserialize: deserialize_relapse_proto_ListenRequest,
    responseSerialize: serialize_relapse_proto_DayResponse,
    responseDeserialize: deserialize_relapse_proto_DayResponse,
  },
};

exports.RelapseClient = grpc.makeGenericClientConstructor(RelapseService);
