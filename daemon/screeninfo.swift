import Foundation
import AppKit

var allWindows:[ParsedWindow] = []
var workspace = NSWorkspace.shared
if let info = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[ String : Any]] {
    let apps = workspace.runningApplications.filter({ $0.activationPolicy == .regular})
    var order = 0
    for dict in info { // the dictionary
        let pid = dict["kCGWindowOwnerPID"] as? Int32
        if (pid != nil) {
            for app in apps {
                if (pid == app.processIdentifier && app.localizedName != nil) {
                    let pw = ParsedWindow(appName: app.localizedName!, order: order, fromWindowInfoDict: dict)
                    order += 10
                    allWindows.append(pw)
                }
            }
        }
    }
}

struct ParsedWindow : Codable {
    var appName = ""
    var windowIsOnScreen = false
    var layer = -1
    var pid = 0
    var bounds = ParsedWindowBounds()
    var windowNumber = 0
    init(appName: String, order: Int, fromWindowInfoDict dict: [String : Any]) {
        self.appName = appName
        self.pid =  dict["kCGWindowOwnerPID"] as! Int
        self.windowIsOnScreen =  dict["kCGWindowIsOnscreen"] as! Int32 == 1
        self.layer =  order
        //self.windowNumber = dict["kCGWindowNumber"] as! Int32
        let bounds = dict["kCGWindowBounds"] as! [String : Any]
        self.bounds = ParsedWindowBounds(fromWindowInfoDict: bounds)
    }
}

struct ParsedWindowBounds : Codable {
    var x = 0
    var y = 0
    var height = 0
    var width = 0
    init () {
        
    }
    init(fromWindowInfoDict dict: [String : Any]) {
        self.x = dict["X"] as! Int
        self.y = dict["Y"] as! Int
        self.height = dict["Height"] as! Int
        self.width = dict["Width"] as! Int
    }
}

do {
    let result = try JSONEncoder().encode(allWindows)
    print(String(data: result, encoding: .utf8)!)
} catch let error {
    print(error.localizedDescription)
}
