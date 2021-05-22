// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.26.0
// 	protoc        v3.15.8
// source: relapse.proto

package relapse_proto

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Capture struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	CaptureID             int64  `protobuf:"varint,1,opt,name=CaptureID,proto3" json:"CaptureID,omitempty" db:"capture_id"`
	AppName               string `protobuf:"bytes,2,opt,name=AppName,proto3" json:"AppName,omitempty" db:"app_name"`
	AppPath               string `protobuf:"bytes,3,opt,name=AppPath,proto3" json:"AppPath,omitempty" db:"app_path"`
	Filepath              string `protobuf:"bytes,4,opt,name=Filepath,proto3" json:"Filepath,omitempty" db:"filepath"`
	Fullpath              string `protobuf:"bytes,5,opt,name=Fullpath,proto3" json:"Fullpath,omitempty" db:"fullpath"`
	CaptureTimeSeconds    int64  `protobuf:"varint,6,opt,name=CaptureTimeSeconds,proto3" json:"CaptureTimeSeconds,omitempty" db:"capture_time_seconds"`
	CaptureDayTimeSeconds int64  `protobuf:"varint,7,opt,name=CaptureDayTimeSeconds,proto3" json:"CaptureDayTimeSeconds,omitempty" db:"capture_day_time_seconds"`
	CaptureSizeBytes      int64  `protobuf:"varint,8,opt,name=CaptureSizeBytes,proto3" json:"CaptureSizeBytes,omitempty" db:"capture_size_bytes"`
	IsPurged              bool   `protobuf:"varint,9,opt,name=IsPurged,proto3" json:"IsPurged,omitempty" db:"is_purged"`
}

func (x *Capture) Reset() {
	*x = Capture{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Capture) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Capture) ProtoMessage() {}

func (x *Capture) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Capture.ProtoReflect.Descriptor instead.
func (*Capture) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{0}
}

func (x *Capture) GetCaptureID() int64 {
	if x != nil {
		return x.CaptureID
	}
	return 0
}

func (x *Capture) GetAppName() string {
	if x != nil {
		return x.AppName
	}
	return ""
}

func (x *Capture) GetAppPath() string {
	if x != nil {
		return x.AppPath
	}
	return ""
}

func (x *Capture) GetFilepath() string {
	if x != nil {
		return x.Filepath
	}
	return ""
}

func (x *Capture) GetFullpath() string {
	if x != nil {
		return x.Fullpath
	}
	return ""
}

func (x *Capture) GetCaptureTimeSeconds() int64 {
	if x != nil {
		return x.CaptureTimeSeconds
	}
	return 0
}

func (x *Capture) GetCaptureDayTimeSeconds() int64 {
	if x != nil {
		return x.CaptureDayTimeSeconds
	}
	return 0
}

func (x *Capture) GetCaptureSizeBytes() int64 {
	if x != nil {
		return x.CaptureSizeBytes
	}
	return 0
}

func (x *Capture) GetIsPurged() bool {
	if x != nil {
		return x.IsPurged
	}
	return false
}

type CaptureDaySummary struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	CaptureDayTimeSeconds    int64 `protobuf:"varint,1,opt,name=CaptureDayTimeSeconds,proto3" json:"CaptureDayTimeSeconds,omitempty" db:"capture_day_time_seconds"`
	TotalCapturedTimeSeconds int64 `protobuf:"varint,2,opt,name=TotalCapturedTimeSeconds,proto3" json:"TotalCapturedTimeSeconds,omitempty" db:"total_captured_time_seconds"`
	TotalCapturesForDay      int64 `protobuf:"varint,3,opt,name=TotalCapturesForDay,proto3" json:"TotalCapturesForDay,omitempty" db:"total_captures_for_day"`
	TotalCaptureSizeBytes    int64 `protobuf:"varint,4,opt,name=TotalCaptureSizeBytes,proto3" json:"TotalCaptureSizeBytes,omitempty" db:"total_capture_size_bytes"`
	IsPurged                 bool  `protobuf:"varint,5,opt,name=IsPurged,proto3" json:"IsPurged,omitempty" db:"is_purged"`
}

