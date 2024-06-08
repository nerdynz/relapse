package main

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Vision

#import <Foundation/Foundation.h>
#import <Vision/Vision.h>

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void processWindowInfoxxx(const char** returnValue) {
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
