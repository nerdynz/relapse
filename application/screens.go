package main

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Cocoa

#import <AppKit/NSScreen.h>

CGSize getScreenSize(int index) {
    NSArray* screens = [NSScreen screens];
    if ([screens count] < 1) {
        CGSize empty;
        return empty;
    }
	return [[screens objectAtIndex:index] frame].size;
}
*/
import "C"
import "fmt"

func getPrimary() *Resolution {
	rect := C.getScreenSize(0)
	if rect.width == 0 || rect.height == 0 {
		return nil
	}
	return &Resolution{int(rect.width), int(rect.height)}
}

func getScreenResolutionAtIndex(index int) *Resolution {
	rect := C.getScreenSize(C.int(index))
	if rect.width == 0 || rect.height == 0 {
		return nil
	}
	return &Resolution{int(rect.width), int(rect.height)}
}

// Resolution represents the resolution of a single screen.
type Resolution struct {
	Width, Height int
}

func (r *Resolution) String() string {
	if r == nil {
		return ""
	}
	return fmt.Sprintf("%dx%d", r.Width, r.Height)
}
