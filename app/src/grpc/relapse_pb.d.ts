// package: relapse_proto
// file: relapse.proto

import * as jspb from 'google-protobuf';

export class Capture extends jspb.Message {
  getCaptureid(): number;
  setCaptureid(value: number): void;

  getAppname(): string;
  setAppname(value: string): void;

  getApppath(): string;
  setApppath(value: string): void;

  getFilepath(): string;
  setFilepath(value: string): void;

  getFullpath(): string;
  setFullpath(value: string): void;

  getCapturetimeseconds(): number;
  setCapturetimeseconds(value: number): void;

  getCapturedaytimeseconds(): number;
  setCapturedaytimeseconds(value: number): void;

  getCapturesizebytes(): number;
  setCapturesizebytes(value: number): void;

  getIspurged(): boolean;
  setIspurged(value: boolean): void;

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
    apppath: string,
    filepath: string,
    fullpath: string,
    capturetimeseconds: number,
    capturedaytimeseconds: number,
    capturesizebytes: number,
    ispurged: boolean,
  }
}

export class CaptureDaySummary extends jspb.Message {
  getCapturedaytimeseconds(): number;
  setCapturedaytimeseconds(value: number): void;

  getTotalcapturedtimeseconds(): number;
  setTotalcapturedtimeseconds(value: number): void;

  getTotalcapturesforday(): number;
  setTotalcapturesforday(value: number): void;

  getTotalcapturesizebytes(): number;
  setTotalcapturesizebytes(value: number): void;

  getIspurged(): boolean;
  setIspurged(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CaptureDaySummary.AsObject;
  static toObject(includeInstance: boolean, msg: CaptureDaySummary): CaptureDaySummary.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CaptureDaySummary, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CaptureDaySummary;
  static deserializeBinaryFromReader(message: CaptureDaySummary, reader: jspb.BinaryReader): CaptureDaySummary;
}

export namespace CaptureDaySummary {
  export type AsObject = {
    capturedaytimeseconds: number,
    totalcapturedtimeseconds: number,
    totalcapturesforday: number,
    totalcapturesizebytes: number,
    ispurged: boolean,
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

  hasSummary(): boolean;
  clearSummary(): void;
  getSummary(): CaptureDaySummary | undefined;
  setSummary(value?: CaptureDaySummary): void;

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
    summary?: CaptureDaySummary.AsObject,
  }
}

export class Settings extends jspb.Message {
  getIsenabled(): boolean;
  setIsenabled(value: boolean): void;

  getRetainforxdays(): number;
  setRetainforxdays(value: number): void;

  clearRejectionsList(): void;
  getRejectionsList(): Array<string>;
  setRejectionsList(value: Array<string>): void;
  addRejections(value: string, index?: number): string;

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
    isenabled: boolean,
    retainforxdays: number,
    rejectionsList: Array<string>,
  }
}

export class SettingsOptions extends jspb.Message {
  clearCapturedapplicationsList(): void;
  getCapturedapplicationsList(): Array<ApplicationInfo>;
  setCapturedapplicationsList(value: Array<ApplicationInfo>): void;
  addCapturedapplications(value?: ApplicationInfo, index?: number): ApplicationInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SettingsOptions.AsObject;
  static toObject(includeInstance: boolean, msg: SettingsOptions): SettingsOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SettingsOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SettingsOptions;
  static deserializeBinaryFromReader(message: SettingsOptions, reader: jspb.BinaryReader): SettingsOptions;
}

export namespace SettingsOptions {
  export type AsObject = {
    capturedapplicationsList: Array<ApplicationInfo.AsObject>,
  }
}

export class ApplicationInfo extends jspb.Message {
  getAppname(): string;
  setAppname(value: string): void;

  getApppath(): string;
  setApppath(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationInfo.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationInfo): ApplicationInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationInfo;
  static deserializeBinaryFromReader(message: ApplicationInfo, reader: jspb.BinaryReader): ApplicationInfo;
}

export namespace ApplicationInfo {
  export type AsObject = {
    appname: string,
    apppath: string,
  }
}

export class DaySummariesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DaySummariesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DaySummariesRequest): DaySummariesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DaySummariesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DaySummariesRequest;
  static deserializeBinaryFromReader(message: DaySummariesRequest, reader: jspb.BinaryReader): DaySummariesRequest;
}

export namespace DaySummariesRequest {
  export type AsObject = {
  }
}

export class DaySummaries extends jspb.Message {
  clearDaysummariesList(): void;
  getDaysummariesList(): Array<CaptureDaySummary>;
  setDaysummariesList(value: Array<CaptureDaySummary>): void;
  addDaysummaries(value?: CaptureDaySummary, index?: number): CaptureDaySummary;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DaySummaries.AsObject;
  static toObject(includeInstance: boolean, msg: DaySummaries): DaySummaries.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DaySummaries, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DaySummaries;
  static deserializeBinaryFromReader(message: DaySummaries, reader: jspb.BinaryReader): DaySummaries;
}

export namespace DaySummaries {
  export type AsObject = {
    daysummariesList: Array<CaptureDaySummary.AsObject>,
  }
}

export class SettingsPlusOptionsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SettingsPlusOptionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SettingsPlusOptionsRequest): SettingsPlusOptionsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SettingsPlusOptionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SettingsPlusOptionsRequest;
  static deserializeBinaryFromReader(message: SettingsPlusOptionsRequest, reader: jspb.BinaryReader): SettingsPlusOptionsRequest;
}

export namespace SettingsPlusOptionsRequest {
  export type AsObject = {
  }
}

export class SettingsPlusOptions extends jspb.Message {
  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): Settings | undefined;
  setSettings(value?: Settings): void;

  hasSettingsoptions(): boolean;
  clearSettingsoptions(): void;
  getSettingsoptions(): SettingsOptions | undefined;
  setSettingsoptions(value?: SettingsOptions): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SettingsPlusOptions.AsObject;
  static toObject(includeInstance: boolean, msg: SettingsPlusOptions): SettingsPlusOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SettingsPlusOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SettingsPlusOptions;
  static deserializeBinaryFromReader(message: SettingsPlusOptions, reader: jspb.BinaryReader): SettingsPlusOptions;
}

export namespace SettingsPlusOptions {
  export type AsObject = {
    settings?: Settings.AsObject,
    settingsoptions?: SettingsOptions.AsObject,
  }
}

export class ListenRequest extends jspb.Message {
  getIsperforminginitialcapture(): boolean;
  setIsperforminginitialcapture(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListenRequest): ListenRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListenRequest;
  static deserializeBinaryFromReader(message: ListenRequest, reader: jspb.BinaryReader): ListenRequest;
}

export namespace ListenRequest {
  export type AsObject = {
    isperforminginitialcapture: boolean,
  }
}

