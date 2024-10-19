package main

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Foundation -framework AppKit

#import <Foundation/Foundation.h>
#import <Appkit/Appkit.h>

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void processWindowInfo(const char** returnValue) {
    NSWorkspace *workspace = [NSWorkspace sharedWorkspace];
    NSArray<NSDictionary *> *info = CFBridgingRelease(CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly, kCGNullWindowID));
    NSArray<NSRunningApplication *> *apps = [[workspace runningApplications] filteredArrayUsingPredicate:[NSPredicate predicateWithBlock:^BOOL(NSRunningApplication *app, NSDictionary<NSString *,id> *bindings) {
        return (app.activationPolicy == NSApplicationActivationPolicyRegular);
    }]];
    int order = 0;
    NSString *str = [[NSString alloc] initWithString:@""];

    for (NSDictionary *dict in info) {
        NSNumber *pid = dict[(__bridge NSString *)kCGWindowOwnerPID];

        if (pid != nil) {
          for (NSRunningApplication *app in apps) {
            if ([pid isEqualToNumber:@(app.processIdentifier)] && app.localizedName != nil) {
              order += 10;

              str = [str stringByAppendingFormat:@"\n\n ---- \n\n AppName = %s; \n pid = %d; \n WindowIsOnScreen = %@; \n Layer = %d \n %@;",
                [app.localizedName UTF8String],
                app.processIdentifier,
                dict[(__bridge NSString *)kCGWindowIsOnscreen] ? @"true" : @"false",
                order,
                dict[(__bridge NSString *)kCGWindowBounds]
              ];
            }
          }
        }
    }

    *returnValue = strdup([str UTF8String]);
    [str release];
    [info release];
    [apps release];
}
*/
import "C"
import (
	"bufio"
	"encoding/json"
	"strconv"
	"strings"
	"unsafe"

	"github.com/sirupsen/logrus"
)

func grabScreenInfo() ([]*ScreenWindow, error) {
	cRetValue := C.CString("")
	defer C.free(unsafe.Pointer(cRetValue))

	C.processWindowInfo(&cRetValue)
	str := C.GoString(cRetValue)
	scanner := bufio.NewScanner(strings.NewReader(str))

	screenWindows := make([]*ScreenWindow, 0)
	lineAt := 0
	currentSw := &ScreenWindow{}
	for scanner.Scan() {

		curLine := strings.TrimSpace(scanner.Text())
		if strings.Contains(curLine, "----") {
			// BREAK and start new
			if currentSw.AppName != "" {
				screenWindows = append(screenWindows, currentSw)
			}
			lineAt = 0
			currentSw = &ScreenWindow{
				Bounds: ScreenWindowBounds{},
			}
		}

		spl := strings.Split(curLine, " = ")
		if len(spl) > 1 {
			value := strings.TrimRight(strings.TrimSpace(spl[1]), ";")
			value = strings.TrimRight(value, "\"") // sometimes ints are in this format "-1250" note -1250
			value = strings.TrimLeft(value, "\"")
			// this could be a case statement, but i dont know what wierdness might occur, best to check line number and "key"
			if lineAt == 2 && strings.TrimSpace(spl[0]) == "AppName" {
				currentSw.AppName = value
			} else if lineAt == 3 && strings.TrimSpace(spl[0]) == "pid" {
				if i, err := strconv.Atoi(value); err == nil {
					currentSw.Pid = i
				}
			} else if lineAt == 5 && strings.TrimSpace(spl[0]) == "Layer" {
				if i, err := strconv.Atoi(value); err == nil {
					currentSw.Layer = i
				}
			} else if lineAt == 7 && strings.TrimSpace(spl[0]) == "Height" {
				if i, err := strconv.Atoi(value); err == nil {
					currentSw.Bounds.Height = i
				}
			} else if lineAt == 8 && strings.TrimSpace(spl[0]) == "Width" {
				if i, err := strconv.Atoi(value); err == nil {
					currentSw.Bounds.Width = i
				}
			} else if lineAt == 9 && strings.TrimSpace(spl[0]) == "X" {
				if i, err := strconv.Atoi(value); err == nil {
					currentSw.Bounds.X = i
				}
			} else if lineAt == 10 && strings.TrimSpace(spl[0]) == "Y" {
				if i, err := strconv.Atoi(value); err == nil {
					currentSw.Bounds.Y = i
				}
			} else if lineAt == 4 && strings.TrimSpace(spl[0]) == "WindowIsOnScreen" {
				currentSw.IsOnScreen = (value == "true")
			}
		}

		lineAt++
	}

	// grab the last guy
	if currentSw.AppName != "" {
		screenWindows = append(screenWindows, currentSw)
	}
	b, err := json.Marshal(screenWindows)
	if err != nil {
		return nil, err
	}
	logrus.Info(string(b))
	return screenWindows, nil
}