func (x *CaptureDaySummary) Reset() {
	*x = CaptureDaySummary{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CaptureDaySummary) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CaptureDaySummary) ProtoMessage() {}

func (x *CaptureDaySummary) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CaptureDaySummary.ProtoReflect.Descriptor instead.
func (*CaptureDaySummary) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{1}
}

func (x *CaptureDaySummary) GetCaptureDayTimeSeconds() int64 {
	if x != nil {
		return x.CaptureDayTimeSeconds
	}
	return 0
}

func (x *CaptureDaySummary) GetTotalCapturedTimeSeconds() int64 {
	if x != nil {
		return x.TotalCapturedTimeSeconds
	}
	return 0
}

func (x *CaptureDaySummary) GetTotalCapturesForDay() int64 {
	if x != nil {
		return x.TotalCapturesForDay
	}
	return 0
}

func (x *CaptureDaySummary) GetTotalCaptureSizeBytes() int64 {
	if x != nil {
		return x.TotalCaptureSizeBytes
	}
	return 0
}

func (x *CaptureDaySummary) GetIsPurged() bool {
	if x != nil {
		return x.IsPurged
	}
	return false
}

type DayRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	CaptureDayTimeSeconds int64 `protobuf:"varint,1,opt,name=CaptureDayTimeSeconds,proto3" json:"CaptureDayTimeSeconds,omitempty" db:"capture_day_time_seconds"`
}

func (x *DayRequest) Reset() {
	*x = DayRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DayRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DayRequest) ProtoMessage() {}

func (x *DayRequest) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DayRequest.ProtoReflect.Descriptor instead.
func (*DayRequest) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{2}
}

func (x *DayRequest) GetCaptureDayTimeSeconds() int64 {
	if x != nil {
		return x.CaptureDayTimeSeconds
	}
	return 0
}

type DayResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	CaptureDayTimeSeconds int64              `protobuf:"varint,1,opt,name=CaptureDayTimeSeconds,proto3" json:"CaptureDayTimeSeconds,omitempty" db:"capture_day_time_seconds"`
	Captures              []*Capture         `protobuf:"bytes,2,rep,name=Captures,proto3" json:"Captures,omitempty" db:"captures"`
	Summary               *CaptureDaySummary `protobuf:"bytes,3,opt,name=summary,proto3" json:"summary,omitempty" db:"summary"`
}

func (x *DayResponse) Reset() {
	*x = DayResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DayResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DayResponse) ProtoMessage() {}

func (x *DayResponse) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DayResponse.ProtoReflect.Descriptor instead.
func (*DayResponse) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{3}
}

func (x *DayResponse) GetCaptureDayTimeSeconds() int64 {
	if x != nil {
		return x.CaptureDayTimeSeconds
	}
	return 0
}

func (x *DayResponse) GetCaptures() []*Capture {
	if x != nil {
		return x.Captures
	}
	return nil
}

func (x *DayResponse) GetSummary() *CaptureDaySummary {
	if x != nil {
		return x.Summary
	}
	return nil
}

type Settings struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	IsEnabled      bool     `protobuf:"varint,1,opt,name=IsEnabled,proto3" json:"IsEnabled,omitempty" db:"is_enabled"`
	RetainForXDays int32    `protobuf:"varint,2,opt,name=RetainForXDays,proto3" json:"RetainForXDays,omitempty" db:"retain_for_x_days"`
	Rejections     []string `protobuf:"bytes,3,rep,name=Rejections,proto3" json:"Rejections,omitempty" db:"rejections"`
}

func (x *Settings) Reset() {
	*x = Settings{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Settings) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Settings) ProtoMessage() {}

func (x *Settings) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Settings.ProtoReflect.Descriptor instead.
func (*Settings) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{4}
}

func (x *Settings) GetIsEnabled() bool {
	if x != nil {
		return x.IsEnabled
	}
	return false
}

