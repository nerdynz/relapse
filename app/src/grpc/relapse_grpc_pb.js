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

function serialize_relapse_proto_ListenRequest(arg) {
  if (!(arg instanceof relapse_pb.ListenRequest)) {
    throw new Error('Expected argument of type relapse_proto.ListenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_ListenRequest(buffer_arg) {
  return relapse_pb.ListenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_Setting(arg) {
  if (!(arg instanceof relapse_pb.Setting)) {
    throw new Error('Expected argument of type relapse_proto.Setting');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_Setting(buffer_arg) {
  return relapse_pb.Setting.deserializeBinary(new Uint8Array(buffer_arg));
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

function serialize_relapse_proto_SettingsRequest(arg) {
  if (!(arg instanceof relapse_pb.SettingsRequest)) {
    throw new Error('Expected argument of type relapse_proto.SettingsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_SettingsRequest(buffer_arg) {
  return relapse_pb.SettingsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_StartRequest(arg) {
  if (!(arg instanceof relapse_pb.StartRequest)) {
    throw new Error('Expected argument of type relapse_proto.StartRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_StartRequest(buffer_arg) {
  return relapse_pb.StartRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_StartResponse(arg) {
  if (!(arg instanceof relapse_pb.StartResponse)) {
    throw new Error('Expected argument of type relapse_proto.StartResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_StartResponse(buffer_arg) {
  return relapse_pb.StartResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_StopRequest(arg) {
  if (!(arg instanceof relapse_pb.StopRequest)) {
    throw new Error('Expected argument of type relapse_proto.StopRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_StopRequest(buffer_arg) {
  return relapse_pb.StopRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_relapse_proto_StopResponse(arg) {
  if (!(arg instanceof relapse_pb.StopResponse)) {
    throw new Error('Expected argument of type relapse_proto.StopResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_relapse_proto_StopResponse(buffer_arg) {
  return relapse_pb.StopResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var RelapseService = exports.RelapseService = {
  getSettings: {
    path: '/relapse_proto.Relapse/GetSettings',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.SettingsRequest,
    responseType: relapse_pb.Settings,
    requestSerialize: serialize_relapse_proto_SettingsRequest,
    requestDeserialize: deserialize_relapse_proto_SettingsRequest,
    responseSerialize: serialize_relapse_proto_Settings,
    responseDeserialize: deserialize_relapse_proto_Settings,
  },
  getSetting: {
    path: '/relapse_proto.Relapse/GetSetting',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.Setting,
    responseType: relapse_pb.Setting,
    requestSerialize: serialize_relapse_proto_Setting,
    requestDeserialize: deserialize_relapse_proto_Setting,
    responseSerialize: serialize_relapse_proto_Setting,
    responseDeserialize: deserialize_relapse_proto_Setting,
  },
  setSetting: {
    path: '/relapse_proto.Relapse/SetSetting',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.Setting,
    responseType: relapse_pb.Setting,
    requestSerialize: serialize_relapse_proto_Setting,
    requestDeserialize: deserialize_relapse_proto_Setting,
    responseSerialize: serialize_relapse_proto_Setting,
    responseDeserialize: deserialize_relapse_proto_Setting,
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
  startCapture: {
    path: '/relapse_proto.Relapse/StartCapture',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.StartRequest,
    responseType: relapse_pb.StartResponse,
    requestSerialize: serialize_relapse_proto_StartRequest,
    requestDeserialize: deserialize_relapse_proto_StartRequest,
    responseSerialize: serialize_relapse_proto_StartResponse,
    responseDeserialize: deserialize_relapse_proto_StartResponse,
  },
  stopCapture: {
    path: '/relapse_proto.Relapse/StopCapture',
    requestStream: false,
    responseStream: false,
    requestType: relapse_pb.StopRequest,
    responseType: relapse_pb.StopResponse,
    requestSerialize: serialize_relapse_proto_StopRequest,
    requestDeserialize: deserialize_relapse_proto_StopRequest,
    responseSerialize: serialize_relapse_proto_StopResponse,
    responseDeserialize: deserialize_relapse_proto_StopResponse,
  },
};

exports.RelapseClient = grpc.makeGenericClientConstructor(RelapseService);
