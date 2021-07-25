// package: relapse_proto
// file: relapse.proto

var relapse_pb = require("./relapse_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Relapse = (function () {
  function Relapse() {}
  Relapse.serviceName = "relapse_proto.Relapse";
  return Relapse;
}());

Relapse.GetSettings = {
  methodName: "GetSettings",
  service: Relapse,
  requestStream: false,
  responseStream: false,
  requestType: relapse_pb.SettingsRequest,
  responseType: relapse_pb.Settings
};

Relapse.GetSetting = {
  methodName: "GetSetting",
  service: Relapse,
  requestStream: false,
  responseStream: false,
  requestType: relapse_pb.Setting,
  responseType: relapse_pb.Setting
};

Relapse.SetSetting = {
  methodName: "SetSetting",
  service: Relapse,
  requestStream: false,
  responseStream: false,
  requestType: relapse_pb.Setting,
  responseType: relapse_pb.Setting
};

Relapse.GetCapturesForADay = {
  methodName: "GetCapturesForADay",
  service: Relapse,
  requestStream: false,
  responseStream: false,
  requestType: relapse_pb.DayRequest,
  responseType: relapse_pb.DayResponse
};

Relapse.StartCapture = {
  methodName: "StartCapture",
  service: Relapse,
  requestStream: false,
  responseStream: false,
  requestType: relapse_pb.StartRequest,
  responseType: relapse_pb.StartResponse
};

Relapse.StopCapture = {
  methodName: "StopCapture",
  service: Relapse,
  requestStream: false,
  responseStream: false,
  requestType: relapse_pb.StopRequest,
  responseType: relapse_pb.StopResponse
};

exports.Relapse = Relapse;

function RelapseClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

RelapseClient.prototype.getSettings = function getSettings(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Relapse.GetSettings, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RelapseClient.prototype.getSetting = function getSetting(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Relapse.GetSetting, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RelapseClient.prototype.setSetting = function setSetting(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Relapse.SetSetting, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RelapseClient.prototype.getCapturesForADay = function getCapturesForADay(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Relapse.GetCapturesForADay, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RelapseClient.prototype.startCapture = function startCapture(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Relapse.StartCapture, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RelapseClient.prototype.stopCapture = function stopCapture(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Relapse.StopCapture, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.RelapseClient = RelapseClient;