func (x *Settings) GetRetainForXDays() int32 {
	if x != nil {
		return x.RetainForXDays
	}
	return 0
}

func (x *Settings) GetRejections() []string {
	if x != nil {
		return x.Rejections
	}
	return nil
}

type SettingsOptions struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	CapturedApplications []*ApplicationInfo `protobuf:"bytes,1,rep,name=CapturedApplications,proto3" json:"CapturedApplications,omitempty" db:"captured_applications"`
}

func (x *SettingsOptions) Reset() {
	*x = SettingsOptions{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SettingsOptions) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SettingsOptions) ProtoMessage() {}

func (x *SettingsOptions) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SettingsOptions.ProtoReflect.Descriptor instead.
func (*SettingsOptions) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{5}
}

func (x *SettingsOptions) GetCapturedApplications() []*ApplicationInfo {
	if x != nil {
		return x.CapturedApplications
	}
	return nil
}

type ApplicationInfo struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	AppName string `protobuf:"bytes,1,opt,name=AppName,proto3" json:"AppName,omitempty" db:"app_name"`
	AppPath string `protobuf:"bytes,2,opt,name=AppPath,proto3" json:"AppPath,omitempty" db:"app_path"`
}

func (x *ApplicationInfo) Reset() {
	*x = ApplicationInfo{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ApplicationInfo) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ApplicationInfo) ProtoMessage() {}

func (x *ApplicationInfo) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ApplicationInfo.ProtoReflect.Descriptor instead.
func (*ApplicationInfo) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{6}
}

func (x *ApplicationInfo) GetAppName() string {
	if x != nil {
		return x.AppName
	}
	return ""
}

func (x *ApplicationInfo) GetAppPath() string {
	if x != nil {
		return x.AppPath
	}
	return ""
}

type DaySummariesRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *DaySummariesRequest) Reset() {
	*x = DaySummariesRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[7]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DaySummariesRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DaySummariesRequest) ProtoMessage() {}

func (x *DaySummariesRequest) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[7]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DaySummariesRequest.ProtoReflect.Descriptor instead.
func (*DaySummariesRequest) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{7}
}

type DaySummaries struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	DaySummaries []*CaptureDaySummary `protobuf:"bytes,1,rep,name=DaySummaries,proto3" json:"DaySummaries,omitempty" db:"day_summaries"`
}

func (x *DaySummaries) Reset() {
	*x = DaySummaries{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[8]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DaySummaries) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DaySummaries) ProtoMessage() {}

func (x *DaySummaries) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[8]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DaySummaries.ProtoReflect.Descriptor instead.
func (*DaySummaries) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{8}
}

func (x *DaySummaries) GetDaySummaries() []*CaptureDaySummary {
	if x != nil {
		return x.DaySummaries
	}
	return nil
}

type SettingsPlusOptionsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *SettingsPlusOptionsRequest) Reset() {
	*x = SettingsPlusOptionsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[9]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SettingsPlusOptionsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SettingsPlusOptionsRequest) ProtoMessage() {}

func (x *SettingsPlusOptionsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[9]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SettingsPlusOptionsRequest.ProtoReflect.Descriptor instead.
func (*SettingsPlusOptionsRequest) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{9}
}

type SettingsPlusOptions struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Settings        *Settings        `protobuf:"bytes,1,opt,name=Settings,proto3" json:"Settings,omitempty" db:"settings"`
	SettingsOptions *SettingsOptions `protobuf:"bytes,2,opt,name=SettingsOptions,proto3" json:"SettingsOptions,omitempty" db:"settings_options"`
}

func (x *SettingsPlusOptions) Reset() {
	*x = SettingsPlusOptions{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[10]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SettingsPlusOptions) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SettingsPlusOptions) ProtoMessage() {}

func (x *SettingsPlusOptions) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[10]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SettingsPlusOptions.ProtoReflect.Descriptor instead.
func (*SettingsPlusOptions) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{10}
}

func (x *SettingsPlusOptions) GetSettings() *Settings {
	if x != nil {
		return x.Settings
	}
	return nil
}

