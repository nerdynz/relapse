// package: relapse_proto
// file: relapse.proto

import * as jspb from "google-protobuf";

export class Capture extends jspb.Message {
  getCaptureid(): number;
  setCaptureid(value: number): void;

  getAppname(): string;
  setAppname(value: string): void;

  getWindowtitle(): string;
  setWindowtitle(value: string): void;

  getFilepath(): string;
  setFilepath(value: string): void;

  getFullpath(): string;
  setFullpath(value: string): void;

  getCapturetimeseconds(): number;
  setCapturetimeseconds(value: number): void;

  getCapturedaytimeseconds(): number;
  setCapturedaytimeseconds(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Capture.AsObject;
  static toObject(includeInstance: boolean, msg: Capture): Capture.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Capture, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Capture;
  static deserializeBinaryFromReader(message: Capture, reader: jspb.BinaryReader): Capture;
}

export namespace Capture {
  export type AsObject = {
    captureid: number,
    appname: string,
    windowtitle: string,
    filepath: string,
    fullpath: string,
    capturetimeseconds: number,
    capturedaytimeseconds: number,
  }
}

export class DayRequest extends jspb.Message {
  getCapturedaytimeseconds(): number;
  setCapturedaytimeseconds(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DayRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DayRequest): DayRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DayRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DayRequest;
  static deserializeBinaryFromReader(message: DayRequest, reader: jspb.BinaryReader): DayRequest;
}

export namespace DayRequest {
  export type AsObject = {
    capturedaytimeseconds: number,
  }
}

export class DayResponse extends jspb.Message {
  getCapturedaytimeseconds(): number;
  setCapturedaytimeseconds(value: number): void;

  clearCapturesList(): void;
  getCapturesList(): Array<Capture>;
  setCapturesList(value: Array<Capture>): void;
  addCaptures(value?: Capture, index?: number): Capture;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DayResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DayResponse): DayResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DayResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DayResponse;
  static deserializeBinaryFromReader(message: DayResponse, reader: jspb.BinaryReader): DayResponse;
}

export namespace DayResponse {
  export type AsObject = {
    capturedaytimeseconds: number,
    capturesList: Array<Capture.AsObject>,
  }
}

export class Settings extends jspb.Message {
  clearSettingsList(): void;
  getSettingsList(): Array<Setting>;
  setSettingsList(value: Array<Setting>): void;
  addSettings(value?: Setting, index?: number): Setting;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Settings.AsObject;
  static toObject(includeInstance: boolean, msg: Settings): Settings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Settings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Settings;
  static deserializeBinaryFromReader(message: Settings, reader: jspb.BinaryReader): Settings;
}

export namespace Settings {
  export type AsObject = {
    settingsList: Array<Setting.AsObject>,
  }
}

export class Setting extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Setting.AsObject;
  static toObject(includeInstance: boolean, msg: Setting): Setting.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Setting, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Setting;
  static deserializeBinaryFromReader(message: Setting, reader: jspb.BinaryReader): Setting;
}

export namespace Setting {
  export type AsObject = {
    key: string,
    value: string,
  }
}

export class StartRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StartRequest): StartRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StartRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartRequest;
  static deserializeBinaryFromReader(message: StartRequest, reader: jspb.BinaryReader): StartRequest;
}

export namespace StartRequest {
  export type AsObject = {
  }
}

export class StartResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StartResponse): StartResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StartResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartResponse;
  static deserializeBinaryFromReader(message: StartResponse, reader: jspb.BinaryReader): StartResponse;
}

export namespace StartResponse {
  export type AsObject = {
  }
}

export class StopRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StopRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StopRequest): StopRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StopRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StopRequest;
  static deserializeBinaryFromReader(message: StopRequest, reader: jspb.BinaryReader): StopRequest;
}

export namespace StopRequest {
  export type AsObject = {
  }
}

export class StopResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StopResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StopResponse): StopResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StopResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StopResponse;
  static deserializeBinaryFromReader(message: StopResponse, reader: jspb.BinaryReader): StopResponse;
}

export namespace StopResponse {
  export type AsObject = {
  }
}

export class SettingsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SettingsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SettingsRequest): SettingsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SettingsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SettingsRequest;
  static deserializeBinaryFromReader(message: SettingsRequest, reader: jspb.BinaryReader): SettingsRequest;
}

export namespace SettingsRequest {
  export type AsObject = {
  }
}

