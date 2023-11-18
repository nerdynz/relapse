package main

/*
#cgo CFLAGS: -x objective-c

#cgo LDFLAGS: -framework CoreGraphics -framework Foundation
#include <CoreGraphics/CoreGraphics.h>
#include <Foundation/Foundation.h>
*/
import "C"

func hasScreenCapturePermissions() (hasPerm bool) {
	defer func() {
		if r := recover(); r != nil {
			hasPerm = true
		}
	}()
	var hasPermissions C.bool
	hasPermissions = C.CGPreflightScreenCaptureAccess()
	hasPerm = bool(hasPermissions)
	return
}