func (x *SettingsPlusOptions) GetSettingsOptions() *SettingsOptions {
	if x != nil {
		return x.SettingsOptions
	}
	return nil
}

type ListenRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	IsPerformingInitialCapture bool `protobuf:"varint,1,opt,name=IsPerformingInitialCapture,proto3" json:"IsPerformingInitialCapture,omitempty" db:"is_performing_initial_capture"`
}

func (x *ListenRequest) Reset() {
	*x = ListenRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_relapse_proto_msgTypes[11]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ListenRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListenRequest) ProtoMessage() {}

func (x *ListenRequest) ProtoReflect() protoreflect.Message {
	mi := &file_relapse_proto_msgTypes[11]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListenRequest.ProtoReflect.Descriptor instead.
func (*ListenRequest) Descriptor() ([]byte, []int) {
	return file_relapse_proto_rawDescGZIP(), []int{11}
}

func (x *ListenRequest) GetIsPerformingInitialCapture() bool {
	if x != nil {
		return x.IsPerformingInitialCapture
	}
	return false
}

var File_relapse_proto protoreflect.FileDescriptor

var file_relapse_proto_rawDesc = []byte{
	0x0a, 0x0d, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12,
	0x0d, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0xc1,
	0x02, 0x0a, 0x07, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x12, 0x1c, 0x0a, 0x09, 0x43, 0x61,
	0x70, 0x74, 0x75, 0x72, 0x65, 0x49, 0x44, 0x18, 0x01, 0x20, 0x01, 0x28, 0x03, 0x52, 0x09, 0x43,
	0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x49, 0x44, 0x12, 0x18, 0x0a, 0x07, 0x41, 0x70, 0x70, 0x4e,
	0x61, 0x6d, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x41, 0x70, 0x70, 0x4e, 0x61,
	0x6d, 0x65, 0x12, 0x18, 0x0a, 0x07, 0x41, 0x70, 0x70, 0x50, 0x61, 0x74, 0x68, 0x18, 0x03, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x07, 0x41, 0x70, 0x70, 0x50, 0x61, 0x74, 0x68, 0x12, 0x1a, 0x0a, 0x08,
	0x46, 0x69, 0x6c, 0x65, 0x70, 0x61, 0x74, 0x68, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08,
	0x46, 0x69, 0x6c, 0x65, 0x70, 0x61, 0x74, 0x68, 0x12, 0x1a, 0x0a, 0x08, 0x46, 0x75, 0x6c, 0x6c,
	0x70, 0x61, 0x74, 0x68, 0x18, 0x05, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x46, 0x75, 0x6c, 0x6c,
	0x70, 0x61, 0x74, 0x68, 0x12, 0x2e, 0x0a, 0x12, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x54,
	0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x18, 0x06, 0x20, 0x01, 0x28, 0x03,
	0x52, 0x12, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x54, 0x69, 0x6d, 0x65, 0x53, 0x65, 0x63,
	0x6f, 0x6e, 0x64, 0x73, 0x12, 0x34, 0x0a, 0x15, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x44,
	0x61, 0x79, 0x54, 0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x18, 0x07, 0x20,
	0x01, 0x28, 0x03, 0x52, 0x15, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x44, 0x61, 0x79, 0x54,
	0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x12, 0x2a, 0x0a, 0x10, 0x43, 0x61,
	0x70, 0x74, 0x75, 0x72, 0x65, 0x53, 0x69, 0x7a, 0x65, 0x42, 0x79, 0x74, 0x65, 0x73, 0x18, 0x08,
	0x20, 0x01, 0x28, 0x03, 0x52, 0x10, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x53, 0x69, 0x7a,
	0x65, 0x42, 0x79, 0x74, 0x65, 0x73, 0x12, 0x1a, 0x0a, 0x08, 0x49, 0x73, 0x50, 0x75, 0x72, 0x67,
	0x65, 0x64, 0x18, 0x09, 0x20, 0x01, 0x28, 0x08, 0x52, 0x08, 0x49, 0x73, 0x50, 0x75, 0x72, 0x67,
	0x65, 0x64, 0x22, 0x89, 0x02, 0x0a, 0x11, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x44, 0x61,
	0x79, 0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x79, 0x12, 0x34, 0x0a, 0x15, 0x43, 0x61, 0x70, 0x74,
	0x75, 0x72, 0x65, 0x44, 0x61, 0x79, 0x54, 0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64,
	0x73, 0x18, 0x01, 0x20, 0x01, 0x28, 0x03, 0x52, 0x15, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65,
	0x44, 0x61, 0x79, 0x54, 0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x12, 0x3a,
	0x0a, 0x18, 0x54, 0x6f, 0x74, 0x61, 0x6c, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x64, 0x54,
	0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x18, 0x02, 0x20, 0x01, 0x28, 0x03,
	0x52, 0x18, 0x54, 0x6f, 0x74, 0x61, 0x6c, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x64, 0x54,
	0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x12, 0x30, 0x0a, 0x13, 0x54, 0x6f,
	0x74, 0x61, 0x6c, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x73, 0x46, 0x6f, 0x72, 0x44, 0x61,
	0x79, 0x18, 0x03, 0x20, 0x01, 0x28, 0x03, 0x52, 0x13, 0x54, 0x6f, 0x74, 0x61, 0x6c, 0x43, 0x61,
	0x70, 0x74, 0x75, 0x72, 0x65, 0x73, 0x46, 0x6f, 0x72, 0x44, 0x61, 0x79, 0x12, 0x34, 0x0a, 0x15,
	0x54, 0x6f, 0x74, 0x61, 0x6c, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x53, 0x69, 0x7a, 0x65,
	0x42, 0x79, 0x74, 0x65, 0x73, 0x18, 0x04, 0x20, 0x01, 0x28, 0x03, 0x52, 0x15, 0x54, 0x6f, 0x74,
	0x61, 0x6c, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x53, 0x69, 0x7a, 0x65, 0x42, 0x79, 0x74,
	0x65, 0x73, 0x12, 0x1a, 0x0a, 0x08, 0x49, 0x73, 0x50, 0x75, 0x72, 0x67, 0x65, 0x64, 0x18, 0x05,
	0x20, 0x01, 0x28, 0x08, 0x52, 0x08, 0x49, 0x73, 0x50, 0x75, 0x72, 0x67, 0x65, 0x64, 0x22, 0x42,
	0x0a, 0x0a, 0x44, 0x61, 0x79, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x34, 0x0a, 0x15,
	0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x44, 0x61, 0x79, 0x54, 0x69, 0x6d, 0x65, 0x53, 0x65,
	0x63, 0x6f, 0x6e, 0x64, 0x73, 0x18, 0x01, 0x20, 0x01, 0x28, 0x03, 0x52, 0x15, 0x43, 0x61, 0x70,
	0x74, 0x75, 0x72, 0x65, 0x44, 0x61, 0x79, 0x54, 0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e,
	0x64, 0x73, 0x22, 0xb3, 0x01, 0x0a, 0x0b, 0x44, 0x61, 0x79, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e,
	0x73, 0x65, 0x12, 0x34, 0x0a, 0x15, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x44, 0x61, 0x79,
	0x54, 0x69, 0x6d, 0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x03, 0x52, 0x15, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x44, 0x61, 0x79, 0x54, 0x69, 0x6d,
	0x65, 0x53, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x73, 0x12, 0x32, 0x0a, 0x08, 0x43, 0x61, 0x70, 0x74,
	0x75, 0x72, 0x65, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x16, 0x2e, 0x72, 0x65, 0x6c,
	0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x43, 0x61, 0x70, 0x74, 0x75,
	0x72, 0x65, 0x52, 0x08, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x73, 0x12, 0x3a, 0x0a, 0x07,
	0x73, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x79, 0x18, 0x03, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x20, 0x2e,
	0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x43, 0x61,
	0x70, 0x74, 0x75, 0x72, 0x65, 0x44, 0x61, 0x79, 0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x79, 0x52,
	0x07, 0x73, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x79, 0x22, 0x70, 0x0a, 0x08, 0x53, 0x65, 0x74, 0x74,
	0x69, 0x6e, 0x67, 0x73, 0x12, 0x1c, 0x0a, 0x09, 0x49, 0x73, 0x45, 0x6e, 0x61, 0x62, 0x6c, 0x65,
	0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x08, 0x52, 0x09, 0x49, 0x73, 0x45, 0x6e, 0x61, 0x62, 0x6c,
	0x65, 0x64, 0x12, 0x26, 0x0a, 0x0e, 0x52, 0x65, 0x74, 0x61, 0x69, 0x6e, 0x46, 0x6f, 0x72, 0x58,
	0x44, 0x61, 0x79, 0x73, 0x18, 0x02, 0x20, 0x01, 0x28, 0x05, 0x52, 0x0e, 0x52, 0x65, 0x74, 0x61,
	0x69, 0x6e, 0x46, 0x6f, 0x72, 0x58, 0x44, 0x61, 0x79, 0x73, 0x12, 0x1e, 0x0a, 0x0a, 0x52, 0x65,
	0x6a, 0x65, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x18, 0x03, 0x20, 0x03, 0x28, 0x09, 0x52, 0x0a,
	0x52, 0x65, 0x6a, 0x65, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x22, 0x65, 0x0a, 0x0f, 0x53, 0x65,
	0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x12, 0x52, 0x0a,
	0x14, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x64, 0x41, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61,
	0x74, 0x69, 0x6f, 0x6e, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x1e, 0x2e, 0x72, 0x65,
	0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x41, 0x70, 0x70, 0x6c,
	0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x49, 0x6e, 0x66, 0x6f, 0x52, 0x14, 0x43, 0x61, 0x70,
	0x74, 0x75, 0x72, 0x65, 0x64, 0x41, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e,
	0x73, 0x22, 0x45, 0x0a, 0x0f, 0x41, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e,
	0x49, 0x6e, 0x66, 0x6f, 0x12, 0x18, 0x0a, 0x07, 0x41, 0x70, 0x70, 0x4e, 0x61, 0x6d, 0x65, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x41, 0x70, 0x70, 0x4e, 0x61, 0x6d, 0x65, 0x12, 0x18,
	0x0a, 0x07, 0x41, 0x70, 0x70, 0x50, 0x61, 0x74, 0x68, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x07, 0x41, 0x70, 0x70, 0x50, 0x61, 0x74, 0x68, 0x22, 0x15, 0x0a, 0x13, 0x44, 0x61, 0x79, 0x53,
	0x75, 0x6d, 0x6d, 0x61, 0x72, 0x69, 0x65, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x22,
	0x54, 0x0a, 0x0c, 0x44, 0x61, 0x79, 0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x69, 0x65, 0x73, 0x12,
	0x44, 0x0a, 0x0c, 0x44, 0x61, 0x79, 0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x69, 0x65, 0x73, 0x18,
	0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x20, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x44, 0x61, 0x79,
	0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x79, 0x52, 0x0c, 0x44, 0x61, 0x79, 0x53, 0x75, 0x6d, 0x6d,
	0x61, 0x72, 0x69, 0x65, 0x73, 0x22, 0x1c, 0x0a, 0x1a, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67,
	0x73, 0x50, 0x6c, 0x75, 0x73, 0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x22, 0x94, 0x01, 0x0a, 0x13, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73,
	0x50, 0x6c, 0x75, 0x73, 0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x12, 0x33, 0x0a, 0x08, 0x53,
	0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x17, 0x2e,
	0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x53, 0x65,
	0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x08, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73,
	0x12, 0x48, 0x0a, 0x0f, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x4f, 0x70, 0x74, 0x69,
	0x6f, 0x6e, 0x73, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1e, 0x2e, 0x72, 0x65, 0x6c, 0x61,
	0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e,
	0x67, 0x73, 0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x0f, 0x53, 0x65, 0x74, 0x74, 0x69,
	0x6e, 0x67, 0x73, 0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x22, 0x4f, 0x0a, 0x0d, 0x4c, 0x69,
	0x73, 0x74, 0x65, 0x6e, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x3e, 0x0a, 0x1a, 0x49,
	0x73, 0x50, 0x65, 0x72, 0x66, 0x6f, 0x72, 0x6d, 0x69, 0x6e, 0x67, 0x49, 0x6e, 0x69, 0x74, 0x69,
	0x61, 0x6c, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x08, 0x52,
	0x1a, 0x49, 0x73, 0x50, 0x65, 0x72, 0x66, 0x6f, 0x72, 0x6d, 0x69, 0x6e, 0x67, 0x49, 0x6e, 0x69,
	0x74, 0x69, 0x61, 0x6c, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x32, 0xa4, 0x03, 0x0a, 0x07,
	0x52, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x12, 0x5e, 0x0a, 0x0b, 0x47, 0x65, 0x74, 0x53, 0x65,
	0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x12, 0x29, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65,
	0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x50,
	0x6c, 0x75, 0x73, 0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x1a, 0x22, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x2e, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x50, 0x6c, 0x75, 0x73, 0x4f, 0x70,
	0x74, 0x69, 0x6f, 0x6e, 0x73, 0x22, 0x00, 0x12, 0x41, 0x0a, 0x0b, 0x53, 0x65, 0x74, 0x53, 0x65,
	0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x12, 0x17, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65,
	0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x1a,
	0x17, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e,
	0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x22, 0x00, 0x12, 0x4d, 0x0a, 0x12, 0x47, 0x65,
	0x74, 0x43, 0x61, 0x70, 0x74, 0x75, 0x72, 0x65, 0x73, 0x46, 0x6f, 0x72, 0x41, 0x44, 0x61, 0x79,
	0x12, 0x19, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x2e, 0x44, 0x61, 0x79, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x1a, 0x2e, 0x72, 0x65,
	0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x44, 0x61, 0x79, 0x52,
	0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22, 0x00, 0x12, 0x54, 0x0a, 0x0f, 0x47, 0x65, 0x74,
	0x44, 0x61, 0x79, 0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x69, 0x65, 0x73, 0x12, 0x22, 0x2e, 0x72,
	0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x44, 0x61, 0x79,
	0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x69, 0x65, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x1a, 0x1b, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x2e, 0x44, 0x61, 0x79, 0x53, 0x75, 0x6d, 0x6d, 0x61, 0x72, 0x69, 0x65, 0x73, 0x22, 0x00, 0x12,
	0x51, 0x0a, 0x11, 0x4c, 0x69, 0x73, 0x74, 0x65, 0x6e, 0x46, 0x6f, 0x72, 0x43, 0x61, 0x70, 0x74,
	0x75, 0x72, 0x65, 0x73, 0x12, 0x1c, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x2e, 0x4c, 0x69, 0x73, 0x74, 0x65, 0x6e, 0x52, 0x65, 0x71, 0x75, 0x65,
	0x73, 0x74, 0x1a, 0x1a, 0x2e, 0x72, 0x65, 0x6c, 0x61, 0x70, 0x73, 0x65, 0x5f, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x2e, 0x44, 0x61, 0x79, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22, 0x00,
	0x30, 0x01, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_relapse_proto_rawDescOnce sync.Once
	file_relapse_proto_rawDescData = file_relapse_proto_rawDesc
)

func file_relapse_proto_rawDescGZIP() []byte {
	file_relapse_proto_rawDescOnce.Do(func() {
		file_relapse_proto_rawDescData = protoimpl.X.CompressGZIP(file_relapse_proto_rawDescData)
	})
	return file_relapse_proto_rawDescData
}

var file_relapse_proto_msgTypes = make([]protoimpl.MessageInfo, 12)
var file_relapse_proto_goTypes = []interface{}{
	(*Capture)(nil),                    // 0: relapse_proto.Capture
	(*CaptureDaySummary)(nil),          // 1: relapse_proto.CaptureDaySummary
	(*DayRequest)(nil),                 // 2: relapse_proto.DayRequest
	(*DayResponse)(nil),                // 3: relapse_proto.DayResponse
	(*Settings)(nil),                   // 4: relapse_proto.Settings
	(*SettingsOptions)(nil),            // 5: relapse_proto.SettingsOptions
	(*ApplicationInfo)(nil),            // 6: relapse_proto.ApplicationInfo
	(*DaySummariesRequest)(nil),        // 7: relapse_proto.DaySummariesRequest
	(*DaySummaries)(nil),               // 8: relapse_proto.DaySummaries
	(*SettingsPlusOptionsRequest)(nil), // 9: relapse_proto.SettingsPlusOptionsRequest
	(*SettingsPlusOptions)(nil),        // 10: relapse_proto.SettingsPlusOptions
	(*ListenRequest)(nil),              // 11: relapse_proto.ListenRequest
}
var file_relapse_proto_depIdxs = []int32{
	0,  // 0: relapse_proto.DayResponse.Captures:type_name -> relapse_proto.Capture
	1,  // 1: relapse_proto.DayResponse.summary:type_name -> relapse_proto.CaptureDaySummary
	6,  // 2: relapse_proto.SettingsOptions.CapturedApplications:type_name -> relapse_proto.ApplicationInfo
	1,  // 3: relapse_proto.DaySummaries.DaySummaries:type_name -> relapse_proto.CaptureDaySummary
	4,  // 4: relapse_proto.SettingsPlusOptions.Settings:type_name -> relapse_proto.Settings
	5,  // 5: relapse_proto.SettingsPlusOptions.SettingsOptions:type_name -> relapse_proto.SettingsOptions
	9,  // 6: relapse_proto.Relapse.GetSettings:input_type -> relapse_proto.SettingsPlusOptionsRequest
	4,  // 7: relapse_proto.Relapse.SetSettings:input_type -> relapse_proto.Settings
	2,  // 8: relapse_proto.Relapse.GetCapturesForADay:input_type -> relapse_proto.DayRequest
	7,  // 9: relapse_proto.Relapse.GetDaySummaries:input_type -> relapse_proto.DaySummariesRequest
	11, // 10: relapse_proto.Relapse.ListenForCaptures:input_type -> relapse_proto.ListenRequest
	10, // 11: relapse_proto.Relapse.GetSettings:output_type -> relapse_proto.SettingsPlusOptions
	4,  // 12: relapse_proto.Relapse.SetSettings:output_type -> relapse_proto.Settings
	3,  // 13: relapse_proto.Relapse.GetCapturesForADay:output_type -> relapse_proto.DayResponse
	8,  // 14: relapse_proto.Relapse.GetDaySummaries:output_type -> relapse_proto.DaySummaries
	3,  // 15: relapse_proto.Relapse.ListenForCaptures:output_type -> relapse_proto.DayResponse
	11, // [11:16] is the sub-list for method output_type
	6,  // [6:11] is the sub-list for method input_type
	6,  // [6:6] is the sub-list for extension type_name
	6,  // [6:6] is the sub-list for extension extendee
	0,  // [0:6] is the sub-list for field type_name
}

func init() { file_relapse_proto_init() }
func file_relapse_proto_init() {
	if File_relapse_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_relapse_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Capture); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CaptureDaySummary); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DayRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DayResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Settings); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*SettingsOptions); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ApplicationInfo); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[7].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DaySummariesRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[8].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DaySummaries); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[9].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*SettingsPlusOptionsRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[10].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*SettingsPlusOptions); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_relapse_proto_msgTypes[11].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ListenRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_relapse_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   12,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_relapse_proto_goTypes,
		DependencyIndexes: file_relapse_proto_depIdxs,
		MessageInfos:      file_relapse_proto_msgTypes,
	}.Build()
	File_relapse_proto = out.File
	file_relapse_proto_rawDesc = nil
	file_relapse_proto_goTypes = nil
	file_relapse_proto_depIdxs = nil
}
