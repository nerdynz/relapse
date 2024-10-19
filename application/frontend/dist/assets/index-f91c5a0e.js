(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const style = "";
let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let nanoid = (size2 = 21) => {
  let id = "";
  let i3 = size2;
  while (i3--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};
const runtimeURL = window.location.origin + "/wails/runtime";
const objectNames = {
  Call: 0,
  Clipboard: 1,
  Application: 2,
  Events: 3,
  ContextMenu: 4,
  Dialog: 5,
  Window: 6,
  Screens: 7,
  System: 8,
  Browser: 9,
  CancelCall: 10
};
let clientId = nanoid();
function newRuntimeCallerWithID(object, windowName) {
  return function(method, args = null) {
    return runtimeCallWithID(object, method, windowName, args);
  };
}
function runtimeCallWithID(objectID, method, windowName, args) {
  let url = new URL(runtimeURL);
  url.searchParams.append("object", objectID);
  url.searchParams.append("method", method);
  let fetchOptions = {
    headers: {}
  };
  if (windowName) {
    fetchOptions.headers["x-wails-window-name"] = windowName;
  }
  if (args) {
    url.searchParams.append("args", JSON.stringify(args));
  }
  fetchOptions.headers["x-wails-client-id"] = clientId;
  return new Promise((resolve2, reject) => {
    fetch(url, fetchOptions).then((response) => {
      if (response.ok) {
        if (response.headers.get("Content-Type") && response.headers.get("Content-Type").indexOf("application/json") !== -1) {
          return response.json();
        } else {
          return response.text();
        }
      }
      reject(Error(response.statusText));
    }).then((data) => resolve2(data)).catch((error) => reject(error));
  });
}
function invoke(msg) {
  if (window.chrome) {
    return window.chrome.webview.postMessage(msg);
  }
  return window.webkit.messageHandlers.external.postMessage(msg);
}
function IsWindows() {
  return window._wails.environment.OS === "windows";
}
function IsDebug() {
  return window._wails.environment.Debug === true;
}
window.addEventListener("contextmenu", contextMenuHandler);
const call$5 = newRuntimeCallerWithID(objectNames.ContextMenu, "");
const ContextMenuOpen = 0;
function openContextMenu(id, x3, y4, data) {
  void call$5(ContextMenuOpen, { id, x: x3, y: y4, data });
}
function contextMenuHandler(event) {
  let element = event.target;
  let customContextMenu = window.getComputedStyle(element).getPropertyValue("--custom-contextmenu");
  customContextMenu = customContextMenu ? customContextMenu.trim() : "";
  if (customContextMenu) {
    event.preventDefault();
    let customContextMenuData = window.getComputedStyle(element).getPropertyValue("--custom-contextmenu-data");
    openContextMenu(customContextMenu, event.clientX, event.clientY, customContextMenuData);
    return;
  }
  processDefaultContextMenu(event);
}
function processDefaultContextMenu(event) {
  if (IsDebug()) {
    return;
  }
  const element = event.target;
  const computedStyle = window.getComputedStyle(element);
  const defaultContextMenuAction = computedStyle.getPropertyValue("--default-contextmenu").trim();
  switch (defaultContextMenuAction) {
    case "show":
      return;
    case "hide":
      event.preventDefault();
      return;
    default:
      if (element.isContentEditable) {
        return;
      }
      const selection = window.getSelection();
      const hasSelection = selection.toString().length > 0;
      if (hasSelection) {
        for (let i3 = 0; i3 < selection.rangeCount; i3++) {
          const range = selection.getRangeAt(i3);
          const rects = range.getClientRects();
          for (let j2 = 0; j2 < rects.length; j2++) {
            const rect = rects[j2];
            if (document.elementFromPoint(rect.left, rect.top) === element) {
              return;
            }
          }
        }
      }
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        if (hasSelection || !element.readOnly && !element.disabled) {
          return;
        }
      }
      event.preventDefault();
  }
}
function GetFlag(keyString) {
  try {
    return window._wails.flags[keyString];
  } catch (e3) {
    throw new Error("Unable to retrieve flag '" + keyString + "': " + e3);
  }
}
let shouldDrag = false;
let resizable = false;
let resizeEdge = null;
let defaultCursor = "auto";
window._wails = window._wails || {};
window._wails.setResizable = function(value) {
  resizable = value;
};
window._wails.endDrag = function() {
  document.body.style.cursor = "default";
  shouldDrag = false;
};
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseup", onMouseUp);
function dragTest(e3) {
  let val = window.getComputedStyle(e3.target).getPropertyValue("--wails-draggable");
  let mousePressed = e3.buttons !== void 0 ? e3.buttons : e3.which;
  if (!val || val === "" || val.trim() !== "drag" || mousePressed === 0) {
    return false;
  }
  return e3.detail === 1;
}
function onMouseDown(e3) {
  if (resizeEdge) {
    invoke("resize:" + resizeEdge);
    e3.preventDefault();
    return;
  }
  if (dragTest(e3)) {
    if (e3.offsetX > e3.target.clientWidth || e3.offsetY > e3.target.clientHeight) {
      return;
    }
    shouldDrag = true;
  } else {
    shouldDrag = false;
  }
}
function onMouseUp() {
  shouldDrag = false;
}
function setResize(cursor) {
  document.documentElement.style.cursor = cursor || defaultCursor;
  resizeEdge = cursor;
}
function onMouseMove(e3) {
  if (shouldDrag) {
    shouldDrag = false;
    let mousePressed = e3.buttons !== void 0 ? e3.buttons : e3.which;
    if (mousePressed > 0) {
      invoke("drag");
      return;
    }
  }
  if (!resizable || !IsWindows()) {
    return;
  }
  let resizeHandleHeight = GetFlag("system.resizeHandleHeight") || 5;
  let resizeHandleWidth = GetFlag("system.resizeHandleWidth") || 5;
  let cornerExtra = GetFlag("resizeCornerExtra") || 10;
  let rightBorder = window.outerWidth - e3.clientX < resizeHandleWidth;
  let leftBorder = e3.clientX < resizeHandleWidth;
  let topBorder = e3.clientY < resizeHandleHeight;
  let bottomBorder = window.outerHeight - e3.clientY < resizeHandleHeight;
  let rightCorner = window.outerWidth - e3.clientX < resizeHandleWidth + cornerExtra;
  let leftCorner = e3.clientX < resizeHandleWidth + cornerExtra;
  let topCorner = e3.clientY < resizeHandleHeight + cornerExtra;
  let bottomCorner = window.outerHeight - e3.clientY < resizeHandleHeight + cornerExtra;
  if (!leftBorder && !rightBorder && !topBorder && !bottomBorder && resizeEdge !== void 0) {
    setResize();
  } else if (rightCorner && bottomCorner)
    setResize("se-resize");
  else if (leftCorner && bottomCorner)
    setResize("sw-resize");
  else if (leftCorner && topCorner)
    setResize("nw-resize");
  else if (topCorner && rightCorner)
    setResize("ne-resize");
  else if (leftBorder)
    setResize("w-resize");
  else if (topBorder)
    setResize("n-resize");
  else if (bottomBorder)
    setResize("s-resize");
  else if (rightBorder)
    setResize("e-resize");
}
const call$4 = newRuntimeCallerWithID(objectNames.Browser, "");
const BrowserOpenURL = 0;
function OpenURL(url) {
  return call$4(BrowserOpenURL, { url });
}
window._wails = window._wails || {};
window._wails.callResultHandler = resultHandler;
window._wails.callErrorHandler = errorHandler;
const CallBinding = 0;
const call$3 = newRuntimeCallerWithID(objectNames.Call, "");
const cancelCall = newRuntimeCallerWithID(objectNames.CancelCall, "");
let callResponses = /* @__PURE__ */ new Map();
function generateID$1() {
  let result;
  do {
    result = nanoid();
  } while (callResponses.has(result));
  return result;
}
function resultHandler(id, data, isJSON) {
  const promiseHandler = getAndDeleteResponse(id);
  if (promiseHandler) {
    promiseHandler.resolve(isJSON ? JSON.parse(data) : data);
  }
}
function errorHandler(id, message) {
  const promiseHandler = getAndDeleteResponse(id);
  if (promiseHandler) {
    promiseHandler.reject(message);
  }
}
function getAndDeleteResponse(id) {
  const response = callResponses.get(id);
  callResponses.delete(id);
  return response;
}
function callBinding(type3, options = {}) {
  const id = generateID$1();
  const doCancel = () => {
    return cancelCall(type3, { "call-id": id });
  };
  let queuedCancel = false, callRunning = false;
  let p2 = new Promise((resolve2, reject) => {
    options["call-id"] = id;
    callResponses.set(id, { resolve: resolve2, reject });
    call$3(type3, options).then((_2) => {
      callRunning = true;
      if (queuedCancel) {
        return doCancel();
      }
    }).catch((error) => {
      reject(error);
      callResponses.delete(id);
    });
  });
  p2.cancel = () => {
    if (callRunning) {
      return doCancel();
    } else {
      queuedCancel = true;
    }
  };
  return p2;
}
function ByID(methodID, ...args) {
  return callBinding(CallBinding, {
    methodID,
    args
  });
}
const call$2 = newRuntimeCallerWithID(objectNames.Clipboard, "");
const ClipboardSetText = 0;
function SetText(text) {
  return call$2(ClipboardSetText, { text });
}
function Any(source) {
  return (
    /** @type {T} */
    source
  );
}
function Array$1(element) {
  if (element === Any) {
    return (source) => source === null ? [] : source;
  }
  return (source) => {
    if (source === null) {
      return [];
    }
    for (let i3 = 0; i3 < source.length; i3++) {
      source[i3] = element(source[i3]);
    }
    return source;
  };
}
function Nullable(element) {
  if (element === Any) {
    return Any;
  }
  return (source) => source === null ? null : element(source);
}
window._wails = window._wails || {};
window._wails.dialogErrorCallback = dialogErrorCallback;
window._wails.dialogResultCallback = dialogResultCallback;
const DialogQuestion = 3;
const call$1 = newRuntimeCallerWithID(objectNames.Dialog, "");
const dialogResponses = /* @__PURE__ */ new Map();
function generateID() {
  let result;
  do {
    result = nanoid();
  } while (dialogResponses.has(result));
  return result;
}
function dialog(type3, options = {}) {
  const id = generateID();
  options["dialog-id"] = id;
  return new Promise((resolve2, reject) => {
    dialogResponses.set(id, { resolve: resolve2, reject });
    call$1(type3, options).catch((error) => {
      reject(error);
      dialogResponses.delete(id);
    });
  });
}
function dialogResultCallback(id, data, isJSON) {
  let p2 = dialogResponses.get(id);
  if (p2) {
    if (isJSON) {
      p2.resolve(JSON.parse(data));
    } else {
      p2.resolve(data);
    }
    dialogResponses.delete(id);
  }
}
function dialogErrorCallback(id, message) {
  let p2 = dialogResponses.get(id);
  if (p2) {
    p2.reject(message);
    dialogResponses.delete(id);
  }
}
const Question = (options) => dialog(DialogQuestion, options);
window._wails = window._wails || {};
window._wails.dispatchWailsEvent = dispatchWailsEvent;
const call = newRuntimeCallerWithID(objectNames.Events, "");
const EmitMethod = 0;
const eventListeners = /* @__PURE__ */ new Map();
class Listener {
  constructor(eventName, callback, maxCallbacks) {
    this.eventName = eventName;
    this.maxCallbacks = maxCallbacks || -1;
    this.Callback = (data) => {
      callback(data);
      if (this.maxCallbacks === -1)
        return false;
      this.maxCallbacks -= 1;
      return this.maxCallbacks === 0;
    };
  }
}
class WailsEvent {
  constructor(name, data = null) {
    this.name = name;
    this.data = data;
  }
}
function dispatchWailsEvent(event) {
  let listeners = eventListeners.get(event.name);
  if (listeners) {
    let toRemove = listeners.filter((listener) => {
      let remove3 = listener.Callback(event);
      if (remove3)
        return true;
    });
    if (toRemove.length > 0) {
      listeners = listeners.filter((l2) => !toRemove.includes(l2));
      if (listeners.length === 0)
        eventListeners.delete(event.name);
      else
        eventListeners.set(event.name, listeners);
    }
  }
}
function OnMultiple(eventName, callback, maxCallbacks) {
  let listeners = eventListeners.get(eventName) || [];
  const thisListener = new Listener(eventName, callback, maxCallbacks);
  listeners.push(thisListener);
  eventListeners.set(eventName, listeners);
  return () => listenerOff(thisListener);
}
function On$1(eventName, callback) {
  return OnMultiple(eventName, callback, -1);
}
function listenerOff(listener) {
  const eventName = listener.eventName;
  let listeners = eventListeners.get(eventName).filter((l2) => l2 !== listener);
  if (listeners.length === 0)
    eventListeners.delete(eventName);
  else
    eventListeners.set(eventName, listeners);
}
function Emit(event) {
  return call(EmitMethod, event);
}
const AbsolutePositionMethod = 0;
const CenterMethod = 1;
const CloseMethod = 2;
const DisableSizeConstraintsMethod = 3;
const EnableSizeConstraintsMethod = 4;
const FocusMethod = 5;
const ForceReloadMethod = 6;
const FullscreenMethod = 7;
const GetScreenMethod = 8;
const GetZoomMethod = 9;
const HeightMethod = 10;
const HideMethod = 11;
const IsFocusedMethod = 12;
const IsFullscreenMethod = 13;
const IsMaximisedMethod = 14;
const IsMinimisedMethod = 15;
const MaximiseMethod = 16;
const MinimiseMethod = 17;
const NameMethod = 18;
const OpenDevToolsMethod = 19;
const RelativePositionMethod = 20;
const ReloadMethod = 21;
const ResizableMethod = 22;
const RestoreMethod = 23;
const SetAbsolutePositionMethod = 24;
const SetAlwaysOnTopMethod = 25;
const SetBackgroundColourMethod = 26;
const SetFramelessMethod = 27;
const SetFullscreenButtonEnabledMethod = 28;
const SetMaxSizeMethod = 29;
const SetMinSizeMethod = 30;
const SetRelativePositionMethod = 31;
const SetResizableMethod = 32;
const SetSizeMethod = 33;
const SetTitleMethod = 34;
const SetZoomMethod = 35;
const ShowMethod = 36;
const SizeMethod = 37;
const ToggleFullscreenMethod = 38;
const ToggleMaximiseMethod = 39;
const UnFullscreenMethod = 40;
const UnMaximiseMethod = 41;
const UnMinimiseMethod = 42;
const WidthMethod = 43;
const ZoomMethod = 44;
const ZoomInMethod = 45;
const ZoomOutMethod = 46;
const ZoomResetMethod = 47;
const caller = Symbol();
class Window {
  /**
   * Initialises a window object with the specified name.
   *
   * @private
   * @param {string} name - The name of the target window.
   */
  constructor(name = "") {
    this[caller] = newRuntimeCallerWithID(objectNames.Window, name);
    for (const method of Object.getOwnPropertyNames(Window.prototype)) {
      if (method !== "constructor" && typeof this[method] === "function") {
        this[method] = this[method].bind(this);
      }
    }
  }
  /**
   * Gets the specified window.
   *
   * @public
   * @param {string} name - The name of the window to get.
   * @return {Window} - The corresponding window object.
   */
  Get(name) {
    return new Window(name);
  }
  /**
   * Returns the absolute position of the window to the screen.
   *
   * @public
   * @return {Promise<Position>} - The current absolute position of the window.
   */
  AbsolutePosition() {
    return this[caller](AbsolutePositionMethod);
  }
  /**
   * Centers the window on the screen.
   *
   * @public
   * @return {Promise<void>}
   */
  Center() {
    return this[caller](CenterMethod);
  }
  /**
   * Closes the window.
   *
   * @public
   * @return {Promise<void>}
   */
  Close() {
    return this[caller](CloseMethod);
  }
  /**
   * Disables min/max size constraints.
   *
   * @public
   * @return {Promise<void>}
   */
  DisableSizeConstraints() {
    return this[caller](DisableSizeConstraintsMethod);
  }
  /**
   * Enables min/max size constraints.
   *
   * @public
   * @return {Promise<void>}
   */
  EnableSizeConstraints() {
    return this[caller](EnableSizeConstraintsMethod);
  }
  /**
   * Focuses the window.
   *
   * @public
   * @return {Promise<void>}
   */
  Focus() {
    return this[caller](FocusMethod);
  }
  /**
   * Forces the window to reload the page assets.
   *
   * @public
   * @return {Promise<void>}
   */
  ForceReload() {
    return this[caller](ForceReloadMethod);
  }
  /**
   * Doc.
   *
   * @public
   * @return {Promise<void>}
   */
  Fullscreen() {
    return this[caller](FullscreenMethod);
  }
  /**
   * Returns the screen that the window is on.
   *
   * @public
   * @return {Promise<Screen>} - The screen the window is currently on
   */
  GetScreen() {
    return this[caller](GetScreenMethod);
  }
  /**
   * Returns the current zoom level of the window.
   *
   * @public
   * @return {Promise<number>} - The current zoom level
   */
  GetZoom() {
    return this[caller](GetZoomMethod);
  }
  /**
   * Returns the height of the window.
   *
   * @public
   * @return {Promise<number>} - The current height of the window
   */
  Height() {
    return this[caller](HeightMethod);
  }
  /**
   * Hides the window.
   *
   * @public
   * @return {Promise<void>}
   */
  Hide() {
    return this[caller](HideMethod);
  }
  /**
   * Returns true if the window is focused.
   *
   * @public
   * @return {Promise<boolean>} - Whether the window is currently focused
   */
  IsFocused() {
    return this[caller](IsFocusedMethod);
  }
  /**
   * Returns true if the window is fullscreen.
   *
   * @public
   * @return {Promise<boolean>} - Whether the window is currently fullscreen
   */
  IsFullscreen() {
    return this[caller](IsFullscreenMethod);
  }
  /**
   * Returns true if the window is maximised.
   *
   * @public
   * @return {Promise<boolean>} - Whether the window is currently maximised
   */
  IsMaximised() {
    return this[caller](IsMaximisedMethod);
  }
  /**
   * Returns true if the window is minimised.
   *
   * @public
   * @return {Promise<boolean>} - Whether the window is currently minimised
   */
  IsMinimised() {
    return this[caller](IsMinimisedMethod);
  }
  /**
   * Maximises the window.
   *
   * @public
   * @return {Promise<void>}
   */
  Maximise() {
    return this[caller](MaximiseMethod);
  }
  /**
   * Minimises the window.
   *
   * @public
   * @return {Promise<void>}
   */
  Minimise() {
    return this[caller](MinimiseMethod);
  }
  /**
   * Returns the name of the window.
   *
   * @public
   * @return {Promise<string>} - The name of the window
   */
  Name() {
    return this[caller](NameMethod);
  }
  /**
   * Opens the development tools pane.
   *
   * @public
   * @return {Promise<void>}
   */
  OpenDevTools() {
    return this[caller](OpenDevToolsMethod);
  }
  /**
   * Returns the relative position of the window to the screen.
   *
   * @public
   * @return {Promise<Position>} - The current relative position of the window
   */
  RelativePosition() {
    return this[caller](RelativePositionMethod);
  }
  /**
   * Reloads the page assets.
   *
   * @public
   * @return {Promise<void>}
   */
  Reload() {
    return this[caller](ReloadMethod);
  }
  /**
   * Returns true if the window is resizable.
   *
   * @public
   * @return {Promise<boolean>} - Whether the window is currently resizable
   */
  Resizable() {
    return this[caller](ResizableMethod);
  }
  /**
   * Restores the window to its previous state if it was previously minimised, maximised or fullscreen.
   *
   * @public
   * @return {Promise<void>}
   */
  Restore() {
    return this[caller](RestoreMethod);
  }
  /**
   * Sets the absolute position of the window to the screen.
   *
   * @public
   * @param {number} x - The desired horizontal absolute position of the window
   * @param {number} y - The desired vertical absolute position of the window
   * @return {Promise<void>}
   */
  SetAbsolutePosition(x3, y4) {
    return this[caller](SetAbsolutePositionMethod, { x: x3, y: y4 });
  }
  /**
   * Sets the window to be always on top.
   *
   * @public
   * @param {boolean} alwaysOnTop - Whether the window should stay on top
   * @return {Promise<void>}
   */
  SetAlwaysOnTop(alwaysOnTop) {
    return this[caller](SetAlwaysOnTopMethod, { alwaysOnTop });
  }
  /**
   * Sets the background colour of the window.
   *
   * @public
   * @param {number} r - The desired red component of the window background
   * @param {number} g - The desired green component of the window background
   * @param {number} b - The desired blue component of the window background
   * @param {number} a - The desired alpha component of the window background
   * @return {Promise<void>}
   */
  SetBackgroundColour(r2, g2, b3, a4) {
    return this[caller](SetBackgroundColourMethod, { r: r2, g: g2, b: b3, a: a4 });
  }
  /**
   * Removes the window frame and title bar.
   *
   * @public
   * @param {boolean} frameless - Whether the window should be frameless
   * @return {Promise<void>}
   */
  SetFrameless(frameless) {
    return this[caller](SetFramelessMethod, { frameless });
  }
  /**
   * Disables the system fullscreen button.
   *
   * @public
   * @param {boolean} enabled - Whether the fullscreen button should be enabled
   * @return {Promise<void>}
   */
  SetFullscreenButtonEnabled(enabled) {
    return this[caller](SetFullscreenButtonEnabledMethod, { enabled });
  }
  /**
   * Sets the maximum size of the window.
   *
   * @public
   * @param {number} width - The desired maximum width of the window
   * @param {number} height - The desired maximum height of the window
   * @return {Promise<void>}
   */
  SetMaxSize(width, height) {
    return this[caller](SetMaxSizeMethod, { width, height });
  }
  /**
   * Sets the minimum size of the window.
   *
   * @public
   * @param {number} width - The desired minimum width of the window
   * @param {number} height - The desired minimum height of the window
   * @return {Promise<void>}
   */
  SetMinSize(width, height) {
    return this[caller](SetMinSizeMethod, { width, height });
  }
  /**
   * Sets the relative position of the window to the screen.
   *
   * @public
   * @param {number} x - The desired horizontal relative position of the window
   * @param {number} y - The desired vertical relative position of the window
   * @return {Promise<void>}
   */
  SetRelativePosition(x3, y4) {
    return this[caller](SetRelativePositionMethod, { x: x3, y: y4 });
  }
  /**
   * Sets whether the window is resizable.
   *
   * @public
   * @param {boolean} resizable - Whether the window should be resizable
   * @return {Promise<void>}
   */
  SetResizable(resizable2) {
    return this[caller](SetResizableMethod, { resizable: resizable2 });
  }
  /**
   * Sets the size of the window.
   *
   * @public
   * @param {number} width - The desired width of the window
   * @param {number} height - The desired height of the window
   * @return {Promise<void>}
   */
  SetSize(width, height) {
    return this[caller](SetSizeMethod, { width, height });
  }
  /**
   * Sets the title of the window.
   *
   * @public
   * @param {string} title - The desired title of the window
   * @return {Promise<void>}
   */
  SetTitle(title) {
    return this[caller](SetTitleMethod, { title });
  }
  /**
   * Sets the zoom level of the window.
   *
   * @public
   * @param {number} zoom - The desired zoom level
   * @return {Promise<void>}
   */
  SetZoom(zoom) {
    return this[caller](SetZoomMethod, { zoom });
  }
  /**
   * Shows the window.
   *
   * @public
   * @return {Promise<void>}
   */
  Show() {
    return this[caller](ShowMethod);
  }
  /**
   * Returns the size of the window.
   *
   * @public
   * @return {Promise<Size>} - The current size of the window
   */
  Size() {
    return this[caller](SizeMethod);
  }
  /**
   * Toggles the window between fullscreen and normal.
   *
   * @public
   * @return {Promise<void>}
   */
  ToggleFullscreen() {
    return this[caller](ToggleFullscreenMethod);
  }
  /**
   * Toggles the window between maximised and normal.
   *
   * @public
   * @return {Promise<void>}
   */
  ToggleMaximise() {
    return this[caller](ToggleMaximiseMethod);
  }
  /**
   * Un-fullscreens the window.
   *
   * @public
   * @return {Promise<void>}
   */
  UnFullscreen() {
    return this[caller](UnFullscreenMethod);
  }
  /**
   * Un-maximises the window.
   *
   * @public
   * @return {Promise<void>}
   */
  UnMaximise() {
    return this[caller](UnMaximiseMethod);
  }
  /**
   * Un-minimises the window.
   *
   * @public
   * @return {Promise<void>}
   */
  UnMinimise() {
    return this[caller](UnMinimiseMethod);
  }
  /**
   * Returns the width of the window.
   *
   * @public
   * @return {Promise<number>} - The current width of the window
   */
  Width() {
    return this[caller](WidthMethod);
  }
  /**
   * Zooms the window.
   *
   * @public
   * @return {Promise<void>}
   */
  Zoom() {
    return this[caller](ZoomMethod);
  }
  /**
   * Increases the zoom level of the webview content.
   *
   * @public
   * @return {Promise<void>}
   */
  ZoomIn() {
    return this[caller](ZoomInMethod);
  }
  /**
   * Decreases the zoom level of the webview content.
   *
   * @public
   * @return {Promise<void>}
   */
  ZoomOut() {
    return this[caller](ZoomOutMethod);
  }
  /**
   * Resets the zoom level of the webview content.
   *
   * @public
   * @return {Promise<void>}
   */
  ZoomReset() {
    return this[caller](ZoomResetMethod);
  }
}
const thisWindow = new Window("");
function canAbortListeners() {
  if (!EventTarget || !AbortSignal || !AbortController)
    return false;
  let result = true;
  const target = new EventTarget();
  const controller2 = new AbortController();
  target.addEventListener("test", () => {
    result = false;
  }, { signal: controller2.signal });
  controller2.abort();
  target.dispatchEvent(new CustomEvent("test"));
  return result;
}
document.addEventListener("DOMContentLoaded", () => true);
function sendEvent(eventName, data = null) {
  Emit(new WailsEvent(eventName, data));
}
function callWindowMethod(windowName, methodName) {
  const targetWindow = thisWindow.Get(windowName);
  const method = targetWindow[methodName];
  if (typeof method !== "function") {
    console.error(`Window method '${methodName}' not found`);
    return;
  }
  try {
    method.call(targetWindow);
  } catch (e3) {
    console.error(`Error calling window method '${methodName}': `, e3);
  }
}
function onWMLTriggered(ev) {
  const element = ev.currentTarget;
  function runEffect(choice = "Yes") {
    if (choice !== "Yes")
      return;
    const eventType = element.getAttribute("wml-event");
    const targetWindow = element.getAttribute("wml-target-window") || "";
    const windowMethod = element.getAttribute("wml-window");
    const url = element.getAttribute("wml-openurl");
    if (eventType !== null)
      sendEvent(eventType);
    if (windowMethod !== null)
      callWindowMethod(targetWindow, windowMethod);
    if (url !== null)
      void OpenURL(url);
  }
  const confirm = element.getAttribute("wml-confirm");
  if (confirm) {
    Question({
      Title: "Confirm",
      Message: confirm,
      Detached: false,
      Buttons: [
        { Label: "Yes" },
        { Label: "No", IsDefault: true }
      ]
    }).then(runEffect);
  } else {
    runEffect();
  }
}
const controller = Symbol();
class AbortControllerRegistry {
  constructor() {
    this[controller] = new AbortController();
  }
  /**
   * Returns an options object for addEventListener that ties the listener
   * to the AbortSignal from the current AbortController.
   *
   * @param {HTMLElement} element An HTML element
   * @param {string[]} triggers The list of active WML trigger events for the specified elements
   * @returns {AddEventListenerOptions}
   */
  set(element, triggers) {
    return { signal: this[controller].signal };
  }
  /**
   * Removes all registered event listeners.
   *
   * @returns {void}
   */
  reset() {
    this[controller].abort();
    this[controller] = new AbortController();
  }
}
const triggerMap = Symbol();
const elementCount = Symbol();
class WeakMapRegistry {
  constructor() {
    this[triggerMap] = /* @__PURE__ */ new WeakMap();
    this[elementCount] = 0;
  }
  /**
   * Sets the active triggers for the specified element.
   *
   * @param {HTMLElement} element An HTML element
   * @param {string[]} triggers The list of active WML trigger events for the specified element
   * @returns {AddEventListenerOptions}
   */
  set(element, triggers) {
    this[elementCount] += !this[triggerMap].has(element);
    this[triggerMap].set(element, triggers);
    return {};
  }
  /**
   * Removes all registered event listeners.
   *
   * @returns {void}
   */
  reset() {
    if (this[elementCount] <= 0)
      return;
    for (const element of document.body.querySelectorAll("*")) {
      if (this[elementCount] <= 0)
        break;
      const triggers = this[triggerMap].get(element);
      this[elementCount] -= typeof triggers !== "undefined";
      for (const trigger2 of triggers || [])
        element.removeEventListener(trigger2, onWMLTriggered);
    }
    this[triggerMap] = /* @__PURE__ */ new WeakMap();
    this[elementCount] = 0;
  }
}
canAbortListeners() ? new AbortControllerRegistry() : new WeakMapRegistry();
window._wails = window._wails || {};
window._wails.invoke = invoke;
invoke("wails:runtime:ready");
function mitt(n2) {
  return { all: n2 = n2 || /* @__PURE__ */ new Map(), on: function(t4, e3) {
    var i3 = n2.get(t4);
    i3 ? i3.push(e3) : n2.set(t4, [e3]);
  }, off: function(t4, e3) {
    var i3 = n2.get(t4);
    i3 && (e3 ? i3.splice(i3.indexOf(e3) >>> 0, 1) : n2.set(t4, []));
  }, emit: function(t4, e3) {
    var i3 = n2.get(t4);
    i3 && i3.slice().map(function(n3) {
      n3(e3);
    }), (i3 = n2.get("*")) && i3.slice().map(function(n3) {
      n3(t4, e3);
    });
  } };
}
const emitter = mitt();
/**
* @vue/shared v3.4.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function makeMap(str, expectsLowerCase) {
  const set2 = new Set(str.split(","));
  return expectsLowerCase ? (val) => set2.has(val.toLowerCase()) : (val) => set2.has(val);
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove$2 = (arr, el) => {
  const i3 = arr.indexOf(el);
  if (i3 > -1) {
    arr.splice(i3, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject$1 = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn2) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn2(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_2, c3) => c3 ? c3.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction((str) => {
  const s4 = str ? `on${capitalize(str)}` : ``;
  return s4;
});
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i3 = 0; i3 < fns.length; i3++) {
    fns[i3](arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n2 = parseFloat(val);
  return isNaN(n2) ? val : n2;
};
const toNumber = (val) => {
  const n2 = isString(val) ? Number(val) : NaN;
  return isNaN(n2) ? val : n2;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
  if (isArray$1(value)) {
    const res = {};
    for (let i3 = 0; i3 < value.length; i3++) {
      const item = value[i3];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray$1(value)) {
    for (let i3 = 0; i3 < value.length; i3++) {
      const normalized = normalizeClass(value[i3]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray$1(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i3) => {
          entries[stringifySymbol(key, i3) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v2) => stringifySymbol(v2))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject(val) && !isArray$1(val) && !isPlainObject$1(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v2, i3 = "") => {
  var _a2;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol(v2) ? `Symbol(${(_a2 = v2.description) != null ? _a2 : i3})` : v2
  );
};
/**
* @vue/reactivity v3.4.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  run(fn2) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn2();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    activeEffectScope = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this._active) {
      let i3, l2;
      for (i3 = 0, l2 = this.effects.length; i3 < l2; i3++) {
        this.effects[i3].stop();
      }
      for (i3 = 0, l2 = this.cleanups.length; i3 < l2; i3++) {
        this.cleanups[i3]();
      }
      if (this.scopes) {
        for (i3 = 0, l2 = this.scopes.length; i3 < l2; i3++) {
          this.scopes[i3].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
function onScopeDispose(fn2) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn2);
  }
}
let activeEffect;
class ReactiveEffect {
  constructor(fn2, trigger2, scheduler, scope) {
    this.fn = fn2;
    this.trigger = trigger2;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this._dirtyLevel = 4;
    this._trackId = 0;
    this._runnings = 0;
    this._shouldSchedule = false;
    this._depsLength = 0;
    recordEffectScope(this, scope);
  }
  get dirty() {
    if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
      this._dirtyLevel = 1;
      pauseTracking();
      for (let i3 = 0; i3 < this._depsLength; i3++) {
        const dep = this.deps[i3];
        if (dep.computed) {
          triggerComputed(dep.computed);
          if (this._dirtyLevel >= 4) {
            break;
          }
        }
      }
      if (this._dirtyLevel === 1) {
        this._dirtyLevel = 0;
      }
      resetTracking();
    }
    return this._dirtyLevel >= 4;
  }
  set dirty(v2) {
    this._dirtyLevel = v2 ? 4 : 0;
  }
  run() {
    this._dirtyLevel = 0;
    if (!this.active) {
      return this.fn();
    }
    let lastShouldTrack = shouldTrack;
    let lastEffect = activeEffect;
    try {
      shouldTrack = true;
      activeEffect = this;
      this._runnings++;
      preCleanupEffect(this);
      return this.fn();
    } finally {
      postCleanupEffect(this);
      this._runnings--;
      activeEffect = lastEffect;
      shouldTrack = lastShouldTrack;
    }
  }
  stop() {
    if (this.active) {
      preCleanupEffect(this);
      postCleanupEffect(this);
      this.onStop && this.onStop();
      this.active = false;
    }
  }
}
function triggerComputed(computed2) {
  return computed2.value;
}
function preCleanupEffect(effect2) {
  effect2._trackId++;
  effect2._depsLength = 0;
}
function postCleanupEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i3 = effect2._depsLength; i3 < effect2.deps.length; i3++) {
      cleanupDepEffect(effect2.deps[i3], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanupDepEffect(dep, effect2) {
  const trackId = dep.get(effect2);
  if (trackId !== void 0 && effect2._trackId !== trackId) {
    dep.delete(effect2);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}
let shouldTrack = true;
let pauseScheduleStack = 0;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function pauseScheduling() {
  pauseScheduleStack++;
}
function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()();
  }
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
  }
}
const queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
  pauseScheduling();
  for (const effect2 of dep.keys()) {
    let tracking;
    if (effect2._dirtyLevel < dirtyLevel && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2._shouldSchedule || (effect2._shouldSchedule = effect2._dirtyLevel === 0);
      effect2._dirtyLevel = dirtyLevel;
    }
    if (effect2._shouldSchedule && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2.trigger();
      if ((!effect2._runnings || effect2.allowRecurse) && effect2._dirtyLevel !== 2) {
        effect2._shouldSchedule = false;
        if (effect2.scheduler) {
          queueEffectSchedulers.push(effect2.scheduler);
        }
      }
    }
  }
  resetScheduling();
}
const createDep = (cleanup, computed2) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.computed = computed2;
  return dep;
};
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
function track(target, type3, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
    }
    trackEffect(
      activeEffect,
      dep
    );
  }
}
function trigger(target, type3, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type3 === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$1(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type3) {
      case "add":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  pauseScheduling();
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
        dep,
        4
      );
    }
  }
  resetScheduling();
}
function getDepFromReactive(object, key) {
  const depsMap = targetMap.get(object);
  return depsMap && depsMap.get(key);
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i3 = 0, l2 = this.length; i3 < l2; i3++) {
        track(arr, "get", i3 + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      pauseScheduling();
      const res = toRaw(this)[key].apply(this, args);
      resetScheduling();
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty(key) {
  if (!isSymbol(key))
    key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray$1(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
  true
);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v2) => Reflect.getPrototypeOf(v2);
function get(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get2.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get2 ? get2.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type3) {
  return function(...args) {
    return type3 === "delete" ? false : type3 === "clear" ? void 0 : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? reactive(value) : value;
const toReadonly = (value) => isObject(value) ? readonly(value) : value;
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this.getter = getter;
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this["__v_isReadonly"] = false;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => triggerRefValue(
        this,
        this.effect._dirtyLevel === 2 ? 2 : 3
      )
    );
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    if ((!self2._cacheable || self2.effect.dirty) && hasChanged(self2._value, self2._value = self2.effect.run())) {
      triggerRefValue(self2, 4);
    }
    trackRefValue(self2);
    if (self2.effect._dirtyLevel >= 2) {
      triggerRefValue(self2, 2);
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
  // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
  get _dirty() {
    return this.effect.dirty;
  }
  set _dirty(v2) {
    this.effect.dirty = v2;
  }
  // #endregion
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
function trackRefValue(ref2) {
  var _a2;
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    trackEffect(
      activeEffect,
      (_a2 = ref2.dep) != null ? _a2 : ref2.dep = createDep(
        () => ref2.dep = void 0,
        ref2 instanceof ComputedRefImpl ? ref2 : void 0
      )
    );
  }
}
function triggerRefValue(ref2, dirtyLevel = 4, newVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    triggerEffects(
      dep,
      dirtyLevel
    );
  }
}
function isRef(r2) {
  return !!(r2 && r2.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this, 4);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
function toRefs(object) {
  const ret = isArray$1(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = propertyToRef(object, key);
  }
  return ret;
}
class ObjectRefImpl {
  constructor(_object, _key, _defaultValue) {
    this._object = _object;
    this._key = _key;
    this._defaultValue = _defaultValue;
    this.__v_isRef = true;
  }
  get value() {
    const val = this._object[this._key];
    return val === void 0 ? this._defaultValue : val;
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
  get dep() {
    return getDepFromReactive(toRaw(this._object), this._key);
  }
}
class GetterRefImpl {
  constructor(_getter) {
    this._getter = _getter;
    this.__v_isRef = true;
    this.__v_isReadonly = true;
  }
  get value() {
    return this._getter();
  }
}
function toRef(source, key, defaultValue) {
  if (isRef(source)) {
    return source;
  } else if (isFunction(source)) {
    return new GetterRefImpl(source);
  } else if (isObject(source) && arguments.length > 1) {
    return propertyToRef(source, key, defaultValue);
  } else {
    return ref(source);
  }
}
function propertyToRef(source, key, defaultValue) {
  const val = source[key];
  return isRef(val) ? val : new ObjectRefImpl(source, key, defaultValue);
}
/**
* @vue/runtime-core v3.4.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const stack = [];
function warn$1(msg, ...args) {
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        msg + args.map((a4) => {
          var _a2, _b;
          return (_b = (_a2 = a4.toString) == null ? void 0 : _a2.call(a4)) != null ? _b : JSON.stringify(a4);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i3) => {
    logs.push(...i3 === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn2, instance, type3, args) {
  try {
    return args ? fn2(...args) : fn2();
  } catch (err) {
    handleError(err, instance, type3);
  }
}
function callWithAsyncErrorHandling(fn2, instance, type3, args) {
  if (isFunction(fn2)) {
    const res = callWithErrorHandling(fn2, instance, type3, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type3);
      });
    }
    return res;
  }
  if (isArray$1(fn2)) {
    const values = [];
    for (let i3 = 0; i3 < fn2.length; i3++) {
      values.push(callWithAsyncErrorHandling(fn2[i3], instance, type3, args));
    }
    return values;
  }
}
function handleError(err, instance, type3, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type3}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i3 = 0; i3 < errorCapturedHooks.length; i3++) {
          if (errorCapturedHooks[i3](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      pauseTracking();
      callWithErrorHandling(
        appErrorHandler,
        null,
        10,
        [err, exposedInstance, errorInfo]
      );
      resetTracking();
      return;
    }
  }
  logError(err, type3, contextVNode, throwInDev);
}
function logError(err, type3, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn2) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn2 ? p2.then(this ? fn2.bind(this) : fn2) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.pre) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!queue.length || !queue.includes(
    job,
    isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
  )) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function invalidateJob(job) {
  const i3 = queue.indexOf(job);
  if (i3 > flushIndex) {
    queue.splice(i3, 1);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray$1(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(
      cb,
      cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
    )) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i3 = isFlushing ? flushIndex + 1 : 0) {
  for (; i3 < queue.length; i3++) {
    const cb = queue[i3];
    if (cb && cb.pre) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      queue.splice(i3, 1);
      i3--;
      cb();
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a4, b3) => getId(a4) - getId(b3)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a4, b3) => {
  const diff = getId(a4) - getId(b3);
  if (diff === 0) {
    if (a4.pre && !b3.pre)
      return -1;
    if (b3.pre && !a4.pre)
      return 1;
  }
  return diff;
};
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  queue.sort(comparator);
  const check = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (false)
          ;
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a4) => isString(a4) ? a4.trim() : a4);
    }
    if (number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$1(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function pushScopeId(id) {
  currentScopeId = id;
}
function popScopeId() {
  currentScopeId = null;
}
function withCtx(fn2, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx)
    return fn2;
  if (fn2._n) {
    return fn2;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn2(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render: render2,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
        render2.call(
          thisProxy,
          proxyToUse,
          renderCache,
          false ? shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render22 = Component;
      if (false)
        ;
      result = normalizeVNode(
        render22.length > 1 ? render22(
          false ? shallowReadonly(props) : props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return shallowReadonly(attrs);
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render22(
          false ? shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root.transition = vnode.transition;
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
function filterSingleRoot(children, recurse = true) {
  let singleRoot;
  for (let i3 = 0; i3 < children.length; i3++) {
    const child = children[i3];
    if (isVNode(child)) {
      if (child.type !== Comment || child.children === "v-if") {
        if (singleRoot) {
          return;
        } else {
          singleRoot = child;
        }
      }
    } else {
      return;
    }
  }
  return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i3 = 0; i3 < dynamicProps.length; i3++) {
        const key = dynamicProps[i3];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i3 = 0; i3 < nextKeys.length; i3++) {
    const key = nextKeys[i3];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.el = vnode.el;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
}
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
function resolveDynamicComponent(component) {
  if (isString(component)) {
    return resolveAsset(COMPONENTS, component, false) || component;
  } else {
    return component || NULL_DYNAMIC_COMPONENT;
  }
}
function resolveAsset(type3, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type3 === COMPONENTS) {
      const selfName = getComponentName(
        Component,
        false
      );
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type3] || Component[type3], name) || // global registration
      resolve(instance.appContext[type3], name)
    );
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
const isSuspense = (type3) => type3.__isSuspense;
let suspenseId = 0;
const SuspenseImpl = {
  name: "Suspense",
  // In order to make Suspense tree-shakable, we need to avoid importing it
  // directly in the renderer. The renderer checks for the __isSuspense flag
  // on a vnode's type and calls the `process` method, passing in renderer
  // internals.
  __isSuspense: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals) {
    if (n1 == null) {
      mountSuspense(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        rendererInternals
      );
    } else {
      if (parentSuspense && parentSuspense.deps > 0 && !n1.suspense.isInFallback) {
        n2.suspense = n1.suspense;
        n2.suspense.vnode = n2;
        n2.el = n1.el;
        return;
      }
      patchSuspense(
        n1,
        n2,
        container,
        anchor,
        parentComponent,
        namespace,
        slotScopeIds,
        optimized,
        rendererInternals
      );
    }
  },
  hydrate: hydrateSuspense,
  create: createSuspenseBoundary,
  normalize: normalizeSuspenseChildren
};
const Suspense = SuspenseImpl;
function triggerEvent(vnode, name) {
  const eventListener = vnode.props && vnode.props[name];
  if (isFunction(eventListener)) {
    eventListener();
  }
}
function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals) {
  const {
    p: patch,
    o: { createElement }
  } = rendererInternals;
  const hiddenContainer = createElement("div");
  const suspense = vnode.suspense = createSuspenseBoundary(
    vnode,
    parentSuspense,
    parentComponent,
    container,
    hiddenContainer,
    anchor,
    namespace,
    slotScopeIds,
    optimized,
    rendererInternals
  );
  patch(
    null,
    suspense.pendingBranch = vnode.ssContent,
    hiddenContainer,
    null,
    parentComponent,
    suspense,
    namespace,
    slotScopeIds
  );
  if (suspense.deps > 0) {
    triggerEvent(vnode, "onPending");
    triggerEvent(vnode, "onFallback");
    patch(
      null,
      vnode.ssFallback,
      container,
      anchor,
      parentComponent,
      null,
      // fallback tree will not have suspense context
      namespace,
      slotScopeIds
    );
    setActiveBranch(suspense, vnode.ssFallback);
  } else {
    suspense.resolve(false, true);
  }
}
function patchSuspense(n1, n2, container, anchor, parentComponent, namespace, slotScopeIds, optimized, { p: patch, um: unmount, o: { createElement } }) {
  const suspense = n2.suspense = n1.suspense;
  suspense.vnode = n2;
  n2.el = n1.el;
  const newBranch = n2.ssContent;
  const newFallback = n2.ssFallback;
  const { activeBranch, pendingBranch, isInFallback, isHydrating } = suspense;
  if (pendingBranch) {
    suspense.pendingBranch = newBranch;
    if (isSameVNodeType(newBranch, pendingBranch)) {
      patch(
        pendingBranch,
        newBranch,
        suspense.hiddenContainer,
        null,
        parentComponent,
        suspense,
        namespace,
        slotScopeIds,
        optimized
      );
      if (suspense.deps <= 0) {
        suspense.resolve();
      } else if (isInFallback) {
        if (!isHydrating) {
          patch(
            activeBranch,
            newFallback,
            container,
            anchor,
            parentComponent,
            null,
            // fallback tree will not have suspense context
            namespace,
            slotScopeIds,
            optimized
          );
          setActiveBranch(suspense, newFallback);
        }
      }
    } else {
      suspense.pendingId = suspenseId++;
      if (isHydrating) {
        suspense.isHydrating = false;
        suspense.activeBranch = pendingBranch;
      } else {
        unmount(pendingBranch, parentComponent, suspense);
      }
      suspense.deps = 0;
      suspense.effects.length = 0;
      suspense.hiddenContainer = createElement("div");
      if (isInFallback) {
        patch(
          null,
          newBranch,
          suspense.hiddenContainer,
          null,
          parentComponent,
          suspense,
          namespace,
          slotScopeIds,
          optimized
        );
        if (suspense.deps <= 0) {
          suspense.resolve();
        } else {
          patch(
            activeBranch,
            newFallback,
            container,
            anchor,
            parentComponent,
            null,
            // fallback tree will not have suspense context
            namespace,
            slotScopeIds,
            optimized
          );
          setActiveBranch(suspense, newFallback);
        }
      } else if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
        patch(
          activeBranch,
          newBranch,
          container,
          anchor,
          parentComponent,
          suspense,
          namespace,
          slotScopeIds,
          optimized
        );
        suspense.resolve(true);
      } else {
        patch(
          null,
          newBranch,
          suspense.hiddenContainer,
          null,
          parentComponent,
          suspense,
          namespace,
          slotScopeIds,
          optimized
        );
        if (suspense.deps <= 0) {
          suspense.resolve();
        }
      }
    }
  } else {
    if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
      patch(
        activeBranch,
        newBranch,
        container,
        anchor,
        parentComponent,
        suspense,
        namespace,
        slotScopeIds,
        optimized
      );
      setActiveBranch(suspense, newBranch);
    } else {
      triggerEvent(n2, "onPending");
      suspense.pendingBranch = newBranch;
      if (newBranch.shapeFlag & 512) {
        suspense.pendingId = newBranch.component.suspenseId;
      } else {
        suspense.pendingId = suspenseId++;
      }
      patch(
        null,
        newBranch,
        suspense.hiddenContainer,
        null,
        parentComponent,
        suspense,
        namespace,
        slotScopeIds,
        optimized
      );
      if (suspense.deps <= 0) {
        suspense.resolve();
      } else {
        const { timeout, pendingId } = suspense;
        if (timeout > 0) {
          setTimeout(() => {
            if (suspense.pendingId === pendingId) {
              suspense.fallback(newFallback);
            }
          }, timeout);
        } else if (timeout === 0) {
          suspense.fallback(newFallback);
        }
      }
    }
  }
}
function createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, namespace, slotScopeIds, optimized, rendererInternals, isHydrating = false) {
  const {
    p: patch,
    m: move,
    um: unmount,
    n: next,
    o: { parentNode, remove: remove3 }
  } = rendererInternals;
  let parentSuspenseId;
  const isSuspensible = isVNodeSuspensible(vnode);
  if (isSuspensible) {
    if (parentSuspense && parentSuspense.pendingBranch) {
      parentSuspenseId = parentSuspense.pendingId;
      parentSuspense.deps++;
    }
  }
  const timeout = vnode.props ? toNumber(vnode.props.timeout) : void 0;
  const initialAnchor = anchor;
  const suspense = {
    vnode,
    parent: parentSuspense,
    parentComponent,
    namespace,
    container,
    hiddenContainer,
    deps: 0,
    pendingId: suspenseId++,
    timeout: typeof timeout === "number" ? timeout : -1,
    activeBranch: null,
    pendingBranch: null,
    isInFallback: !isHydrating,
    isHydrating,
    isUnmounted: false,
    effects: [],
    resolve(resume = false, sync = false) {
      const {
        vnode: vnode2,
        activeBranch,
        pendingBranch,
        pendingId,
        effects,
        parentComponent: parentComponent2,
        container: container2
      } = suspense;
      let delayEnter = false;
      if (suspense.isHydrating) {
        suspense.isHydrating = false;
      } else if (!resume) {
        delayEnter = activeBranch && pendingBranch.transition && pendingBranch.transition.mode === "out-in";
        if (delayEnter) {
          activeBranch.transition.afterLeave = () => {
            if (pendingId === suspense.pendingId) {
              move(
                pendingBranch,
                container2,
                anchor === initialAnchor ? next(activeBranch) : anchor,
                0
              );
              queuePostFlushCb(effects);
            }
          };
        }
        if (activeBranch) {
          if (parentNode(activeBranch.el) !== suspense.hiddenContainer) {
            anchor = next(activeBranch);
          }
          unmount(activeBranch, parentComponent2, suspense, true);
        }
        if (!delayEnter) {
          move(pendingBranch, container2, anchor, 0);
        }
      }
      setActiveBranch(suspense, pendingBranch);
      suspense.pendingBranch = null;
      suspense.isInFallback = false;
      let parent = suspense.parent;
      let hasUnresolvedAncestor = false;
      while (parent) {
        if (parent.pendingBranch) {
          parent.effects.push(...effects);
          hasUnresolvedAncestor = true;
          break;
        }
        parent = parent.parent;
      }
      if (!hasUnresolvedAncestor && !delayEnter) {
        queuePostFlushCb(effects);
      }
      suspense.effects = [];
      if (isSuspensible) {
        if (parentSuspense && parentSuspense.pendingBranch && parentSuspenseId === parentSuspense.pendingId) {
          parentSuspense.deps--;
          if (parentSuspense.deps === 0 && !sync) {
            parentSuspense.resolve();
          }
        }
      }
      triggerEvent(vnode2, "onResolve");
    },
    fallback(fallbackVNode) {
      if (!suspense.pendingBranch) {
        return;
      }
      const { vnode: vnode2, activeBranch, parentComponent: parentComponent2, container: container2, namespace: namespace2 } = suspense;
      triggerEvent(vnode2, "onFallback");
      const anchor2 = next(activeBranch);
      const mountFallback = () => {
        if (!suspense.isInFallback) {
          return;
        }
        patch(
          null,
          fallbackVNode,
          container2,
          anchor2,
          parentComponent2,
          null,
          // fallback tree will not have suspense context
          namespace2,
          slotScopeIds,
          optimized
        );
        setActiveBranch(suspense, fallbackVNode);
      };
      const delayEnter = fallbackVNode.transition && fallbackVNode.transition.mode === "out-in";
      if (delayEnter) {
        activeBranch.transition.afterLeave = mountFallback;
      }
      suspense.isInFallback = true;
      unmount(
        activeBranch,
        parentComponent2,
        null,
        // no suspense so unmount hooks fire now
        true
        // shouldRemove
      );
      if (!delayEnter) {
        mountFallback();
      }
    },
    move(container2, anchor2, type3) {
      suspense.activeBranch && move(suspense.activeBranch, container2, anchor2, type3);
      suspense.container = container2;
    },
    next() {
      return suspense.activeBranch && next(suspense.activeBranch);
    },
    registerDep(instance, setupRenderEffect) {
      const isInPendingSuspense = !!suspense.pendingBranch;
      if (isInPendingSuspense) {
        suspense.deps++;
      }
      const hydratedEl = instance.vnode.el;
      instance.asyncDep.catch((err) => {
        handleError(err, instance, 0);
      }).then((asyncSetupResult) => {
        if (instance.isUnmounted || suspense.isUnmounted || suspense.pendingId !== instance.suspenseId) {
          return;
        }
        instance.asyncResolved = true;
        const { vnode: vnode2 } = instance;
        handleSetupResult(instance, asyncSetupResult, false);
        if (hydratedEl) {
          vnode2.el = hydratedEl;
        }
        const placeholder = !hydratedEl && instance.subTree.el;
        setupRenderEffect(
          instance,
          vnode2,
          // component may have been moved before resolve.
          // if this is not a hydration, instance.subTree will be the comment
          // placeholder.
          parentNode(hydratedEl || instance.subTree.el),
          // anchor will not be used if this is hydration, so only need to
          // consider the comment placeholder case.
          hydratedEl ? null : next(instance.subTree),
          suspense,
          namespace,
          optimized
        );
        if (placeholder) {
          remove3(placeholder);
        }
        updateHOCHostEl(instance, vnode2.el);
        if (isInPendingSuspense && --suspense.deps === 0) {
          suspense.resolve();
        }
      });
    },
    unmount(parentSuspense2, doRemove) {
      suspense.isUnmounted = true;
      if (suspense.activeBranch) {
        unmount(
          suspense.activeBranch,
          parentComponent,
          parentSuspense2,
          doRemove
        );
      }
      if (suspense.pendingBranch) {
        unmount(
          suspense.pendingBranch,
          parentComponent,
          parentSuspense2,
          doRemove
        );
      }
    }
  };
  return suspense;
}
function hydrateSuspense(node, vnode, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals, hydrateNode) {
  const suspense = vnode.suspense = createSuspenseBoundary(
    vnode,
    parentSuspense,
    parentComponent,
    node.parentNode,
    // eslint-disable-next-line no-restricted-globals
    document.createElement("div"),
    null,
    namespace,
    slotScopeIds,
    optimized,
    rendererInternals,
    true
  );
  const result = hydrateNode(
    node,
    suspense.pendingBranch = vnode.ssContent,
    parentComponent,
    suspense,
    slotScopeIds,
    optimized
  );
  if (suspense.deps === 0) {
    suspense.resolve(false, true);
  }
  return result;
}
function normalizeSuspenseChildren(vnode) {
  const { shapeFlag, children } = vnode;
  const isSlotChildren = shapeFlag & 32;
  vnode.ssContent = normalizeSuspenseSlot(
    isSlotChildren ? children.default : children
  );
  vnode.ssFallback = isSlotChildren ? normalizeSuspenseSlot(children.fallback) : createVNode(Comment);
}
function normalizeSuspenseSlot(s4) {
  let block;
  if (isFunction(s4)) {
    const trackBlock = isBlockTreeEnabled && s4._c;
    if (trackBlock) {
      s4._d = false;
      openBlock();
    }
    s4 = s4();
    if (trackBlock) {
      s4._d = true;
      block = currentBlock;
      closeBlock();
    }
  }
  if (isArray$1(s4)) {
    const singleChild = filterSingleRoot(s4);
    s4 = singleChild;
  }
  s4 = normalizeVNode(s4);
  if (block && !s4.dynamicChildren) {
    s4.dynamicChildren = block.filter((c3) => c3 !== s4);
  }
  return s4;
}
function queueEffectWithSuspense(fn2, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$1(fn2)) {
      suspense.effects.push(...fn2);
    } else {
      suspense.effects.push(fn2);
    }
  } else {
    queuePostFlushCb(fn2);
  }
}
function setActiveBranch(suspense, branch) {
  suspense.activeBranch = branch;
  const { vnode, parentComponent } = suspense;
  let el = branch.el;
  while (!el && branch.component) {
    branch = branch.component.subTree;
    el = branch.el;
  }
  vnode.el = el;
  if (parentComponent && parentComponent.subTree === vnode) {
    parentComponent.vnode.el = el;
    updateHOCHostEl(parentComponent, el);
  }
}
function isVNodeSuspensible(vnode) {
  const suspensible = vnode.props && vnode.props.suspensible;
  return suspensible != null && suspensible !== false;
}
const ssrContextKey = Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
function watchEffect(effect, options) {
  return doWatch(effect, null, options);
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, {
  immediate,
  deep,
  flush,
  once,
  onTrack,
  onTrigger
} = EMPTY_OBJ) {
  if (cb && once) {
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      unwatch();
    };
  }
  const instance = currentInstance;
  const reactiveGetter = (source2) => deep === true ? source2 : (
    // for deep: false, only traverse root-level properties
    traverse(source2, deep === false ? 1 : void 0)
  );
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray$1(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s4) => isReactive(s4) || isShallow(s4));
    getter = () => source.map((s4) => {
      if (isRef(s4)) {
        return s4.value;
      } else if (isReactive(s4)) {
        return reactiveGetter(s4);
      } else if (isFunction(s4)) {
        return callWithErrorHandling(s4, instance, 2);
      } else
        ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(
          source,
          instance,
          3,
          [onCleanup]
        );
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn2) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn2, instance, 4);
      cleanup = effect.onStop = void 0;
    };
  };
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else {
      return NOOP;
    }
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect.active || !effect.dirty) {
      return;
    }
    if (cb) {
      const newValue = effect.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v2, i3) => hasChanged(v2, oldValue[i3])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance)
      job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect = new ReactiveEffect(getter, NOOP, scheduler);
  const scope = getCurrentScope();
  const unwatch = () => {
    effect.stop();
    if (scope) {
      remove$2(scope.effects, effect);
    }
  };
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(
      effect.run.bind(effect),
      instance && instance.suspense
    );
  } else {
    effect.run();
  }
  if (ssrCleanup)
    ssrCleanup.push(unwatch);
  return unwatch;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i3 = 0; i3 < segments.length && cur; i3++) {
      cur = cur[segments[i3]];
    }
    return cur;
  };
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  depth--;
  if (isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray$1(value)) {
    for (let i3 = 0; i3 < value.length; i3++) {
      traverse(value[i3], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v2) => {
      traverse(v2, depth, seen);
    });
  } else if (isPlainObject$1(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
  }
  return value;
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    return vnode;
  }
  const instance = getExposeProxy(currentRenderingInstance) || currentRenderingInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i3 = 0; i3 < directives.length; i3++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i3];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i3 = 0; i3 < bindings.length; i3++) {
    const binding = bindings[i3];
    if (oldBindings) {
      binding.oldValue = oldBindings[i3].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
const leaveCbKey = Symbol("_leaveCb");
const enterCbKey = Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  // leave
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  // appear
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: BaseTransitionPropsValidators,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) {
        return;
      }
      let child = children[0];
      if (children.length > 1) {
        for (const c3 of children) {
          if (c3.type !== Comment) {
            child = c3;
            break;
          }
        }
      }
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getKeepAliveChild(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      const enterHooks = resolveTransitionHooks(
        innerChild,
        rawProps,
        state,
        instance
      );
      setTransitionHooks(innerChild, enterHooks);
      const oldChild = instance.subTree;
      const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
      if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(innerChild, oldInnerChild)) {
        const leavingHooks = resolveTransitionHooks(
          oldInnerChild,
          rawProps,
          state,
          instance
        );
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in" && innerChild.type !== Comment) {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (instance.update.active !== false) {
              instance.effect.dirty = true;
              instance.update();
            }
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(
              state,
              oldInnerChild
            );
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el[leaveCbKey] = () => {
              earlyRemove();
              el[leaveCbKey] = void 0;
              delete enterHooks.delayedLeave;
            };
            enterHooks.delayedLeave = delayedLeave;
          };
        }
      }
      return child;
    };
  }
};
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance) {
  const {
    appear,
    mode,
    persisted = false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
    onLeaveCancelled,
    onBeforeAppear,
    onAppear,
    onAfterAppear,
    onAppearCancelled
  } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(
      hook,
      instance,
      9,
      args
    );
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray$1(hook)) {
      if (hook.every((hook2) => hook2.length <= 1))
        done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el[leaveCbKey]) {
        el[leaveCbKey](
          true
          /* cancelled */
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) {
        leavingVNode.el[leaveCbKey]();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      const done = el[enterCbKey] = (cancelled) => {
        if (called)
          return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el[enterCbKey] = void 0;
      };
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove3) {
      const key2 = String(vnode.key);
      if (el[enterCbKey]) {
        el[enterCbKey](
          true
          /* cancelled */
        );
      }
      if (state.isUnmounting) {
        return remove3();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      const done = el[leaveCbKey] = (cancelled) => {
        if (called)
          return;
        called = true;
        remove3();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el[leaveCbKey] = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      return resolveTransitionHooks(vnode2, props, state, instance);
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getKeepAliveChild(vnode) {
  if (!isKeepAlive(vnode)) {
    return vnode;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction(children.default)) {
      return children.default();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i3 = 0; i3 < children.length; i3++) {
    let child = children[i3];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i3);
    if (child.type === Fragment) {
      if (child.patchFlag & 128)
        keyedFragmentCount++;
      ret = ret.concat(
        getTransitionRawChildren(child.children, keepComment, key)
      );
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i3 = 0; i3 < ret.length; i3++) {
      ret[i3].patchFlag = -2;
    }
  }
  return ret;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction(options) ? (
    // #8326: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
const isAsyncWrapper = (i3) => !!i3.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type3, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type3, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type3, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type3, target, keepAliveRoot) {
  const injected = injectHook(
    type3,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove$2(keepAliveRoot[type3], injected);
  }, target);
}
function injectHook(type3, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type3] || (target[type3] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type3, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (
  // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
  (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args) => hook(...args), target)
);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook(
  "rtg"
);
const onRenderTracked = createHook(
  "rtc"
);
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache && cache[index];
  if (isArray$1(source) || isString(source)) {
    ret = new Array(source.length);
    for (let i3 = 0, l2 = source.length; i3 < l2; i3++) {
      ret[i3] = renderItem(source[i3], i3, void 0, cached && cached[i3]);
    }
  } else if (typeof source === "number") {
    ret = new Array(source);
    for (let i3 = 0; i3 < source; i3++) {
      ret[i3] = renderItem(i3 + 1, i3, void 0, cached && cached[i3]);
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i3) => renderItem(item, i3, void 0, cached && cached[i3])
      );
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i3 = 0, l2 = keys.length; i3 < l2; i3++) {
        const key = keys[i3];
        ret[i3] = renderItem(source[key], key, i3, cached && cached[i3]);
      }
    }
  } else {
    ret = [];
  }
  if (cache) {
    cache[index] = ret;
  }
  return ret;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
  if (currentRenderingInstance.isCE || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.isCE) {
    if (name !== "default")
      props.name = name;
    return createVNode("slot", props, fallback && fallback());
  }
  let slot = slots[name];
  if (slot && slot._c) {
    slot._d = false;
  }
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  const rendered = createBlock(
    Fragment,
    {
      key: props.key || // slot content array of a dynamic conditional slot may have a branch
      // key attached in the `createSlots` helper, respect that
      validSlotContent && validSlotContent.key || `_${name}`
    },
    validSlotContent || (fallback ? fallback() : []),
    validSlotContent && slots._ === 1 ? 64 : -2
  );
  if (!noSlotted && rendered.scopeId) {
    rendered.slotScopeIds = [rendered.scopeId + "-s"];
  }
  if (slot && slot._c) {
    slot._d = true;
  }
  return rendered;
}
function ensureValidVNode(vnodes) {
  return vnodes.some((child) => {
    if (!isVNode(child))
      return true;
    if (child.type === Comment)
      return false;
    if (child.type === Fragment && !ensureValidVNode(child.children))
      return false;
    return true;
  }) ? vnodes : null;
}
const getPublicInstance = (i3) => {
  if (!i3)
    return null;
  if (isStatefulComponent(i3))
    return getExposeProxy(i3) || i3.proxy;
  return getPublicInstance(i3.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i3) => i3,
    $el: (i3) => i3.vnode.el,
    $data: (i3) => i3.data,
    $props: (i3) => i3.props,
    $attrs: (i3) => i3.attrs,
    $slots: (i3) => i3.slots,
    $refs: (i3) => i3.refs,
    $parent: (i3) => getPublicInstance(i3.parent),
    $root: (i3) => getPublicInstance(i3.root),
    $emit: (i3) => i3.emit,
    $options: (i3) => resolveMergedOptions(i3),
    $forceUpdate: (i3) => i3.f || (i3.f = () => {
      i3.effect.dirty = true;
      queueJob(i3.update);
    }),
    $nextTick: (i3) => i3.n || (i3.n = nextTick.bind(i3.proxy)),
    $watch: (i3) => instanceWatch.bind(i3)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type: type3, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n2 = accessCache[key];
      if (n2 !== void 0) {
        switch (n2) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (
        // only cache other properties when instance has declared (thus stable)
        // props
        (normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)
      ) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type3.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else
      ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, propsOptions }
  }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray$1(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
function withAsyncContext(getAwaitable) {
  const ctx = getCurrentInstance();
  let awaitable = getAwaitable();
  unsetCurrentInstance();
  if (isPromise(awaitable)) {
    awaitable = awaitable.catch((e3) => {
      setCurrentInstance(ctx);
      throw e3;
    });
  }
  return [awaitable, () => setCurrentInstance(ctx)];
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render: render2,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject(data))
      ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get2 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c3 = computed({
        get: get2,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c3.value,
        set: (v2) => c3.value = v2
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$1(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$1(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render2 && instance.render === NOOP) {
    instance.render = render2;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray$1(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v2) => injected.value = v2
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type3) {
  callWithAsyncErrorHandling(
    isArray$1(hook) ? hook.map((h4) => h4.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type3
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject(raw)) {
    if (isArray$1(raw)) {
      raw.forEach((r2) => createWatcher(r2, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else
    ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m4) => mergeOptions$1(resolved, m4, optionMergeStrategies, true)
      );
    }
    mergeOptions$1(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions$1(to2, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions$1(to2, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m4) => mergeOptions$1(to2, m4, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose")
      ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to2[key] = strat ? strat(to2[key], from[key]) : from[key];
    }
  }
  return to2;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to2, from) {
  if (!from) {
    return to2;
  }
  if (!to2) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to2) ? to2.call(this, this) : to2,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to2, from) {
  return mergeObjectOptions(normalizeInject(to2), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
    const res = {};
    for (let i3 = 0; i3 < raw.length; i3++) {
      res[raw[i3]] = raw[i3];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to2, from) {
  return to2 ? [...new Set([].concat(to2, from))] : from;
}
function mergeObjectOptions(to2, from) {
  return to2 ? extend(/* @__PURE__ */ Object.create(null), to2, from) : from;
}
function mergeEmitsOrPropsOptions(to2, from) {
  if (to2) {
    if (isArray$1(to2) && isArray$1(from)) {
      return [.../* @__PURE__ */ new Set([...to2, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to2),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to2, from) {
  if (!to2)
    return from;
  if (!from)
    return to2;
  const merged = extend(/* @__PURE__ */ Object.create(null), to2);
  for (const key in from) {
    merged[key] = mergeAsArray(to2[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render2, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    let isMounted = false;
    const app2 = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v2) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin))
          ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app2, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app2, ...options);
        } else
          ;
        return app2;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app2;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app2;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app2;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render2(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app2._container = rootContainer;
          rootContainer.__vue_app__ = app2;
          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render2(null, app2._container);
          delete app2._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app2;
      },
      runWithContext(fn2) {
        const lastApp = currentApp;
        currentApp = app2;
        try {
          return fn2();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app2;
  };
}
let currentApp = null;
function provide(key, value) {
  if (!currentInstance)
    ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance || currentApp) {
    const provides = instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : currentApp._context.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else
      ;
  }
}
function hasInjectionContext() {
  return !!(currentInstance || currentRenderingInstance || currentApp);
}
const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i3 = 0; i3 < propsToUpdate.length; i3++) {
        let key = propsToUpdate[i3];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i3 = 0; i3 < needCastKeys.length; i3++) {
      const key = needCastKeys[i3];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys)
        needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$1(raw)) {
    for (let i3 = 0; i3 < raw.length; i3++) {
      const normalizedKey = camelize(raw[i3]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[
            0
            /* shouldCast */
          ] = booleanIndex > -1;
          prop[
            1
            /* shouldCastTrue */
          ] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
function getType(ctor) {
  if (ctor === null) {
    return "null";
  }
  if (typeof ctor === "function") {
    return ctor.name || "";
  } else if (typeof ctor === "object") {
    const name = ctor.constructor && ctor.constructor.name;
    return name || "";
  }
  return "";
}
function isSameType(a4, b3) {
  return getType(a4) === getType(b3);
}
function getTypeIndex(type3, expectedTypes) {
  if (isArray$1(expectedTypes)) {
    return expectedTypes.findIndex((t4) => isSameType(t4, type3));
  } else if (isFunction(expectedTypes)) {
    return isSameType(expectedTypes, type3) ? 0 : -1;
  }
  return -1;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray$1(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot$1 = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false)
      ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key))
      continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot$1(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type3 = children._;
    if (type3) {
      extend(slots, children);
      def(slots, "_", type3, true);
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type3 = children._;
    if (type3) {
      if (optimized && type3 === 1) {
        needDeletionCheck = false;
      } else {
        extend(slots, children);
        if (!optimized && type3 === 1) {
          delete slots._;
        }
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$1(rawRef)) {
    rawRef.forEach(
      (r2, i3) => setRef(
        r2,
        oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i3] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref2 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref2) {
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction(ref2)) {
    callWithErrorHandling(ref2, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref2);
    const _isRef = isRef(ref2);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? hasOwn(setupState, ref2) ? setupState[ref2] : refs[ref2] : ref2.value;
          if (isUnmount) {
            isArray$1(existing) && remove$2(existing, refValue);
          } else {
            if (!isArray$1(existing)) {
              if (_isString) {
                refs[ref2] = [refValue];
                if (hasOwn(setupState, ref2)) {
                  setupState[ref2] = refs[ref2];
                }
              } else {
                ref2.value = [refValue];
                if (rawRef.k)
                  refs[rawRef.k] = ref2.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref2] = value;
          if (hasOwn(setupState, ref2)) {
            setupState[ref2] = value;
          }
        } else if (_isRef) {
          ref2.value = value;
          if (rawRef.k)
            refs[rawRef.k] = value;
        } else
          ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type: type3, ref: ref2, shapeFlag } = n2;
    switch (type3) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type3.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type3.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else
          ;
    }
    if (ref2 != null && parentComponent) {
      setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      patchElement(
        n1,
        n2,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(
            el,
            key,
            null,
            props[key],
            namespace,
            vnode.children,
            parentComponent,
            parentSuspense,
            unmountChildren
          );
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i3 = 0; i3 < slotScopeIds.length; i3++) {
        hostSetScopeId(el, slotScopeIds[i3]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i3 = start; i3 < children.length; i3++) {
      const child = children[i3] = optimized ? cloneIfMounted(children[i3]) : normalizeVNode(children[i3]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(
          el,
          n2,
          oldProps,
          newProps,
          parentComponent,
          parentSuspense,
          namespace
        );
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i3 = 0; i3 < propsToUpdate.length; i3++) {
            const key = propsToUpdate[i3];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(
                el,
                key,
                prev,
                next,
                namespace,
                n1.children,
                parentComponent,
                parentSuspense,
                unmountChildren
              );
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(
        el,
        n2,
        oldProps,
        newProps,
        parentComponent,
        parentSuspense,
        namespace
      );
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i3 = 0; i3 < newChildren.length; i3++) {
      const oldVNode = oldChildren[i3];
      const newVNode = newChildren[i3];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              vnode.children,
              parentComponent,
              parentSuspense,
              unmountChildren
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(
            el,
            key,
            prev,
            next,
            namespace,
            vnode.children,
            parentComponent,
            parentSuspense,
            unmountChildren
          );
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.effect.dirty = true;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m: m4, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(
              el,
              instance.subTree,
              instance,
              parentSuspense,
              null
            );
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(
              // note: we are moving the render call into an async callback,
              // which means it won't track dependencies - but it's ok because
              // a server-rendered async wrapper is already in resolved state
              // and it will never need to change.
              () => !instance.isUnmounted && hydrateSubTree()
            );
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m4) {
          queuePostRenderEffect(m4, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u: u3, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              if (!instance.isUnmounted) {
                componentUpdateFn();
              }
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u3) {
          queuePostRenderEffect(u3, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    };
    const effect = instance.effect = new ReactiveEffect(
      componentUpdateFn,
      NOOP,
      () => queueJob(update),
      instance.scope
      // track it in component's effect scope
    );
    const update = instance.update = () => {
      if (effect.dirty) {
        effect.run();
      }
    };
    update.id = instance.uid;
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c22 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c22,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c22,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c22 !== c1) {
        hostSetElementText(container, c22);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c22,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c22,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c22, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c22 = c22 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c22.length;
    const commonLength = Math.min(oldLength, newLength);
    let i3;
    for (i3 = 0; i3 < commonLength; i3++) {
      const nextChild = c22[i3] = optimized ? cloneIfMounted(c22[i3]) : normalizeVNode(c22[i3]);
      patch(
        c1[i3],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c22,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c22, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i3 = 0;
    const l2 = c22.length;
    let e1 = c1.length - 1;
    let e22 = l2 - 1;
    while (i3 <= e1 && i3 <= e22) {
      const n1 = c1[i3];
      const n2 = c22[i3] = optimized ? cloneIfMounted(c22[i3]) : normalizeVNode(c22[i3]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i3++;
    }
    while (i3 <= e1 && i3 <= e22) {
      const n1 = c1[e1];
      const n2 = c22[e22] = optimized ? cloneIfMounted(c22[e22]) : normalizeVNode(c22[e22]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e22--;
    }
    if (i3 > e1) {
      if (i3 <= e22) {
        const nextPos = e22 + 1;
        const anchor = nextPos < l2 ? c22[nextPos].el : parentAnchor;
        while (i3 <= e22) {
          patch(
            null,
            c22[i3] = optimized ? cloneIfMounted(c22[i3]) : normalizeVNode(c22[i3]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i3++;
        }
      }
    } else if (i3 > e22) {
      while (i3 <= e1) {
        unmount(c1[i3], parentComponent, parentSuspense, true);
        i3++;
      }
    } else {
      const s1 = i3;
      const s22 = i3;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i3 = s22; i3 <= e22; i3++) {
        const nextChild = c22[i3] = optimized ? cloneIfMounted(c22[i3]) : normalizeVNode(c22[i3]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i3);
        }
      }
      let j2;
      let patched = 0;
      const toBePatched = e22 - s22 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i3 = 0; i3 < toBePatched; i3++)
        newIndexToOldIndexMap[i3] = 0;
      for (i3 = s1; i3 <= e1; i3++) {
        const prevChild = c1[i3];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j2 = s22; j2 <= e22; j2++) {
            if (newIndexToOldIndexMap[j2 - s22] === 0 && isSameVNodeType(prevChild, c22[j2])) {
              newIndex = j2;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s22] = i3 + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c22[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j2 = increasingNewIndexSequence.length - 1;
      for (i3 = toBePatched - 1; i3 >= 0; i3--) {
        const nextIndex = s22 + i3;
        const nextChild = c22[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c22[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i3] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j2 < 0 || i3 !== increasingNewIndexSequence[j2]) {
            move(nextChild, container, anchor, 2);
          } else {
            j2--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type: type3, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type3.move(vnode, container, anchor, internals);
      return;
    }
    if (type3 === Fragment) {
      hostInsert(el, container, anchor);
      for (let i3 = 0; i3 < children.length; i3++) {
        move(children[i3], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type3 === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove22();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type: type3,
      props,
      ref: ref2,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs
    } = vnode;
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode, true);
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          optimized,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type3 !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type3 === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove3(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove3 = (vnode) => {
    const { type: type3, el, anchor, transition } = vnode;
    if (type3 === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type3 === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update, subTree, um } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update) {
      update.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i3 = start; i3 < children.length; i3++) {
      unmount(children[i3], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    return hostNextSibling(vnode.anchor || vnode.el);
  };
  let isFlushing2 = false;
  const render2 = (vnode, container, namespace) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    if (!isFlushing2) {
      isFlushing2 = true;
      flushPreFlushCbs();
      flushPostFlushCbs();
      isFlushing2 = false;
    }
    container._vnode = vnode;
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove3,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  let hydrateNode;
  if (createHydrationFns) {
    [hydrate, hydrateNode] = createHydrationFns(
      internals
    );
  }
  return {
    render: render2,
    hydrate,
    createApp: createAppAPI(render2, hydrate)
  };
}
function resolveChildrenNamespace({ type: type3, props }, currentNamespace) {
  return currentNamespace === "svg" && type3 === "foreignObject" || currentNamespace === "mathml" && type3 === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect, update }, allowed) {
  effect.allowRecurse = update.allowRecurse = allowed;
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$1(ch1) && isArray$1(ch2)) {
    for (let i3 = 0; i3 < ch1.length; i3++) {
      const c1 = ch1[i3];
      let c22 = ch2[i3];
      if (c22.shapeFlag & 1 && !c22.dynamicChildren) {
        if (c22.patchFlag <= 0 || c22.patchFlag === 32) {
          c22 = ch2[i3] = cloneIfMounted(ch2[i3]);
          c22.el = c1.el;
        }
        if (!shallow)
          traverseStaticChildren(c1, c22);
      }
      if (c22.type === Text) {
        c22.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i3, j2, u3, v2, c3;
  const len = arr.length;
  for (i3 = 0; i3 < len; i3++) {
    const arrI = arr[i3];
    if (arrI !== 0) {
      j2 = result[result.length - 1];
      if (arr[j2] < arrI) {
        p2[i3] = j2;
        result.push(i3);
        continue;
      }
      u3 = 0;
      v2 = result.length - 1;
      while (u3 < v2) {
        c3 = u3 + v2 >> 1;
        if (arr[result[c3]] < arrI) {
          u3 = c3 + 1;
        } else {
          v2 = c3;
        }
      }
      if (arrI < arr[result[u3]]) {
        if (u3 > 0) {
          p2[i3] = result[u3 - 1];
        }
        result[u3] = i3;
      }
    }
  }
  u3 = result.length;
  v2 = result[u3 - 1];
  while (u3-- > 0) {
    result[u3] = v2;
    v2 = p2[v2];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
const isTeleport = (type3) => type3.__isTeleport;
const Fragment = Symbol.for("v-fgt");
const Text = Symbol.for("v-txt");
const Comment = Symbol.for("v-cmt");
const Static = Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type3, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type3,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type3, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type3,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref2,
  ref_key,
  ref_for
}) => {
  if (typeof ref2 === "number") {
    ref2 = "" + ref2;
  }
  return ref2 != null ? isString(ref2) || isRef(ref2) || isFunction(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
};
function createBaseVNode(type3, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type3 === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type: type3,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type3.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type3, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type3 || type3 === NULL_DYNAMIC_COMPONENT) {
    type3 = Comment;
  }
  if (isVNode(type3)) {
    const cloned = cloneVNode(
      type3,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type3)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag |= -2;
    return cloned;
  }
  if (isClassComponent(type3)) {
    type3 = type3.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style: style2 } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style2)) {
      if (isProxy(style2) && !isArray$1(style2)) {
        style2 = extend({}, style2);
      }
      props.style = normalizeStyle(style2);
    }
  }
  const shapeFlag = isString(type3) ? 1 : isSuspense(type3) ? 128 : isTeleport(type3) ? 64 : isObject(type3) ? 4 : isFunction(type3) ? 2 : 0;
  return createBaseVNode(
    type3,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref2, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref2 ? isArray$1(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref2,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    cloned.transition = transition.clone(cloned);
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$1(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type3 = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$1(children)) {
    type3 = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type3 = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type3 = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type3 = 16;
      children = [createTextVNode(children)];
    } else {
      type3 = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type3;
}
function mergeProps(...args) {
  const ret = {};
  for (let i3 = 0; i3 < args.length; i3++) {
    const toMerge = args[i3];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$1(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type3 = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type: type3,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type3, appContext),
    emitsOptions: normalizeEmitsOptions(type3, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type3.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    attrsProxy: null,
    slotsProxy: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g2 = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g2[key]))
      setters = g2[key] = [];
    setters.push(setter);
    return (v2) => {
      if (setters.length > 1)
        setters.forEach((set2) => set2(v2));
      else
        setters[0](v2);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v2) => currentInstance = v2
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v2) => isInSSRComponentSetup = v2
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    resetTracking();
    reset();
    if (isPromise(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e3) => {
          handleError(e3, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else
    ;
  finishComponentSetup(instance, isSSR);
}
let compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile && !Component.render) {
      const template = Component.template || resolveMergedOptions(instance).template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend(
          extend(
            {
              isCustomElement,
              delimiters
            },
            compilerOptions
          ),
          componentCompilerOptions
        );
        Component.render = compile(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c3) => c3.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match2 = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match2) {
      name = match2[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(
      instance.components || instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c3 = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c3;
};
function h$2(type3, propsOrChildren, children) {
  const l2 = arguments.length;
  if (l2 === 2) {
    if (isObject(propsOrChildren) && !isArray$1(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type3, null, [propsOrChildren]);
      }
      return createVNode(type3, propsOrChildren);
    } else {
      return createVNode(type3, null, propsOrChildren);
    }
  } else {
    if (l2 > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l2 === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type3, propsOrChildren, children);
  }
}
const version = "3.4.27";
/**
* @vue/runtime-dom v3.4.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is2, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : doc.createElement(tag, is2 ? { is: is2 } : void 0);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling))
          break;
      }
    } else {
      templateContainer.innerHTML = namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content;
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const TRANSITION = "transition";
const ANIMATION = "animation";
const vtcKey = Symbol("_vtc");
const Transition = (props, { slots }) => h$2(BaseTransition, resolveTransitionProps(props), slots);
Transition.displayName = "Transition";
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
Transition.props = /* @__PURE__ */ extend(
  {},
  BaseTransitionPropsValidators,
  DOMTransitionPropsValidators
);
const callHook = (hook, args = []) => {
  if (isArray$1(hook)) {
    hook.forEach((h22) => h22(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray$1(hook) ? hook.some((h22) => h22.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const {
    name = "v",
    type: type3,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled
  } = baseProps;
  const finishEnter = (el, isAppear, done) => {
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type3, enterDuration, resolve2);
        }
      });
    };
  };
  return extend(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve2 = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      addTransitionClass(el, leaveActiveClass);
      forceReflow();
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type3, leaveDuration, resolve2);
        }
      });
      callHook(onLeave, [el, resolve2]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n2 = NumberOf(duration);
    return [n2, n2];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c3) => c3 && el.classList.add(c3));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c3) => c3 && el.classList.remove(c3));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el[vtcKey] = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve2();
    }
  };
  if (explicitTimeout) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type: type3, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type3) {
    return resolve2();
  }
  const endEvent = type3 + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e3) => {
    if (e3.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type3 = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type3 = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type3 = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type3 = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type3 ? type3 === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type3 === TRANSITION && /\b(transform|all)(,|$)/.test(
    getStyleProperties(`${TRANSITION}Property`).toString()
  );
  return {
    type: type3,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d4, i3) => toMs(d4) + toMs(delays[i3])));
}
function toMs(s4) {
  if (s4 === "auto")
    return 0;
  return Number(s4.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow() {
  return document.body.offsetHeight;
}
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = Symbol("_vod");
const vShowHidden = Symbol("_vsh");
const vShow = {
  beforeMount(el, { value }, { transition }) {
    el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
    if (transition && value) {
      transition.beforeEnter(el);
    } else {
      setDisplay(el, value);
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el);
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue)
      return;
    if (transition) {
      if (value) {
        transition.beforeEnter(el);
        setDisplay(el, true);
        transition.enter(el);
      } else {
        transition.leave(el, () => {
          setDisplay(el, false);
        });
      }
    } else {
      setDisplay(el, value);
    }
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  }
};
function setDisplay(el, value) {
  el.style.display = value ? el[vShowOriginalDisplay] : "none";
  el[vShowHidden] = !value;
}
const CSS_VAR_TEXT = Symbol("");
const displayRE = /(^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style2 = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style2, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style2, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      setStyle(style2, key, next[key]);
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style2[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style2.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style2.display : "";
    if (el[vShowHidden]) {
      style2.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style2, name, val) {
  if (isArray$1(val)) {
    val.forEach((v2) => setStyle(style2, name, v2));
  } else {
    if (val == null)
      val = "";
    if (name.startsWith("--")) {
      style2.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style2, name);
      if (importantRE.test(val)) {
        style2.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style2[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style2, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style2) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i3 = 0; i3 < prefixes.length; i3++) {
    const prefixed = prefixes[i3] + name;
    if (prefixed in style2) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean = isSpecialBooleanAttr(key);
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean ? "" : value);
    }
  }
}
function patchDOMProp(el, key, value, prevChildren, parentComponent, parentSuspense, unmountChildren) {
  if (key === "innerHTML" || key === "textContent") {
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? "" : value;
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? "" : value;
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type3 = typeof el[key];
    if (type3 === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type3 === "string") {
      value = "";
      needRemove = true;
    } else if (type3 === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e3) {
  }
  needRemove && el.removeAttribute(key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m4;
    while (m4 = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m4[0].length);
      options[m4[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p$1 = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p$1.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e3) => {
    if (!e3._vts) {
      e3._vts = Date.now();
    } else if (e3._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(
      patchStopImmediatePropagation(e3, invoker.value),
      instance,
      5,
      [e3]
    );
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e3, value) {
  if (isArray$1(value)) {
    const originalStop = e3.stopImmediatePropagation;
    e3.stopImmediatePropagation = () => {
      originalStop.call(e3);
      e3._stopped = true;
    };
    return value.map(
      (fn2) => (e22) => !e22._stopped && fn2 && fn2(e22)
    );
  } else {
    return value;
  }
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(
      el,
      key,
      nextValue,
      prevChildren,
      parentComponent,
      parentSuspense,
      unmountChildren
    );
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
const getModelAssigner = (vnode) => {
  const fn2 = vnode.props["onUpdate:modelValue"] || false;
  return isArray$1(fn2) ? (value) => invokeArrayFns(fn2, value) : fn2;
};
function onCompositionStart(e3) {
  e3.target.composing = true;
}
function onCompositionEnd(e3) {
  const target = e3.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = Symbol("_assign");
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e3) => {
      if (e3.target.composing)
        return;
      let domValue = el.value;
      if (trim) {
        domValue = domValue.trim();
      }
      if (castToNumber) {
        domValue = looseToNumber(domValue);
      }
      el[assignKey](domValue);
    });
    if (trim) {
      addEventListener(el, "change", () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing)
      return;
    const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
    const newValue = value == null ? "" : value;
    if (elValue === newValue) {
      return;
    }
    if (document.activeElement === el && el.type !== "range") {
      if (lazy) {
        return;
      }
      if (trim && el.value.trim() === newValue) {
        return;
      }
    }
    el.value = newValue;
  }
};
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e3) => e3.stopPropagation(),
  prevent: (e3) => e3.preventDefault(),
  self: (e3) => e3.target !== e3.currentTarget,
  ctrl: (e3) => !e3.ctrlKey,
  shift: (e3) => !e3.shiftKey,
  alt: (e3) => !e3.altKey,
  meta: (e3) => !e3.metaKey,
  left: (e3) => "button" in e3 && e3.button !== 0,
  middle: (e3) => "button" in e3 && e3.button !== 1,
  right: (e3) => "button" in e3 && e3.button !== 2,
  exact: (e3, modifiers) => systemModifiers.some((m4) => e3[`${m4}Key`] && !modifiers.includes(m4))
};
const withModifiers = (fn2, modifiers) => {
  const cache = fn2._withMods || (fn2._withMods = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = (event, ...args) => {
    for (let i3 = 0; i3 < modifiers.length; i3++) {
      const guard = modifierGuards[modifiers[i3]];
      if (guard && guard(event, modifiers))
        return;
    }
    return fn2(event, ...args);
  });
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn2, modifiers) => {
  const cache = fn2._withKeys || (fn2._withKeys = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = (event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some((k3) => k3 === eventKey || keyNames[k3] === eventKey)) {
      return fn2(event);
    }
  });
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = (...args) => {
  const app2 = ensureRenderer().createApp(...args);
  const { mount } = app2;
  app2.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container)
      return;
    const component = app2._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app2;
};
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
const _hoisted_1$u = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 576 512"
};
const _hoisted_2$t = /* @__PURE__ */ createBaseVNode("path", { d: "M280.37 148.26 96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0M571.6 251.47 488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93" }, null, -1);
const _hoisted_3$o = [
  _hoisted_2$t
];
function render$m(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$u, [..._hoisted_3$o]);
}
const Home = { render: render$m };
const _hoisted_1$t = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 512 512"
};
const _hoisted_2$s = /* @__PURE__ */ createBaseVNode("path", { d: "M503.691 189.836 327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328" }, null, -1);
const _hoisted_3$n = [
  _hoisted_2$s
];
function render$l(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$t, [..._hoisted_3$n]);
}
const Share = { render: render$l };
const _hoisted_1$s = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 320 512"
};
const _hoisted_2$r = /* @__PURE__ */ createBaseVNode("path", { d: "M34.52 239.03 228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94" }, null, -1);
const _hoisted_3$m = [
  _hoisted_2$r
];
function render$k(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$s, [..._hoisted_3$m]);
}
const ChevronLeft = { render: render$k };
const _hoisted_1$r = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 320 512"
};
const _hoisted_2$q = /* @__PURE__ */ createBaseVNode("path", { d: "M285.476 272.971 91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941" }, null, -1);
const _hoisted_3$l = [
  _hoisted_2$q
];
function render$j(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$r, [..._hoisted_3$l]);
}
const ChevronRight = { render: render$j };
const _hoisted_1$q = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 512 512"
};
const _hoisted_2$p = /* @__PURE__ */ createBaseVNode("path", { d: "M34.5 239 228.9 44.7c9.4-9.4 24.6-9.4 33.9 0l22.7 22.7c9.4 9.4 9.4 24.5 0 33.9L131.5 256l154 154.7c9.3 9.4 9.3 24.5 0 33.9l-22.7 22.7c-9.4 9.4-24.6 9.4-33.9 0L34.5 273c-9.3-9.4-9.3-24.6 0-34m192 34 194.3 194.3c9.4 9.4 24.6 9.4 33.9 0l22.7-22.7c9.4-9.4 9.4-24.5 0-33.9L323.5 256l154-154.7c9.3-9.4 9.3-24.5 0-33.9l-22.7-22.7c-9.4-9.4-24.6-9.4-33.9 0L226.5 239c-9.3 9.4-9.3 24.6 0 34" }, null, -1);
const _hoisted_3$k = [
  _hoisted_2$p
];
function render$i(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$q, [..._hoisted_3$k]);
}
const ChevronDoubleLeft = { render: render$i };
const _hoisted_1$p = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 512 512"
};
const _hoisted_2$o = /* @__PURE__ */ createBaseVNode("path", { d: "M477.5 273 283.1 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.7-22.7c-9.4-9.4-9.4-24.5 0-33.9l154-154.7-154-154.7c-9.3-9.4-9.3-24.5 0-33.9l22.7-22.7c9.4-9.4 24.6-9.4 33.9 0L477.5 239c9.3 9.4 9.3 24.6 0 34m-192-34L91.1 44.7c-9.4-9.4-24.6-9.4-33.9 0L34.5 67.4c-9.4 9.4-9.4 24.5 0 33.9l154 154.7-154 154.7c-9.3 9.4-9.3 24.5 0 33.9l22.7 22.7c9.4 9.4 24.6 9.4 33.9 0L285.5 273c9.3-9.4 9.3-24.6 0-34" }, null, -1);
const _hoisted_3$j = [
  _hoisted_2$o
];
function render$h(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$p, [..._hoisted_3$j]);
}
const ChevronDoubleRight = { render: render$h };
const _hoisted_1$o = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 256 512"
};
const _hoisted_2$n = /* @__PURE__ */ createBaseVNode("path", { d: "m31.7 239 136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34" }, null, -1);
const _hoisted_3$i = [
  _hoisted_2$n
];
function render$g(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$o, [..._hoisted_3$i]);
}
const AngleLeft = { render: render$g };
const _hoisted_1$n = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 256 512"
};
const _hoisted_2$m = /* @__PURE__ */ createBaseVNode("path", { d: "m224.3 273-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34" }, null, -1);
const _hoisted_3$h = [
  _hoisted_2$m
];
function render$f(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$n, [..._hoisted_3$h]);
}
const AngleRight = { render: render$f };
const _hoisted_1$m = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 256 512"
};
const _hoisted_2$l = /* @__PURE__ */ createBaseVNode("path", { d: "M119.5 326.9 3.5 209.1c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0L128 287.3l100.4-102.2c4.7-4.7 12.3-4.7 17 0l7.1 7.1c4.7 4.7 4.7 12.3 0 17L136.5 327c-4.7 4.6-12.3 4.6-17-.1" }, null, -1);
const _hoisted_3$g = [
  _hoisted_2$l
];
function render$e(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$m, [..._hoisted_3$g]);
}
const AngleDown = { render: render$e };
const _hoisted_1$l = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 256 512"
};
const _hoisted_2$k = /* @__PURE__ */ createBaseVNode("path", { d: "m136.5 185.1 116 117.8c4.7 4.7 4.7 12.3 0 17l-7.1 7.1c-4.7 4.7-12.3 4.7-17 0L128 224.7 27.6 326.9c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17l116-117.8c4.7-4.6 12.3-4.6 17 .1" }, null, -1);
const _hoisted_3$f = [
  _hoisted_2$k
];
function render$d(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$l, [..._hoisted_3$f]);
}
const AngleUp = { render: render$d };
const _hoisted_1$k = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 448 512"
};
const _hoisted_2$j = /* @__PURE__ */ createBaseVNode("path", { d: "m223.7 239 136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34m-192 34 136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34" }, null, -1);
const _hoisted_3$e = [
  _hoisted_2$j
];
function render$c(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$k, [..._hoisted_3$e]);
}
const AngleDoubleLeft = { render: render$c };
const _hoisted_1$j = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 448 512"
};
const _hoisted_2$i = /* @__PURE__ */ createBaseVNode("path", { d: "m224.3 273-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34m192-34-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8" }, null, -1);
const _hoisted_3$d = [
  _hoisted_2$i
];
function render$b(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$j, [..._hoisted_3$d]);
}
const AngleDoubleRight = { render: render$b };
const _hoisted_1$i = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 448 512"
};
const _hoisted_2$h = /* @__PURE__ */ createBaseVNode("path", { d: "M0 424V88c0-13.3 10.7-24 24-24h24c13.3 0 24 10.7 24 24v336c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24m254.5-269.6 65.6 65.6H120c-13.3 0-24 10.7-24 24v24c0 13.3 10.7 24 24 24h200.1l-65.6 65.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0L441 273c9.4-9.4 9.4-24.6 0-33.9L305.5 103.5c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6-.1 33.9" }, null, -1);
const _hoisted_3$c = [
  _hoisted_2$h
];
function render$a(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$i, [..._hoisted_3$c]);
}
const ArrowFromLeft = { render: render$a };
const _hoisted_1$h = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 448 512"
};
const _hoisted_2$g = /* @__PURE__ */ createBaseVNode("path", { d: "M448 88v336c0 13.3-10.7 24-24 24h-24c-13.3 0-24-10.7-24-24V88c0-13.3 10.7-24 24-24h24c13.3 0 24 10.7 24 24M193.5 357.6 127.9 292H328c13.3 0 24-10.7 24-24v-24c0-13.3-10.7-24-24-24H127.9l65.6-65.6c9.4-9.4 9.4-24.6 0-33.9l-17-17c-9.4-9.4-24.6-9.4-33.9 0L7 239c-9.4 9.4-9.4 24.6 0 33.9l135.5 135.5c9.4 9.4 24.6 9.4 33.9 0l17-17c9.4-9.3 9.4-24.5.1-33.8" }, null, -1);
const _hoisted_3$b = [
  _hoisted_2$g
];
function render$9(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$h, [..._hoisted_3$b]);
}
const ArrowFromRight = { render: render$9 };
const _hoisted_1$g = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 448 512"
};
const _hoisted_2$f = /* @__PURE__ */ createBaseVNode("path", { d: "m257.5 445.1-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3" }, null, -1);
const _hoisted_3$a = [
  _hoisted_2$f
];
function render$8(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$g, [..._hoisted_3$a]);
}
const ArrowLeft = { render: render$8 };
const _hoisted_1$f = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 448 512"
};
const _hoisted_2$e = /* @__PURE__ */ createBaseVNode("path", { d: "m190.5 66.9 22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3" }, null, -1);
const _hoisted_3$9 = [
  _hoisted_2$e
];
function render$7(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$f, [..._hoisted_3$9]);
}
const ArrowRight = { render: render$7 };
const _hoisted_1$e = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 576 512"
};
const _hoisted_2$d = /* @__PURE__ */ createBaseVNode("path", { d: "M288 128a80 80 0 1 0 80 80 80.12 80.12 0 0 0-80-80m0 128a48 48 0 1 1 48-48 48.05 48.05 0 0 1-48 48M104 416h368a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H104a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8m470.43-87.94a32.1 32.1 0 0 0-3.8-8.06L512 256V80a48 48 0 0 0-48-48H112a48 48 0 0 0-48 48v176L5.38 320A33.45 33.45 0 0 0 0 337.75V448a32 32 0 0 0 32 32h512a32 32 0 0 0 32-32V337.75a31.8 31.8 0 0 0-1.57-9.69M96 268.44V80a16 16 0 0 1 16-16h352a16 16 0 0 1 16 16v188.44L527.23 320H48.77zM544 448H32v-96h512zM432 104h-32a8 8 0 0 0-8 8v32a8 8 0 0 0 8 8h32a8 8 0 0 0 8-8v-32a8 8 0 0 0-8-8" }, null, -1);
const _hoisted_3$8 = [
  _hoisted_2$d
];
function render$6(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$e, [..._hoisted_3$8]);
}
const CameraPolaroid = { render: render$6 };
const _hoisted_1$d = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 448 512"
};
const _hoisted_2$c = /* @__PURE__ */ createBaseVNode("path", { d: "M112 368h96c8.8 0 16-7.2 16-16v-96c0-8.8-7.2-16-16-16h-96c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16M400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48m0 394c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V160h352z" }, null, -1);
const _hoisted_3$7 = [
  _hoisted_2$c
];
function render$5(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$d, [..._hoisted_3$7]);
}
const CalandarDay = { render: render$5 };
const _hoisted_1$c = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 512 512"
};
const _hoisted_2$b = /* @__PURE__ */ createBaseVNode("path", { d: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8m216 248c0 118.7-96.1 216-216 216-118.7 0-216-96.1-216-216 0-118.7 96.1-216 216-216 118.7 0 216 96.1 216 216m-148.9 88.3-81.2-59c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h14c6.6 0 12 5.4 12 12v146.3l70.5 51.3c5.4 3.9 6.5 11.4 2.6 16.8l-8.2 11.3c-3.9 5.3-11.4 6.5-16.8 2.6" }, null, -1);
const _hoisted_3$6 = [
  _hoisted_2$b
];
function render$4(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$c, [..._hoisted_3$6]);
}
const Clock = { render: render$4 };
const _hoisted_1$b = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 384 512"
};
const _hoisted_2$a = /* @__PURE__ */ createBaseVNode("path", { d: "M376 232H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h368c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8" }, null, -1);
const _hoisted_3$5 = [
  _hoisted_2$a
];
function render$3(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$b, [..._hoisted_3$5]);
}
const Minus = { render: render$3 };
const _hoisted_1$a = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 384 512"
};
const _hoisted_2$9 = /* @__PURE__ */ createBaseVNode("path", { d: "M376 232H216V72c0-4.42-3.58-8-8-8h-32c-4.42 0-8 3.58-8 8v160H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h160v160c0 4.42 3.58 8 8 8h32c4.42 0 8-3.58 8-8V280h160c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8" }, null, -1);
const _hoisted_3$4 = [
  _hoisted_2$9
];
function render$2(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$a, [..._hoisted_3$4]);
}
const Plus = { render: render$2 };
const _hoisted_1$9 = {
  xmlns: "http://www.w3.org/2000/svg",
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  "image-rendering": "optimizeQuality",
  "shape-rendering": "geometricPrecision",
  "text-rendering": "geometricPrecision",
  viewBox: "0 0 512 406.453"
};
const _hoisted_2$8 = /* @__PURE__ */ createBaseVNode("path", {
  "fill-rule": "nonzero",
  d: "M414.238 63.347h20.374c21.303 0 40.662 8.705 54.67 22.714C503.295 100.073 512 119.442 512 140.735v188.329c0 21.296-8.709 40.655-22.721 54.667s-33.375 22.722-54.667 22.722H77.388c-21.292 0-40.662-8.706-54.674-22.718C8.705 369.727 0 350.368 0 329.064V140.735c0-21.307 8.698-40.666 22.71-54.678s33.368-22.71 54.678-22.71h138.653V14.426C216.041 6.459 222.5 0 230.467 0c3.875 0 7.394 1.527 9.985 4.013l99.797 78.827c6.223 4.914 7.28 13.947 2.366 20.17a14.4 14.4 0 0 1-2.61 2.559l-100.636 79.489c-6.223 4.914-15.255 3.856-20.169-2.366a14.3 14.3 0 0 1-3.09-8.902h-.069v-52.737H77.388c-5.386 0-10.304 2.224-13.881 5.801s-5.801 8.498-5.801 13.881v188.329c0 5.38 2.228 10.298 5.805 13.874 3.58 3.58 8.501 5.808 13.877 5.808h357.224c5.368 0 10.29-2.231 13.87-5.811s5.812-8.499 5.812-13.871V140.735c0-5.376-2.228-10.297-5.809-13.878-3.576-3.576-8.494-5.804-13.873-5.804h-20.374z"
}, null, -1);
const _hoisted_3$3 = [
  _hoisted_2$8
];
function render$1(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$9, [..._hoisted_3$3]);
}
const RepeatSquareIcon = { render: render$1 };
const _hoisted_1$8 = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 640 512"
};
const _hoisted_2$7 = /* @__PURE__ */ createBaseVNode("path", { d: "M160 8c0-4.4-3.6-8-8-8H72c-4.4 0-8 3.6-8 8v152h96zm128 0c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152h64zm96 0c0-4.4-3.6-8-8-8h-16c-4.4 0-8 3.6-8 8v152h32zm96 0c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152h64zm96 0c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152h64zM416 504c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V352h-64zm-64 0c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8V352h-32zm-288 0c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V352H64zm160 0c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V352h-64zm288 0c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V352h-64zm120-264H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h624c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8" }, null, -1);
const _hoisted_3$2 = [
  _hoisted_2$7
];
function render(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$8, [..._hoisted_3$2]);
}
const BarcodeScan = { render };
const icons = (() => {
  let icons2 = {
    "ico-home": Home,
    "ico-share": Share,
    "ico-chevron-left": ChevronLeft,
    "ico-chevron-right": ChevronRight,
    "ico-chevron-double-left": ChevronDoubleLeft,
    "ico-chevron-double-right": ChevronDoubleRight,
    "ico-angle-left": AngleLeft,
    "ico-angle-right": AngleRight,
    "ico-angle-down": AngleDown,
    "ico-angle-up": AngleUp,
    "ico-arrow-left": ArrowLeft,
    "ico-arrow-right": ArrowRight,
    "ico-arrow-down": AngleDown,
    "ico-arrow-up": AngleUp,
    "ico-angle-double-left": AngleDoubleLeft,
    "ico-angle-double-right": AngleDoubleRight,
    "ico-arrow-from-left": ArrowFromLeft,
    "ico-arrow-from-right": ArrowFromRight,
    "ico-minus": Minus,
    "ico-plus": Plus,
    "ico-camera-polaroid": CameraPolaroid,
    "ico-calendar-day": CalandarDay,
    "ico-clock": Clock,
    "ico-repeat-square-icon": RepeatSquareIcon,
    "ico-barcode-scan": BarcodeScan
  };
  let aliases = {
    // 'ico-quote': icons['ico-quote-left'],
    // 'ico-hr': icons['ico-horizontal-rule'],
    // 'ico-signout': icons['ico-logout'],
    // 'ico-sign-out': icons['ico-logout']
  };
  return {
    ...icons2,
    ...aliases
  };
})();
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  name: "Icons",
  components: icons,
  props: {
    icon: {
      type: String,
      required: true
    },
    size: String
  },
  data() {
    return {
      icons
    };
  },
  computed: {
    iconSize() {
      let size2 = (this.size + "").toLowerCase();
      switch (size2) {
        case "small":
        case "is-small":
          return "is-small";
        case "medium":
        case "is-medium":
          return "is-medium";
        case "large":
        case "is-large":
          return "is-large";
        default:
          return "";
      }
    },
    iconName() {
      let iconName = this.icon;
      if (typeof this.icon === "string")
        ;
      else {
        iconName = this.icon.join("-");
      }
      iconName = iconName.replaceAll("icon-", "");
      iconName = "ico-" + iconName;
      return iconName;
    },
    hasIcon() {
      let hasIcon = !!this.icons[this.iconName];
      if (!hasIcon) {
        console.warn("missing icon", this.iconName);
      }
      return hasIcon;
    }
  }
});
const Icons_vue_vue_type_style_index_0_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", {
    class: normalizeClass(["icon", _ctx.iconSize])
  }, [
    _ctx.hasIcon ? (openBlock(), createBlock(resolveDynamicComponent(_ctx.iconName), { key: 0 })) : createCommentVNode("", true)
  ], 2);
}
const Icons = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$2]]);
var isVue2 = false;
/*!
 * pinia v2.1.7
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */
let activePinia;
const setActivePinia = (pinia2) => activePinia = pinia2;
const piniaSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject(o2) {
  return o2 && typeof o2 === "object" && Object.prototype.toString.call(o2) === "[object Object]" && typeof o2.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia2 = markRaw({
    install(app2) {
      setActivePinia(pinia2);
      {
        pinia2._a = app2;
        app2.provide(piniaSymbol, pinia2);
        app2.config.globalProperties.$pinia = pinia2;
        toBeInstalled.forEach((plugin) => _p.push(plugin));
        toBeInstalled = [];
      }
    },
    use(plugin) {
      if (!this._a && !isVue2) {
        toBeInstalled.push(plugin);
      } else {
        _p.push(plugin);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  return pinia2;
}
const noop$1 = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop$1) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
const fallbackRunWithContext = (fn2) => fn2();
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  }
  if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(obj) {
  return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign: assign$2 } = Object;
function isComputed(o2) {
  return !!(isRef(o2) && o2.effect);
}
function createOptionsStore(id, options, pinia2, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia2.state.value[id];
  let store;
  function setup() {
    if (!initialState && true) {
      {
        pinia2.state.value[id] = state ? state() : {};
      }
    }
    const localState = toRefs(pinia2.state.value[id]);
    return assign$2(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia2);
        const store2 = pinia2._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia2, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia2, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign$2({ actions: {} }, options);
  const $subscribeOptions = {
    deep: true
    // flush: 'post',
  };
  let isListening;
  let isSyncListening;
  let subscriptions = [];
  let actionSubscriptions = [];
  let debuggerEvents;
  const initialState = pinia2.state.value[$id];
  if (!isOptionsStore && !initialState && true) {
    {
      pinia2.state.value[$id] = {};
    }
  }
  ref({});
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia2.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia2.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia2.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign$2($state, newState);
    });
  } : (
    /* istanbul ignore next */
    noop$1
  );
  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia2._s.delete($id);
  }
  function wrapAction(name, action) {
    return function() {
      setActivePinia(pinia2);
      const args = Array.from(arguments);
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError
      });
      let ret;
      try {
        ret = action.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackList, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackList, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }
  const partialStore = {
    _p: pinia2,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia2.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign$2({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(partialStore);
  pinia2._s.set($id, store);
  const runWithContext = pinia2._a && pinia2._a.runWithContext || fallbackRunWithContext;
  const setupStore = runWithContext(() => pinia2._e.run(() => (scope = effectScope()).run(setup)));
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        {
          pinia2.state.value[$id][key] = prop;
        }
      }
    } else if (typeof prop === "function") {
      const actionValue = wrapAction(key, prop);
      {
        setupStore[key] = actionValue;
      }
      optionsForPlugin.actions[key] = prop;
    } else
      ;
  }
  {
    assign$2(store, setupStore);
    assign$2(toRaw(store), setupStore);
  }
  Object.defineProperty(store, "$state", {
    get: () => pinia2.state.value[$id],
    set: (state) => {
      $patch(($state) => {
        assign$2($state, state);
      });
    }
  });
  pinia2._p.forEach((extender) => {
    {
      assign$2(store, scope.run(() => extender({
        store,
        app: pinia2._a,
        pinia: pinia2,
        options: optionsForPlugin
      })));
    }
  });
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options;
  const isSetupStore = typeof setup === "function";
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }
  function useStore(pinia2, hot) {
    const hasContext = hasInjectionContext();
    pinia2 = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    pinia2 || (hasContext ? inject(piniaSymbol, null) : null);
    if (pinia2)
      setActivePinia(pinia2);
    pinia2 = activePinia;
    if (!pinia2._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia2);
      } else {
        createOptionsStore(id, options, pinia2);
      }
    }
    const store = pinia2._s.get(id);
    return store;
  }
  useStore.$id = id;
  return useStore;
}
function storeToRefs(store) {
  {
    store = toRaw(store);
    const refs = {};
    for (const key in store) {
      const value = store[key];
      if (isRef(value) || isReactive(value)) {
        refs[key] = // ---
        toRef(store, key);
      }
    }
    return refs;
  }
}
function _typeof(o2) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o3) {
    return typeof o3;
  } : function(o3) {
    return o3 && "function" == typeof Symbol && o3.constructor === Symbol && o3 !== Symbol.prototype ? "symbol" : typeof o3;
  }, _typeof(o2);
}
function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }
  var number = Number(dirtyNumber);
  if (isNaN(number)) {
    return number;
  }
  return number < 0 ? Math.ceil(number) : Math.floor(number);
}
function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + " argument" + (required > 1 ? "s" : "") + " required, but only " + args.length + " present");
  }
}
function toDate(argument) {
  requiredArgs(1, arguments);
  var argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || _typeof(argument) === "object" && argStr === "[object Date]") {
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || argStr === "[object Number]") {
    return new Date(argument);
  } else {
    if ((typeof argument === "string" || argStr === "[object String]") && typeof console !== "undefined") {
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments");
      console.warn(new Error().stack);
    }
    return /* @__PURE__ */ new Date(NaN);
  }
}
function addDays(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var amount = toInteger(dirtyAmount);
  if (isNaN(amount)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (!amount) {
    return date;
  }
  date.setDate(date.getDate() + amount);
  return date;
}
function addMonths(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var amount = toInteger(dirtyAmount);
  if (isNaN(amount)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (!amount) {
    return date;
  }
  var dayOfMonth = date.getDate();
  var endOfDesiredMonth = new Date(date.getTime());
  endOfDesiredMonth.setMonth(date.getMonth() + amount + 1, 0);
  var daysInMonth = endOfDesiredMonth.getDate();
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth;
  } else {
    date.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth);
    return date;
  }
}
function addMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var timestamp = toDate(dirtyDate).getTime();
  var amount = toInteger(dirtyAmount);
  return new Date(timestamp + amount);
}
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}
function startOfWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = date.getDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function getTimezoneOffsetInMilliseconds(date) {
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}
function startOfDay(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setHours(0, 0, 0, 0);
  return date;
}
function addYears(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMonths(dirtyDate, amount * 12);
}
function max(dirtyDatesArray) {
  requiredArgs(1, arguments);
  var datesArray;
  if (dirtyDatesArray && typeof dirtyDatesArray.forEach === "function") {
    datesArray = dirtyDatesArray;
  } else if (_typeof(dirtyDatesArray) === "object" && dirtyDatesArray !== null) {
    datesArray = Array.prototype.slice.call(dirtyDatesArray);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
  var result;
  datesArray.forEach(function(dirtyDate) {
    var currentDate = toDate(dirtyDate);
    if (result === void 0 || result < currentDate || isNaN(Number(currentDate))) {
      result = currentDate;
    }
  });
  return result || /* @__PURE__ */ new Date(NaN);
}
function min(dirtyDatesArray) {
  requiredArgs(1, arguments);
  var datesArray;
  if (dirtyDatesArray && typeof dirtyDatesArray.forEach === "function") {
    datesArray = dirtyDatesArray;
  } else if (_typeof(dirtyDatesArray) === "object" && dirtyDatesArray !== null) {
    datesArray = Array.prototype.slice.call(dirtyDatesArray);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
  var result;
  datesArray.forEach(function(dirtyDate) {
    var currentDate = toDate(dirtyDate);
    if (result === void 0 || result > currentDate || isNaN(currentDate.getDate())) {
      result = currentDate;
    }
  });
  return result || /* @__PURE__ */ new Date(NaN);
}
var millisecondsInMinute = 6e4;
var millisecondsInHour = 36e5;
var millisecondsInSecond = 1e3;
function isSameDay(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeftStartOfDay = startOfDay(dirtyDateLeft);
  var dateRightStartOfDay = startOfDay(dirtyDateRight);
  return dateLeftStartOfDay.getTime() === dateRightStartOfDay.getTime();
}
function isDate(value) {
  requiredArgs(1, arguments);
  return value instanceof Date || _typeof(value) === "object" && Object.prototype.toString.call(value) === "[object Date]";
}
function isValid(dirtyDate) {
  requiredArgs(1, arguments);
  if (!isDate(dirtyDate) && typeof dirtyDate !== "number") {
    return false;
  }
  var date = toDate(dirtyDate);
  return !isNaN(Number(date));
}
function endOfDay(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setHours(23, 59, 59, 999);
  return date;
}
function endOfMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var month = date.getMonth();
  date.setFullYear(date.getFullYear(), month + 1, 0);
  date.setHours(23, 59, 59, 999);
  return date;
}
function eachDayOfInterval(dirtyInterval, options) {
  var _options$step;
  requiredArgs(1, arguments);
  var interval = dirtyInterval || {};
  var startDate = toDate(interval.start);
  var endDate = toDate(interval.end);
  var endTime = endDate.getTime();
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError("Invalid interval");
  }
  var dates = [];
  var currentDate = startDate;
  currentDate.setHours(0, 0, 0, 0);
  var step = Number((_options$step = options === null || options === void 0 ? void 0 : options.step) !== null && _options$step !== void 0 ? _options$step : 1);
  if (step < 1 || isNaN(step))
    throw new RangeError("`options.step` must be a number greater than 1");
  while (currentDate.getTime() <= endTime) {
    dates.push(toDate(currentDate));
    currentDate.setDate(currentDate.getDate() + step);
    currentDate.setHours(0, 0, 0, 0);
  }
  return dates;
}
function startOfMinute(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setSeconds(0, 0);
  return date;
}
function eachMonthOfInterval(dirtyInterval) {
  requiredArgs(1, arguments);
  var interval = dirtyInterval || {};
  var startDate = toDate(interval.start);
  var endDate = toDate(interval.end);
  var endTime = endDate.getTime();
  var dates = [];
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError("Invalid interval");
  }
  var currentDate = startDate;
  currentDate.setHours(0, 0, 0, 0);
  currentDate.setDate(1);
  while (currentDate.getTime() <= endTime) {
    dates.push(toDate(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return dates;
}
function startOfMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}
function endOfYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getFullYear();
  date.setFullYear(year + 1, 0, 0);
  date.setHours(23, 59, 59, 999);
  return date;
}
function startOfYear(dirtyDate) {
  requiredArgs(1, arguments);
  var cleanDate = toDate(dirtyDate);
  var date = /* @__PURE__ */ new Date(0);
  date.setFullYear(cleanDate.getFullYear(), 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
function eachYearOfInterval(dirtyInterval) {
  requiredArgs(1, arguments);
  var interval = dirtyInterval || {};
  var startDate = toDate(interval.start);
  var endDate = toDate(interval.end);
  var endTime = endDate.getTime();
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError("Invalid interval");
  }
  var dates = [];
  var currentDate = startDate;
  currentDate.setHours(0, 0, 0, 0);
  currentDate.setMonth(0, 1);
  while (currentDate.getTime() <= endTime) {
    dates.push(toDate(currentDate));
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  }
  return dates;
}
function endOfDecade(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getFullYear();
  var decade = 9 + Math.floor(year / 10) * 10;
  date.setFullYear(decade, 11, 31);
  date.setHours(23, 59, 59, 999);
  return date;
}
function endOfWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = date.getDay();
  var diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
  date.setDate(date.getDate() + diff);
  date.setHours(23, 59, 59, 999);
  return date;
}
function subMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMilliseconds(dirtyDate, -amount);
}
var MILLISECONDS_IN_DAY = 864e5;
function getUTCDayOfYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var timestamp = date.getTime();
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
  var startOfYearTimestamp = date.getTime();
  var difference = timestamp - startOfYearTimestamp;
  return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
}
function startOfUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var weekStartsOn = 1;
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
function getUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var fourthOfJanuaryOfNextYear = /* @__PURE__ */ new Date(0);
  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = /* @__PURE__ */ new Date(0);
  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}
function startOfUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var year = getUTCISOWeekYear(dirtyDate);
  var fourthOfJanuary = /* @__PURE__ */ new Date(0);
  fourthOfJanuary.setUTCFullYear(year, 0, 4);
  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCISOWeek(fourthOfJanuary);
  return date;
}
var MILLISECONDS_IN_WEEK$1 = 6048e5;
function getUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
}
function startOfUTCWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
function getUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var defaultOptions2 = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var firstWeekOfNextYear = /* @__PURE__ */ new Date(0);
  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, options);
  var firstWeekOfThisYear = /* @__PURE__ */ new Date(0);
  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, options);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}
function startOfUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  var year = getUTCWeekYear(dirtyDate, options);
  var firstWeek = /* @__PURE__ */ new Date(0);
  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCWeek(firstWeek, options);
  return date;
}
var MILLISECONDS_IN_WEEK = 6048e5;
function getUTCWeek(dirtyDate, options) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}
function addLeadingZeros(number, targetLength) {
  var sign = number < 0 ? "-" : "";
  var output = Math.abs(number).toString();
  while (output.length < targetLength) {
    output = "0" + output;
  }
  return sign + output;
}
var formatters$2 = {
  // Year
  y: function y(date, token) {
    var signedYear = date.getUTCFullYear();
    var year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M: function M(date, token) {
    var month = date.getUTCMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d: function d(date, token) {
    return addLeadingZeros(date.getUTCDate(), token.length);
  },
  // AM or PM
  a: function a(date, token) {
    var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h: function h(date, token) {
    return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H: function H(date, token) {
    return addLeadingZeros(date.getUTCHours(), token.length);
  },
  // Minute
  m: function m(date, token) {
    return addLeadingZeros(date.getUTCMinutes(), token.length);
  },
  // Second
  s: function s(date, token) {
    return addLeadingZeros(date.getUTCSeconds(), token.length);
  },
  // Fraction of second
  S: function S(date, token) {
    var numberOfDigits = token.length;
    var milliseconds = date.getUTCMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};
const formatters$3 = formatters$2;
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  // Era
  G: function G(date, token, localize2) {
    var era = date.getUTCFullYear() > 0 ? 1 : 0;
    switch (token) {
      case "G":
      case "GG":
      case "GGG":
        return localize2.era(era, {
          width: "abbreviated"
        });
      case "GGGGG":
        return localize2.era(era, {
          width: "narrow"
        });
      case "GGGG":
      default:
        return localize2.era(era, {
          width: "wide"
        });
    }
  },
  // Year
  y: function y2(date, token, localize2) {
    if (token === "yo") {
      var signedYear = date.getUTCFullYear();
      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize2.ordinalNumber(year, {
        unit: "year"
      });
    }
    return formatters$3.y(date, token);
  },
  // Local week-numbering year
  Y: function Y(date, token, localize2, options) {
    var signedWeekYear = getUTCWeekYear(date, options);
    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      var twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize2.ordinalNumber(weekYear, {
        unit: "year"
      });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function R(date, token) {
    var isoWeekYear = getUTCISOWeekYear(date);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function u(date, token) {
    var year = date.getUTCFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function Q(date, token, localize2) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
    switch (token) {
      case "Q":
        return String(quarter);
      case "QQ":
        return addLeadingZeros(quarter, 2);
      case "Qo":
        return localize2.ordinalNumber(quarter, {
          unit: "quarter"
        });
      case "QQQ":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      case "QQQQQ":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      case "QQQQ":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function q(date, token, localize2) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
    switch (token) {
      case "q":
        return String(quarter);
      case "qq":
        return addLeadingZeros(quarter, 2);
      case "qo":
        return localize2.ordinalNumber(quarter, {
          unit: "quarter"
        });
      case "qqq":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      case "qqqqq":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      case "qqqq":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function M2(date, token, localize2) {
    var month = date.getUTCMonth();
    switch (token) {
      case "M":
      case "MM":
        return formatters$3.M(date, token);
      case "Mo":
        return localize2.ordinalNumber(month + 1, {
          unit: "month"
        });
      case "MMM":
        return localize2.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      case "MMMMM":
        return localize2.month(month, {
          width: "narrow",
          context: "formatting"
        });
      case "MMMM":
      default:
        return localize2.month(month, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone month
  L: function L(date, token, localize2) {
    var month = date.getUTCMonth();
    switch (token) {
      case "L":
        return String(month + 1);
      case "LL":
        return addLeadingZeros(month + 1, 2);
      case "Lo":
        return localize2.ordinalNumber(month + 1, {
          unit: "month"
        });
      case "LLL":
        return localize2.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      case "LLLLL":
        return localize2.month(month, {
          width: "narrow",
          context: "standalone"
        });
      case "LLLL":
      default:
        return localize2.month(month, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Local week of year
  w: function w(date, token, localize2, options) {
    var week = getUTCWeek(date, options);
    if (token === "wo") {
      return localize2.ordinalNumber(week, {
        unit: "week"
      });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function I(date, token, localize2) {
    var isoWeek = getUTCISOWeek(date);
    if (token === "Io") {
      return localize2.ordinalNumber(isoWeek, {
        unit: "week"
      });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function d2(date, token, localize2) {
    if (token === "do") {
      return localize2.ordinalNumber(date.getUTCDate(), {
        unit: "date"
      });
    }
    return formatters$3.d(date, token);
  },
  // Day of year
  D: function D(date, token, localize2) {
    var dayOfYear = getUTCDayOfYear(date);
    if (token === "Do") {
      return localize2.ordinalNumber(dayOfYear, {
        unit: "dayOfYear"
      });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function E(date, token, localize2) {
    var dayOfWeek = date.getUTCDay();
    switch (token) {
      case "E":
      case "EE":
      case "EEE":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "EEEEE":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "EEEEEE":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "EEEE":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function e(date, token, localize2, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "e":
        return String(localDayOfWeek);
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      case "eo":
        return localize2.ordinalNumber(localDayOfWeek, {
          unit: "day"
        });
      case "eee":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "eeeee":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "eeeeee":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "eeee":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function c(date, token, localize2, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "c":
        return String(localDayOfWeek);
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      case "co":
        return localize2.ordinalNumber(localDayOfWeek, {
          unit: "day"
        });
      case "ccc":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      case "ccccc":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      case "cccccc":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      case "cccc":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function i(date, token, localize2) {
    var dayOfWeek = date.getUTCDay();
    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      case "i":
        return String(isoDayOfWeek);
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      case "io":
        return localize2.ordinalNumber(isoDayOfWeek, {
          unit: "day"
        });
      case "iii":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "iiiii":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "iiiiii":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "iiii":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function a2(date, token, localize2) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function b(date, token, localize2) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function B(date, token, localize2) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function h2(date, token, localize2) {
    if (token === "ho") {
      var hours = date.getUTCHours() % 12;
      if (hours === 0)
        hours = 12;
      return localize2.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return formatters$3.h(date, token);
  },
  // Hour [0-23]
  H: function H2(date, token, localize2) {
    if (token === "Ho") {
      return localize2.ordinalNumber(date.getUTCHours(), {
        unit: "hour"
      });
    }
    return formatters$3.H(date, token);
  },
  // Hour [0-11]
  K: function K(date, token, localize2) {
    var hours = date.getUTCHours() % 12;
    if (token === "Ko") {
      return localize2.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function k(date, token, localize2) {
    var hours = date.getUTCHours();
    if (hours === 0)
      hours = 24;
    if (token === "ko") {
      return localize2.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function m2(date, token, localize2) {
    if (token === "mo") {
      return localize2.ordinalNumber(date.getUTCMinutes(), {
        unit: "minute"
      });
    }
    return formatters$3.m(date, token);
  },
  // Second
  s: function s2(date, token, localize2) {
    if (token === "so") {
      return localize2.ordinalNumber(date.getUTCSeconds(), {
        unit: "second"
      });
    }
    return formatters$3.s(date, token);
  },
  // Fraction of second
  S: function S2(date, token) {
    return formatters$3.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function X(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      case "XXXXX":
      case "XXX":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function x(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      case "xxxxx":
      case "xxx":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function O(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function z(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Seconds timestamp
  t: function t(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = Math.floor(originalDate.getTime() / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function T(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = originalDate.getTime();
    return addLeadingZeros(timestamp, token.length);
  }
};
function formatTimezoneShort(offset, dirtyDelimiter) {
  var sign = offset > 0 ? "-" : "+";
  var absOffset = Math.abs(offset);
  var hours = Math.floor(absOffset / 60);
  var minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  var delimiter = dirtyDelimiter || "";
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
  if (offset % 60 === 0) {
    var sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, dirtyDelimiter);
}
function formatTimezone(offset, dirtyDelimiter) {
  var delimiter = dirtyDelimiter || "";
  var sign = offset > 0 ? "-" : "+";
  var absOffset = Math.abs(offset);
  var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
  var minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}
const formatters$1 = formatters;
var dateLongFormatter = function dateLongFormatter2(pattern, formatLong2) {
  switch (pattern) {
    case "P":
      return formatLong2.date({
        width: "short"
      });
    case "PP":
      return formatLong2.date({
        width: "medium"
      });
    case "PPP":
      return formatLong2.date({
        width: "long"
      });
    case "PPPP":
    default:
      return formatLong2.date({
        width: "full"
      });
  }
};
var timeLongFormatter = function timeLongFormatter2(pattern, formatLong2) {
  switch (pattern) {
    case "p":
      return formatLong2.time({
        width: "short"
      });
    case "pp":
      return formatLong2.time({
        width: "medium"
      });
    case "ppp":
      return formatLong2.time({
        width: "long"
      });
    case "pppp":
    default:
      return formatLong2.time({
        width: "full"
      });
  }
};
var dateTimeLongFormatter = function dateTimeLongFormatter2(pattern, formatLong2) {
  var matchResult = pattern.match(/(P+)(p+)?/) || [];
  var datePattern = matchResult[1];
  var timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong2);
  }
  var dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong2.dateTime({
        width: "short"
      });
      break;
    case "PP":
      dateTimeFormat = formatLong2.dateTime({
        width: "medium"
      });
      break;
    case "PPP":
      dateTimeFormat = formatLong2.dateTime({
        width: "long"
      });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong2.dateTime({
        width: "full"
      });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};
const longFormatters$1 = longFormatters;
var protectedDayOfYearTokens = ["D", "DD"];
var protectedWeekYearTokens = ["YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return protectedDayOfYearTokens.indexOf(token) !== -1;
}
function isProtectedWeekYearToken(token) {
  return protectedWeekYearTokens.indexOf(token) !== -1;
}
function throwProtectedError(token, format2, input) {
  if (token === "YYYY") {
    throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format2, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === "YY") {
    throw new RangeError("Use `yy` instead of `YY` (in `".concat(format2, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === "D") {
    throw new RangeError("Use `d` instead of `D` (in `".concat(format2, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === "DD") {
    throw new RangeError("Use `dd` instead of `DD` (in `".concat(format2, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  }
}
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = function formatDistance2(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};
const formatDistance$1 = formatDistance;
function buildFormatLongFn(args) {
  return function() {
    var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format2 = args.formats[width] || args.formats[args.defaultWidth];
    return format2;
  };
}
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};
const formatLong$1 = formatLong;
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = function formatRelative2(token, _date, _baseDate, _options) {
  return formatRelativeLocale[token];
};
const formatRelative$1 = formatRelative;
function buildLocalizeFn(args) {
  return function(dirtyIndex, options) {
    var context = options !== null && options !== void 0 && options.context ? String(options.context) : "standalone";
    var valuesArray;
    if (context === "formatting" && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options !== null && options !== void 0 && options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;
      var _width = options !== null && options !== void 0 && options.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }
    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
    return valuesArray[index];
  };
}
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  wide: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = function ordinalNumber2(dirtyNumber, _options) {
  var number = Number(dirtyNumber);
  var rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};
const localize$1 = localize;
function buildMatchFn(args) {
  return function(string) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function(pattern) {
      return pattern.test(matchedString);
    }) : findKey(parsePatterns, function(pattern) {
      return pattern.test(matchedString);
    });
    var value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value,
      rest
    };
  };
}
function findKey(object, predicate) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (var key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}
function buildMatchPatternFn(args) {
  return function(string) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult)
      return null;
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult)
      return null;
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value,
      rest
    };
  };
}
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function valueCallback(value) {
      return parseInt(value, 10);
    }
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: function valueCallback2(index) {
      return index + 1;
    }
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};
const match$1 = match;
var locale = {
  code: "en-US",
  formatDistance: formatDistance$1,
  formatLong: formatLong$1,
  formatRelative: formatRelative$1,
  localize: localize$1,
  match: match$1,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
const defaultLocale = locale;
var formattingTokensRegExp$1 = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp$1 = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp$1 = /^'([^]*?)'?$/;
var doubleQuoteRegExp$1 = /''/g;
var unescapedLatinCharacterRegExp$1 = /[a-zA-Z]/;
function format(dirtyDate, dirtyFormatStr, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _options$locale2, _options$locale2$opti, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _options$locale3, _options$locale3$opti, _defaultOptions$local3, _defaultOptions$local4;
  requiredArgs(2, arguments);
  var formatStr = String(dirtyFormatStr);
  var defaultOptions2 = getDefaultOptions();
  var locale2 = (_ref = (_options$locale = options === null || options === void 0 ? void 0 : options.locale) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions2.locale) !== null && _ref !== void 0 ? _ref : defaultLocale;
  var firstWeekContainsDate = toInteger((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale2 = options.locale) === null || _options$locale2 === void 0 ? void 0 : (_options$locale2$opti = _options$locale2.options) === null || _options$locale2$opti === void 0 ? void 0 : _options$locale2$opti.firstWeekContainsDate) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions2.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var weekStartsOn = toInteger((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale3 = options.locale) === null || _options$locale3 === void 0 ? void 0 : (_options$locale3$opti = _options$locale3.options) === null || _options$locale3$opti === void 0 ? void 0 : _options$locale3$opti.weekStartsOn) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions2.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions2.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  if (!locale2.localize) {
    throw new RangeError("locale must contain localize property");
  }
  if (!locale2.formatLong) {
    throw new RangeError("locale must contain formatLong property");
  }
  var originalDate = toDate(dirtyDate);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
  var utcDate = subMilliseconds(originalDate, timezoneOffset);
  var formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale: locale2,
    _originalDate: originalDate
  };
  var result = formatStr.match(longFormattingTokensRegExp$1).map(function(substring) {
    var firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      var longFormatter = longFormatters$1[firstCharacter];
      return longFormatter(substring, locale2.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp$1).map(function(substring) {
    if (substring === "''") {
      return "'";
    }
    var firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return cleanEscapedString$1(substring);
    }
    var formatter = formatters$1[firstCharacter];
    if (formatter) {
      if (!(options !== null && options !== void 0 && options.useAdditionalWeekYearTokens) && isProtectedWeekYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }
      if (!(options !== null && options !== void 0 && options.useAdditionalDayOfYearTokens) && isProtectedDayOfYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }
      return formatter(utcDate, substring, locale2.localize, formatterOptions);
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp$1)) {
      throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
    }
    return substring;
  }).join("");
  return result;
}
function cleanEscapedString$1(input) {
  var matched = input.match(escapedStringRegExp$1);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp$1, "'");
}
function assign$1(target, object) {
  if (target == null) {
    throw new TypeError("assign requires that input parameter not be null or undefined");
  }
  for (var property in object) {
    if (Object.prototype.hasOwnProperty.call(object, property)) {
      target[property] = object[property];
    }
  }
  return target;
}
function formatRFC3339(dirtyDate, options) {
  var _options$fractionDigi;
  if (arguments.length < 1) {
    throw new TypeError("1 arguments required, but only ".concat(arguments.length, " present"));
  }
  var originalDate = toDate(dirtyDate);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  var fractionDigits = Number((_options$fractionDigi = options === null || options === void 0 ? void 0 : options.fractionDigits) !== null && _options$fractionDigi !== void 0 ? _options$fractionDigi : 0);
  if (!(fractionDigits >= 0 && fractionDigits <= 3)) {
    throw new RangeError("fractionDigits must be between 0 and 3 inclusively");
  }
  var day = addLeadingZeros(originalDate.getDate(), 2);
  var month = addLeadingZeros(originalDate.getMonth() + 1, 2);
  var year = originalDate.getFullYear();
  var hour = addLeadingZeros(originalDate.getHours(), 2);
  var minute = addLeadingZeros(originalDate.getMinutes(), 2);
  var second = addLeadingZeros(originalDate.getSeconds(), 2);
  var fractionalSecond = "";
  if (fractionDigits > 0) {
    var milliseconds = originalDate.getMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, fractionDigits - 3));
    fractionalSecond = "." + addLeadingZeros(fractionalSeconds, fractionDigits);
  }
  var offset = "";
  var tzOffset = originalDate.getTimezoneOffset();
  if (tzOffset !== 0) {
    var absoluteOffset = Math.abs(tzOffset);
    var hourOffset = addLeadingZeros(toInteger(absoluteOffset / 60), 2);
    var minuteOffset = addLeadingZeros(absoluteOffset % 60, 2);
    var sign = tzOffset < 0 ? "+" : "-";
    offset = "".concat(sign).concat(hourOffset, ":").concat(minuteOffset);
  } else {
    offset = "Z";
  }
  return "".concat(year, "-").concat(month, "-").concat(day, "T").concat(hour, ":").concat(minute, ":").concat(second).concat(fractionalSecond).concat(offset);
}
function getDaysInMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getFullYear();
  var monthIndex = date.getMonth();
  var lastDayOfMonth = /* @__PURE__ */ new Date(0);
  lastDayOfMonth.setFullYear(year, monthIndex + 1, 0);
  lastDayOfMonth.setHours(0, 0, 0, 0);
  return lastDayOfMonth.getDate();
}
function getDecade(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getFullYear();
  var decade = Math.floor(year / 10) * 10;
  return decade;
}
function getYear(dirtyDate) {
  requiredArgs(1, arguments);
  return toDate(dirtyDate).getFullYear();
}
function isAfter(dirtyDate, dirtyDateToCompare) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var dateToCompare = toDate(dirtyDateToCompare);
  return date.getTime() > dateToCompare.getTime();
}
function isBefore(dirtyDate, dirtyDateToCompare) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var dateToCompare = toDate(dirtyDateToCompare);
  return date.getTime() < dateToCompare.getTime();
}
function _arrayLikeToArray(r2, a4) {
  (null == a4 || a4 > r2.length) && (a4 = r2.length);
  for (var e3 = 0, n2 = Array(a4); e3 < a4; e3++)
    n2[e3] = r2[e3];
  return n2;
}
function _unsupportedIterableToArray(r2, a4) {
  if (r2) {
    if ("string" == typeof r2)
      return _arrayLikeToArray(r2, a4);
    var t4 = {}.toString.call(r2).slice(8, -1);
    return "Object" === t4 && r2.constructor && (t4 = r2.constructor.name), "Map" === t4 || "Set" === t4 ? Array.from(r2) : "Arguments" === t4 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t4) ? _arrayLikeToArray(r2, a4) : void 0;
  }
}
function _createForOfIteratorHelper(r2, e3) {
  var t4 = "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
  if (!t4) {
    if (Array.isArray(r2) || (t4 = _unsupportedIterableToArray(r2)) || e3 && r2 && "number" == typeof r2.length) {
      t4 && (r2 = t4);
      var _n2 = 0, F2 = function F3() {
      };
      return {
        s: F2,
        n: function n2() {
          return _n2 >= r2.length ? {
            done: true
          } : {
            done: false,
            value: r2[_n2++]
          };
        },
        e: function e4(r3) {
          throw r3;
        },
        f: F2
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o2, a4 = true, u3 = false;
  return {
    s: function s4() {
      t4 = t4.call(r2);
    },
    n: function n2() {
      var r3 = t4.next();
      return a4 = r3.done, r3;
    },
    e: function e4(r3) {
      u3 = true, o2 = r3;
    },
    f: function f2() {
      try {
        a4 || null == t4["return"] || t4["return"]();
      } finally {
        if (u3)
          throw o2;
      }
    }
  };
}
function _assertThisInitialized(e3) {
  if (void 0 === e3)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e3;
}
function _setPrototypeOf(t4, e3) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t5, e4) {
    return t5.__proto__ = e4, t5;
  }, _setPrototypeOf(t4, e3);
}
function _inherits(t4, e3) {
  if ("function" != typeof e3 && null !== e3)
    throw new TypeError("Super expression must either be null or a function");
  t4.prototype = Object.create(e3 && e3.prototype, {
    constructor: {
      value: t4,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t4, "prototype", {
    writable: false
  }), e3 && _setPrototypeOf(t4, e3);
}
function _getPrototypeOf(t4) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t5) {
    return t5.__proto__ || Object.getPrototypeOf(t5);
  }, _getPrototypeOf(t4);
}
function _isNativeReflectConstruct() {
  try {
    var t4 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t5) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
    return !!t4;
  })();
}
function _possibleConstructorReturn(t4, e3) {
  if (e3 && ("object" == _typeof(e3) || "function" == typeof e3))
    return e3;
  if (void 0 !== e3)
    throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t4);
}
function _createSuper(t4) {
  var r2 = _isNativeReflectConstruct();
  return function() {
    var e3, o2 = _getPrototypeOf(t4);
    if (r2) {
      var s4 = _getPrototypeOf(this).constructor;
      e3 = Reflect.construct(o2, arguments, s4);
    } else
      e3 = o2.apply(this, arguments);
    return _possibleConstructorReturn(this, e3);
  };
}
function _classCallCheck(a4, n2) {
  if (!(a4 instanceof n2))
    throw new TypeError("Cannot call a class as a function");
}
function toPrimitive(t4, r2) {
  if ("object" != _typeof(t4) || !t4)
    return t4;
  var e3 = t4[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t4, r2 || "default");
    if ("object" != _typeof(i3))
      return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r2 ? String : Number)(t4);
}
function toPropertyKey(t4) {
  var i3 = toPrimitive(t4, "string");
  return "symbol" == _typeof(i3) ? i3 : i3 + "";
}
function _defineProperties(e3, r2) {
  for (var t4 = 0; t4 < r2.length; t4++) {
    var o2 = r2[t4];
    o2.enumerable = o2.enumerable || false, o2.configurable = true, "value" in o2 && (o2.writable = true), Object.defineProperty(e3, toPropertyKey(o2.key), o2);
  }
}
function _createClass(e3, r2, t4) {
  return r2 && _defineProperties(e3.prototype, r2), t4 && _defineProperties(e3, t4), Object.defineProperty(e3, "prototype", {
    writable: false
  }), e3;
}
function _defineProperty(e3, r2, t4) {
  return (r2 = toPropertyKey(r2)) in e3 ? Object.defineProperty(e3, r2, {
    value: t4,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e3[r2] = t4, e3;
}
var TIMEZONE_UNIT_PRIORITY = 10;
var Setter = /* @__PURE__ */ function() {
  function Setter2() {
    _classCallCheck(this, Setter2);
    _defineProperty(this, "priority", void 0);
    _defineProperty(this, "subPriority", 0);
  }
  _createClass(Setter2, [{
    key: "validate",
    value: function validate(_utcDate, _options) {
      return true;
    }
  }]);
  return Setter2;
}();
var ValueSetter = /* @__PURE__ */ function(_Setter) {
  _inherits(ValueSetter2, _Setter);
  var _super = _createSuper(ValueSetter2);
  function ValueSetter2(value, validateValue, setValue, priority, subPriority) {
    var _this;
    _classCallCheck(this, ValueSetter2);
    _this = _super.call(this);
    _this.value = value;
    _this.validateValue = validateValue;
    _this.setValue = setValue;
    _this.priority = priority;
    if (subPriority) {
      _this.subPriority = subPriority;
    }
    return _this;
  }
  _createClass(ValueSetter2, [{
    key: "validate",
    value: function validate(utcDate, options) {
      return this.validateValue(utcDate, this.value, options);
    }
  }, {
    key: "set",
    value: function set2(utcDate, flags, options) {
      return this.setValue(utcDate, flags, this.value, options);
    }
  }]);
  return ValueSetter2;
}(Setter);
var DateToSystemTimezoneSetter = /* @__PURE__ */ function(_Setter2) {
  _inherits(DateToSystemTimezoneSetter2, _Setter2);
  var _super2 = _createSuper(DateToSystemTimezoneSetter2);
  function DateToSystemTimezoneSetter2() {
    var _this2;
    _classCallCheck(this, DateToSystemTimezoneSetter2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this2 = _super2.call.apply(_super2, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this2), "priority", TIMEZONE_UNIT_PRIORITY);
    _defineProperty(_assertThisInitialized(_this2), "subPriority", -1);
    return _this2;
  }
  _createClass(DateToSystemTimezoneSetter2, [{
    key: "set",
    value: function set2(date, flags) {
      if (flags.timestampIsSet) {
        return date;
      }
      var convertedDate = /* @__PURE__ */ new Date(0);
      convertedDate.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      convertedDate.setHours(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
      return convertedDate;
    }
  }]);
  return DateToSystemTimezoneSetter2;
}(Setter);
var Parser = /* @__PURE__ */ function() {
  function Parser2() {
    _classCallCheck(this, Parser2);
    _defineProperty(this, "incompatibleTokens", void 0);
    _defineProperty(this, "priority", void 0);
    _defineProperty(this, "subPriority", void 0);
  }
  _createClass(Parser2, [{
    key: "run",
    value: function run(dateString, token, match2, options) {
      var result = this.parse(dateString, token, match2, options);
      if (!result) {
        return null;
      }
      return {
        setter: new ValueSetter(result.value, this.validate, this.set, this.priority, this.subPriority),
        rest: result.rest
      };
    }
  }, {
    key: "validate",
    value: function validate(_utcDate, _value, _options) {
      return true;
    }
  }]);
  return Parser2;
}();
var EraParser = /* @__PURE__ */ function(_Parser) {
  _inherits(EraParser2, _Parser);
  var _super = _createSuper(EraParser2);
  function EraParser2() {
    var _this;
    _classCallCheck(this, EraParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 140);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["R", "u", "t", "T"]);
    return _this;
  }
  _createClass(EraParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "G":
        case "GG":
        case "GGG":
          return match2.era(dateString, {
            width: "abbreviated"
          }) || match2.era(dateString, {
            width: "narrow"
          });
        case "GGGGG":
          return match2.era(dateString, {
            width: "narrow"
          });
        case "GGGG":
        default:
          return match2.era(dateString, {
            width: "wide"
          }) || match2.era(dateString, {
            width: "abbreviated"
          }) || match2.era(dateString, {
            width: "narrow"
          });
      }
    }
  }, {
    key: "set",
    value: function set2(date, flags, value) {
      flags.era = value;
      date.setUTCFullYear(value, 0, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return EraParser2;
}(Parser);
var numericPatterns = {
  month: /^(1[0-2]|0?\d)/,
  // 0 to 12
  date: /^(3[0-1]|[0-2]?\d)/,
  // 0 to 31
  dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
  // 0 to 366
  week: /^(5[0-3]|[0-4]?\d)/,
  // 0 to 53
  hour23h: /^(2[0-3]|[0-1]?\d)/,
  // 0 to 23
  hour24h: /^(2[0-4]|[0-1]?\d)/,
  // 0 to 24
  hour11h: /^(1[0-1]|0?\d)/,
  // 0 to 11
  hour12h: /^(1[0-2]|0?\d)/,
  // 0 to 12
  minute: /^[0-5]?\d/,
  // 0 to 59
  second: /^[0-5]?\d/,
  // 0 to 59
  singleDigit: /^\d/,
  // 0 to 9
  twoDigits: /^\d{1,2}/,
  // 0 to 99
  threeDigits: /^\d{1,3}/,
  // 0 to 999
  fourDigits: /^\d{1,4}/,
  // 0 to 9999
  anyDigitsSigned: /^-?\d+/,
  singleDigitSigned: /^-?\d/,
  // 0 to 9, -0 to -9
  twoDigitsSigned: /^-?\d{1,2}/,
  // 0 to 99, -0 to -99
  threeDigitsSigned: /^-?\d{1,3}/,
  // 0 to 999, -0 to -999
  fourDigitsSigned: /^-?\d{1,4}/
  // 0 to 9999, -0 to -9999
};
var timezonePatterns = {
  basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
  basic: /^([+-])(\d{2})(\d{2})|Z/,
  basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  extended: /^([+-])(\d{2}):(\d{2})|Z/,
  extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/
};
function mapValue(parseFnResult, mapFn) {
  if (!parseFnResult) {
    return parseFnResult;
  }
  return {
    value: mapFn(parseFnResult.value),
    rest: parseFnResult.rest
  };
}
function parseNumericPattern(pattern, dateString) {
  var matchResult = dateString.match(pattern);
  if (!matchResult) {
    return null;
  }
  return {
    value: parseInt(matchResult[0], 10),
    rest: dateString.slice(matchResult[0].length)
  };
}
function parseTimezonePattern(pattern, dateString) {
  var matchResult = dateString.match(pattern);
  if (!matchResult) {
    return null;
  }
  if (matchResult[0] === "Z") {
    return {
      value: 0,
      rest: dateString.slice(1)
    };
  }
  var sign = matchResult[1] === "+" ? 1 : -1;
  var hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
  var minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
  var seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;
  return {
    value: sign * (hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * millisecondsInSecond),
    rest: dateString.slice(matchResult[0].length)
  };
}
function parseAnyDigitsSigned(dateString) {
  return parseNumericPattern(numericPatterns.anyDigitsSigned, dateString);
}
function parseNDigits(n2, dateString) {
  switch (n2) {
    case 1:
      return parseNumericPattern(numericPatterns.singleDigit, dateString);
    case 2:
      return parseNumericPattern(numericPatterns.twoDigits, dateString);
    case 3:
      return parseNumericPattern(numericPatterns.threeDigits, dateString);
    case 4:
      return parseNumericPattern(numericPatterns.fourDigits, dateString);
    default:
      return parseNumericPattern(new RegExp("^\\d{1," + n2 + "}"), dateString);
  }
}
function parseNDigitsSigned(n2, dateString) {
  switch (n2) {
    case 1:
      return parseNumericPattern(numericPatterns.singleDigitSigned, dateString);
    case 2:
      return parseNumericPattern(numericPatterns.twoDigitsSigned, dateString);
    case 3:
      return parseNumericPattern(numericPatterns.threeDigitsSigned, dateString);
    case 4:
      return parseNumericPattern(numericPatterns.fourDigitsSigned, dateString);
    default:
      return parseNumericPattern(new RegExp("^-?\\d{1," + n2 + "}"), dateString);
  }
}
function dayPeriodEnumToHours(dayPeriod) {
  switch (dayPeriod) {
    case "morning":
      return 4;
    case "evening":
      return 17;
    case "pm":
    case "noon":
    case "afternoon":
      return 12;
    case "am":
    case "midnight":
    case "night":
    default:
      return 0;
  }
}
function normalizeTwoDigitYear(twoDigitYear, currentYear) {
  var isCommonEra = currentYear > 0;
  var absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;
  var result;
  if (absCurrentYear <= 50) {
    result = twoDigitYear || 100;
  } else {
    var rangeEnd = absCurrentYear + 50;
    var rangeEndCentury = Math.floor(rangeEnd / 100) * 100;
    var isPreviousCentury = twoDigitYear >= rangeEnd % 100;
    result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
  }
  return isCommonEra ? result : 1 - result;
}
function isLeapYearIndex(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
var YearParser = /* @__PURE__ */ function(_Parser) {
  _inherits(YearParser2, _Parser);
  var _super = _createSuper(YearParser2);
  function YearParser2() {
    var _this;
    _classCallCheck(this, YearParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["Y", "R", "u", "w", "I", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(YearParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      var valueCallback3 = function valueCallback4(year) {
        return {
          year,
          isTwoDigitYear: token === "yy"
        };
      };
      switch (token) {
        case "y":
          return mapValue(parseNDigits(4, dateString), valueCallback3);
        case "yo":
          return mapValue(match2.ordinalNumber(dateString, {
            unit: "year"
          }), valueCallback3);
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback3);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }
  }, {
    key: "set",
    value: function set2(date, flags, value) {
      var currentYear = date.getUTCFullYear();
      if (value.isTwoDigitYear) {
        var normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
        date.setUTCFullYear(normalizedTwoDigitYear, 0, 1);
        date.setUTCHours(0, 0, 0, 0);
        return date;
      }
      var year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setUTCFullYear(year, 0, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return YearParser2;
}(Parser);
var LocalWeekYearParser = /* @__PURE__ */ function(_Parser) {
  _inherits(LocalWeekYearParser2, _Parser);
  var _super = _createSuper(LocalWeekYearParser2);
  function LocalWeekYearParser2() {
    var _this;
    _classCallCheck(this, LocalWeekYearParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["y", "R", "u", "Q", "q", "M", "L", "I", "d", "D", "i", "t", "T"]);
    return _this;
  }
  _createClass(LocalWeekYearParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      var valueCallback3 = function valueCallback4(year) {
        return {
          year,
          isTwoDigitYear: token === "YY"
        };
      };
      switch (token) {
        case "Y":
          return mapValue(parseNDigits(4, dateString), valueCallback3);
        case "Yo":
          return mapValue(match2.ordinalNumber(dateString, {
            unit: "year"
          }), valueCallback3);
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback3);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }
  }, {
    key: "set",
    value: function set2(date, flags, value, options) {
      var currentYear = getUTCWeekYear(date, options);
      if (value.isTwoDigitYear) {
        var normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
        date.setUTCFullYear(normalizedTwoDigitYear, 0, options.firstWeekContainsDate);
        date.setUTCHours(0, 0, 0, 0);
        return startOfUTCWeek(date, options);
      }
      var year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setUTCFullYear(year, 0, options.firstWeekContainsDate);
      date.setUTCHours(0, 0, 0, 0);
      return startOfUTCWeek(date, options);
    }
  }]);
  return LocalWeekYearParser2;
}(Parser);
var ISOWeekYearParser = /* @__PURE__ */ function(_Parser) {
  _inherits(ISOWeekYearParser2, _Parser);
  var _super = _createSuper(ISOWeekYearParser2);
  function ISOWeekYearParser2() {
    var _this;
    _classCallCheck(this, ISOWeekYearParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["G", "y", "Y", "u", "Q", "q", "M", "L", "w", "d", "D", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(ISOWeekYearParser2, [{
    key: "parse",
    value: function parse2(dateString, token) {
      if (token === "R") {
        return parseNDigitsSigned(4, dateString);
      }
      return parseNDigitsSigned(token.length, dateString);
    }
  }, {
    key: "set",
    value: function set2(_date, _flags, value) {
      var firstWeekOfYear = /* @__PURE__ */ new Date(0);
      firstWeekOfYear.setUTCFullYear(value, 0, 4);
      firstWeekOfYear.setUTCHours(0, 0, 0, 0);
      return startOfUTCISOWeek(firstWeekOfYear);
    }
  }]);
  return ISOWeekYearParser2;
}(Parser);
var ExtendedYearParser = /* @__PURE__ */ function(_Parser) {
  _inherits(ExtendedYearParser2, _Parser);
  var _super = _createSuper(ExtendedYearParser2);
  function ExtendedYearParser2() {
    var _this;
    _classCallCheck(this, ExtendedYearParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["G", "y", "Y", "R", "w", "I", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(ExtendedYearParser2, [{
    key: "parse",
    value: function parse2(dateString, token) {
      if (token === "u") {
        return parseNDigitsSigned(4, dateString);
      }
      return parseNDigitsSigned(token.length, dateString);
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCFullYear(value, 0, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return ExtendedYearParser2;
}(Parser);
var QuarterParser = /* @__PURE__ */ function(_Parser) {
  _inherits(QuarterParser2, _Parser);
  var _super = _createSuper(QuarterParser2);
  function QuarterParser2() {
    var _this;
    _classCallCheck(this, QuarterParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 120);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["Y", "R", "q", "M", "L", "w", "I", "d", "D", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(QuarterParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "Q":
        case "QQ":
          return parseNDigits(token.length, dateString);
        case "Qo":
          return match2.ordinalNumber(dateString, {
            unit: "quarter"
          });
        case "QQQ":
          return match2.quarter(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "QQQQQ":
          return match2.quarter(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "QQQQ":
        default:
          return match2.quarter(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.quarter(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 4;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCMonth((value - 1) * 3, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return QuarterParser2;
}(Parser);
var StandAloneQuarterParser = /* @__PURE__ */ function(_Parser) {
  _inherits(StandAloneQuarterParser2, _Parser);
  var _super = _createSuper(StandAloneQuarterParser2);
  function StandAloneQuarterParser2() {
    var _this;
    _classCallCheck(this, StandAloneQuarterParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 120);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["Y", "R", "Q", "M", "L", "w", "I", "d", "D", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(StandAloneQuarterParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "q":
        case "qq":
          return parseNDigits(token.length, dateString);
        case "qo":
          return match2.ordinalNumber(dateString, {
            unit: "quarter"
          });
        case "qqq":
          return match2.quarter(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "standalone"
          });
        case "qqqqq":
          return match2.quarter(dateString, {
            width: "narrow",
            context: "standalone"
          });
        case "qqqq":
        default:
          return match2.quarter(dateString, {
            width: "wide",
            context: "standalone"
          }) || match2.quarter(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "standalone"
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 4;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCMonth((value - 1) * 3, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return StandAloneQuarterParser2;
}(Parser);
var MonthParser = /* @__PURE__ */ function(_Parser) {
  _inherits(MonthParser2, _Parser);
  var _super = _createSuper(MonthParser2);
  function MonthParser2() {
    var _this;
    _classCallCheck(this, MonthParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["Y", "R", "q", "Q", "L", "w", "I", "D", "i", "e", "c", "t", "T"]);
    _defineProperty(_assertThisInitialized(_this), "priority", 110);
    return _this;
  }
  _createClass(MonthParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      var valueCallback3 = function valueCallback4(value) {
        return value - 1;
      };
      switch (token) {
        case "M":
          return mapValue(parseNumericPattern(numericPatterns.month, dateString), valueCallback3);
        case "MM":
          return mapValue(parseNDigits(2, dateString), valueCallback3);
        case "Mo":
          return mapValue(match2.ordinalNumber(dateString, {
            unit: "month"
          }), valueCallback3);
        case "MMM":
          return match2.month(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.month(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "MMMMM":
          return match2.month(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "MMMM":
        default:
          return match2.month(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.month(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.month(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 11;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCMonth(value, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return MonthParser2;
}(Parser);
var StandAloneMonthParser = /* @__PURE__ */ function(_Parser) {
  _inherits(StandAloneMonthParser2, _Parser);
  var _super = _createSuper(StandAloneMonthParser2);
  function StandAloneMonthParser2() {
    var _this;
    _classCallCheck(this, StandAloneMonthParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 110);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["Y", "R", "q", "Q", "M", "w", "I", "D", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(StandAloneMonthParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      var valueCallback3 = function valueCallback4(value) {
        return value - 1;
      };
      switch (token) {
        case "L":
          return mapValue(parseNumericPattern(numericPatterns.month, dateString), valueCallback3);
        case "LL":
          return mapValue(parseNDigits(2, dateString), valueCallback3);
        case "Lo":
          return mapValue(match2.ordinalNumber(dateString, {
            unit: "month"
          }), valueCallback3);
        case "LLL":
          return match2.month(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.month(dateString, {
            width: "narrow",
            context: "standalone"
          });
        case "LLLLL":
          return match2.month(dateString, {
            width: "narrow",
            context: "standalone"
          });
        case "LLLL":
        default:
          return match2.month(dateString, {
            width: "wide",
            context: "standalone"
          }) || match2.month(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.month(dateString, {
            width: "narrow",
            context: "standalone"
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 11;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCMonth(value, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return StandAloneMonthParser2;
}(Parser);
function setUTCWeek(dirtyDate, dirtyWeek, options) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var week = toInteger(dirtyWeek);
  var diff = getUTCWeek(date, options) - week;
  date.setUTCDate(date.getUTCDate() - diff * 7);
  return date;
}
var LocalWeekParser = /* @__PURE__ */ function(_Parser) {
  _inherits(LocalWeekParser2, _Parser);
  var _super = _createSuper(LocalWeekParser2);
  function LocalWeekParser2() {
    var _this;
    _classCallCheck(this, LocalWeekParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 100);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["y", "R", "u", "q", "Q", "M", "L", "I", "d", "D", "i", "t", "T"]);
    return _this;
  }
  _createClass(LocalWeekParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "w":
          return parseNumericPattern(numericPatterns.week, dateString);
        case "wo":
          return match2.ordinalNumber(dateString, {
            unit: "week"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 53;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value, options) {
      return startOfUTCWeek(setUTCWeek(date, value, options), options);
    }
  }]);
  return LocalWeekParser2;
}(Parser);
function setUTCISOWeek(dirtyDate, dirtyISOWeek) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var isoWeek = toInteger(dirtyISOWeek);
  var diff = getUTCISOWeek(date) - isoWeek;
  date.setUTCDate(date.getUTCDate() - diff * 7);
  return date;
}
var ISOWeekParser = /* @__PURE__ */ function(_Parser) {
  _inherits(ISOWeekParser2, _Parser);
  var _super = _createSuper(ISOWeekParser2);
  function ISOWeekParser2() {
    var _this;
    _classCallCheck(this, ISOWeekParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 100);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["y", "Y", "u", "q", "Q", "M", "L", "w", "d", "D", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(ISOWeekParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "I":
          return parseNumericPattern(numericPatterns.week, dateString);
        case "Io":
          return match2.ordinalNumber(dateString, {
            unit: "week"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 53;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      return startOfUTCISOWeek(setUTCISOWeek(date, value));
    }
  }]);
  return ISOWeekParser2;
}(Parser);
var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DAYS_IN_MONTH_LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DateParser = /* @__PURE__ */ function(_Parser) {
  _inherits(DateParser2, _Parser);
  var _super = _createSuper(DateParser2);
  function DateParser2() {
    var _this;
    _classCallCheck(this, DateParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "subPriority", 1);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["Y", "R", "q", "Q", "w", "I", "D", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(DateParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "d":
          return parseNumericPattern(numericPatterns.date, dateString);
        case "do":
          return match2.ordinalNumber(dateString, {
            unit: "date"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(date, value) {
      var year = date.getUTCFullYear();
      var isLeapYear = isLeapYearIndex(year);
      var month = date.getUTCMonth();
      if (isLeapYear) {
        return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
      } else {
        return value >= 1 && value <= DAYS_IN_MONTH[month];
      }
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCDate(value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return DateParser2;
}(Parser);
var DayOfYearParser = /* @__PURE__ */ function(_Parser) {
  _inherits(DayOfYearParser2, _Parser);
  var _super = _createSuper(DayOfYearParser2);
  function DayOfYearParser2() {
    var _this;
    _classCallCheck(this, DayOfYearParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "subpriority", 1);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["Y", "R", "q", "Q", "M", "L", "w", "I", "d", "E", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(DayOfYearParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "D":
        case "DD":
          return parseNumericPattern(numericPatterns.dayOfYear, dateString);
        case "Do":
          return match2.ordinalNumber(dateString, {
            unit: "date"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(date, value) {
      var year = date.getUTCFullYear();
      var isLeapYear = isLeapYearIndex(year);
      if (isLeapYear) {
        return value >= 1 && value <= 366;
      } else {
        return value >= 1 && value <= 365;
      }
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCMonth(0, value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return DayOfYearParser2;
}(Parser);
function setUTCDay(dirtyDate, dirtyDay, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(2, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = toInteger(dirtyDay);
  var currentDay = date.getUTCDay();
  var remainder = day % 7;
  var dayIndex = (remainder + 7) % 7;
  var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
var DayParser = /* @__PURE__ */ function(_Parser) {
  _inherits(DayParser2, _Parser);
  var _super = _createSuper(DayParser2);
  function DayParser2() {
    var _this;
    _classCallCheck(this, DayParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["D", "i", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(DayParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "E":
        case "EE":
        case "EEE":
          return match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "EEEEE":
          return match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "EEEEEE":
          return match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "EEEE":
        default:
          return match2.day(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 6;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value, options) {
      date = setUTCDay(date, value, options);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return DayParser2;
}(Parser);
var LocalDayParser = /* @__PURE__ */ function(_Parser) {
  _inherits(LocalDayParser2, _Parser);
  var _super = _createSuper(LocalDayParser2);
  function LocalDayParser2() {
    var _this;
    _classCallCheck(this, LocalDayParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["y", "R", "u", "q", "Q", "M", "L", "I", "d", "D", "E", "i", "c", "t", "T"]);
    return _this;
  }
  _createClass(LocalDayParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2, options) {
      var valueCallback3 = function valueCallback4(value) {
        var wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
      };
      switch (token) {
        case "e":
        case "ee":
          return mapValue(parseNDigits(token.length, dateString), valueCallback3);
        case "eo":
          return mapValue(match2.ordinalNumber(dateString, {
            unit: "day"
          }), valueCallback3);
        case "eee":
          return match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "eeeee":
          return match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "eeeeee":
          return match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "eeee":
        default:
          return match2.day(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 6;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value, options) {
      date = setUTCDay(date, value, options);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return LocalDayParser2;
}(Parser);
var StandAloneLocalDayParser = /* @__PURE__ */ function(_Parser) {
  _inherits(StandAloneLocalDayParser2, _Parser);
  var _super = _createSuper(StandAloneLocalDayParser2);
  function StandAloneLocalDayParser2() {
    var _this;
    _classCallCheck(this, StandAloneLocalDayParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["y", "R", "u", "q", "Q", "M", "L", "I", "d", "D", "E", "i", "e", "t", "T"]);
    return _this;
  }
  _createClass(StandAloneLocalDayParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2, options) {
      var valueCallback3 = function valueCallback4(value) {
        var wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
      };
      switch (token) {
        case "c":
        case "cc":
          return mapValue(parseNDigits(token.length, dateString), valueCallback3);
        case "co":
          return mapValue(match2.ordinalNumber(dateString, {
            unit: "day"
          }), valueCallback3);
        case "ccc":
          return match2.day(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.day(dateString, {
            width: "short",
            context: "standalone"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "standalone"
          });
        case "ccccc":
          return match2.day(dateString, {
            width: "narrow",
            context: "standalone"
          });
        case "cccccc":
          return match2.day(dateString, {
            width: "short",
            context: "standalone"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "standalone"
          });
        case "cccc":
        default:
          return match2.day(dateString, {
            width: "wide",
            context: "standalone"
          }) || match2.day(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.day(dateString, {
            width: "short",
            context: "standalone"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "standalone"
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 6;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value, options) {
      date = setUTCDay(date, value, options);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return StandAloneLocalDayParser2;
}(Parser);
function setUTCISODay(dirtyDate, dirtyDay) {
  requiredArgs(2, arguments);
  var day = toInteger(dirtyDay);
  if (day % 7 === 0) {
    day = day - 7;
  }
  var weekStartsOn = 1;
  var date = toDate(dirtyDate);
  var currentDay = date.getUTCDay();
  var remainder = day % 7;
  var dayIndex = (remainder + 7) % 7;
  var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
var ISODayParser = /* @__PURE__ */ function(_Parser) {
  _inherits(ISODayParser2, _Parser);
  var _super = _createSuper(ISODayParser2);
  function ISODayParser2() {
    var _this;
    _classCallCheck(this, ISODayParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["y", "Y", "u", "q", "Q", "M", "L", "w", "d", "D", "E", "e", "c", "t", "T"]);
    return _this;
  }
  _createClass(ISODayParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      var valueCallback3 = function valueCallback4(value) {
        if (value === 0) {
          return 7;
        }
        return value;
      };
      switch (token) {
        case "i":
        case "ii":
          return parseNDigits(token.length, dateString);
        case "io":
          return match2.ordinalNumber(dateString, {
            unit: "day"
          });
        case "iii":
          return mapValue(match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }), valueCallback3);
        case "iiiii":
          return mapValue(match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }), valueCallback3);
        case "iiiiii":
          return mapValue(match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }), valueCallback3);
        case "iiii":
        default:
          return mapValue(match2.day(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }), valueCallback3);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 7;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date = setUTCISODay(date, value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return ISODayParser2;
}(Parser);
var AMPMParser = /* @__PURE__ */ function(_Parser) {
  _inherits(AMPMParser2, _Parser);
  var _super = _createSuper(AMPMParser2);
  function AMPMParser2() {
    var _this;
    _classCallCheck(this, AMPMParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 80);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["b", "B", "H", "k", "t", "T"]);
    return _this;
  }
  _createClass(AMPMParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "a":
        case "aa":
        case "aaa":
          return match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaaa":
          return match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaa":
        default:
          return match2.dayPeriod(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
  }]);
  return AMPMParser2;
}(Parser);
var AMPMMidnightParser = /* @__PURE__ */ function(_Parser) {
  _inherits(AMPMMidnightParser2, _Parser);
  var _super = _createSuper(AMPMMidnightParser2);
  function AMPMMidnightParser2() {
    var _this;
    _classCallCheck(this, AMPMMidnightParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 80);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["a", "B", "H", "k", "t", "T"]);
    return _this;
  }
  _createClass(AMPMMidnightParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "b":
        case "bb":
        case "bbb":
          return match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbbb":
          return match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbb":
        default:
          return match2.dayPeriod(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
  }]);
  return AMPMMidnightParser2;
}(Parser);
var DayPeriodParser = /* @__PURE__ */ function(_Parser) {
  _inherits(DayPeriodParser2, _Parser);
  var _super = _createSuper(DayPeriodParser2);
  function DayPeriodParser2() {
    var _this;
    _classCallCheck(this, DayPeriodParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 80);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["a", "b", "t", "T"]);
    return _this;
  }
  _createClass(DayPeriodParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBBB":
          return match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBB":
        default:
          return match2.dayPeriod(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
  }]);
  return DayPeriodParser2;
}(Parser);
var Hour1to12Parser = /* @__PURE__ */ function(_Parser) {
  _inherits(Hour1to12Parser2, _Parser);
  var _super = _createSuper(Hour1to12Parser2);
  function Hour1to12Parser2() {
    var _this;
    _classCallCheck(this, Hour1to12Parser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["H", "K", "k", "t", "T"]);
    return _this;
  }
  _createClass(Hour1to12Parser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "h":
          return parseNumericPattern(numericPatterns.hour12h, dateString);
        case "ho":
          return match2.ordinalNumber(dateString, {
            unit: "hour"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 12;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      var isPM = date.getUTCHours() >= 12;
      if (isPM && value < 12) {
        date.setUTCHours(value + 12, 0, 0, 0);
      } else if (!isPM && value === 12) {
        date.setUTCHours(0, 0, 0, 0);
      } else {
        date.setUTCHours(value, 0, 0, 0);
      }
      return date;
    }
  }]);
  return Hour1to12Parser2;
}(Parser);
var Hour0to23Parser = /* @__PURE__ */ function(_Parser) {
  _inherits(Hour0to23Parser2, _Parser);
  var _super = _createSuper(Hour0to23Parser2);
  function Hour0to23Parser2() {
    var _this;
    _classCallCheck(this, Hour0to23Parser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["a", "b", "h", "K", "k", "t", "T"]);
    return _this;
  }
  _createClass(Hour0to23Parser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "H":
          return parseNumericPattern(numericPatterns.hour23h, dateString);
        case "Ho":
          return match2.ordinalNumber(dateString, {
            unit: "hour"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 23;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCHours(value, 0, 0, 0);
      return date;
    }
  }]);
  return Hour0to23Parser2;
}(Parser);
var Hour0To11Parser = /* @__PURE__ */ function(_Parser) {
  _inherits(Hour0To11Parser2, _Parser);
  var _super = _createSuper(Hour0To11Parser2);
  function Hour0To11Parser2() {
    var _this;
    _classCallCheck(this, Hour0To11Parser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["h", "H", "k", "t", "T"]);
    return _this;
  }
  _createClass(Hour0To11Parser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "K":
          return parseNumericPattern(numericPatterns.hour11h, dateString);
        case "Ko":
          return match2.ordinalNumber(dateString, {
            unit: "hour"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 11;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      var isPM = date.getUTCHours() >= 12;
      if (isPM && value < 12) {
        date.setUTCHours(value + 12, 0, 0, 0);
      } else {
        date.setUTCHours(value, 0, 0, 0);
      }
      return date;
    }
  }]);
  return Hour0To11Parser2;
}(Parser);
var Hour1To24Parser = /* @__PURE__ */ function(_Parser) {
  _inherits(Hour1To24Parser2, _Parser);
  var _super = _createSuper(Hour1To24Parser2);
  function Hour1To24Parser2() {
    var _this;
    _classCallCheck(this, Hour1To24Parser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["a", "b", "h", "H", "K", "t", "T"]);
    return _this;
  }
  _createClass(Hour1To24Parser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "k":
          return parseNumericPattern(numericPatterns.hour24h, dateString);
        case "ko":
          return match2.ordinalNumber(dateString, {
            unit: "hour"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 24;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      var hours = value <= 24 ? value % 24 : value;
      date.setUTCHours(hours, 0, 0, 0);
      return date;
    }
  }]);
  return Hour1To24Parser2;
}(Parser);
var MinuteParser = /* @__PURE__ */ function(_Parser) {
  _inherits(MinuteParser2, _Parser);
  var _super = _createSuper(MinuteParser2);
  function MinuteParser2() {
    var _this;
    _classCallCheck(this, MinuteParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 60);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["t", "T"]);
    return _this;
  }
  _createClass(MinuteParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "m":
          return parseNumericPattern(numericPatterns.minute, dateString);
        case "mo":
          return match2.ordinalNumber(dateString, {
            unit: "minute"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 59;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCMinutes(value, 0, 0);
      return date;
    }
  }]);
  return MinuteParser2;
}(Parser);
var SecondParser = /* @__PURE__ */ function(_Parser) {
  _inherits(SecondParser2, _Parser);
  var _super = _createSuper(SecondParser2);
  function SecondParser2() {
    var _this;
    _classCallCheck(this, SecondParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 50);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["t", "T"]);
    return _this;
  }
  _createClass(SecondParser2, [{
    key: "parse",
    value: function parse2(dateString, token, match2) {
      switch (token) {
        case "s":
          return parseNumericPattern(numericPatterns.second, dateString);
        case "so":
          return match2.ordinalNumber(dateString, {
            unit: "second"
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 59;
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCSeconds(value, 0);
      return date;
    }
  }]);
  return SecondParser2;
}(Parser);
var FractionOfSecondParser = /* @__PURE__ */ function(_Parser) {
  _inherits(FractionOfSecondParser2, _Parser);
  var _super = _createSuper(FractionOfSecondParser2);
  function FractionOfSecondParser2() {
    var _this;
    _classCallCheck(this, FractionOfSecondParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 30);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["t", "T"]);
    return _this;
  }
  _createClass(FractionOfSecondParser2, [{
    key: "parse",
    value: function parse2(dateString, token) {
      var valueCallback3 = function valueCallback4(value) {
        return Math.floor(value * Math.pow(10, -token.length + 3));
      };
      return mapValue(parseNDigits(token.length, dateString), valueCallback3);
    }
  }, {
    key: "set",
    value: function set2(date, _flags, value) {
      date.setUTCMilliseconds(value);
      return date;
    }
  }]);
  return FractionOfSecondParser2;
}(Parser);
var ISOTimezoneWithZParser = /* @__PURE__ */ function(_Parser) {
  _inherits(ISOTimezoneWithZParser2, _Parser);
  var _super = _createSuper(ISOTimezoneWithZParser2);
  function ISOTimezoneWithZParser2() {
    var _this;
    _classCallCheck(this, ISOTimezoneWithZParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 10);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["t", "T", "x"]);
    return _this;
  }
  _createClass(ISOTimezoneWithZParser2, [{
    key: "parse",
    value: function parse2(dateString, token) {
      switch (token) {
        case "X":
          return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, dateString);
        case "XX":
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case "XXXX":
          return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, dateString);
        case "XXXXX":
          return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, dateString);
        case "XXX":
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }
  }, {
    key: "set",
    value: function set2(date, flags, value) {
      if (flags.timestampIsSet) {
        return date;
      }
      return new Date(date.getTime() - value);
    }
  }]);
  return ISOTimezoneWithZParser2;
}(Parser);
var ISOTimezoneParser = /* @__PURE__ */ function(_Parser) {
  _inherits(ISOTimezoneParser2, _Parser);
  var _super = _createSuper(ISOTimezoneParser2);
  function ISOTimezoneParser2() {
    var _this;
    _classCallCheck(this, ISOTimezoneParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 10);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ["t", "T", "X"]);
    return _this;
  }
  _createClass(ISOTimezoneParser2, [{
    key: "parse",
    value: function parse2(dateString, token) {
      switch (token) {
        case "x":
          return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, dateString);
        case "xx":
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case "xxxx":
          return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, dateString);
        case "xxxxx":
          return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, dateString);
        case "xxx":
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }
  }, {
    key: "set",
    value: function set2(date, flags, value) {
      if (flags.timestampIsSet) {
        return date;
      }
      return new Date(date.getTime() - value);
    }
  }]);
  return ISOTimezoneParser2;
}(Parser);
var TimestampSecondsParser = /* @__PURE__ */ function(_Parser) {
  _inherits(TimestampSecondsParser2, _Parser);
  var _super = _createSuper(TimestampSecondsParser2);
  function TimestampSecondsParser2() {
    var _this;
    _classCallCheck(this, TimestampSecondsParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 40);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", "*");
    return _this;
  }
  _createClass(TimestampSecondsParser2, [{
    key: "parse",
    value: function parse2(dateString) {
      return parseAnyDigitsSigned(dateString);
    }
  }, {
    key: "set",
    value: function set2(_date, _flags, value) {
      return [new Date(value * 1e3), {
        timestampIsSet: true
      }];
    }
  }]);
  return TimestampSecondsParser2;
}(Parser);
var TimestampMillisecondsParser = /* @__PURE__ */ function(_Parser) {
  _inherits(TimestampMillisecondsParser2, _Parser);
  var _super = _createSuper(TimestampMillisecondsParser2);
  function TimestampMillisecondsParser2() {
    var _this;
    _classCallCheck(this, TimestampMillisecondsParser2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 20);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", "*");
    return _this;
  }
  _createClass(TimestampMillisecondsParser2, [{
    key: "parse",
    value: function parse2(dateString) {
      return parseAnyDigitsSigned(dateString);
    }
  }, {
    key: "set",
    value: function set2(_date, _flags, value) {
      return [new Date(value), {
        timestampIsSet: true
      }];
    }
  }]);
  return TimestampMillisecondsParser2;
}(Parser);
var parsers = {
  G: new EraParser(),
  y: new YearParser(),
  Y: new LocalWeekYearParser(),
  R: new ISOWeekYearParser(),
  u: new ExtendedYearParser(),
  Q: new QuarterParser(),
  q: new StandAloneQuarterParser(),
  M: new MonthParser(),
  L: new StandAloneMonthParser(),
  w: new LocalWeekParser(),
  I: new ISOWeekParser(),
  d: new DateParser(),
  D: new DayOfYearParser(),
  E: new DayParser(),
  e: new LocalDayParser(),
  c: new StandAloneLocalDayParser(),
  i: new ISODayParser(),
  a: new AMPMParser(),
  b: new AMPMMidnightParser(),
  B: new DayPeriodParser(),
  h: new Hour1to12Parser(),
  H: new Hour0to23Parser(),
  K: new Hour0To11Parser(),
  k: new Hour1To24Parser(),
  m: new MinuteParser(),
  s: new SecondParser(),
  S: new FractionOfSecondParser(),
  X: new ISOTimezoneWithZParser(),
  x: new ISOTimezoneParser(),
  t: new TimestampSecondsParser(),
  T: new TimestampMillisecondsParser()
};
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var notWhitespaceRegExp = /\S/;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function parse(dirtyDateString, dirtyFormatString, dirtyReferenceDate, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _options$locale2, _options$locale2$opti, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _options$locale3, _options$locale3$opti, _defaultOptions$local3, _defaultOptions$local4;
  requiredArgs(3, arguments);
  var dateString = String(dirtyDateString);
  var formatString = String(dirtyFormatString);
  var defaultOptions2 = getDefaultOptions();
  var locale2 = (_ref = (_options$locale = options === null || options === void 0 ? void 0 : options.locale) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions2.locale) !== null && _ref !== void 0 ? _ref : defaultLocale;
  if (!locale2.match) {
    throw new RangeError("locale must contain match property");
  }
  var firstWeekContainsDate = toInteger((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale2 = options.locale) === null || _options$locale2 === void 0 ? void 0 : (_options$locale2$opti = _options$locale2.options) === null || _options$locale2$opti === void 0 ? void 0 : _options$locale2$opti.firstWeekContainsDate) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions2.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var weekStartsOn = toInteger((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale3 = options.locale) === null || _options$locale3 === void 0 ? void 0 : (_options$locale3$opti = _options$locale3.options) === null || _options$locale3$opti === void 0 ? void 0 : _options$locale3$opti.weekStartsOn) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions2.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions2.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  if (formatString === "") {
    if (dateString === "") {
      return toDate(dirtyReferenceDate);
    } else {
      return /* @__PURE__ */ new Date(NaN);
    }
  }
  var subFnOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale: locale2
  };
  var setters = [new DateToSystemTimezoneSetter()];
  var tokens = formatString.match(longFormattingTokensRegExp).map(function(substring) {
    var firstCharacter = substring[0];
    if (firstCharacter in longFormatters$1) {
      var longFormatter = longFormatters$1[firstCharacter];
      return longFormatter(substring, locale2.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp);
  var usedTokens = [];
  var _iterator = _createForOfIteratorHelper(tokens), _step;
  try {
    var _loop = function _loop2() {
      var token = _step.value;
      if (!(options !== null && options !== void 0 && options.useAdditionalWeekYearTokens) && isProtectedWeekYearToken(token)) {
        throwProtectedError(token, formatString, dirtyDateString);
      }
      if (!(options !== null && options !== void 0 && options.useAdditionalDayOfYearTokens) && isProtectedDayOfYearToken(token)) {
        throwProtectedError(token, formatString, dirtyDateString);
      }
      var firstCharacter = token[0];
      var parser = parsers[firstCharacter];
      if (parser) {
        var incompatibleTokens = parser.incompatibleTokens;
        if (Array.isArray(incompatibleTokens)) {
          var incompatibleToken = usedTokens.find(function(usedToken) {
            return incompatibleTokens.includes(usedToken.token) || usedToken.token === firstCharacter;
          });
          if (incompatibleToken) {
            throw new RangeError("The format string mustn't contain `".concat(incompatibleToken.fullToken, "` and `").concat(token, "` at the same time"));
          }
        } else if (parser.incompatibleTokens === "*" && usedTokens.length > 0) {
          throw new RangeError("The format string mustn't contain `".concat(token, "` and any other token at the same time"));
        }
        usedTokens.push({
          token: firstCharacter,
          fullToken: token
        });
        var parseResult = parser.run(dateString, token, locale2.match, subFnOptions);
        if (!parseResult) {
          return {
            v: /* @__PURE__ */ new Date(NaN)
          };
        }
        setters.push(parseResult.setter);
        dateString = parseResult.rest;
      } else {
        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
        }
        if (token === "''") {
          token = "'";
        } else if (firstCharacter === "'") {
          token = cleanEscapedString(token);
        }
        if (dateString.indexOf(token) === 0) {
          dateString = dateString.slice(token.length);
        } else {
          return {
            v: /* @__PURE__ */ new Date(NaN)
          };
        }
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var _ret = _loop();
      if (_typeof(_ret) === "object")
        return _ret.v;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (dateString.length > 0 && notWhitespaceRegExp.test(dateString)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  var uniquePrioritySetters = setters.map(function(setter2) {
    return setter2.priority;
  }).sort(function(a4, b3) {
    return b3 - a4;
  }).filter(function(priority, index, array) {
    return array.indexOf(priority) === index;
  }).map(function(priority) {
    return setters.filter(function(setter2) {
      return setter2.priority === priority;
    }).sort(function(a4, b3) {
      return b3.subPriority - a4.subPriority;
    });
  }).map(function(setterArray) {
    return setterArray[0];
  });
  var date = toDate(dirtyReferenceDate);
  if (isNaN(date.getTime())) {
    return /* @__PURE__ */ new Date(NaN);
  }
  var utcDate = subMilliseconds(date, getTimezoneOffsetInMilliseconds(date));
  var flags = {};
  var _iterator2 = _createForOfIteratorHelper(uniquePrioritySetters), _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
      var setter = _step2.value;
      if (!setter.validate(utcDate, subFnOptions)) {
        return /* @__PURE__ */ new Date(NaN);
      }
      var result = setter.set(utcDate, flags, subFnOptions);
      if (Array.isArray(result)) {
        utcDate = result[0];
        assign$1(flags, result[1]);
      } else {
        utcDate = result;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return utcDate;
}
function cleanEscapedString(input) {
  return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
}
function startOfHour(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setMinutes(0, 0, 0);
  return date;
}
function isSameHour(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeftStartOfHour = startOfHour(dirtyDateLeft);
  var dateRightStartOfHour = startOfHour(dirtyDateRight);
  return dateLeftStartOfHour.getTime() === dateRightStartOfHour.getTime();
}
function isSameMinute(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeftStartOfMinute = startOfMinute(dirtyDateLeft);
  var dateRightStartOfMinute = startOfMinute(dirtyDateRight);
  return dateLeftStartOfMinute.getTime() === dateRightStartOfMinute.getTime();
}
function isSameMonth(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeft = toDate(dirtyDateLeft);
  var dateRight = toDate(dirtyDateRight);
  return dateLeft.getFullYear() === dateRight.getFullYear() && dateLeft.getMonth() === dateRight.getMonth();
}
function isSameYear(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeft = toDate(dirtyDateLeft);
  var dateRight = toDate(dirtyDateRight);
  return dateLeft.getFullYear() === dateRight.getFullYear();
}
function isWithinInterval(dirtyDate, interval) {
  requiredArgs(2, arguments);
  var time = toDate(dirtyDate).getTime();
  var startTime = toDate(interval.start).getTime();
  var endTime = toDate(interval.end).getTime();
  if (!(startTime <= endTime)) {
    throw new RangeError("Invalid interval");
  }
  return time >= startTime && time <= endTime;
}
function subDays(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addDays(dirtyDate, -amount);
}
function setMonth(dirtyDate, dirtyMonth) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var month = toInteger(dirtyMonth);
  var year = date.getFullYear();
  var day = date.getDate();
  var dateWithDesiredMonth = /* @__PURE__ */ new Date(0);
  dateWithDesiredMonth.setFullYear(year, month, 15);
  dateWithDesiredMonth.setHours(0, 0, 0, 0);
  var daysInMonth = getDaysInMonth(dateWithDesiredMonth);
  date.setMonth(month, Math.min(day, daysInMonth));
  return date;
}
function set(dirtyDate, values) {
  requiredArgs(2, arguments);
  if (_typeof(values) !== "object" || values === null) {
    throw new RangeError("values parameter must be an object");
  }
  var date = toDate(dirtyDate);
  if (isNaN(date.getTime())) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (values.year != null) {
    date.setFullYear(values.year);
  }
  if (values.month != null) {
    date = setMonth(date, values.month);
  }
  if (values.date != null) {
    date.setDate(toInteger(values.date));
  }
  if (values.hours != null) {
    date.setHours(toInteger(values.hours));
  }
  if (values.minutes != null) {
    date.setMinutes(toInteger(values.minutes));
  }
  if (values.seconds != null) {
    date.setSeconds(toInteger(values.seconds));
  }
  if (values.milliseconds != null) {
    date.setMilliseconds(toInteger(values.milliseconds));
  }
  return date;
}
function setDay(dirtyDate, dirtyDay, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(2, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = toInteger(dirtyDay);
  var currentDay = date.getDay();
  var remainder = day % 7;
  var dayIndex = (remainder + 7) % 7;
  var delta = 7 - weekStartsOn;
  var diff = day < 0 || day > 6 ? day - (currentDay + delta) % 7 : (dayIndex + delta) % 7 - (currentDay + delta) % 7;
  return addDays(date, diff);
}
function startOfDecade(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getFullYear();
  var decade = Math.floor(year / 10) * 10;
  date.setFullYear(decade, 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
function subMonths(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMonths(dirtyDate, -amount);
}
function subYears(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addYears(dirtyDate, -amount);
}
class ApplicationInfo {
  /**
   * Creates a new ApplicationInfo instance.
   * @param {Partial<ApplicationInfo>} [$$source = {}] - The source object to create the ApplicationInfo.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new ApplicationInfo instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {ApplicationInfo}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new ApplicationInfo(
      /** @type {Partial<ApplicationInfo>} */
      $$parsedSource
    );
  }
}
class Capture {
  /**
   * Creates a new Capture instance.
   * @param {Partial<Capture>} [$$source = {}] - The source object to create the Capture.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new Capture instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {Capture}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new Capture(
      /** @type {Partial<Capture>} */
      $$parsedSource
    );
  }
}
class CaptureDaySummary {
  /**
   * Creates a new CaptureDaySummary instance.
   * @param {Partial<CaptureDaySummary>} [$$source = {}] - The source object to create the CaptureDaySummary.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new CaptureDaySummary instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {CaptureDaySummary}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new CaptureDaySummary(
      /** @type {Partial<CaptureDaySummary>} */
      $$parsedSource
    );
  }
}
class CapturedDay {
  /**
   * Creates a new CapturedDay instance.
   * @param {Partial<CapturedDay>} [$$source = {}] - The source object to create the CapturedDay.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new CapturedDay instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {CapturedDay}
   */
  static createFrom($$source = {}) {
    const $$createField1_0 = $$createType2$1;
    const $$createField2_0 = $$createType4;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Captures" in $$parsedSource) {
      $$parsedSource["Captures"] = $$createField1_0($$parsedSource["Captures"]);
    }
    if ("Summary" in $$parsedSource) {
      $$parsedSource["Summary"] = $$createField2_0($$parsedSource["Summary"]);
    }
    return new CapturedDay(
      /** @type {Partial<CapturedDay>} */
      $$parsedSource
    );
  }
}
class OcrFull {
  /**
   * Creates a new OcrFull instance.
   * @param {Partial<OcrFull>} [$$source = {}] - The source object to create the OcrFull.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new OcrFull instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {OcrFull}
   */
  static createFrom($$source = {}) {
    const $$createField0_0 = $$createType9$1;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Meta" in $$parsedSource) {
      $$parsedSource["Meta"] = $$createField0_0($$parsedSource["Meta"]);
    }
    return new OcrFull(
      /** @type {Partial<OcrFull>} */
      $$parsedSource
    );
  }
}
class OcrMeta {
  /**
   * Creates a new OcrMeta instance.
   * @param {Partial<OcrMeta>} [$$source = {}] - The source object to create the OcrMeta.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new OcrMeta instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {OcrMeta}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new OcrMeta(
      /** @type {Partial<OcrMeta>} */
      $$parsedSource
    );
  }
}
class Settings {
  /**
   * Creates a new Settings instance.
   * @param {Partial<Settings>} [$$source = {}] - The source object to create the Settings.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new Settings instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {Settings}
   */
  static createFrom($$source = {}) {
    const $$createField2_0 = $$createType6$1;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Rejections" in $$parsedSource) {
      $$parsedSource["Rejections"] = $$createField2_0($$parsedSource["Rejections"]);
    }
    return new Settings(
      /** @type {Partial<Settings>} */
      $$parsedSource
    );
  }
}
class SettingsOptions {
  /**
   * Creates a new SettingsOptions instance.
   * @param {Partial<SettingsOptions>} [$$source = {}] - The source object to create the SettingsOptions.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new SettingsOptions instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {SettingsOptions}
   */
  static createFrom($$source = {}) {
    const $$createField0_0 = $$createType12;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("CapturedApplications" in $$parsedSource) {
      $$parsedSource["CapturedApplications"] = $$createField0_0($$parsedSource["CapturedApplications"]);
    }
    return new SettingsOptions(
      /** @type {Partial<SettingsOptions>} */
      $$parsedSource
    );
  }
}
class SettingsPlusOptions {
  /**
   * Creates a new SettingsPlusOptions instance.
   * @param {Partial<SettingsPlusOptions>} [$$source = {}] - The source object to create the SettingsPlusOptions.
   */
  constructor($$source = {}) {
    Object.assign(this, $$source);
  }
  /**
   * Creates a new SettingsPlusOptions instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {SettingsPlusOptions}
   */
  static createFrom($$source = {}) {
    const $$createField0_0 = $$createType14;
    const $$createField1_0 = $$createType16;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Settings" in $$parsedSource) {
      $$parsedSource["Settings"] = $$createField0_0($$parsedSource["Settings"]);
    }
    if ("SettingsOptions" in $$parsedSource) {
      $$parsedSource["SettingsOptions"] = $$createField1_0($$parsedSource["SettingsOptions"]);
    }
    return new SettingsPlusOptions(
      /** @type {Partial<SettingsPlusOptions>} */
      $$parsedSource
    );
  }
}
const $$createType0 = Capture.createFrom;
const $$createType1 = Nullable($$createType0);
const $$createType2$1 = Array$1($$createType1);
const $$createType3$1 = CaptureDaySummary.createFrom;
const $$createType4 = Nullable($$createType3$1);
const $$createType6$1 = Array$1(Any);
const $$createType7$1 = OcrMeta.createFrom;
const $$createType8$1 = Nullable($$createType7$1);
const $$createType9$1 = Array$1($$createType8$1);
const $$createType10$1 = ApplicationInfo.createFrom;
const $$createType11$1 = Nullable($$createType10$1);
const $$createType12 = Array$1($$createType11$1);
const $$createType13 = Settings.createFrom;
const $$createType14 = Nullable($$createType13);
const $$createType15 = SettingsOptions.createFrom;
const $$createType16 = Nullable($$createType15);
function GetSettings() {
  let $resultPromise = (
    /** @type {any} */
    ByID(1883675502)
  );
  let $typingPromise = (
    /** @type {any} */
    $resultPromise.then(($result) => {
      return $$createType7($result);
    })
  );
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return $typingPromise;
}
function LoadCaptureOcr(req) {
  let $resultPromise = (
    /** @type {any} */
    ByID(1710621811, req)
  );
  let $typingPromise = (
    /** @type {any} */
    $resultPromise.then(($result) => {
      return $$createType9($result);
    })
  );
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return $typingPromise;
}
function LoadCapturedDay(req) {
  let $resultPromise = (
    /** @type {any} */
    ByID(984895139, req)
  );
  let $typingPromise = (
    /** @type {any} */
    $resultPromise.then(($result) => {
      return $$createType11($result);
    })
  );
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return $typingPromise;
}
function SetSettings(settings) {
  let $resultPromise = (
    /** @type {any} */
    ByID(2034067018, settings)
  );
  let $typingPromise = (
    /** @type {any} */
    $resultPromise.then(($result) => {
      return $$createType3($result);
    })
  );
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return $typingPromise;
}
const $$createType2 = Settings.createFrom;
const $$createType3 = Nullable($$createType2);
const $$createType6 = SettingsPlusOptions.createFrom;
const $$createType7 = Nullable($$createType6);
const $$createType8 = OcrFull.createFrom;
const $$createType9 = Nullable($$createType8);
const $$createType10 = CapturedDay.createFrom;
const $$createType11 = Nullable($$createType10);
const useRelapseStore = defineStore("relapse", () => {
  const isHelpShown = ref(false);
  let day = ref(null);
  const settings = ref(null);
  const currentDay = computed(() => {
    if (!day.value) {
      let bod = formatRFC3339(startOfDay(/* @__PURE__ */ new Date()));
      let fallbackDay = {
        Bod: bod,
        Captures: [],
        Summary: {
          TotalCapturedMinutes: 0,
          TotalCapturesCount: 0,
          TotalCaptureSizeBytes: 0,
          Bod: bod
        }
      };
      return fallbackDay;
    }
    return day.value;
  });
  let captures = computed(() => {
    if (currentDay.value) {
      let d4 = currentDay.value;
      if (d4.Captures && d4.Captures.length > 0) {
        return d4.Captures;
      }
    }
    return [];
  });
  const earliestCaptureIndex = computed(() => {
    return captures.value.findIndex((cap) => {
      return cap.IsReal;
    }) || 0;
  });
  const latestCaptureIndex = computed(() => {
    return captures.value.findLastIndex((cap) => {
      return cap.IsReal;
    }) || 0;
  });
  const appSettings = computed(() => {
    return settings.value;
  });
  async function loadSettings() {
    settings.value = await GetSettings();
  }
  async function saveSettings(newSettings) {
    let updatedSettings = await SetSettings(newSettings);
    if (settings.value) {
      settings.value.Settings = updatedSettings;
    }
  }
  async function loadDay(date) {
    try {
      day.value = await LoadCapturedDay({
        Dt: formatRFC3339(startOfDay(date))
      });
    } catch (error) {
      console.error("loadDay error", error);
    }
  }
  async function loadToday() {
    await loadDay(/* @__PURE__ */ new Date());
  }
  return {
    isHelpShown,
    day,
    settings,
    currentDay,
    captures,
    earliestCaptureIndex,
    latestCaptureIndex,
    appSettings,
    loadSettings,
    saveSettings,
    loadDay,
    loadToday
  };
});
const _hoisted_1$7 = /* @__PURE__ */ createBaseVNode("div", {
  class: "handlebar-drag",
  style: { "--wails-draggable": "drag" }
}, null, -1);
const _hoisted_2$6 = [
  _hoisted_1$7
];
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    let isFocused = ref(true);
    const relapseStore = useRelapseStore();
    function maximise() {
      thisWindow.IsMaximised().then((isMaximised) => {
        if (isMaximised) {
          thisWindow.UnMaximise();
        } else {
          thisWindow.Maximise();
        }
      });
    }
    function onWindowBlur() {
      console.log("onWindowBlur happened");
      isFocused.value = false;
    }
    function onWindowFocus() {
      console.log("onWindowFocus happened");
      isFocused.value = true;
    }
    On$1("blur", onWindowBlur);
    On$1("focus", onWindowFocus);
    onMounted(() => {
      console.log("document.title", document.title);
    });
    relapseStore.loadSettings();
    return (_ctx, _cache) => {
      const _component_router_view = resolveComponent("router-view");
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["main-body", { "is-focused": unref(isFocused), "is-blurred": !unref(isFocused) }])
      }, [
        createBaseVNode("div", {
          class: "handlebar",
          onDblclick: maximise
        }, _hoisted_2$6, 32),
        (openBlock(), createBlock(Suspense, null, {
          default: withCtx(() => [
            createVNode(_component_router_view)
          ]),
          _: 1
        }))
      ], 2);
    };
  }
});
const App_vue_vue_type_style_index_0_lang = "";
/*!
  * vue-router v4.3.2
  * (c) 2024 Eduardo San Martin Morote
  * @license MIT
  */
const isBrowser = typeof document !== "undefined";
function isESModule(obj) {
  return obj.__esModule || obj[Symbol.toStringTag] === "Module";
}
const assign = Object.assign;
function applyToParams(fn2, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = isArray(value) ? value.map(fn2) : fn2(value);
  }
  return newParams;
}
const noop = () => {
};
const isArray = Array.isArray;
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return text == null ? "" : encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery2, location2, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const hashPos = location2.indexOf("#");
  let searchPos = location2.indexOf("?");
  if (hashPos < searchPos && hashPos >= 0) {
    searchPos = -1;
  }
  if (searchPos > -1) {
    path = location2.slice(0, searchPos);
    searchString = location2.slice(searchPos + 1, hashPos > -1 ? hashPos : location2.length);
    query = parseQuery2(searchString);
  }
  if (hashPos > -1) {
    path = path || location2.slice(0, hashPos);
    hash = location2.slice(hashPos, location2.length);
  }
  path = resolveRelativePath(path != null ? path : location2, currentLocation);
  return {
    fullPath: path + (searchString && "?") + searchString + hash,
    path,
    query,
    hash: decode(hash)
  };
}
function stringifyURL(stringifyQuery2, location2) {
  const query = location2.query ? stringifyQuery2(location2.query) : "";
  return location2.path + (query && "?") + query + (location2.hash || "");
}
function stripBase(pathname, base) {
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
    return pathname;
  return pathname.slice(base.length) || "/";
}
function isSameRouteLocation(stringifyQuery2, a4, b3) {
  const aLastIndex = a4.matched.length - 1;
  const bLastIndex = b3.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a4.matched[aLastIndex], b3.matched[bLastIndex]) && isSameRouteLocationParams(a4.params, b3.params) && stringifyQuery2(a4.query) === stringifyQuery2(b3.query) && a4.hash === b3.hash;
}
function isSameRouteRecord(a4, b3) {
  return (a4.aliasOf || a4) === (b3.aliasOf || b3);
}
function isSameRouteLocationParams(a4, b3) {
  if (Object.keys(a4).length !== Object.keys(b3).length)
    return false;
  for (const key in a4) {
    if (!isSameRouteLocationParamsValue(a4[key], b3[key]))
      return false;
  }
  return true;
}
function isSameRouteLocationParamsValue(a4, b3) {
  return isArray(a4) ? isEquivalentArray(a4, b3) : isArray(b3) ? isEquivalentArray(b3, a4) : a4 === b3;
}
function isEquivalentArray(a4, b3) {
  return isArray(b3) ? a4.length === b3.length && a4.every((value, i3) => value === b3[i3]) : a4.length === 1 && a4[0] === b3;
}
function resolveRelativePath(to2, from) {
  if (to2.startsWith("/"))
    return to2;
  if (!to2)
    return from;
  const fromSegments = from.split("/");
  const toSegments = to2.split("/");
  const lastToSegment = toSegments[toSegments.length - 1];
  if (lastToSegment === ".." || lastToSegment === ".") {
    toSegments.push("");
  }
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (segment === ".")
      continue;
    if (segment === "..") {
      if (position > 1)
        position--;
    } else
      break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition).join("/");
}
var NavigationType;
(function(NavigationType2) {
  NavigationType2["pop"] = "pop";
  NavigationType2["push"] = "push";
})(NavigationType || (NavigationType = {}));
var NavigationDirection;
(function(NavigationDirection2) {
  NavigationDirection2["back"] = "back";
  NavigationDirection2["forward"] = "forward";
  NavigationDirection2["unknown"] = "";
})(NavigationDirection || (NavigationDirection = {}));
function normalizeBase(base) {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector("base");
      base = baseEl && baseEl.getAttribute("href") || "/";
      base = base.replace(/^\w+:\/\/[^\/]+/, "");
    } else {
      base = "/";
    }
  }
  if (base[0] !== "/" && base[0] !== "#")
    base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location2) {
  return base.replace(BEFORE_HASH_RE, "#") + location2;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.scrollX,
  top: window.scrollY
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else {
    scrollToOptions = position;
  }
  if ("scrollBehavior" in document.documentElement.style)
    window.scrollTo(scrollToOptions);
  else {
    window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.scrollX, scrollToOptions.top != null ? scrollToOptions.top : window.scrollY);
  }
}
function getScrollKey(path, delta) {
  const position = history.state ? history.state.position - delta : -1;
  return position + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
let createBaseLocation = () => location.protocol + "//" + location.host;
function createCurrentLocation(base, location2) {
  const { pathname, search, hash } = location2;
  const hashPos = base.indexOf("#");
  if (hashPos > -1) {
    let slicePos = hash.includes(base.slice(hashPos)) ? base.slice(hashPos).length : 1;
    let pathFromHash = hash.slice(slicePos);
    if (pathFromHash[0] !== "/")
      pathFromHash = "/" + pathFromHash;
    return stripBase(pathFromHash, "");
  }
  const path = stripBase(pathname, base);
  return path + search + hash;
}
function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;
  const popStateHandler = ({ state }) => {
    const to2 = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;
    if (state) {
      currentLocation.value = to2;
      historyState.value = state;
      if (pauseState && pauseState === from) {
        pauseState = null;
        return;
      }
      delta = fromState ? state.position - fromState.position : 0;
    } else {
      replace(to2);
    }
    listeners.forEach((listener) => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
      });
    });
  };
  function pauseListeners() {
    pauseState = currentLocation.value;
  }
  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index = listeners.indexOf(callback);
      if (index > -1)
        listeners.splice(index, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }
  function beforeUnloadListener() {
    const { history: history2 } = window;
    if (!history2.state)
      return;
    history2.replaceState(assign({}, history2.state, { scroll: computeScrollPosition() }), "");
  }
  function destroy() {
    for (const teardown of teardowns)
      teardown();
    teardowns = [];
    window.removeEventListener("popstate", popStateHandler);
    window.removeEventListener("beforeunload", beforeUnloadListener);
  }
  window.addEventListener("popstate", popStateHandler);
  window.addEventListener("beforeunload", beforeUnloadListener, {
    passive: true
  });
  return {
    pauseListeners,
    listen,
    destroy
  };
}
function buildState(back, current, forward, replaced = false, computeScroll = false) {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  };
}
function useHistoryStateNavigation(base) {
  const { history: history2, location: location2 } = window;
  const currentLocation = {
    value: createCurrentLocation(base, location2)
  };
  const historyState = { value: history2.state };
  if (!historyState.value) {
    changeLocation(currentLocation.value, {
      back: null,
      current: currentLocation.value,
      forward: null,
      // the length is off by one, we need to decrease it
      position: history2.length - 1,
      replaced: true,
      // don't add a scroll as the user may have an anchor, and we want
      // scrollBehavior to be triggered without a saved position
      scroll: null
    }, true);
  }
  function changeLocation(to2, state, replace2) {
    const hashIndex = base.indexOf("#");
    const url = hashIndex > -1 ? (location2.host && document.querySelector("base") ? base : base.slice(hashIndex)) + to2 : createBaseLocation() + base + to2;
    try {
      history2[replace2 ? "replaceState" : "pushState"](state, "", url);
      historyState.value = state;
    } catch (err) {
      {
        console.error(err);
      }
      location2[replace2 ? "replace" : "assign"](url);
    }
  }
  function replace(to2, data) {
    const state = assign({}, history2.state, buildState(
      historyState.value.back,
      // keep back and forward entries but override current position
      to2,
      historyState.value.forward,
      true
    ), data, { position: historyState.value.position });
    changeLocation(to2, state, true);
    currentLocation.value = to2;
  }
  function push(to2, data) {
    const currentState = assign(
      {},
      // use current history state to gracefully handle a wrong call to
      // history.replaceState
      // https://github.com/vuejs/router/issues/366
      historyState.value,
      history2.state,
      {
        forward: to2,
        scroll: computeScrollPosition()
      }
    );
    changeLocation(currentState.current, currentState, true);
    const state = assign({}, buildState(currentLocation.value, to2, null), { position: currentState.position + 1 }, data);
    changeLocation(to2, state, false);
    currentLocation.value = to2;
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  };
}
function createWebHistory(base) {
  base = normalizeBase(base);
  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
  function go2(delta, triggerListeners = true) {
    if (!triggerListeners)
      historyListeners.pauseListeners();
    history.go(delta);
  }
  const routerHistory = assign({
    // it's overridden right after
    location: "",
    base,
    go: go2,
    createHref: createHref.bind(null, base)
  }, historyNavigation, historyListeners);
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: () => historyNavigation.location.value
  });
  Object.defineProperty(routerHistory, "state", {
    enumerable: true,
    get: () => historyNavigation.state.value
  });
  return routerHistory;
}
function createWebHashHistory(base) {
  base = location.host ? base || location.pathname + location.search : "";
  if (!base.includes("#"))
    base += "#";
  return createWebHistory(base);
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
const NavigationFailureSymbol = Symbol("");
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
function createRouterError(type3, params) {
  {
    return assign(new Error(), {
      type: type3,
      [NavigationFailureSymbol]: true
    }, params);
  }
}
function isNavigationFailure(error, type3) {
  return error instanceof Error && NavigationFailureSymbol in error && (type3 == null || !!(error.type & type3));
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [
      90
      /* PathScore.Root */
    ];
    if (options.strict && !segment.length)
      pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = 40 + (options.sensitive ? 0.25 : 0);
      if (token.type === 0) {
        if (!tokenIndex)
          pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += 40;
      } else if (token.type === 1) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re3 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re3 !== BASE_PARAM_PATTERN) {
          subSegmentScore += 10;
          try {
            new RegExp(`(${re3})`);
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re3}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re3})(?:/(?:${re3}))*)` : `(${re3})`;
        if (!tokenIndex)
          subPattern = // avoid an optional / if there are more segments e.g. /:p?-static
          // or /:p?-:p2
          optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional)
          subPattern += "?";
        pattern += subPattern;
        subSegmentScore += 20;
        if (optional)
          subSegmentScore += -8;
        if (repeatable)
          subSegmentScore += -20;
        if (re3 === ".*")
          subSegmentScore += -50;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i3 = score.length - 1;
    score[i3][score[i3].length - 1] += 0.7000000000000001;
  }
  if (!options.strict)
    pattern += "/?";
  if (options.end)
    pattern += "$";
  else if (options.strict)
    pattern += "(?:/|$)";
  const re2 = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse2(path) {
    const match2 = path.match(re2);
    const params = {};
    if (!match2)
      return null;
    for (let i3 = 1; i3 < match2.length; i3++) {
      const value = match2[i3] || "";
      const key = keys[i3 - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/"))
        path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) {
        if (token.type === 0) {
          path += token.value;
        } else if (token.type === 1) {
          const { value, repeatable, optional } = token;
          const param = value in params ? params[value] : "";
          if (isArray(param) && !repeatable) {
            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
          }
          const text = isArray(param) ? param.join("/") : param;
          if (!text) {
            if (optional) {
              if (segment.length < 2) {
                if (path.endsWith("/"))
                  path = path.slice(0, -1);
                else
                  avoidDuplicatedSlash = true;
              }
            } else
              throw new Error(`Missing required param "${value}"`);
          }
          path += text;
        }
      }
    }
    return path || "/";
  }
  return {
    re: re2,
    score,
    keys,
    parse: parse2,
    stringify
  };
}
function compareScoreArray(a4, b3) {
  let i3 = 0;
  while (i3 < a4.length && i3 < b3.length) {
    const diff = b3[i3] - a4[i3];
    if (diff)
      return diff;
    i3++;
  }
  if (a4.length < b3.length) {
    return a4.length === 1 && a4[0] === 40 + 40 ? -1 : 1;
  } else if (a4.length > b3.length) {
    return b3.length === 1 && b3[0] === 40 + 40 ? 1 : -1;
  }
  return 0;
}
function comparePathParserScore(a4, b3) {
  let i3 = 0;
  const aScore = a4.score;
  const bScore = b3.score;
  while (i3 < aScore.length && i3 < bScore.length) {
    const comp = compareScoreArray(aScore[i3], bScore[i3]);
    if (comp)
      return comp;
    i3++;
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore))
      return 1;
    if (isLastScoreNegative(bScore))
      return -1;
  }
  return bScore.length - aScore.length;
}
function isLastScoreNegative(score) {
  const last = score[score.length - 1];
  return score.length > 0 && last[last.length - 1] < 0;
}
const ROOT_TOKEN = {
  type: 0,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path)
    return [[]];
  if (path === "/")
    return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) {
    throw new Error(`Invalid path "${path}"`);
  }
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }
  let state = 0;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment)
      tokens.push(segment);
    segment = [];
  }
  let i3 = 0;
  let char;
  let buffer = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer)
      return;
    if (state === 0) {
      segment.push({
        type: 0,
        value: buffer
      });
    } else if (state === 1 || state === 2 || state === 3) {
      if (segment.length > 1 && (char === "*" || char === "+"))
        crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 1,
        value: buffer,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else {
      crash("Invalid state to consume buffer");
    }
    buffer = "";
  }
  function addCharToBuffer() {
    buffer += char;
  }
  while (i3 < path.length) {
    char = path[i3++];
    if (char === "\\" && state !== 2) {
      previousState = state;
      state = 4;
      continue;
    }
    switch (state) {
      case 0:
        if (char === "/") {
          if (buffer) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = 1;
        } else {
          addCharToBuffer();
        }
        break;
      case 4:
        addCharToBuffer();
        state = previousState;
        break;
      case 1:
        if (char === "(") {
          state = 2;
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i3--;
        }
        break;
      case 2:
        if (char === ")") {
          if (customRe[customRe.length - 1] == "\\")
            customRe = customRe.slice(0, -1) + char;
          else
            state = 3;
        } else {
          customRe += char;
        }
        break;
      case 3:
        consumeBuffer();
        state = 0;
        if (char !== "*" && char !== "?" && char !== "+")
          i3--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === 2)
    crash(`Unfinished custom RegExp for param "${buffer}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  const matcher = assign(parser, {
    record,
    parent,
    // these needs to be populated by the parent
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes2, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [
      mainNormalizedRecord
    ];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) {
        normalizedRecords.push(assign({}, mainNormalizedRecord, {
          // this allows us to hold a copy of the `components` option
          // so that async components cache is hold on the original record
          components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
          path: alias,
          // we might be the child of an alias
          aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
          // the aliases are always of the same kind as the original since they
          // are defined on the same record
        }));
      }
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher)
          originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher))
          removeRoute(record.name);
      }
      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;
        for (let i3 = 0; i3 < children.length; i3++) {
          addRoute(children[i3], matcher, originalRecord && originalRecord.children[i3]);
        }
      }
      originalRecord = originalRecord || matcher;
      if (matcher.record.components && Object.keys(matcher.record.components).length || matcher.record.name || matcher.record.redirect) {
        insertMatcher(matcher);
      }
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name)
          matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    let i3 = 0;
    while (i3 < matchers.length && comparePathParserScore(matcher, matchers[i3]) >= 0 && // Adding children with empty path should still appear before the parent
    // https://github.com/vuejs/router/issues/1124
    (matcher.record.path !== matchers[i3].record.path || !isRecordChildOf(matcher, matchers[i3])))
      i3++;
    matchers.splice(i3, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher))
      matcherMap.set(matcher.record.name, matcher);
  }
  function resolve2(location2, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location2 && location2.name) {
      matcher = matcherMap.get(location2.name);
      if (!matcher)
        throw createRouterError(1, {
          location: location2
        });
      name = matcher.record.name;
      params = assign(
        // paramsFromLocation is a new object
        paramsFromLocation(
          currentLocation.params,
          // only keep params that exist in the resolved location
          // only keep optional params coming from a parent record
          matcher.keys.filter((k3) => !k3.optional).concat(matcher.parent ? matcher.parent.keys.filter((k3) => k3.optional) : []).map((k3) => k3.name)
        ),
        // discard any existing params in the current location that do not exist here
        // #1497 this ensures better active/exact matching
        location2.params && paramsFromLocation(location2.params, matcher.keys.map((k3) => k3.name))
      );
      path = matcher.stringify(params);
    } else if (location2.path != null) {
      path = location2.path;
      matcher = matchers.find((m4) => m4.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m4) => m4.re.test(currentLocation.path));
      if (!matcher)
        throw createRouterError(1, {
          location: location2,
          currentLocation
        });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location2.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes2.forEach((route) => addRoute(route));
  return { addRoute, resolve: resolve2, removeRoute, getRoutes, getRecordMatcher };
}
function paramsFromLocation(params, keys) {
  const newParams = {};
  for (const key of keys) {
    if (key in params)
      newParams[key] = params[key];
  }
  return newParams;
}
function normalizeRouteRecord(record) {
  return {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: void 0,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    components: "components" in record ? record.components || null : record.component && { default: record.component }
  };
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) {
    propsObject.default = props;
  } else {
    for (const name in record.components)
      propsObject[name] = typeof props === "object" ? props[name] : props;
  }
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf)
      return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function mergeOptions(defaults, partialOptions) {
  const options = {};
  for (const key in defaults) {
    options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
  }
  return options;
}
function isRecordChildOf(record, parent) {
  return parent.children.some((child) => child === record || isRecordChildOf(record, child));
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?")
    return query;
  const hasLeadingIM = search[0] === "?";
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
  for (let i3 = 0; i3 < searchParams.length; ++i3) {
    const searchParam = searchParams[i3].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!isArray(currentValue)) {
        currentValue = query[key] = [currentValue];
      }
      currentValue.push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) {
        search += (search.length ? "&" : "") + key;
      }
      continue;
    }
    const values = isArray(value) ? value.map((v2) => v2 && encodeQueryValue(v2)) : [value && encodeQueryValue(value)];
    values.forEach((value2) => {
      if (value2 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value2 != null)
          search += "=" + value2;
      }
    });
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) {
      normalizedQuery[key] = isArray(value) ? value.map((v2) => v2 == null ? null : "" + v2) : value == null ? value : "" + value;
    }
  }
  return normalizedQuery;
}
const matchedRouteKey = Symbol("");
const viewDepthKey = Symbol("");
const routerKey = Symbol("");
const routeLocationKey = Symbol("");
const routerViewLocationKey = Symbol("");
function useCallbacks() {
  let handlers = [];
  function add2(handler) {
    handlers.push(handler);
    return () => {
      const i3 = handlers.indexOf(handler);
      if (i3 > -1)
        handlers.splice(i3, 1);
    };
  }
  function reset() {
    handlers = [];
  }
  return {
    add: add2,
    list: () => handlers.slice(),
    reset
  };
}
function guardToPromiseFn(guard, to2, from, record, name, runWithContext = (fn2) => fn2()) {
  const enterCallbackArray = record && // name is defined if record is because of the function overload
  (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve2, reject) => {
    const next = (valid) => {
      if (valid === false) {
        reject(createRouterError(4, {
          from,
          to: to2
        }));
      } else if (valid instanceof Error) {
        reject(valid);
      } else if (isRouteLocation(valid)) {
        reject(createRouterError(2, {
          from: to2,
          to: valid
        }));
      } else {
        if (enterCallbackArray && // since enterCallbackArray is truthy, both record and name also are
        record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") {
          enterCallbackArray.push(valid);
        }
        resolve2();
      }
    };
    const guardReturn = runWithContext(() => guard.call(record && record.instances[name], to2, from, next));
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3)
      guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
function extractComponentsGuards(matched, guardType, to2, from, runWithContext = (fn2) => fn2()) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name])
        continue;
      if (isRouteComponent(rawComponent)) {
        const options = rawComponent.__vccOpts || rawComponent;
        const guard = options[guardType];
        guard && guards.push(guardToPromiseFn(guard, to2, from, record, name, runWithContext));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved)
            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.components[name] = resolvedComponent;
          const options = resolvedComponent.__vccOpts || resolvedComponent;
          const guard = options[guardType];
          return guard && guardToPromiseFn(guard, to2, from, record, name, runWithContext)();
        }));
      }
    }
  }
  return guards;
}
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function useLink(props) {
  const router2 = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => {
    const to2 = unref(props.to);
    return router2.resolve(to2);
  });
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length)
      return -1;
    const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1)
      return index;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return (
      // we are dealing with nested routes
      length > 1 && // if the parent and matched route have the same path, this link is
      // referring to the empty child. Or we currently are on a different
      // child of the same parent
      getOriginalPath(routeMatched) === parentRecordPath && // avoid comparing the child with its parent
      currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index
    );
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e3 = {}) {
    if (guardEvent(e3)) {
      return router2[unref(props.replace) ? "replace" : "push"](
        unref(props.to)
        // avoid uncaught errors are they are logged anyway
      ).catch(noop);
    }
    return Promise.resolve();
  }
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    // inactiveClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      // [getLinkClass(
      //   props.inactiveClass,
      //   options.linkInactiveClass,
      //   'router-link-inactive'
      // )]: !link.isExactActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && slots.default(link);
      return props.custom ? children : h$2("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        // this would override user added attrs but Vue will still add
        // the listener, so we end up triggering both
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e3) {
  if (e3.metaKey || e3.altKey || e3.ctrlKey || e3.shiftKey)
    return;
  if (e3.defaultPrevented)
    return;
  if (e3.button !== void 0 && e3.button !== 0)
    return;
  if (e3.currentTarget && e3.currentTarget.getAttribute) {
    const target = e3.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target))
      return;
  }
  if (e3.preventDefault)
    e3.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue)
        return false;
    } else {
      if (!isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i3) => value !== outerValue[i3]))
        return false;
    }
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  // #674 we manually inherit them
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  // Better compat for @vue/compat users
  // https://github.com/vuejs/router/issues/1315
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;
      let matchedRoute;
      while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) {
        initialDepth++;
      }
      return initialDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
    provide(viewDepthKey, computed(() => depth.value + 1));
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = ref();
    watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to2, name], [oldInstance, from, oldName]) => {
      if (to2) {
        to2.instances[name] = instance;
        if (from && from !== to2 && instance && instance === oldInstance) {
          if (!to2.leaveGuards.size) {
            to2.leaveGuards = from.leaveGuards;
          }
          if (!to2.updateGuards.size) {
            to2.updateGuards = from.updateGuards;
          }
        }
      }
      if (instance && to2 && // if there is no instance but to and from are the same this might be
      // the first visit
      (!from || !isSameRouteRecord(to2, from) || !oldInstance)) {
        (to2.enterCallbacks[name] || []).forEach((callback) => callback(instance));
      }
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[currentName];
      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route });
      }
      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };
      const component = h$2(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return (
        // pass the vnode to the slot as a prop.
        // h and <component :is="..."> both accept vnodes
        normalizeSlot(slots.default, { Component: component, route }) || component
      );
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot)
    return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
const RouterView = RouterViewImpl;
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const parseQuery$1 = options.parseQuery || parseQuery;
  const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  const routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = (
    // @ts-expect-error: intentionally avoid the type check
    applyToParams.bind(null, decode)
  );
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    }
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve2(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute2 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href2 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute2, {
        params: decodeParams(matchedRoute2.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href2
      });
    }
    let matcherLocation;
    if (rawLocation.path != null) {
      matcherLocation = assign({}, rawLocation, {
        path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
      });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = assign({}, rawLocation, {
        params: encodeParams(targetParams)
      });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      // keep the hash encoded so fullPath is effectively path + encodedQuery +
      // hash
      hash,
      query: (
        // if the user is using a custom query lib like qs, we might have
        // nested objects, so we keep the query as is, meaning it can contain
        // numbers at `$route.query`, but at the point, the user will have to
        // use their own type anyway.
        // https://github.com/vuejs/router/issues/328#issuecomment-649481567
        stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
      )
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to2) {
    return typeof to2 === "string" ? parseURL(parseQuery$1, to2, currentRoute.value.path) : assign({}, to2);
  }
  function checkCanceledNavigation(to2, from) {
    if (pendingLocation !== to2) {
      return createRouterError(8, {
        from,
        to: to2
      });
    }
  }
  function push(to2) {
    return pushWithRedirect(to2);
  }
  function replace(to2) {
    return push(assign(locationAsObject(to2), { replace: true }));
  }
  function handleRedirectRecord(to2) {
    const lastMatched = to2.matched[to2.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to2) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : (
          // force empty params
          { path: newTargetLocation }
        );
        newTargetLocation.params = {};
      }
      return assign({
        query: to2.query,
        hash: to2.hash,
        // avoid transferring params if the redirect has a path
        params: newTargetLocation.path != null ? {} : to2.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to2, redirectedFrom) {
    const targetLocation = pendingLocation = resolve2(to2);
    const from = currentRoute.value;
    const data = to2.state;
    const force = to2.force;
    const replace2 = to2.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation);
    if (shouldRedirect)
      return pushWithRedirect(
        assign(locationAsObject(shouldRedirect), {
          state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
          force,
          replace: replace2
        }),
        // keep original redirectedFrom if it exists
        redirectedFrom || targetLocation
      );
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(16, { to: toLocation, from });
      handleScroll(
        from,
        from,
        // this is a push, the only way for it to be triggered from a
        // history.listen is with a redirect, which makes it become a push
        true,
        // This cannot be the first navigation because the initial location
        // cannot be manually navigated to
        false
      );
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? (
      // navigation redirects still mark the router as ready
      isNavigationFailure(
        error,
        2
        /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
      ) ? error : markAsReady(error)
    ) : (
      // reject any unknown error
      triggerError(error, toLocation, from)
    )).then((failure2) => {
      if (failure2) {
        if (isNavigationFailure(
          failure2,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          return pushWithRedirect(
            // keep options
            assign({
              // preserve an existing replacement but allow the redirect to override it
              replace: replace2
            }, locationAsObject(failure2.to), {
              state: typeof failure2.to === "object" ? assign({}, data, failure2.to.state) : data,
              force
            }),
            // preserve the original redirectedFrom if any
            redirectedFrom || toLocation
          );
        }
      } else {
        failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
      }
      triggerAfterEach(toLocation, from, failure2);
      return failure2;
    });
  }
  function checkCanceledNavigationAndReject(to2, from) {
    const error = checkCanceledNavigation(to2, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function runWithContext(fn2) {
    const app2 = installedApps.values().next().value;
    return app2 && typeof app2.runWithContext === "function" ? app2.runWithContext(fn2) : fn2();
  }
  function navigate(to2, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to2, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to2, from);
    for (const record of leavingRecords) {
      record.leaveGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to2, from));
      });
    }
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to2, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to2, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to2, from);
      for (const record of updatingRecords) {
        record.updateGuards.forEach((guard) => {
          guards.push(guardToPromiseFn(guard, to2, from));
        });
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of enteringRecords) {
        if (record.beforeEnter) {
          if (isArray(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to2, from));
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to2, from));
          }
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to2.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to2, from, runWithContext);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to2, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(
      err,
      8
      /* ErrorTypes.NAVIGATION_CANCELLED */
    ) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to2, from, failure) {
    afterGuards.list().forEach((guard) => runWithContext(() => guard(to2, from, failure)));
  }
  function finalizeNavigation(toLocation, from, isPush, replace2, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error)
      return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) {
      if (replace2 || isFirstNavigation)
        routerHistory.replace(toLocation.fullPath, assign({
          scroll: isFirstNavigation && state && state.scroll
        }, data));
      else
        routerHistory.push(toLocation.fullPath, data);
    }
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener)
      return;
    removeHistoryListener = routerHistory.listen((to2, _from, info) => {
      if (!router2.listening)
        return;
      const toLocation = resolve2(to2);
      const shouldRedirect = handleRedirectRecord(toLocation);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) {
        saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      }
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(
          error,
          4 | 8
          /* ErrorTypes.NAVIGATION_CANCELLED */
        )) {
          return error;
        }
        if (isNavigationFailure(
          error,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          pushWithRedirect(
            error.to,
            toLocation
            // avoid an uncaught rejection, let push call triggerError
          ).then((failure) => {
            if (isNavigationFailure(
              failure,
              4 | 16
              /* ErrorTypes.NAVIGATION_DUPLICATED */
            ) && !info.delta && info.type === NavigationType.pop) {
              routerHistory.go(-1, false);
            }
          }).catch(noop);
          return Promise.reject();
        }
        if (info.delta) {
          routerHistory.go(-info.delta, false);
        }
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(
          // after navigation, all matched components are resolved
          toLocation,
          from,
          false
        );
        if (failure) {
          if (info.delta && // a new navigation has been triggered, so we do not want to revert, that will change the current history
          // entry while a different route is displayed
          !isNavigationFailure(
            failure,
            8
            /* ErrorTypes.NAVIGATION_CANCELLED */
          )) {
            routerHistory.go(-info.delta, false);
          } else if (info.type === NavigationType.pop && isNavigationFailure(
            failure,
            4 | 16
            /* ErrorTypes.NAVIGATION_DUPLICATED */
          )) {
            routerHistory.go(-1, false);
          }
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop);
    });
  }
  let readyHandlers = useCallbacks();
  let errorListeners = useCallbacks();
  let ready;
  function triggerError(error, to2, from) {
    markAsReady(error);
    const list = errorListeners.list();
    if (list.length) {
      list.forEach((handler) => handler(error, to2, from));
    } else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve3, reject) => {
      readyHandlers.add([resolve3, reject]);
    });
  }
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve3, reject]) => err ? reject(err) : resolve3());
      readyHandlers.reset();
    }
    return err;
  }
  function handleScroll(to2, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior)
      return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to2.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick().then(() => scrollBehavior(to2, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to2, from));
  }
  const go2 = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router2 = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve: resolve2,
    options,
    push,
    replace,
    go: go2,
    back: () => go2(-1),
    forward: () => go2(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorListeners.add,
    isReady,
    install(app2) {
      const router3 = this;
      app2.component("RouterLink", RouterLink);
      app2.component("RouterView", RouterView);
      app2.config.globalProperties.$router = router3;
      Object.defineProperty(app2.config.globalProperties, "$route", {
        enumerable: true,
        get: () => unref(currentRoute)
      });
      if (isBrowser && // used for the initial navigation client side to avoid pushing
      // multiple times when the router is used in multiple apps
      !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) {
        Object.defineProperty(reactiveRoute, key, {
          get: () => currentRoute.value[key],
          enumerable: true
        });
      }
      app2.provide(routerKey, router3);
      app2.provide(routeLocationKey, shallowReactive(reactiveRoute));
      app2.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app2.unmount;
      installedApps.add(app2);
      app2.unmount = function() {
        installedApps.delete(app2);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  function runGuardQueue(guards) {
    return guards.reduce((promise, guard) => promise.then(() => runWithContext(guard)), Promise.resolve());
  }
  return router2;
}
function extractChangingRecords(to2, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to2.matched.length);
  for (let i3 = 0; i3 < len; i3++) {
    const recordFrom = from.matched[i3];
    if (recordFrom) {
      if (to2.matched.find((record) => isSameRouteRecord(record, recordFrom)))
        updatingRecords.push(recordFrom);
      else
        leavingRecords.push(recordFrom);
    }
    const recordTo = to2.matched[i3];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) {
        enteringRecords.push(recordTo);
      }
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords];
}
function t2(t4, e3) {
  var s4 = Object.keys(t4);
  if (Object.getOwnPropertySymbols) {
    var i3 = Object.getOwnPropertySymbols(t4);
    e3 && (i3 = i3.filter(function(e4) {
      return Object.getOwnPropertyDescriptor(t4, e4).enumerable;
    })), s4.push.apply(s4, i3);
  }
  return s4;
}
function e2(e3) {
  for (var i3 = 1; i3 < arguments.length; i3++) {
    var r2 = null != arguments[i3] ? arguments[i3] : {};
    i3 % 2 ? t2(Object(r2), true).forEach(function(t4) {
      s3(e3, t4, r2[t4]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(r2)) : t2(Object(r2)).forEach(function(t4) {
      Object.defineProperty(e3, t4, Object.getOwnPropertyDescriptor(r2, t4));
    });
  }
  return e3;
}
function s3(t4, e3, s4) {
  return (e3 = n(e3)) in t4 ? Object.defineProperty(t4, e3, { value: s4, enumerable: true, configurable: true, writable: true }) : t4[e3] = s4, t4;
}
function i2(t4, e3) {
  if (null == t4)
    return {};
  var s4, i3, r2 = function(t5, e4) {
    if (null == t5)
      return {};
    var s5, i4, r3 = {}, n3 = Object.keys(t5);
    for (i4 = 0; i4 < n3.length; i4++)
      s5 = n3[i4], e4.indexOf(s5) >= 0 || (r3[s5] = t5[s5]);
    return r3;
  }(t4, e3);
  if (Object.getOwnPropertySymbols) {
    var n2 = Object.getOwnPropertySymbols(t4);
    for (i3 = 0; i3 < n2.length; i3++)
      s4 = n2[i3], e3.indexOf(s4) >= 0 || Object.prototype.propertyIsEnumerable.call(t4, s4) && (r2[s4] = t4[s4]);
  }
  return r2;
}
function r(t4, e3) {
  return e3 || (e3 = t4.slice(0)), Object.freeze(Object.defineProperties(t4, { raw: { value: Object.freeze(e3) } }));
}
function n(t4) {
  var e3 = function(t5, e4) {
    if ("object" != typeof t5 || null === t5)
      return t5;
    var s4 = t5[Symbol.toPrimitive];
    if (void 0 !== s4) {
      var i3 = s4.call(t5, e4 || "default");
      if ("object" != typeof i3)
        return i3;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === e4 ? String : Number)(t5);
  }(t4, "string");
  return "symbol" == typeof e3 ? e3 : String(e3);
}
class o {
  constructor() {
    s3(this, "browserShadowBlurConstant", 1), s3(this, "DPI", 96), s3(this, "devicePixelRatio", "undefined" != typeof window ? window.devicePixelRatio : 1), s3(this, "perfLimitSizeTotal", 2097152), s3(this, "maxCacheSideLimit", 4096), s3(this, "minCacheSideLimit", 256), s3(this, "disableStyleCopyPaste", false), s3(this, "enableGLFiltering", true), s3(this, "textureSize", 4096), s3(this, "forceGLPutImageData", false), s3(this, "cachesBoundsOfCurve", true), s3(this, "fontPaths", {}), s3(this, "NUM_FRACTION_DIGITS", 4);
  }
}
const a3 = new class extends o {
  constructor(t4) {
    super(), this.configure(t4);
  }
  configure() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    Object.assign(this, t4);
  }
  addFonts() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.fontPaths = e2(e2({}, this.fontPaths), t4);
  }
  removeFonts() {
    (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []).forEach((t4) => {
      delete this.fontPaths[t4];
    });
  }
  clearFonts() {
    this.fontPaths = {};
  }
  restoreDefaults(t4) {
    const e3 = new o(), s4 = (null == t4 ? void 0 : t4.reduce((t5, s5) => (t5[s5] = e3[s5], t5), {})) || e3;
    this.configure(s4);
  }
}(), h$1 = function(t4) {
  for (var e3 = arguments.length, s4 = new Array(e3 > 1 ? e3 - 1 : 0), i3 = 1; i3 < e3; i3++)
    s4[i3 - 1] = arguments[i3];
  return console[t4]("fabric", ...s4);
};
class c2 extends Error {
  constructor(t4, e3) {
    super("fabric: ".concat(t4), e3);
  }
}
class l extends c2 {
  constructor(t4) {
    super("".concat(t4, " 'options.signal' is in 'aborted' state"));
  }
}
class u2 {
}
class d3 extends u2 {
  testPrecision(t4, e3) {
    const s4 = "precision ".concat(e3, " float;\nvoid main(){}"), i3 = t4.createShader(t4.FRAGMENT_SHADER);
    return !!i3 && (t4.shaderSource(i3, s4), t4.compileShader(i3), !!t4.getShaderParameter(i3, t4.COMPILE_STATUS));
  }
  queryWebGL(t4) {
    const e3 = t4.getContext("webgl");
    e3 && (this.maxTextureSize = e3.getParameter(e3.MAX_TEXTURE_SIZE), this.GLPrecision = ["highp", "mediump", "lowp"].find((t5) => this.testPrecision(e3, t5)), e3.getExtension("WEBGL_lose_context").loseContext(), h$1("log", "WebGL: max texture size ".concat(this.maxTextureSize)));
  }
  isSupported(t4) {
    return !!this.maxTextureSize && this.maxTextureSize >= t4;
  }
}
const g = {};
let f$1;
const m3 = () => f$1 || (f$1 = { document, window, isTouchSupported: "ontouchstart" in window || "ontouchstart" in document || window && window.navigator && window.navigator.maxTouchPoints > 0, WebGLProbe: new d3(), dispose() {
}, copyPasteData: g }), v$1 = () => m3().document, y3 = () => m3().window, _ = () => {
  var t4;
  return Math.max(null !== (t4 = a3.devicePixelRatio) && void 0 !== t4 ? t4 : y3().devicePixelRatio, 1);
};
const x2 = new class {
  constructor() {
    s3(this, "charWidthsCache", {}), s3(this, "boundsOfCurveCache", {});
  }
  getFontCache(t4) {
    let { fontFamily: e3, fontStyle: s4, fontWeight: i3 } = t4;
    e3 = e3.toLowerCase(), this.charWidthsCache[e3] || (this.charWidthsCache[e3] = {});
    const r2 = this.charWidthsCache[e3], n2 = "".concat(s4.toLowerCase(), "_").concat((i3 + "").toLowerCase());
    return r2[n2] || (r2[n2] = {}), r2[n2];
  }
  clearFontCache(t4) {
    (t4 = (t4 || "").toLowerCase()) ? this.charWidthsCache[t4] && delete this.charWidthsCache[t4] : this.charWidthsCache = {};
  }
  limitDimsByArea(t4) {
    const { perfLimitSizeTotal: e3 } = a3, s4 = Math.sqrt(e3 * t4);
    return [Math.floor(s4), Math.floor(e3 / s4)];
  }
}();
const C = "6.0.0-rc2";
function b$1() {
}
const w2 = Math.PI / 2, S3 = 2 * Math.PI, T$1 = Math.PI / 180, O2 = Object.freeze([1, 0, 0, 1, 0, 0]), k2 = 16, D2 = 0.4477152502, M3 = "center", P = "left", E2 = "top", A = "bottom", j = "right", F = "none", L2 = /\r?\n/, R2 = "json", B2 = "svg";
const I2 = new class {
  constructor() {
    this[R2] = /* @__PURE__ */ new Map(), this[B2] = /* @__PURE__ */ new Map();
  }
  getClass(t4) {
    const e3 = this[R2].get(t4);
    if (!e3)
      throw new c2("No class registered for ".concat(t4));
    return e3;
  }
  setClass(t4, e3) {
    e3 ? this[R2].set(e3, t4) : (this[R2].set(t4.type, t4), this[R2].set(t4.type.toLowerCase(), t4));
  }
  getSVGClass(t4) {
    return this[B2].get(t4);
  }
  setSVGClass(t4, e3) {
    this[B2].set(null != e3 ? e3 : t4.type.toLowerCase(), t4);
  }
}();
const X2 = new class extends Array {
  remove(t4) {
    const e3 = this.indexOf(t4);
    e3 > -1 && this.splice(e3, 1);
  }
  cancelAll() {
    const t4 = this.splice(0);
    return t4.forEach((t5) => t5.abort()), t4;
  }
  cancelByCanvas(t4) {
    if (!t4)
      return [];
    const e3 = this.filter((e4) => {
      var s4;
      return e4.target === t4 || "object" == typeof e4.target && (null === (s4 = e4.target) || void 0 === s4 ? void 0 : s4.canvas) === t4;
    });
    return e3.forEach((t5) => t5.abort()), e3;
  }
  cancelByTarget(t4) {
    if (!t4)
      return [];
    const e3 = this.filter((e4) => e4.target === t4);
    return e3.forEach((t5) => t5.abort()), e3;
  }
}();
class Y2 {
  constructor() {
    s3(this, "__eventListeners", {});
  }
  on(t4, e3) {
    if (this.__eventListeners || (this.__eventListeners = {}), "object" == typeof t4)
      return Object.entries(t4).forEach((t5) => {
        let [e4, s4] = t5;
        this.on(e4, s4);
      }), () => this.off(t4);
    if (e3) {
      const s4 = t4;
      return this.__eventListeners[s4] || (this.__eventListeners[s4] = []), this.__eventListeners[s4].push(e3), () => this.off(s4, e3);
    }
    return () => false;
  }
  once(t4, e3) {
    if ("object" == typeof t4) {
      const e4 = [];
      return Object.entries(t4).forEach((t5) => {
        let [s4, i3] = t5;
        e4.push(this.once(s4, i3));
      }), () => e4.forEach((t5) => t5());
    }
    if (e3) {
      const s4 = this.on(t4, function() {
        for (var t5 = arguments.length, i3 = new Array(t5), r2 = 0; r2 < t5; r2++)
          i3[r2] = arguments[r2];
        e3.call(this, ...i3), s4();
      });
      return s4;
    }
    return () => false;
  }
  _removeEventListener(t4, e3) {
    if (this.__eventListeners[t4])
      if (e3) {
        const s4 = this.__eventListeners[t4], i3 = s4.indexOf(e3);
        i3 > -1 && s4.splice(i3, 1);
      } else
        this.__eventListeners[t4] = [];
  }
  off(t4, e3) {
    if (this.__eventListeners)
      if (void 0 === t4)
        for (const t5 in this.__eventListeners)
          this._removeEventListener(t5);
      else
        "object" == typeof t4 ? Object.entries(t4).forEach((t5) => {
          let [e4, s4] = t5;
          this._removeEventListener(e4, s4);
        }) : this._removeEventListener(t4, e3);
  }
  fire(t4, e3) {
    var s4;
    if (!this.__eventListeners)
      return;
    const i3 = null === (s4 = this.__eventListeners[t4]) || void 0 === s4 ? void 0 : s4.concat();
    if (i3)
      for (let t5 = 0; t5 < i3.length; t5++)
        i3[t5].call(this, e3 || {});
  }
}
const V = (t4, e3) => isNaN(t4) && "number" == typeof e3 ? e3 : t4, z2 = (t4, e3) => {
  const s4 = t4.indexOf(e3);
  return -1 !== s4 && t4.splice(s4, 1), t4;
}, H3 = (t4) => {
  if (0 === t4)
    return 1;
  switch (Math.abs(t4) / w2) {
    case 1:
    case 3:
      return 0;
    case 2:
      return -1;
  }
  return Math.cos(t4);
}, G$1 = (t4) => {
  if (0 === t4)
    return 0;
  const e3 = t4 / w2, s4 = Math.sign(t4);
  switch (e3) {
    case 1:
      return s4;
    case 2:
      return 0;
    case 3:
      return -s4;
  }
  return Math.sin(t4);
};
class U {
  constructor() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0, e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
    "object" == typeof t4 ? (this.x = t4.x, this.y = t4.y) : (this.x = t4, this.y = e3);
  }
  add(t4) {
    return new U(this.x + t4.x, this.y + t4.y);
  }
  addEquals(t4) {
    return this.x += t4.x, this.y += t4.y, this;
  }
  scalarAdd(t4) {
    return new U(this.x + t4, this.y + t4);
  }
  scalarAddEquals(t4) {
    return this.x += t4, this.y += t4, this;
  }
  subtract(t4) {
    return new U(this.x - t4.x, this.y - t4.y);
  }
  subtractEquals(t4) {
    return this.x -= t4.x, this.y -= t4.y, this;
  }
  scalarSubtract(t4) {
    return new U(this.x - t4, this.y - t4);
  }
  scalarSubtractEquals(t4) {
    return this.x -= t4, this.y -= t4, this;
  }
  multiply(t4) {
    return new U(this.x * t4.x, this.y * t4.y);
  }
  scalarMultiply(t4) {
    return new U(this.x * t4, this.y * t4);
  }
  scalarMultiplyEquals(t4) {
    return this.x *= t4, this.y *= t4, this;
  }
  divide(t4) {
    return new U(this.x / t4.x, this.y / t4.y);
  }
  scalarDivide(t4) {
    return new U(this.x / t4, this.y / t4);
  }
  scalarDivideEquals(t4) {
    return this.x /= t4, this.y /= t4, this;
  }
  eq(t4) {
    return this.x === t4.x && this.y === t4.y;
  }
  lt(t4) {
    return this.x < t4.x && this.y < t4.y;
  }
  lte(t4) {
    return this.x <= t4.x && this.y <= t4.y;
  }
  gt(t4) {
    return this.x > t4.x && this.y > t4.y;
  }
  gte(t4) {
    return this.x >= t4.x && this.y >= t4.y;
  }
  lerp(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0.5;
    return e3 = Math.max(Math.min(1, e3), 0), new U(this.x + (t4.x - this.x) * e3, this.y + (t4.y - this.y) * e3);
  }
  distanceFrom(t4) {
    const e3 = this.x - t4.x, s4 = this.y - t4.y;
    return Math.sqrt(e3 * e3 + s4 * s4);
  }
  midPointFrom(t4) {
    return this.lerp(t4);
  }
  min(t4) {
    return new U(Math.min(this.x, t4.x), Math.min(this.y, t4.y));
  }
  max(t4) {
    return new U(Math.max(this.x, t4.x), Math.max(this.y, t4.y));
  }
  toString() {
    return "".concat(this.x, ",").concat(this.y);
  }
  setXY(t4, e3) {
    return this.x = t4, this.y = e3, this;
  }
  setX(t4) {
    return this.x = t4, this;
  }
  setY(t4) {
    return this.y = t4, this;
  }
  setFromPoint(t4) {
    return this.x = t4.x, this.y = t4.y, this;
  }
  swap(t4) {
    const e3 = this.x, s4 = this.y;
    this.x = t4.x, this.y = t4.y, t4.x = e3, t4.y = s4;
  }
  clone() {
    return new U(this.x, this.y);
  }
  rotate(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : N;
    const s4 = G$1(t4), i3 = H3(t4), r2 = this.subtract(e3);
    return new U(r2.x * i3 - r2.y * s4, r2.x * s4 + r2.y * i3).add(e3);
  }
  transform(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
    return new U(t4[0] * this.x + t4[2] * this.y + (e3 ? 0 : t4[4]), t4[1] * this.x + t4[3] * this.y + (e3 ? 0 : t4[5]));
  }
}
const N = new U(0, 0), q2 = (t4) => !!t4 && Array.isArray(t4._objects);
function K2(t4) {
  class e3 extends t4 {
    constructor() {
      super(...arguments), s3(this, "_objects", []);
    }
    _onObjectAdded(t5) {
    }
    _onObjectRemoved(t5) {
    }
    _onStackOrderChanged(t5) {
    }
    add() {
      for (var t5 = arguments.length, e4 = new Array(t5), s4 = 0; s4 < t5; s4++)
        e4[s4] = arguments[s4];
      const i3 = this._objects.push(...e4);
      return e4.forEach((t6) => this._onObjectAdded(t6)), i3;
    }
    insertAt(t5) {
      for (var e4 = arguments.length, s4 = new Array(e4 > 1 ? e4 - 1 : 0), i3 = 1; i3 < e4; i3++)
        s4[i3 - 1] = arguments[i3];
      return this._objects.splice(t5, 0, ...s4), s4.forEach((t6) => this._onObjectAdded(t6)), this._objects.length;
    }
    remove() {
      const t5 = this._objects, e4 = [];
      for (var s4 = arguments.length, i3 = new Array(s4), r2 = 0; r2 < s4; r2++)
        i3[r2] = arguments[r2];
      return i3.forEach((s5) => {
        const i4 = t5.indexOf(s5);
        -1 !== i4 && (t5.splice(i4, 1), e4.push(s5), this._onObjectRemoved(s5));
      }), e4;
    }
    forEachObject(t5) {
      this.getObjects().forEach((e4, s4, i3) => t5(e4, s4, i3));
    }
    getObjects() {
      for (var t5 = arguments.length, e4 = new Array(t5), s4 = 0; s4 < t5; s4++)
        e4[s4] = arguments[s4];
      return 0 === e4.length ? [...this._objects] : this._objects.filter((t6) => t6.isType(...e4));
    }
    item(t5) {
      return this._objects[t5];
    }
    isEmpty() {
      return 0 === this._objects.length;
    }
    size() {
      return this._objects.length;
    }
    contains(t5, s4) {
      return !!this._objects.includes(t5) || !!s4 && this._objects.some((s5) => s5 instanceof e3 && s5.contains(t5, true));
    }
    complexity() {
      return this._objects.reduce((t5, e4) => t5 += e4.complexity ? e4.complexity() : 0, 0);
    }
    sendObjectToBack(t5) {
      return !(!t5 || t5 === this._objects[0]) && (z2(this._objects, t5), this._objects.unshift(t5), this._onStackOrderChanged(t5), true);
    }
    bringObjectToFront(t5) {
      return !(!t5 || t5 === this._objects[this._objects.length - 1]) && (z2(this._objects, t5), this._objects.push(t5), this._onStackOrderChanged(t5), true);
    }
    sendObjectBackwards(t5, e4) {
      if (!t5)
        return false;
      const s4 = this._objects.indexOf(t5);
      if (0 !== s4) {
        const i3 = this.findNewLowerIndex(t5, s4, e4);
        return z2(this._objects, t5), this._objects.splice(i3, 0, t5), this._onStackOrderChanged(t5), true;
      }
      return false;
    }
    bringObjectForward(t5, e4) {
      if (!t5)
        return false;
      const s4 = this._objects.indexOf(t5);
      if (s4 !== this._objects.length - 1) {
        const i3 = this.findNewUpperIndex(t5, s4, e4);
        return z2(this._objects, t5), this._objects.splice(i3, 0, t5), this._onStackOrderChanged(t5), true;
      }
      return false;
    }
    moveObjectTo(t5, e4) {
      return t5 !== this._objects[e4] && (z2(this._objects, t5), this._objects.splice(e4, 0, t5), this._onStackOrderChanged(t5), true);
    }
    findNewLowerIndex(t5, e4, s4) {
      let i3;
      if (s4) {
        i3 = e4;
        for (let s5 = e4 - 1; s5 >= 0; --s5)
          if (t5.isOverlapping(this._objects[s5])) {
            i3 = s5;
            break;
          }
      } else
        i3 = e4 - 1;
      return i3;
    }
    findNewUpperIndex(t5, e4, s4) {
      let i3;
      if (s4) {
        i3 = e4;
        for (let s5 = e4 + 1; s5 < this._objects.length; ++s5)
          if (t5.isOverlapping(this._objects[s5])) {
            i3 = s5;
            break;
          }
      } else
        i3 = e4 + 1;
      return i3;
    }
    collectObjects(t5) {
      let { left: e4, top: s4, width: i3, height: r2 } = t5, { includeIntersecting: n2 = true } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const o2 = [], a4 = new U(e4, s4), h4 = a4.add(new U(i3, r2));
      for (let t6 = this._objects.length - 1; t6 >= 0; t6--) {
        const e5 = this._objects[t6];
        e5.selectable && e5.visible && (n2 && e5.intersectsWithRect(a4, h4) || e5.isContainedWithinRect(a4, h4) || n2 && e5.containsPoint(a4) || n2 && e5.containsPoint(h4)) && o2.push(e5);
      }
      return o2;
    }
  }
  return e3;
}
class J extends Y2 {
  _setOptions() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    for (const e3 in t4)
      this.set(e3, t4[e3]);
  }
  _setObject(t4) {
    for (const e3 in t4)
      this._set(e3, t4[e3]);
  }
  set(t4, e3) {
    return "object" == typeof t4 ? this._setObject(t4) : this._set(t4, e3), this;
  }
  _set(t4, e3) {
    this[t4] = e3;
  }
  toggle(t4) {
    const e3 = this.get(t4);
    return "boolean" == typeof e3 && this.set(t4, !e3), this;
  }
  get(t4) {
    return this[t4];
  }
}
function Z(t4) {
  return y3().requestAnimationFrame(t4);
}
function Q2(t4) {
  return y3().cancelAnimationFrame(t4);
}
let $ = 0;
const tt$1 = () => $++, et$1 = () => {
  const t4 = v$1().createElement("canvas");
  if (!t4 || void 0 === t4.getContext)
    throw new c2("Failed to create `canvas` element");
  return t4;
}, st$1 = () => v$1().createElement("img"), it$1 = (t4, e3, s4) => t4.toDataURL("image/".concat(e3), s4), rt$1 = (t4) => t4 * T$1, nt$1 = (t4) => t4 / T$1, ot$1 = (t4) => t4.every((t5, e3) => t5 === O2[e3]), at$1 = (t4, e3, s4) => new U(t4).transform(e3, s4), ht$1 = (t4) => {
  const e3 = 1 / (t4[0] * t4[3] - t4[1] * t4[2]), s4 = [e3 * t4[3], -e3 * t4[1], -e3 * t4[2], e3 * t4[0], 0, 0], { x: i3, y: r2 } = new U(t4[4], t4[5]).transform(s4, true);
  return s4[4] = -i3, s4[5] = -r2, s4;
}, ct$1 = (t4, e3, s4) => [t4[0] * e3[0] + t4[2] * e3[1], t4[1] * e3[0] + t4[3] * e3[1], t4[0] * e3[2] + t4[2] * e3[3], t4[1] * e3[2] + t4[3] * e3[3], s4 ? 0 : t4[0] * e3[4] + t4[2] * e3[5] + t4[4], s4 ? 0 : t4[1] * e3[4] + t4[3] * e3[5] + t4[5]], lt$1 = (t4, e3) => t4.reduceRight((t5, s4) => s4 && t5 ? ct$1(s4, t5, e3) : s4 || t5, void 0) || O2.concat(), ut$1 = (t4) => {
  let [e3, s4] = t4;
  return Math.atan2(s4, e3);
}, dt$1 = (t4) => {
  const e3 = ut$1(t4), s4 = Math.pow(t4[0], 2) + Math.pow(t4[1], 2), i3 = Math.sqrt(s4), r2 = (t4[0] * t4[3] - t4[2] * t4[1]) / i3, n2 = Math.atan2(t4[0] * t4[2] + t4[1] * t4[3], s4);
  return { angle: nt$1(e3), scaleX: i3, scaleY: r2, skewX: nt$1(n2), skewY: 0, translateX: t4[4] || 0, translateY: t4[5] || 0 };
}, gt$1 = function(t4) {
  return [1, 0, 0, 1, t4, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0];
};
function ft$1() {
  let { angle: t4 = 0 } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, { x: e3 = 0, y: s4 = 0 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  const i3 = rt$1(t4), r2 = H3(i3), n2 = G$1(i3);
  return [r2, n2, -n2, r2, e3 ? e3 - (r2 * e3 - n2 * s4) : 0, s4 ? s4 - (n2 * e3 + r2 * s4) : 0];
}
const pt$1 = function(t4) {
  return [t4, 0, 0, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : t4, 0, 0];
}, mt$1 = (t4) => Math.tan(rt$1(t4)), vt$1 = (t4) => [1, 0, mt$1(t4), 1, 0, 0], yt$1 = (t4) => [1, mt$1(t4), 0, 1, 0, 0], _t = (t4) => {
  let { scaleX: e3 = 1, scaleY: s4 = 1, flipX: i3 = false, flipY: r2 = false, skewX: n2 = 0, skewY: o2 = 0 } = t4, a4 = pt$1(i3 ? -e3 : e3, r2 ? -s4 : s4);
  return n2 && (a4 = ct$1(a4, vt$1(n2), true)), o2 && (a4 = ct$1(a4, yt$1(o2), true)), a4;
}, xt = (t4) => {
  const { translateX: e3 = 0, translateY: s4 = 0, angle: i3 = 0 } = t4;
  let r2 = gt$1(e3, s4);
  i3 && (r2 = ct$1(r2, ft$1({ angle: i3 })));
  const n2 = _t(t4);
  return ot$1(n2) || (r2 = ct$1(r2, n2)), r2;
}, Ct = function(t4) {
  let { signal: e3, crossOrigin: s4 = null } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return new Promise(function(i3, r2) {
    if (e3 && e3.aborted)
      return r2(new l("loadImage"));
    const n2 = st$1();
    let o2;
    e3 && (o2 = function(t5) {
      n2.src = "", r2(t5);
    }, e3.addEventListener("abort", o2, { once: true }));
    const a4 = function() {
      n2.onload = n2.onerror = null, o2 && (null == e3 || e3.removeEventListener("abort", o2)), i3(n2);
    };
    t4 ? (n2.onload = a4, n2.onerror = function() {
      o2 && (null == e3 || e3.removeEventListener("abort", o2)), r2(new c2("Error loading ".concat(n2.src)));
    }, s4 && (n2.crossOrigin = s4), n2.src = t4) : a4();
  });
}, bt$1 = function(t4) {
  let { signal: e3, reviver: s4 = b$1 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return new Promise((i3, r2) => {
    const n2 = [];
    e3 && e3.addEventListener("abort", r2, { once: true }), Promise.all(t4.map((t5) => I2.getClass(t5.type).fromObject(t5, { signal: e3 }).then((e4) => (s4(t5, e4), n2.push(e4), e4)))).then(i3).catch((t5) => {
      n2.forEach((t6) => {
        t6.dispose && t6.dispose();
      }), r2(t5);
    }).finally(() => {
      e3 && e3.removeEventListener("abort", r2);
    });
  });
}, wt = function(t4) {
  let { signal: e3 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return new Promise((s4, i3) => {
    const r2 = [];
    e3 && e3.addEventListener("abort", i3, { once: true });
    const n2 = Object.values(t4).map((t5) => t5 ? t5.type ? bt$1([t5], { signal: e3 }).then((t6) => {
      let [e4] = t6;
      return r2.push(e4), e4;
    }) : t5.source ? I2.getClass("pattern").fromObject(t5, { signal: e3 }).then((t6) => (r2.push(t6), t6)) : t5 : t5), o2 = Object.keys(t4);
    Promise.all(n2).then((t5) => t5.reduce((t6, e4, s5) => (t6[o2[s5]] = e4, t6), {})).then(s4).catch((t5) => {
      r2.forEach((t6) => {
        t6.dispose && t6.dispose();
      }), i3(t5);
    }).finally(() => {
      e3 && e3.removeEventListener("abort", i3);
    });
  });
}, St = function(t4) {
  return (arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : []).reduce((e3, s4) => (s4 in t4 && (e3[s4] = t4[s4]), e3), {});
}, Tt = (t4, e3) => Object.keys(t4).reduce((s4, i3) => (e3(t4[i3], i3, t4) && (s4[i3] = t4[i3]), s4), {}), Ot = { aliceblue: "#F0F8FF", antiquewhite: "#FAEBD7", aqua: "#0FF", aquamarine: "#7FFFD4", azure: "#F0FFFF", beige: "#F5F5DC", bisque: "#FFE4C4", black: "#000", blanchedalmond: "#FFEBCD", blue: "#00F", blueviolet: "#8A2BE2", brown: "#A52A2A", burlywood: "#DEB887", cadetblue: "#5F9EA0", chartreuse: "#7FFF00", chocolate: "#D2691E", coral: "#FF7F50", cornflowerblue: "#6495ED", cornsilk: "#FFF8DC", crimson: "#DC143C", cyan: "#0FF", darkblue: "#00008B", darkcyan: "#008B8B", darkgoldenrod: "#B8860B", darkgray: "#A9A9A9", darkgrey: "#A9A9A9", darkgreen: "#006400", darkkhaki: "#BDB76B", darkmagenta: "#8B008B", darkolivegreen: "#556B2F", darkorange: "#FF8C00", darkorchid: "#9932CC", darkred: "#8B0000", darksalmon: "#E9967A", darkseagreen: "#8FBC8F", darkslateblue: "#483D8B", darkslategray: "#2F4F4F", darkslategrey: "#2F4F4F", darkturquoise: "#00CED1", darkviolet: "#9400D3", deeppink: "#FF1493", deepskyblue: "#00BFFF", dimgray: "#696969", dimgrey: "#696969", dodgerblue: "#1E90FF", firebrick: "#B22222", floralwhite: "#FFFAF0", forestgreen: "#228B22", fuchsia: "#F0F", gainsboro: "#DCDCDC", ghostwhite: "#F8F8FF", gold: "#FFD700", goldenrod: "#DAA520", gray: "#808080", grey: "#808080", green: "#008000", greenyellow: "#ADFF2F", honeydew: "#F0FFF0", hotpink: "#FF69B4", indianred: "#CD5C5C", indigo: "#4B0082", ivory: "#FFFFF0", khaki: "#F0E68C", lavender: "#E6E6FA", lavenderblush: "#FFF0F5", lawngreen: "#7CFC00", lemonchiffon: "#FFFACD", lightblue: "#ADD8E6", lightcoral: "#F08080", lightcyan: "#E0FFFF", lightgoldenrodyellow: "#FAFAD2", lightgray: "#D3D3D3", lightgrey: "#D3D3D3", lightgreen: "#90EE90", lightpink: "#FFB6C1", lightsalmon: "#FFA07A", lightseagreen: "#20B2AA", lightskyblue: "#87CEFA", lightslategray: "#789", lightslategrey: "#789", lightsteelblue: "#B0C4DE", lightyellow: "#FFFFE0", lime: "#0F0", limegreen: "#32CD32", linen: "#FAF0E6", magenta: "#F0F", maroon: "#800000", mediumaquamarine: "#66CDAA", mediumblue: "#0000CD", mediumorchid: "#BA55D3", mediumpurple: "#9370DB", mediumseagreen: "#3CB371", mediumslateblue: "#7B68EE", mediumspringgreen: "#00FA9A", mediumturquoise: "#48D1CC", mediumvioletred: "#C71585", midnightblue: "#191970", mintcream: "#F5FFFA", mistyrose: "#FFE4E1", moccasin: "#FFE4B5", navajowhite: "#FFDEAD", navy: "#000080", oldlace: "#FDF5E6", olive: "#808000", olivedrab: "#6B8E23", orange: "#FFA500", orangered: "#FF4500", orchid: "#DA70D6", palegoldenrod: "#EEE8AA", palegreen: "#98FB98", paleturquoise: "#AFEEEE", palevioletred: "#DB7093", papayawhip: "#FFEFD5", peachpuff: "#FFDAB9", peru: "#CD853F", pink: "#FFC0CB", plum: "#DDA0DD", powderblue: "#B0E0E6", purple: "#800080", rebeccapurple: "#639", red: "#F00", rosybrown: "#BC8F8F", royalblue: "#4169E1", saddlebrown: "#8B4513", salmon: "#FA8072", sandybrown: "#F4A460", seagreen: "#2E8B57", seashell: "#FFF5EE", sienna: "#A0522D", silver: "#C0C0C0", skyblue: "#87CEEB", slateblue: "#6A5ACD", slategray: "#708090", slategrey: "#708090", snow: "#FFFAFA", springgreen: "#00FF7F", steelblue: "#4682B4", tan: "#D2B48C", teal: "#008080", thistle: "#D8BFD8", tomato: "#FF6347", turquoise: "#40E0D0", violet: "#EE82EE", wheat: "#F5DEB3", white: "#FFF", whitesmoke: "#F5F5F5", yellow: "#FF0", yellowgreen: "#9ACD32" }, kt = (t4, e3, s4) => (s4 < 0 && (s4 += 1), s4 > 1 && (s4 -= 1), s4 < 1 / 6 ? t4 + 6 * (e3 - t4) * s4 : s4 < 0.5 ? e3 : s4 < 2 / 3 ? t4 + (e3 - t4) * (2 / 3 - s4) * 6 : t4), Dt$1 = (t4, e3, s4, i3) => {
  t4 /= 255, e3 /= 255, s4 /= 255;
  const r2 = Math.max(t4, e3, s4), n2 = Math.min(t4, e3, s4);
  let o2, a4;
  const h4 = (r2 + n2) / 2;
  if (r2 === n2)
    o2 = a4 = 0;
  else {
    const i4 = r2 - n2;
    switch (a4 = h4 > 0.5 ? i4 / (2 - r2 - n2) : i4 / (r2 + n2), r2) {
      case t4:
        o2 = (e3 - s4) / i4 + (e3 < s4 ? 6 : 0);
        break;
      case e3:
        o2 = (s4 - t4) / i4 + 2;
        break;
      case s4:
        o2 = (t4 - e3) / i4 + 4;
    }
    o2 /= 6;
  }
  return [Math.round(360 * o2), Math.round(100 * a4), Math.round(100 * h4), i3];
}, Mt = function() {
  let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "1";
  return parseFloat(t4) / (t4.endsWith("%") ? 100 : 1);
}, Pt = (t4) => Math.min(Math.round(t4), 255).toString(16).toUpperCase().padStart(2, "0"), Et = (t4) => {
  let [e3, s4, i3, r2 = 1] = t4;
  const n2 = Math.round(0.3 * e3 + 0.59 * s4 + 0.11 * i3);
  return [n2, n2, n2, r2];
};
class At {
  constructor(t4) {
    if (t4)
      if (t4 instanceof At)
        this.setSource([...t4._source]);
      else if (Array.isArray(t4)) {
        const [e3, s4, i3, r2 = 1] = t4;
        this.setSource([e3, s4, i3, r2]);
      } else
        this.setSource(this._tryParsingColor(t4));
    else
      this.setSource([0, 0, 0, 1]);
  }
  _tryParsingColor(t4) {
    return t4 in Ot && (t4 = Ot[t4]), "transparent" === t4 ? [255, 255, 255, 0] : At.sourceFromHex(t4) || At.sourceFromRgb(t4) || At.sourceFromHsl(t4) || [0, 0, 0, 1];
  }
  getSource() {
    return this._source;
  }
  setSource(t4) {
    this._source = t4;
  }
  toRgb() {
    const [t4, e3, s4] = this.getSource();
    return "rgb(".concat(t4, ",").concat(e3, ",").concat(s4, ")");
  }
  toRgba() {
    return "rgba(".concat(this.getSource().join(","), ")");
  }
  toHsl() {
    const [t4, e3, s4] = Dt$1(...this.getSource());
    return "hsl(".concat(t4, ",").concat(e3, "%,").concat(s4, "%)");
  }
  toHsla() {
    const [t4, e3, s4, i3] = Dt$1(...this.getSource());
    return "hsla(".concat(t4, ",").concat(e3, "%,").concat(s4, "%,").concat(i3, ")");
  }
  toHex() {
    return this.toHexa().slice(0, 6);
  }
  toHexa() {
    const [t4, e3, s4, i3] = this.getSource();
    return "".concat(Pt(t4)).concat(Pt(e3)).concat(Pt(s4)).concat(Pt(Math.round(255 * i3)));
  }
  getAlpha() {
    return this.getSource()[3];
  }
  setAlpha(t4) {
    return this._source[3] = t4, this;
  }
  toGrayscale() {
    return this.setSource(Et(this.getSource())), this;
  }
  toBlackWhite(t4) {
    const [e3, , , s4] = Et(this.getSource()), i3 = e3 < (t4 || 127) ? 0 : 255;
    return this.setSource([i3, i3, i3, s4]), this;
  }
  overlayWith(t4) {
    t4 instanceof At || (t4 = new At(t4));
    const e3 = this.getSource(), s4 = t4.getSource(), [i3, r2, n2] = e3.map((t5, e4) => Math.round(0.5 * t5 + 0.5 * s4[e4]));
    return this.setSource([i3, r2, n2, e3[3]]), this;
  }
  static fromRgb(t4) {
    return At.fromRgba(t4);
  }
  static fromRgba(t4) {
    return new At(At.sourceFromRgb(t4));
  }
  static sourceFromRgb(t4) {
    const e3 = t4.match(/^rgba?\(\s*(\d{0,3}(?:\.\d+)?%?)\s*[\s|,]\s*(\d{0,3}(?:\.\d+)?%?)\s*[\s|,]\s*(\d{0,3}(?:\.\d+)?%?)\s*(?:\s*[,/]\s*(\d{0,3}(?:\.\d+)?%?)\s*)?\)$/i);
    if (e3) {
      const [t5, s4, i3] = e3.slice(1, 4).map((t6) => {
        const e4 = parseFloat(t6);
        return t6.endsWith("%") ? Math.round(2.55 * e4) : e4;
      });
      return [t5, s4, i3, Mt(e3[4])];
    }
  }
  static fromHsl(t4) {
    return At.fromHsla(t4);
  }
  static fromHsla(t4) {
    return new At(At.sourceFromHsl(t4));
  }
  static sourceFromHsl(t4) {
    const e3 = t4.match(/^hsla?\(\s*([+-]?\d{1,3})\s*[\s|,]\s*(\d{1,3}%)\s*[\s|,]\s*(\d{1,3}%)\s*(?:\s*[,/]\s*(\d*(?:\.\d+)?%?)\s*)?\)$/i);
    if (!e3)
      return;
    const s4 = (parseFloat(e3[1]) % 360 + 360) % 360 / 360, i3 = parseFloat(e3[2]) / 100, r2 = parseFloat(e3[3]) / 100;
    let n2, o2, a4;
    if (0 === i3)
      n2 = o2 = a4 = r2;
    else {
      const t5 = r2 <= 0.5 ? r2 * (i3 + 1) : r2 + i3 - r2 * i3, e4 = 2 * r2 - t5;
      n2 = kt(e4, t5, s4 + 1 / 3), o2 = kt(e4, t5, s4), a4 = kt(e4, t5, s4 - 1 / 3);
    }
    return [Math.round(255 * n2), Math.round(255 * o2), Math.round(255 * a4), Mt(e3[4])];
  }
  static fromHex(t4) {
    return new At(At.sourceFromHex(t4));
  }
  static sourceFromHex(t4) {
    if (t4.match(/^#?(([0-9a-f]){3,4}|([0-9a-f]{2}){3,4})$/i)) {
      const e3 = t4.slice(t4.indexOf("#") + 1);
      let s4;
      s4 = e3.length <= 4 ? e3.split("").map((t5) => t5 + t5) : e3.match(/.{2}/g);
      const [i3, r2, n2, o2 = 255] = s4.map((t5) => parseInt(t5, 16));
      return [i3, r2, n2, o2 / 255];
    }
  }
}
const jt = (t4, e3) => parseFloat(Number(t4).toFixed(e3)), Ft = function(t4) {
  let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : k2;
  const s4 = /\D{0,2}$/.exec(t4), i3 = parseFloat(t4), r2 = a3.DPI;
  switch (null == s4 ? void 0 : s4[0]) {
    case "mm":
      return i3 * r2 / 25.4;
    case "cm":
      return i3 * r2 / 2.54;
    case "in":
      return i3 * r2;
    case "pt":
      return i3 * r2 / 72;
    case "pc":
      return i3 * r2 / 72 * 12;
    case "em":
      return i3 * e3;
    default:
      return i3;
  }
}, Lt$1 = (t4) => {
  const [e3, s4] = t4.trim().split(" "), [i3, r2] = (n2 = e3) && n2 !== F ? [n2.slice(1, 4), n2.slice(5, 8)] : n2 === F ? [n2, n2] : ["Mid", "Mid"];
  var n2;
  return { meetOrSlice: s4 || "meet", alignX: i3, alignY: r2 };
}, Rt = (t4) => "matrix(" + t4.map((t5) => jt(t5, a3.NUM_FRACTION_DIGITS)).join(" ") + ")", Bt = function(t4, e3) {
  let s4, i3, r2 = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2];
  if (e3)
    if (e3.toLive)
      s4 = "url(#SVGID_".concat(e3.id, ")");
    else {
      const t5 = new At(e3), r3 = t5.getAlpha();
      s4 = t5.toRgb(), 1 !== r3 && (i3 = r3.toString());
    }
  else
    s4 = "none";
  return r2 ? "".concat(t4, ": ").concat(s4, "; ").concat(i3 ? "".concat(t4, "-opacity: ").concat(i3, "; ") : "") : "".concat(t4, '="').concat(s4, '" ').concat(i3 ? "".concat(t4, '-opacity="').concat(i3, '" ') : "");
}, It = (t4) => !!t4 && void 0 !== t4.toLive, Xt = (t4) => !!t4 && "function" == typeof t4.toObject, Yt = (t4) => !!t4 && void 0 !== t4.offsetX && "source" in t4, Wt = (t4) => !!t4 && "function" == typeof t4._renderText, Vt = (t4) => !!t4 && "multiSelectionStacking" in t4;
function zt(t4) {
  const e3 = t4 && Ht(t4);
  let s4 = 0, i3 = 0;
  if (!t4 || !e3)
    return { left: s4, top: i3 };
  const r2 = e3.documentElement, n2 = e3.body || { scrollLeft: 0, scrollTop: 0 };
  for (; t4 && (t4.parentNode || t4.host) && ((t4 = t4.parentNode || t4.host) === e3 ? (s4 = n2.scrollLeft || r2.scrollLeft || 0, i3 = n2.scrollTop || r2.scrollTop || 0) : (s4 += t4.scrollLeft || 0, i3 += t4.scrollTop || 0), 1 !== t4.nodeType || "fixed" !== t4.style.position); )
    ;
  return { left: s4, top: i3 };
}
const Ht = (t4) => t4.ownerDocument || null, Gt = (t4) => {
  var e3;
  return (null === (e3 = t4.ownerDocument) || void 0 === e3 ? void 0 : e3.defaultView) || null;
};
function Ut(t4, e3) {
  const s4 = t4.style;
  s4 && ("string" == typeof e3 ? t4.style.cssText += ";" + e3 : Object.entries(e3).forEach((t5) => {
    let [e4, i3] = t5;
    return s4.setProperty(e4, i3);
  }));
}
const Nt = function(t4, e3, s4) {
  let { width: i3, height: r2 } = s4, n2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 1;
  t4.width = i3, t4.height = r2, n2 > 1 && (t4.setAttribute("width", (i3 * n2).toString()), t4.setAttribute("height", (r2 * n2).toString()), e3.scale(n2, n2));
};
const qt = (t4, e3) => {
  let { width: s4, height: i3 } = e3;
  s4 && (t4.style.width = "number" == typeof s4 ? "".concat(s4, "px") : s4), i3 && (t4.style.height = "number" == typeof i3 ? "".concat(i3, "px") : i3);
};
function Kt(t4) {
  return void 0 !== t4.onselectstart && (t4.onselectstart = () => false), t4.style.userSelect = F, t4;
}
class Jt {
  constructor(t4) {
    s3(this, "_originalCanvasStyle", void 0), s3(this, "lower", void 0);
    const e3 = this.createLowerCanvas(t4);
    this.lower = { el: e3, ctx: e3.getContext("2d") };
  }
  createLowerCanvas(t4) {
    const e3 = (s4 = t4) && void 0 !== s4.getContext ? t4 : t4 && v$1().getElementById(t4) || et$1();
    var s4;
    if (e3.hasAttribute("data-fabric"))
      throw new c2("Trying to initialize a canvas that has already been initialized. Did you forget to dispose the canvas?");
    return this._originalCanvasStyle = e3.style.cssText, e3.setAttribute("data-fabric", "main"), e3.classList.add("lower-canvas"), e3;
  }
  cleanupDOM(t4) {
    let { width: e3, height: s4 } = t4;
    const { el: i3 } = this.lower;
    i3.classList.remove("lower-canvas"), i3.removeAttribute("data-fabric"), i3.setAttribute("width", "".concat(e3)), i3.setAttribute("height", "".concat(s4)), i3.style.cssText = this._originalCanvasStyle || "", this._originalCanvasStyle = void 0;
  }
  setDimensions(t4, e3) {
    const { el: s4, ctx: i3 } = this.lower;
    Nt(s4, i3, t4, e3);
  }
  setCSSDimensions(t4) {
    qt(this.lower.el, t4);
  }
  calcOffset() {
    return function(t4) {
      var e3;
      let s4 = { left: 0, top: 0 };
      const i3 = t4 && Ht(t4), r2 = { left: 0, top: 0 }, n2 = { borderLeftWidth: P, borderTopWidth: E2, paddingLeft: P, paddingTop: E2 };
      if (!i3)
        return r2;
      const o2 = (null === (e3 = Gt(t4)) || void 0 === e3 ? void 0 : e3.getComputedStyle(t4, null)) || {};
      for (const t5 in n2)
        r2[n2[t5]] += parseInt(o2[t5], 10) || 0;
      const a4 = i3.documentElement;
      void 0 !== t4.getBoundingClientRect && (s4 = t4.getBoundingClientRect());
      const h4 = zt(t4);
      return { left: s4.left + h4.left - (a4.clientLeft || 0) + r2.left, top: s4.top + h4.top - (a4.clientTop || 0) + r2.top };
    }(this.lower.el);
  }
  dispose() {
    m3().dispose(this.lower.el), delete this.lower;
  }
}
const Zt = { backgroundVpt: true, backgroundColor: "", overlayVpt: true, overlayColor: "", includeDefaultValues: true, svgViewportTransformation: true, renderOnAddRemove: true, skipOffscreen: true, enableRetinaScaling: true, imageSmoothingEnabled: true, controlsAboveOverlay: false, allowTouchScrolling: false, viewportTransform: [...O2] };
class Qt extends K2(J) {
  get lowerCanvasEl() {
    var t4;
    return null === (t4 = this.elements.lower) || void 0 === t4 ? void 0 : t4.el;
  }
  get contextContainer() {
    var t4;
    return null === (t4 = this.elements.lower) || void 0 === t4 ? void 0 : t4.ctx;
  }
  static getDefaults() {
    return Qt.ownDefaults;
  }
  constructor(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(), Object.assign(this, this.constructor.getDefaults()), this.set(e3), this.initElements(t4), this._setDimensionsImpl({ width: this.width || this.elements.lower.el.width || 0, height: this.height || this.elements.lower.el.height || 0 }), this.skipControlsDrawing = false, this.viewportTransform = [...this.viewportTransform], this.calcViewportBoundaries();
  }
  initElements(t4) {
    this.elements = new Jt(t4);
  }
  add() {
    const t4 = super.add(...arguments);
    return arguments.length > 0 && this.renderOnAddRemove && this.requestRenderAll(), t4;
  }
  insertAt(t4) {
    for (var e3 = arguments.length, s4 = new Array(e3 > 1 ? e3 - 1 : 0), i3 = 1; i3 < e3; i3++)
      s4[i3 - 1] = arguments[i3];
    const r2 = super.insertAt(t4, ...s4);
    return s4.length > 0 && this.renderOnAddRemove && this.requestRenderAll(), r2;
  }
  remove() {
    const t4 = super.remove(...arguments);
    return t4.length > 0 && this.renderOnAddRemove && this.requestRenderAll(), t4;
  }
  _onObjectAdded(t4) {
    t4.canvas && t4.canvas !== this && (h$1("warn", "Canvas is trying to add an object that belongs to a different canvas.\nResulting to default behavior: removing object from previous canvas and adding to new canvas"), t4.canvas.remove(t4)), t4._set("canvas", this), t4.setCoords(), this.fire("object:added", { target: t4 }), t4.fire("added", { target: this });
  }
  _onObjectRemoved(t4) {
    t4._set("canvas", void 0), this.fire("object:removed", { target: t4 }), t4.fire("removed", { target: this });
  }
  _onStackOrderChanged() {
    this.renderOnAddRemove && this.requestRenderAll();
  }
  getRetinaScaling() {
    return this.enableRetinaScaling ? _() : 1;
  }
  calcOffset() {
    return this._offset = this.elements.calcOffset();
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  setWidth(t4, e3) {
    return this.setDimensions({ width: t4 }, e3);
  }
  setHeight(t4, e3) {
    return this.setDimensions({ height: t4 }, e3);
  }
  _setDimensionsImpl(t4) {
    let { cssOnly: s4 = false, backstoreOnly: i3 = false } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (!s4) {
      const s5 = e2({ width: this.width, height: this.height }, t4);
      this.elements.setDimensions(s5, this.getRetinaScaling()), this.hasLostContext = true, this.width = s5.width, this.height = s5.height;
    }
    i3 || this.elements.setCSSDimensions(t4), this.calcOffset();
  }
  setDimensions(t4, e3) {
    this._setDimensionsImpl(t4, e3), e3 && e3.cssOnly || this.requestRenderAll();
  }
  getZoom() {
    return this.viewportTransform[0];
  }
  setViewportTransform(t4) {
    const e3 = this.backgroundImage, s4 = this.overlayImage, i3 = this._objects.length;
    this.viewportTransform = t4;
    for (let t5 = 0; t5 < i3; t5++) {
      const e4 = this._objects[t5];
      e4.group || e4.setCoords();
    }
    e3 && e3.setCoords(), s4 && s4.setCoords(), this.calcViewportBoundaries(), this.renderOnAddRemove && this.requestRenderAll();
  }
  zoomToPoint(t4, e3) {
    const s4 = t4, i3 = [...this.viewportTransform], r2 = at$1(t4, ht$1(i3));
    i3[0] = e3, i3[3] = e3;
    const n2 = at$1(r2, i3);
    i3[4] += s4.x - n2.x, i3[5] += s4.y - n2.y, this.setViewportTransform(i3);
  }
  setZoom(t4) {
    this.zoomToPoint(new U(0, 0), t4);
  }
  absolutePan(t4) {
    const e3 = [...this.viewportTransform];
    return e3[4] = -t4.x, e3[5] = -t4.y, this.setViewportTransform(e3);
  }
  relativePan(t4) {
    return this.absolutePan(new U(-t4.x - this.viewportTransform[4], -t4.y - this.viewportTransform[5]));
  }
  getElement() {
    return this.elements.lower.el;
  }
  clearContext(t4) {
    t4.clearRect(0, 0, this.width, this.height);
  }
  getContext() {
    return this.elements.lower.ctx;
  }
  clear() {
    this.remove(...this.getObjects()), this.backgroundImage = void 0, this.overlayImage = void 0, this.backgroundColor = "", this.overlayColor = "", this.clearContext(this.getContext()), this.fire("canvas:cleared"), this.renderOnAddRemove && this.requestRenderAll();
  }
  renderAll() {
    this.cancelRequestedRender(), this.destroyed || this.renderCanvas(this.getContext(), this._objects);
  }
  renderAndReset() {
    this.nextRenderHandle = 0, this.renderAll();
  }
  requestRenderAll() {
    this.nextRenderHandle || this.disposed || this.destroyed || (this.nextRenderHandle = Z(() => this.renderAndReset()));
  }
  calcViewportBoundaries() {
    const t4 = this.width, e3 = this.height, s4 = ht$1(this.viewportTransform), i3 = at$1({ x: 0, y: 0 }, s4), r2 = at$1({ x: t4, y: e3 }, s4), n2 = i3.min(r2), o2 = i3.max(r2);
    return this.vptCoords = { tl: n2, tr: new U(o2.x, n2.y), bl: new U(n2.x, o2.y), br: o2 };
  }
  cancelRequestedRender() {
    this.nextRenderHandle && (Q2(this.nextRenderHandle), this.nextRenderHandle = 0);
  }
  drawControls(t4) {
  }
  renderCanvas(t4, e3) {
    if (this.destroyed)
      return;
    const s4 = this.viewportTransform, i3 = this.clipPath;
    this.calcViewportBoundaries(), this.clearContext(t4), t4.imageSmoothingEnabled = this.imageSmoothingEnabled, t4.patternQuality = "best", this.fire("before:render", { ctx: t4 }), this._renderBackground(t4), t4.save(), t4.transform(s4[0], s4[1], s4[2], s4[3], s4[4], s4[5]), this._renderObjects(t4, e3), t4.restore(), this.controlsAboveOverlay || this.skipControlsDrawing || this.drawControls(t4), i3 && (i3._set("canvas", this), i3.shouldCache(), i3._transformDone = true, i3.renderCache({ forClipping: true }), this.drawClipPathOnCanvas(t4, i3)), this._renderOverlay(t4), this.controlsAboveOverlay && !this.skipControlsDrawing && this.drawControls(t4), this.fire("after:render", { ctx: t4 }), this.__cleanupTask && (this.__cleanupTask(), this.__cleanupTask = void 0);
  }
  drawClipPathOnCanvas(t4, e3) {
    const s4 = this.viewportTransform;
    t4.save(), t4.transform(...s4), t4.globalCompositeOperation = "destination-in", e3.transform(t4), t4.scale(1 / e3.zoomX, 1 / e3.zoomY), t4.drawImage(e3._cacheCanvas, -e3.cacheTranslationX, -e3.cacheTranslationY), t4.restore();
  }
  _renderObjects(t4, e3) {
    for (let s4 = 0, i3 = e3.length; s4 < i3; ++s4)
      e3[s4] && e3[s4].render(t4);
  }
  _renderBackgroundOrOverlay(t4, e3) {
    const s4 = this["".concat(e3, "Color")], i3 = this["".concat(e3, "Image")], r2 = this.viewportTransform, n2 = this["".concat(e3, "Vpt")];
    if (!s4 && !i3)
      return;
    const o2 = It(s4);
    if (s4) {
      if (t4.save(), t4.beginPath(), t4.moveTo(0, 0), t4.lineTo(this.width, 0), t4.lineTo(this.width, this.height), t4.lineTo(0, this.height), t4.closePath(), t4.fillStyle = o2 ? s4.toLive(t4) : s4, n2 && t4.transform(...r2), o2) {
        t4.transform(1, 0, 0, 1, s4.offsetX || 0, s4.offsetY || 0);
        const e4 = s4.gradientTransform || s4.patternTransform;
        e4 && t4.transform(...e4);
      }
      t4.fill(), t4.restore();
    }
    if (i3) {
      t4.save();
      const { skipOffscreen: e4 } = this;
      this.skipOffscreen = n2, n2 && t4.transform(...r2), i3.render(t4), this.skipOffscreen = e4, t4.restore();
    }
  }
  _renderBackground(t4) {
    this._renderBackgroundOrOverlay(t4, "background");
  }
  _renderOverlay(t4) {
    this._renderBackgroundOrOverlay(t4, "overlay");
  }
  getCenter() {
    return { top: this.height / 2, left: this.width / 2 };
  }
  getCenterPoint() {
    return new U(this.width / 2, this.height / 2);
  }
  centerObjectH(t4) {
    return this._centerObject(t4, new U(this.getCenterPoint().x, t4.getCenterPoint().y));
  }
  centerObjectV(t4) {
    return this._centerObject(t4, new U(t4.getCenterPoint().x, this.getCenterPoint().y));
  }
  centerObject(t4) {
    return this._centerObject(t4, this.getCenterPoint());
  }
  viewportCenterObject(t4) {
    return this._centerObject(t4, this.getVpCenter());
  }
  viewportCenterObjectH(t4) {
    return this._centerObject(t4, new U(this.getVpCenter().x, t4.getCenterPoint().y));
  }
  viewportCenterObjectV(t4) {
    return this._centerObject(t4, new U(t4.getCenterPoint().x, this.getVpCenter().y));
  }
  getVpCenter() {
    return at$1(this.getCenterPoint(), ht$1(this.viewportTransform));
  }
  _centerObject(t4, e3) {
    t4.setXY(e3, M3, M3), t4.setCoords(), this.renderOnAddRemove && this.requestRenderAll();
  }
  toDatalessJSON(t4) {
    return this.toDatalessObject(t4);
  }
  toObject(t4) {
    return this._toObjectMethod("toObject", t4);
  }
  toJSON() {
    return this.toObject();
  }
  toDatalessObject(t4) {
    return this._toObjectMethod("toDatalessObject", t4);
  }
  _toObjectMethod(t4, s4) {
    const i3 = this.clipPath, r2 = i3 && !i3.excludeFromExport ? this._toObject(i3, t4, s4) : null;
    return e2(e2(e2({ version: C }, St(this, s4)), {}, { objects: this._objects.filter((t5) => !t5.excludeFromExport).map((e3) => this._toObject(e3, t4, s4)) }, this.__serializeBgOverlay(t4, s4)), r2 ? { clipPath: r2 } : null);
  }
  _toObject(t4, e3, s4) {
    let i3;
    this.includeDefaultValues || (i3 = t4.includeDefaultValues, t4.includeDefaultValues = false);
    const r2 = t4[e3](s4);
    return this.includeDefaultValues || (t4.includeDefaultValues = !!i3), r2;
  }
  __serializeBgOverlay(t4, e3) {
    const s4 = {}, i3 = this.backgroundImage, r2 = this.overlayImage, n2 = this.backgroundColor, o2 = this.overlayColor;
    return It(n2) ? n2.excludeFromExport || (s4.background = n2.toObject(e3)) : n2 && (s4.background = n2), It(o2) ? o2.excludeFromExport || (s4.overlay = o2.toObject(e3)) : o2 && (s4.overlay = o2), i3 && !i3.excludeFromExport && (s4.backgroundImage = this._toObject(i3, t4, e3)), r2 && !r2.excludeFromExport && (s4.overlayImage = this._toObject(r2, t4, e3)), s4;
  }
  toSVG() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, e3 = arguments.length > 1 ? arguments[1] : void 0;
    t4.reviver = e3;
    const s4 = [];
    return this._setSVGPreamble(s4, t4), this._setSVGHeader(s4, t4), this.clipPath && s4.push('<g clip-path="url(#'.concat(this.clipPath.clipPathId, ')" >\n')), this._setSVGBgOverlayColor(s4, "background"), this._setSVGBgOverlayImage(s4, "backgroundImage", e3), this._setSVGObjects(s4, e3), this.clipPath && s4.push("</g>\n"), this._setSVGBgOverlayColor(s4, "overlay"), this._setSVGBgOverlayImage(s4, "overlayImage", e3), s4.push("</svg>"), s4.join("");
  }
  _setSVGPreamble(t4, e3) {
    e3.suppressPreamble || t4.push('<?xml version="1.0" encoding="', e3.encoding || "UTF-8", '" standalone="no" ?>\n', '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ', '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n');
  }
  _setSVGHeader(t4, e3) {
    const s4 = e3.width || "".concat(this.width), i3 = e3.height || "".concat(this.height), r2 = a3.NUM_FRACTION_DIGITS, n2 = e3.viewBox;
    let o2;
    if (n2)
      o2 = 'viewBox="'.concat(n2.x, " ").concat(n2.y, " ").concat(n2.width, " ").concat(n2.height, '" ');
    else if (this.svgViewportTransformation) {
      const t5 = this.viewportTransform;
      o2 = 'viewBox="'.concat(jt(-t5[4] / t5[0], r2), " ").concat(jt(-t5[5] / t5[3], r2), " ").concat(jt(this.width / t5[0], r2), " ").concat(jt(this.height / t5[3], r2), '" ');
    } else
      o2 = 'viewBox="0 0 '.concat(this.width, " ").concat(this.height, '" ');
    t4.push("<svg ", 'xmlns="http://www.w3.org/2000/svg" ', 'xmlns:xlink="http://www.w3.org/1999/xlink" ', 'version="1.1" ', 'width="', s4, '" ', 'height="', i3, '" ', o2, 'xml:space="preserve">\n', "<desc>Created with Fabric.js ", C, "</desc>\n", "<defs>\n", this.createSVGFontFacesMarkup(), this.createSVGRefElementsMarkup(), this.createSVGClipPathMarkup(e3), "</defs>\n");
  }
  createSVGClipPathMarkup(t4) {
    const e3 = this.clipPath;
    return e3 ? (e3.clipPathId = "CLIPPATH_".concat(tt$1()), '<clipPath id="'.concat(e3.clipPathId, '" >\n').concat(e3.toClipPathSVG(t4.reviver), "</clipPath>\n")) : "";
  }
  createSVGRefElementsMarkup() {
    return ["background", "overlay"].map((t4) => {
      const e3 = this["".concat(t4, "Color")];
      if (It(e3)) {
        const s4 = this["".concat(t4, "Vpt")], i3 = this.viewportTransform, r2 = { isType: () => false, width: this.width / (s4 ? i3[0] : 1), height: this.height / (s4 ? i3[3] : 1) };
        return e3.toSVG(r2, { additionalTransform: s4 ? Rt(i3) : "" });
      }
    }).join("");
  }
  createSVGFontFacesMarkup() {
    const t4 = [], e3 = {}, s4 = a3.fontPaths;
    this._objects.forEach(function e4(s5) {
      t4.push(s5), q2(s5) && s5._objects.forEach(e4);
    }), t4.forEach((t5) => {
      if (!Wt(t5))
        return;
      const { styles: i4, fontFamily: r2 } = t5;
      !e3[r2] && s4[r2] && (e3[r2] = true, i4 && Object.values(i4).forEach((t6) => {
        Object.values(t6).forEach((t7) => {
          let { fontFamily: i5 = "" } = t7;
          !e3[i5] && s4[i5] && (e3[i5] = true);
        });
      }));
    });
    const i3 = Object.keys(e3).map((t5) => "		@font-face {\n			font-family: '".concat(t5, "';\n			src: url('").concat(s4[t5], "');\n		}\n")).join("");
    return i3 ? '	<style type="text/css"><![CDATA[\n'.concat(i3, "]]></style>\n") : "";
  }
  _setSVGObjects(t4, e3) {
    this.forEachObject((s4) => {
      s4.excludeFromExport || this._setSVGObject(t4, s4, e3);
    });
  }
  _setSVGObject(t4, e3, s4) {
    t4.push(e3.toSVG(s4));
  }
  _setSVGBgOverlayImage(t4, e3, s4) {
    const i3 = this[e3];
    i3 && !i3.excludeFromExport && i3.toSVG && t4.push(i3.toSVG(s4));
  }
  _setSVGBgOverlayColor(t4, e3) {
    const s4 = this["".concat(e3, "Color")];
    if (s4)
      if (It(s4)) {
        const i3 = s4.repeat || "", r2 = this.width, n2 = this.height, o2 = this["".concat(e3, "Vpt")] ? Rt(ht$1(this.viewportTransform)) : "";
        t4.push('<rect transform="'.concat(o2, " translate(").concat(r2 / 2, ",").concat(n2 / 2, ')" x="').concat(s4.offsetX - r2 / 2, '" y="').concat(s4.offsetY - n2 / 2, '" width="').concat("repeat-y" !== i3 && "no-repeat" !== i3 || !Yt(s4) ? r2 : s4.source.width, '" height="').concat("repeat-x" !== i3 && "no-repeat" !== i3 || !Yt(s4) ? n2 : s4.source.height, '" fill="url(#SVGID_').concat(s4.id, ')"></rect>\n'));
      } else
        t4.push('<rect x="0" y="0" width="100%" height="100%" ', 'fill="', s4, '"', "></rect>\n");
  }
  loadFromJSON(t4, e3) {
    let { signal: s4 } = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    if (!t4)
      return Promise.reject(new c2("`json` is undefined"));
    const i3 = "string" == typeof t4 ? JSON.parse(t4) : t4, { objects: r2 = [], backgroundImage: n2, background: o2, overlayImage: a4, overlay: h4, clipPath: l2 } = i3, u3 = this.renderOnAddRemove;
    return this.renderOnAddRemove = false, Promise.all([bt$1(r2, { reviver: e3, signal: s4 }), wt({ backgroundImage: n2, backgroundColor: o2, overlayImage: a4, overlayColor: h4, clipPath: l2 }, { signal: s4 })]).then((t5) => {
      let [e4, s5] = t5;
      return this.clear(), this.add(...e4), this.set(i3), this.set(s5), this.renderOnAddRemove = u3, this;
    });
  }
  clone(t4) {
    const e3 = this.toObject(t4);
    return this.cloneWithoutData().loadFromJSON(e3);
  }
  cloneWithoutData() {
    const t4 = et$1();
    return t4.width = this.width, t4.height = this.height, new this.constructor(t4);
  }
  toDataURL() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    const { format: e3 = "png", quality: s4 = 1, multiplier: i3 = 1, enableRetinaScaling: r2 = false } = t4, n2 = i3 * (r2 ? this.getRetinaScaling() : 1);
    return it$1(this.toCanvasElement(n2, t4), e3, s4);
  }
  toCanvasElement() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1, { width: e3, height: s4, left: i3, top: r2, filter: n2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const o2 = (e3 || this.width) * t4, a4 = (s4 || this.height) * t4, h4 = this.getZoom(), c3 = this.width, l2 = this.height, u3 = this.skipControlsDrawing, d4 = h4 * t4, g2 = this.viewportTransform, f2 = [d4, 0, 0, d4, (g2[4] - (i3 || 0)) * t4, (g2[5] - (r2 || 0)) * t4], p2 = this.enableRetinaScaling, m4 = et$1(), v2 = n2 ? this._objects.filter((t5) => n2(t5)) : this._objects;
    return m4.width = o2, m4.height = a4, this.enableRetinaScaling = false, this.viewportTransform = f2, this.width = o2, this.height = a4, this.skipControlsDrawing = true, this.calcViewportBoundaries(), this.renderCanvas(m4.getContext("2d"), v2), this.viewportTransform = g2, this.width = c3, this.height = l2, this.calcViewportBoundaries(), this.enableRetinaScaling = p2, this.skipControlsDrawing = u3, m4;
  }
  dispose() {
    return !this.disposed && this.elements.cleanupDOM({ width: this.width, height: this.height }), X2.cancelByCanvas(this), this.disposed = true, new Promise((t4, e3) => {
      const s4 = () => {
        this.destroy(), t4(true);
      };
      s4.kill = e3, this.__cleanupTask && this.__cleanupTask.kill("aborted"), this.destroyed ? t4(false) : this.nextRenderHandle ? this.__cleanupTask = s4 : s4();
    });
  }
  destroy() {
    this.destroyed = true, this.cancelRequestedRender(), this.forEachObject((t4) => t4.dispose()), this._objects = [], this.backgroundImage && this.backgroundImage.dispose(), this.backgroundImage = void 0, this.overlayImage && this.overlayImage.dispose(), this.overlayImage = void 0, this.elements.dispose();
  }
  toString() {
    return "#<Canvas (".concat(this.complexity(), "): { objects: ").concat(this._objects.length, " }>");
  }
}
s3(Qt, "ownDefaults", Zt);
const $t = ["touchstart", "touchmove", "touchend"];
const te$1 = (t4) => {
  const e3 = zt(t4.target), s4 = function(t5) {
    const e4 = t5.changedTouches;
    return e4 && e4[0] ? e4[0] : t5;
  }(t4);
  return new U(s4.clientX + e3.left, s4.clientY + e3.top);
}, ee = (t4) => $t.includes(t4.type) || "touch" === t4.pointerType, se$1 = (t4) => {
  t4.preventDefault(), t4.stopPropagation();
}, ie = (t4) => {
  if (0 === t4.length)
    return { left: 0, top: 0, width: 0, height: 0 };
  const { min: e3, max: s4 } = t4.reduce((t5, e4) => {
    let { min: s5, max: i4 } = t5;
    return { min: s5.min(e4), max: i4.max(e4) };
  }, { min: new U(t4[0]), max: new U(t4[0]) }), i3 = s4.subtract(e3);
  return { left: e3.x, top: e3.y, width: i3.x, height: i3.y };
}, re = ["translateX", "translateY", "scaleX", "scaleY"], ne = (t4, e3) => oe(t4, ct$1(e3, t4.calcOwnMatrix())), oe = (t4, e3) => {
  const s4 = dt$1(e3), { translateX: r2, translateY: n2, scaleX: o2, scaleY: a4 } = s4, h4 = i2(s4, re), c3 = new U(r2, n2);
  t4.flipX = false, t4.flipY = false, Object.assign(t4, h4), t4.set({ scaleX: o2, scaleY: a4 }), t4.setPositionByOrigin(c3, M3, M3);
}, ae = (t4) => {
  t4.scaleX = 1, t4.scaleY = 1, t4.skewX = 0, t4.skewY = 0, t4.flipX = false, t4.flipY = false, t4.rotate(0);
}, he = (t4) => ({ scaleX: t4.scaleX, scaleY: t4.scaleY, skewX: t4.skewX, skewY: t4.skewY, angle: t4.angle, left: t4.left, flipX: t4.flipX, flipY: t4.flipY, top: t4.top }), ce = (t4, e3, s4) => {
  const i3 = t4 / 2, r2 = e3 / 2, n2 = [new U(-i3, -r2), new U(i3, -r2), new U(-i3, r2), new U(i3, r2)].map((t5) => t5.transform(s4)), o2 = ie(n2);
  return new U(o2.width, o2.height);
}, le = function() {
  let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : O2;
  return ct$1(ht$1(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : O2), t4);
}, ue = function(t4) {
  let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : O2, s4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : O2;
  return t4.transform(le(e3, s4));
}, de = function(t4) {
  let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : O2, s4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : O2;
  return t4.transform(le(e3, s4), true);
}, ge = (t4, e3, s4) => {
  const i3 = le(e3, s4);
  return oe(t4, ct$1(i3, t4.calcOwnMatrix())), i3;
}, fe = (t4, s4) => {
  var i3;
  const { transform: { target: r2 } } = s4;
  null === (i3 = r2.canvas) || void 0 === i3 || i3.fire("object:".concat(t4), e2(e2({}, s4), {}, { target: r2 })), r2.fire(t4, s4);
}, pe = { left: -0.5, top: -0.5, center: 0, bottom: 0.5, right: 0.5 }, me = (t4) => "string" == typeof t4 ? pe[t4] : t4 - 0.5, ve = "not-allowed";
function ye(t4) {
  return t4.originX === M3 && t4.originY === M3;
}
function _e(t4) {
  return 0.5 - me(t4);
}
const xe$1 = (t4, e3) => t4[e3], Ce = (t4, e3, s4, i3) => ({ e: t4, transform: e3, pointer: new U(s4, i3) });
function be(t4, e3) {
  const s4 = t4.getTotalAngle() + nt$1(Math.atan2(e3.y, e3.x)) + 360;
  return Math.round(s4 % 360 / 45);
}
function we(t4, e3, s4, i3, r2) {
  var n2;
  let { target: o2, corner: a4 } = t4;
  const h4 = o2.controls[a4], c3 = (null === (n2 = o2.canvas) || void 0 === n2 ? void 0 : n2.getZoom()) || 1, l2 = o2.padding / c3, u3 = function(t5, e4, s5, i4) {
    const r3 = t5.getRelativeCenterPoint(), n3 = void 0 !== s5 && void 0 !== i4 ? t5.translateToGivenOrigin(r3, M3, M3, s5, i4) : new U(t5.left, t5.top);
    return (t5.angle ? e4.rotate(-rt$1(t5.angle), r3) : e4).subtract(n3);
  }(o2, new U(i3, r2), e3, s4);
  return u3.x >= l2 && (u3.x -= l2), u3.x <= -l2 && (u3.x += l2), u3.y >= l2 && (u3.y -= l2), u3.y <= l2 && (u3.y += l2), u3.x -= h4.offsetX, u3.y -= h4.offsetY, u3;
}
const Se = (t4, e3, s4, i3) => {
  const { target: r2, offsetX: n2, offsetY: o2 } = e3, a4 = s4 - n2, h4 = i3 - o2, c3 = !xe$1(r2, "lockMovementX") && r2.left !== a4, l2 = !xe$1(r2, "lockMovementY") && r2.top !== h4;
  return c3 && r2.set(P, a4), l2 && r2.set(E2, h4), (c3 || l2) && fe("moving", Ce(t4, e3, s4, i3)), c3 || l2;
};
class Te {
  getSvgStyles(t4) {
    const e3 = this.fillRule ? this.fillRule : "nonzero", s4 = this.strokeWidth ? this.strokeWidth : "0", i3 = this.strokeDashArray ? this.strokeDashArray.join(" ") : F, r2 = this.strokeDashOffset ? this.strokeDashOffset : "0", n2 = this.strokeLineCap ? this.strokeLineCap : "butt", o2 = this.strokeLineJoin ? this.strokeLineJoin : "miter", a4 = this.strokeMiterLimit ? this.strokeMiterLimit : "4", h4 = void 0 !== this.opacity ? this.opacity : "1", c3 = this.visible ? "" : " visibility: hidden;", l2 = t4 ? "" : this.getSvgFilter(), u3 = Bt("fill", this.fill);
    return [Bt("stroke", this.stroke), "stroke-width: ", s4, "; ", "stroke-dasharray: ", i3, "; ", "stroke-linecap: ", n2, "; ", "stroke-dashoffset: ", r2, "; ", "stroke-linejoin: ", o2, "; ", "stroke-miterlimit: ", a4, "; ", u3, "fill-rule: ", e3, "; ", "opacity: ", h4, ";", l2, c3].join("");
  }
  getSvgFilter() {
    return this.shadow ? "filter: url(#SVGID_".concat(this.shadow.id, ");") : "";
  }
  getSvgCommons() {
    return [this.id ? 'id="'.concat(this.id, '" ') : "", this.clipPath ? 'clip-path="url(#'.concat(this.clipPath.clipPathId, ')" ') : ""].join("");
  }
  getSvgTransform(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
    const s4 = t4 ? this.calcTransformMatrix() : this.calcOwnMatrix(), i3 = 'transform="'.concat(Rt(s4));
    return "".concat(i3).concat(e3, '" ');
  }
  _toSVG(t4) {
    return [""];
  }
  toSVG(t4) {
    return this._createBaseSVGMarkup(this._toSVG(t4), { reviver: t4 });
  }
  toClipPathSVG(t4) {
    return "	" + this._createBaseClipPathSVGMarkup(this._toSVG(t4), { reviver: t4 });
  }
  _createBaseClipPathSVGMarkup(t4) {
    let { reviver: e3, additionalTransform: s4 = "" } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const i3 = [this.getSvgTransform(true, s4), this.getSvgCommons()].join(""), r2 = t4.indexOf("COMMON_PARTS");
    return t4[r2] = i3, e3 ? e3(t4.join("")) : t4.join("");
  }
  _createBaseSVGMarkup(t4) {
    let { noStyle: e3, reviver: s4, withShadow: i3, additionalTransform: r2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const n2 = e3 ? "" : 'style="'.concat(this.getSvgStyles(), '" '), o2 = i3 ? 'style="'.concat(this.getSvgFilter(), '" ') : "", a4 = this.clipPath, h4 = this.strokeUniform ? 'vector-effect="non-scaling-stroke" ' : "", c3 = a4 && a4.absolutePositioned, l2 = this.stroke, u3 = this.fill, d4 = this.shadow, g2 = [], f2 = t4.indexOf("COMMON_PARTS");
    let p2;
    a4 && (a4.clipPathId = "CLIPPATH_".concat(tt$1()), p2 = '<clipPath id="'.concat(a4.clipPathId, '" >\n').concat(a4.toClipPathSVG(s4), "</clipPath>\n")), c3 && g2.push("<g ", o2, this.getSvgCommons(), " >\n"), g2.push("<g ", this.getSvgTransform(false), c3 ? "" : o2 + this.getSvgCommons(), " >\n");
    const m4 = [n2, h4, e3 ? "" : this.addPaintOrder(), " ", r2 ? 'transform="'.concat(r2, '" ') : ""].join("");
    return t4[f2] = m4, It(u3) && g2.push(u3.toSVG(this)), It(l2) && g2.push(l2.toSVG(this)), d4 && g2.push(d4.toSVG(this)), a4 && g2.push(p2), g2.push(t4.join("")), g2.push("</g>\n"), c3 && g2.push("</g>\n"), s4 ? s4(g2.join("")) : g2.join("");
  }
  addPaintOrder() {
    return "fill" !== this.paintFirst ? ' paint-order="'.concat(this.paintFirst, '" ') : "";
  }
}
const De = (t4, e3, s4, i3) => -s4 * Math.cos(t4 / i3 * w2) + s4 + e3;
const Ae$1 = () => false;
let je$1 = class je {
  constructor(t4) {
    let { startValue: e3, byValue: i3, duration: r2 = 500, delay: n2 = 0, easing: o2 = De, onStart: a4 = b$1, onChange: h4 = b$1, onComplete: c3 = b$1, abort: l2 = Ae$1, target: u3 } = t4;
    s3(this, "_state", "pending"), s3(this, "durationProgress", 0), s3(this, "valueProgress", 0), this.tick = this.tick.bind(this), this.duration = r2, this.delay = n2, this.easing = o2, this._onStart = a4, this._onChange = h4, this._onComplete = c3, this._abort = l2, this.target = u3, this.startValue = e3, this.byValue = i3, this.value = this.startValue, this.endValue = Object.freeze(this.calculate(this.duration).value);
  }
  get state() {
    return this._state;
  }
  isDone() {
    return "aborted" === this._state || "completed" === this._state;
  }
  start() {
    const t4 = (t5) => {
      "pending" === this._state && (this.startTime = t5 || +/* @__PURE__ */ new Date(), this._state = "running", this._onStart(), this.tick(this.startTime));
    };
    this.register(), this.delay > 0 ? setTimeout(() => Z(t4), this.delay) : Z(t4);
  }
  tick(t4) {
    const e3 = (t4 || +/* @__PURE__ */ new Date()) - this.startTime, s4 = Math.min(e3, this.duration);
    this.durationProgress = s4 / this.duration;
    const { value: i3, valueProgress: r2 } = this.calculate(s4);
    this.value = Object.freeze(i3), this.valueProgress = r2, "aborted" !== this._state && (this._abort(this.value, this.valueProgress, this.durationProgress) ? (this._state = "aborted", this.unregister()) : e3 >= this.duration ? (this.durationProgress = this.valueProgress = 1, this._onChange(this.endValue, this.valueProgress, this.durationProgress), this._state = "completed", this._onComplete(this.endValue, this.valueProgress, this.durationProgress), this.unregister()) : (this._onChange(this.value, this.valueProgress, this.durationProgress), Z(this.tick)));
  }
  register() {
    X2.push(this);
  }
  unregister() {
    X2.remove(this);
  }
  abort() {
    this._state = "aborted", this.unregister();
  }
};
const Fe = ["startValue", "endValue"];
class Le extends je$1 {
  constructor(t4) {
    let { startValue: s4 = 0, endValue: r2 = 100 } = t4;
    super(e2(e2({}, i2(t4, Fe)), {}, { startValue: s4, byValue: r2 - s4 }));
  }
  calculate(t4) {
    const e3 = this.easing(t4, this.startValue, this.byValue, this.duration);
    return { value: e3, valueProgress: Math.abs((e3 - this.startValue) / this.byValue) };
  }
}
const Re = ["startValue", "endValue"];
class Be extends je$1 {
  constructor(t4) {
    let { startValue: s4 = [0], endValue: r2 = [100] } = t4;
    super(e2(e2({}, i2(t4, Re)), {}, { startValue: s4, byValue: r2.map((t5, e3) => t5 - s4[e3]) }));
  }
  calculate(t4) {
    const e3 = this.startValue.map((e4, s4) => this.easing(t4, e4, this.byValue[s4], this.duration, s4));
    return { value: e3, valueProgress: Math.abs((e3[0] - this.startValue[0]) / this.byValue[0]) };
  }
}
const Ie = (t4, e3, s4) => Math.max(t4, Math.min(e3, s4)), Xe$1 = ["startValue", "endValue", "easing", "onChange", "onComplete", "abort"], Ye$1 = (t4, e3, s4, i3) => e3 + s4 * (1 - Math.cos(t4 / i3 * w2)), We$1 = (t4) => t4 && ((e3, s4, i3) => t4(new At(e3).toRgba(), s4, i3));
class Ve extends je$1 {
  constructor(t4) {
    let { startValue: s4, endValue: r2, easing: n2 = Ye$1, onChange: o2, onComplete: a4, abort: h4 } = t4, c3 = i2(t4, Xe$1);
    const l2 = new At(s4).getSource(), u3 = new At(r2).getSource();
    super(e2(e2({}, c3), {}, { startValue: l2, byValue: u3.map((t5, e3) => t5 - l2[e3]), easing: n2, onChange: We$1(o2), onComplete: We$1(a4), abort: We$1(h4) }));
  }
  calculate(t4) {
    const [e3, s4, i3, r2] = this.startValue.map((e4, s5) => this.easing(t4, e4, this.byValue[s5], this.duration, s5)), n2 = [...[e3, s4, i3].map(Math.round), Ie(0, r2, 1)];
    return { value: n2, valueProgress: n2.map((t5, e4) => 0 !== this.byValue[e4] ? Math.abs((t5 - this.startValue[e4]) / this.byValue[e4]) : 0).find((t5) => 0 !== t5) || 0 };
  }
}
function ze$1(t4) {
  const e3 = ((t5) => Array.isArray(t5.startValue) || Array.isArray(t5.endValue))(t4) ? new Be(t4) : new Le(t4);
  return e3.start(), e3;
}
function He(t4) {
  const e3 = new Ve(t4);
  return e3.start(), e3;
}
const Ge$1 = new U(1, 0), Ue$1 = new U(), Ne$1 = (t4, e3) => t4.rotate(e3), qe = (t4, e3) => new U(e3).subtract(t4), Ke$1 = (t4) => t4.distanceFrom(Ue$1), Je$1 = (t4, e3) => Math.atan2(ts(t4, e3), es(t4, e3)), Ze$1 = (t4) => Je$1(Ge$1, t4), Qe$1 = (t4) => t4.eq(Ue$1) ? t4 : t4.scalarDivide(Ke$1(t4)), $e = function(t4) {
  let e3 = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
  return Qe$1(new U(-t4.y, t4.x).scalarMultiply(e3 ? 1 : -1));
}, ts = (t4, e3) => t4.x * e3.y - t4.y * e3.x, es = (t4, e3) => t4.x * e3.x + t4.y * e3.y, ss = (t4, e3, s4) => {
  if (t4.eq(e3) || t4.eq(s4))
    return true;
  const i3 = ts(e3, s4), r2 = ts(e3, t4), n2 = ts(s4, t4);
  return i3 >= 0 ? r2 >= 0 && n2 <= 0 : !(r2 <= 0 && n2 >= 0);
};
class is {
  constructor(t4) {
    this.status = t4, this.points = [];
  }
  includes(t4) {
    return this.points.some((e3) => e3.eq(t4));
  }
  append() {
    for (var t4 = arguments.length, e3 = new Array(t4), s4 = 0; s4 < t4; s4++)
      e3[s4] = arguments[s4];
    return this.points = this.points.concat(e3.filter((t5) => !this.includes(t5))), this;
  }
  static isPointContained(t4, e3, s4) {
    let i3 = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
    if (e3.eq(s4))
      return t4.eq(e3);
    if (e3.x === s4.x)
      return t4.x === e3.x && (i3 || t4.y >= Math.min(e3.y, s4.y) && t4.y <= Math.max(e3.y, s4.y));
    if (e3.y === s4.y)
      return t4.y === e3.y && (i3 || t4.x >= Math.min(e3.x, s4.x) && t4.x <= Math.max(e3.x, s4.x));
    {
      const r2 = qe(e3, s4), n2 = qe(e3, t4).divide(r2);
      return i3 ? Math.abs(n2.x) === Math.abs(n2.y) : n2.x === n2.y && n2.x >= 0 && n2.x <= 1;
    }
  }
  static isPointInPolygon(t4, e3) {
    const s4 = new U(t4).setX(Math.min(t4.x - 1, ...e3.map((t5) => t5.x)));
    let i3 = 0;
    for (let r2 = 0; r2 < e3.length; r2++) {
      const n2 = this.intersectSegmentSegment(e3[r2], e3[(r2 + 1) % e3.length], t4, s4);
      if (n2.includes(t4))
        return true;
      i3 += Number("Intersection" === n2.status);
    }
    return i3 % 2 == 1;
  }
  static intersectLineLine(t4, e3, s4, i3) {
    let r2 = !(arguments.length > 4 && void 0 !== arguments[4]) || arguments[4], n2 = !(arguments.length > 5 && void 0 !== arguments[5]) || arguments[5];
    const o2 = e3.x - t4.x, a4 = e3.y - t4.y, h4 = i3.x - s4.x, c3 = i3.y - s4.y, l2 = t4.x - s4.x, u3 = t4.y - s4.y, d4 = h4 * u3 - c3 * l2, g2 = o2 * u3 - a4 * l2, f2 = c3 * o2 - h4 * a4;
    if (0 !== f2) {
      const e4 = d4 / f2, s5 = g2 / f2;
      return (r2 || 0 <= e4 && e4 <= 1) && (n2 || 0 <= s5 && s5 <= 1) ? new is("Intersection").append(new U(t4.x + e4 * o2, t4.y + e4 * a4)) : new is();
    }
    if (0 === d4 || 0 === g2) {
      const o3 = r2 || n2 || is.isPointContained(t4, s4, i3) || is.isPointContained(e3, s4, i3) || is.isPointContained(s4, t4, e3) || is.isPointContained(i3, t4, e3);
      return new is(o3 ? "Coincident" : void 0);
    }
    return new is("Parallel");
  }
  static intersectSegmentLine(t4, e3, s4, i3) {
    return is.intersectLineLine(t4, e3, s4, i3, false, true);
  }
  static intersectSegmentSegment(t4, e3, s4, i3) {
    return is.intersectLineLine(t4, e3, s4, i3, false, false);
  }
  static intersectLinePolygon(t4, e3, s4) {
    let i3 = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3];
    const r2 = new is(), n2 = s4.length;
    for (let o2, a4, h4, c3 = 0; c3 < n2; c3++) {
      if (o2 = s4[c3], a4 = s4[(c3 + 1) % n2], h4 = is.intersectLineLine(t4, e3, o2, a4, i3, false), "Coincident" === h4.status)
        return h4;
      r2.append(...h4.points);
    }
    return r2.points.length > 0 && (r2.status = "Intersection"), r2;
  }
  static intersectSegmentPolygon(t4, e3, s4) {
    return is.intersectLinePolygon(t4, e3, s4, false);
  }
  static intersectPolygonPolygon(t4, e3) {
    const s4 = new is(), i3 = t4.length, r2 = [];
    for (let n2 = 0; n2 < i3; n2++) {
      const o2 = t4[n2], a4 = t4[(n2 + 1) % i3], h4 = is.intersectSegmentPolygon(o2, a4, e3);
      "Coincident" === h4.status ? (r2.push(h4), s4.append(o2, a4)) : s4.append(...h4.points);
    }
    return r2.length > 0 && r2.length === t4.length ? new is("Coincident") : (s4.points.length > 0 && (s4.status = "Intersection"), s4);
  }
  static intersectPolygonRectangle(t4, e3, s4) {
    const i3 = e3.min(s4), r2 = e3.max(s4), n2 = new U(r2.x, i3.y), o2 = new U(i3.x, r2.y);
    return is.intersectPolygonPolygon(t4, [i3, n2, r2, o2]);
  }
}
class rs extends J {
  _getTransformedDimensions() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    const s4 = e2({ scaleX: this.scaleX, scaleY: this.scaleY, skewX: this.skewX, skewY: this.skewY, width: this.width, height: this.height, strokeWidth: this.strokeWidth }, t4), i3 = s4.strokeWidth;
    let r2 = i3, n2 = 0;
    this.strokeUniform && (r2 = 0, n2 = i3);
    const o2 = s4.width + r2, a4 = s4.height + r2;
    let h4;
    return h4 = 0 === s4.skewX && 0 === s4.skewY ? new U(o2 * s4.scaleX, a4 * s4.scaleY) : ce(o2, a4, _t(s4)), h4.scalarAdd(n2);
  }
  translateToGivenOrigin(t4, e3, s4, i3, r2) {
    let n2 = t4.x, o2 = t4.y;
    const a4 = me(i3) - me(e3), h4 = me(r2) - me(s4);
    if (a4 || h4) {
      const t5 = this._getTransformedDimensions();
      n2 += a4 * t5.x, o2 += h4 * t5.y;
    }
    return new U(n2, o2);
  }
  translateToCenterPoint(t4, e3, s4) {
    const i3 = this.translateToGivenOrigin(t4, e3, s4, M3, M3);
    return this.angle ? i3.rotate(rt$1(this.angle), t4) : i3;
  }
  translateToOriginPoint(t4, e3, s4) {
    const i3 = this.translateToGivenOrigin(t4, M3, M3, e3, s4);
    return this.angle ? i3.rotate(rt$1(this.angle), t4) : i3;
  }
  getCenterPoint() {
    const t4 = this.getRelativeCenterPoint();
    return this.group ? at$1(t4, this.group.calcTransformMatrix()) : t4;
  }
  getRelativeCenterPoint() {
    return this.translateToCenterPoint(new U(this.left, this.top), this.originX, this.originY);
  }
  getPointByOrigin(t4, e3) {
    return this.translateToOriginPoint(this.getRelativeCenterPoint(), t4, e3);
  }
  setPositionByOrigin(t4, e3, s4) {
    const i3 = this.translateToCenterPoint(t4, e3, s4), r2 = this.translateToOriginPoint(i3, this.originX, this.originY);
    this.set({ left: r2.x, top: r2.y });
  }
  _getLeftTopCoords() {
    return this.translateToOriginPoint(this.getRelativeCenterPoint(), P, E2);
  }
}
class ns extends rs {
  getX() {
    return this.getXY().x;
  }
  setX(t4) {
    this.setXY(this.getXY().setX(t4));
  }
  getY() {
    return this.getXY().y;
  }
  setY(t4) {
    this.setXY(this.getXY().setY(t4));
  }
  getRelativeX() {
    return this.left;
  }
  setRelativeX(t4) {
    this.left = t4;
  }
  getRelativeY() {
    return this.top;
  }
  setRelativeY(t4) {
    this.top = t4;
  }
  getXY() {
    const t4 = this.getRelativeXY();
    return this.group ? at$1(t4, this.group.calcTransformMatrix()) : t4;
  }
  setXY(t4, e3, s4) {
    this.group && (t4 = at$1(t4, ht$1(this.group.calcTransformMatrix()))), this.setRelativeXY(t4, e3, s4);
  }
  getRelativeXY() {
    return new U(this.left, this.top);
  }
  setRelativeXY(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.originX, s4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.originY;
    this.setPositionByOrigin(t4, e3, s4);
  }
  isStrokeAccountedForInDimensions() {
    return false;
  }
  getCoords() {
    const { tl: t4, tr: e3, br: s4, bl: i3 } = this.aCoords || (this.aCoords = this.calcACoords()), r2 = [t4, e3, s4, i3];
    if (this.group) {
      const t5 = this.group.calcTransformMatrix();
      return r2.map((e4) => at$1(e4, t5));
    }
    return r2;
  }
  intersectsWithRect(t4, e3) {
    return "Intersection" === is.intersectPolygonRectangle(this.getCoords(), t4, e3).status;
  }
  intersectsWithObject(t4) {
    const e3 = is.intersectPolygonPolygon(this.getCoords(), t4.getCoords());
    return "Intersection" === e3.status || "Coincident" === e3.status || t4.isContainedWithinObject(this) || this.isContainedWithinObject(t4);
  }
  isContainedWithinObject(t4) {
    return this.getCoords().every((e3) => t4.containsPoint(e3));
  }
  isContainedWithinRect(t4, e3) {
    const { left: s4, top: i3, width: r2, height: n2 } = this.getBoundingRect();
    return s4 >= t4.x && s4 + r2 <= e3.x && i3 >= t4.y && i3 + n2 <= e3.y;
  }
  isOverlapping(t4) {
    return this.intersectsWithObject(t4) || this.isContainedWithinObject(t4) || t4.isContainedWithinObject(this);
  }
  containsPoint(t4) {
    return is.isPointInPolygon(t4, this.getCoords());
  }
  isOnScreen() {
    if (!this.canvas)
      return false;
    const { tl: t4, br: e3 } = this.canvas.vptCoords;
    return !!this.getCoords().some((s4) => s4.x <= e3.x && s4.x >= t4.x && s4.y <= e3.y && s4.y >= t4.y) || (!!this.intersectsWithRect(t4, e3) || this.containsPoint(t4.midPointFrom(e3)));
  }
  isPartiallyOnScreen() {
    if (!this.canvas)
      return false;
    const { tl: t4, br: e3 } = this.canvas.vptCoords;
    if (this.intersectsWithRect(t4, e3))
      return true;
    return this.getCoords().every((s4) => (s4.x >= e3.x || s4.x <= t4.x) && (s4.y >= e3.y || s4.y <= t4.y)) && this.containsPoint(t4.midPointFrom(e3));
  }
  getBoundingRect() {
    return ie(this.getCoords());
  }
  getScaledWidth() {
    return this._getTransformedDimensions().x;
  }
  getScaledHeight() {
    return this._getTransformedDimensions().y;
  }
  scale(t4) {
    this._set("scaleX", t4), this._set("scaleY", t4), this.setCoords();
  }
  scaleToWidth(t4) {
    const e3 = this.getBoundingRect().width / this.getScaledWidth();
    return this.scale(t4 / this.width / e3);
  }
  scaleToHeight(t4) {
    const e3 = this.getBoundingRect().height / this.getScaledHeight();
    return this.scale(t4 / this.height / e3);
  }
  getCanvasRetinaScaling() {
    var t4;
    return (null === (t4 = this.canvas) || void 0 === t4 ? void 0 : t4.getRetinaScaling()) || 1;
  }
  getTotalAngle() {
    return this.group ? nt$1(ut$1(this.calcTransformMatrix())) : this.angle;
  }
  getViewportTransform() {
    var t4;
    return (null === (t4 = this.canvas) || void 0 === t4 ? void 0 : t4.viewportTransform) || O2.concat();
  }
  calcACoords() {
    const t4 = ft$1({ angle: this.angle }), { x: e3, y: s4 } = this.getRelativeCenterPoint(), i3 = gt$1(e3, s4), r2 = ct$1(i3, t4), n2 = this._getTransformedDimensions(), o2 = n2.x / 2, a4 = n2.y / 2;
    return { tl: at$1({ x: -o2, y: -a4 }, r2), tr: at$1({ x: o2, y: -a4 }, r2), bl: at$1({ x: -o2, y: a4 }, r2), br: at$1({ x: o2, y: a4 }, r2) };
  }
  setCoords() {
    this.aCoords = this.calcACoords();
  }
  transformMatrixKey() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] && arguments[0], e3 = [];
    return !t4 && this.group && (e3 = this.group.transformMatrixKey(t4)), e3.push(this.top, this.left, this.width, this.height, this.scaleX, this.scaleY, this.angle, this.strokeWidth, this.skewX, this.skewY, +this.flipX, +this.flipY, me(this.originX), me(this.originY)), e3;
  }
  calcTransformMatrix() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] && arguments[0], e3 = this.calcOwnMatrix();
    if (t4 || !this.group)
      return e3;
    const s4 = this.transformMatrixKey(t4), i3 = this.matrixCache;
    return i3 && i3.key.every((t5, e4) => t5 === s4[e4]) ? i3.value : (this.group && (e3 = ct$1(this.group.calcTransformMatrix(false), e3)), this.matrixCache = { key: s4, value: e3 }, e3);
  }
  calcOwnMatrix() {
    const t4 = this.transformMatrixKey(true), e3 = this.ownMatrixCache;
    if (e3 && e3.key === t4)
      return e3.value;
    const s4 = this.getRelativeCenterPoint(), i3 = { angle: this.angle, translateX: s4.x, translateY: s4.y, scaleX: this.scaleX, scaleY: this.scaleY, skewX: this.skewX, skewY: this.skewY, flipX: this.flipX, flipY: this.flipY }, r2 = xt(i3);
    return this.ownMatrixCache = { key: t4, value: r2 }, r2;
  }
  _getNonTransformedDimensions() {
    return new U(this.width, this.height).scalarAdd(this.strokeWidth);
  }
  _calculateCurrentDimensions(t4) {
    return this._getTransformedDimensions(t4).transform(this.getViewportTransform(), true).scalarAdd(2 * this.padding);
  }
}
class os extends ns {
  isDescendantOf(t4) {
    const { parent: e3, group: s4 } = this;
    return e3 === t4 || s4 === t4 || this.canvas === t4 || !!e3 && e3.isDescendantOf(t4) || !!s4 && s4 !== e3 && s4.isDescendantOf(t4);
  }
  getAncestors(t4) {
    const e3 = [];
    let s4 = this;
    do {
      var i3;
      s4 = s4 instanceof os ? null !== (i3 = s4.parent) && void 0 !== i3 ? i3 : t4 ? void 0 : s4.canvas : void 0, s4 && e3.push(s4);
    } while (s4);
    return e3;
  }
  findCommonAncestors(t4, e3) {
    if (this === t4)
      return { fork: [], otherFork: [], common: [this, ...this.getAncestors(e3)] };
    const s4 = this.getAncestors(e3), i3 = t4.getAncestors(e3);
    if (0 === s4.length && i3.length > 0 && this === i3[i3.length - 1])
      return { fork: [], otherFork: [t4, ...i3.slice(0, i3.length - 1)], common: [this] };
    for (let e4, r2 = 0; r2 < s4.length; r2++) {
      if (e4 = s4[r2], e4 === t4)
        return { fork: [this, ...s4.slice(0, r2)], otherFork: [], common: s4.slice(r2) };
      for (let n2 = 0; n2 < i3.length; n2++) {
        if (this === i3[n2])
          return { fork: [], otherFork: [t4, ...i3.slice(0, n2)], common: [this, ...s4] };
        if (e4 === i3[n2])
          return { fork: [this, ...s4.slice(0, r2)], otherFork: [t4, ...i3.slice(0, n2)], common: s4.slice(r2) };
      }
    }
    return { fork: [this, ...s4], otherFork: [t4, ...i3], common: [] };
  }
  hasCommonAncestors(t4, e3) {
    const s4 = this.findCommonAncestors(t4, e3);
    return s4 && !!s4.common.length;
  }
  isInFrontOf(t4) {
    if (this === t4)
      return;
    const e3 = this.findCommonAncestors(t4);
    if (!e3)
      return;
    if (e3.fork.includes(t4))
      return true;
    if (e3.otherFork.includes(this))
      return false;
    const s4 = e3.common[0];
    if (!s4)
      return;
    const i3 = e3.fork.pop(), r2 = e3.otherFork.pop(), n2 = s4._objects.indexOf(i3), o2 = s4._objects.indexOf(r2);
    return n2 > -1 && n2 > o2;
  }
}
class as extends os {
  animate(t4, e3) {
    return Object.entries(t4).reduce((t5, s4) => {
      let [i3, r2] = s4;
      return t5[i3] = this._animate(i3, r2, e3), t5;
    }, {});
  }
  _animate(t4, s4) {
    let i3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    const r2 = t4.split("."), n2 = this.constructor.colorProperties.includes(r2[r2.length - 1]), { abort: o2, startValue: a4, onChange: h4, onComplete: c3 } = i3, l2 = e2(e2({}, i3), {}, { target: this, startValue: null != a4 ? a4 : r2.reduce((t5, e3) => t5[e3], this), endValue: s4, abort: null == o2 ? void 0 : o2.bind(this), onChange: (t5, e3, s5) => {
      r2.reduce((e4, s6, i4) => (i4 === r2.length - 1 && (e4[s6] = t5), e4[s6]), this), h4 && h4(t5, e3, s5);
    }, onComplete: (t5, e3, s5) => {
      this.setCoords(), c3 && c3(t5, e3, s5);
    } });
    return n2 ? He(l2) : ze$1(l2);
  }
}
function hs(t4) {
  return new RegExp("^(" + t4.join("|") + ")\\b", "i");
}
var cs, ls;
s3(as, "colorProperties", ["fill", "stroke", "backgroundColor"]);
const us = String.raw(cs || (cs = r(["(?:[-+]?(?:d*.d+|d+.?)(?:[eE][-+]?d+)?)"], ["(?:[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?)"])));
String.raw(ls || (ls = r(["(?:s+,?s*|,s*|$)"], ["(?:\\s+,?\\s*|,\\s*|$)"])));
const gs = new RegExp("(normal|italic)?\\s*(normal|small-caps)?\\s*(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)?\\s*(" + us + "(?:px|cm|mm|em|pt|pc|in)*)(?:\\/(normal|" + us + "))?\\s+(.*)"), fs = { cx: P, x: P, r: "radius", cy: E2, y: E2, display: "visible", visibility: "visible", transform: "transformMatrix", "fill-opacity": "fillOpacity", "fill-rule": "fillRule", "font-family": "fontFamily", "font-size": "fontSize", "font-style": "fontStyle", "font-weight": "fontWeight", "letter-spacing": "charSpacing", "paint-order": "paintFirst", "stroke-dasharray": "strokeDashArray", "stroke-dashoffset": "strokeDashOffset", "stroke-linecap": "strokeLineCap", "stroke-linejoin": "strokeLineJoin", "stroke-miterlimit": "strokeMiterLimit", "stroke-opacity": "strokeOpacity", "stroke-width": "strokeWidth", "text-decoration": "textDecoration", "text-anchor": "textAnchor", opacity: "opacity", "clip-path": "clipPath", "clip-rule": "clipRule", "vector-effect": "strokeUniform", "image-rendering": "imageSmoothing" }, ps = "font-size", ms = "clip-path";
hs(["path", "circle", "polygon", "polyline", "ellipse", "rect", "line", "image", "text"]);
hs(["symbol", "image", "marker", "pattern", "view", "svg"]);
const _s = hs(["symbol", "g", "a", "svg", "clipPath", "defs"]), Cs = "(-?\\d+(?:\\.\\d*)?(?:px)?(?:\\s?|$))?", bs = new RegExp("(?:\\s|^)" + Cs + Cs + "(" + us + "?(?:px)?)?(?:\\s?|$)(?:$|\\s)");
class ws {
  constructor(t4) {
    const e3 = "string" == typeof t4 ? ws.parseShadow(t4) : t4;
    Object.assign(this, ws.ownDefaults);
    for (const t5 in e3)
      this[t5] = e3[t5];
    this.id = tt$1();
  }
  static parseShadow(t4) {
    const e3 = t4.trim(), [, s4 = 0, i3 = 0, r2 = 0] = (bs.exec(e3) || []).map((t5) => parseFloat(t5) || 0);
    return { color: (e3.replace(bs, "") || "rgb(0,0,0)").trim(), offsetX: s4, offsetY: i3, blur: r2 };
  }
  toString() {
    return [this.offsetX, this.offsetY, this.blur, this.color].join("px ");
  }
  toSVG(t4) {
    const e3 = Ne$1(new U(this.offsetX, this.offsetY), rt$1(-t4.angle)), s4 = new At(this.color);
    let i3 = 40, r2 = 40;
    return t4.width && t4.height && (i3 = 100 * jt((Math.abs(e3.x) + this.blur) / t4.width, a3.NUM_FRACTION_DIGITS) + 20, r2 = 100 * jt((Math.abs(e3.y) + this.blur) / t4.height, a3.NUM_FRACTION_DIGITS) + 20), t4.flipX && (e3.x *= -1), t4.flipY && (e3.y *= -1), '<filter id="SVGID_'.concat(this.id, '" y="-').concat(r2, '%" height="').concat(100 + 2 * r2, '%" x="-').concat(i3, '%" width="').concat(100 + 2 * i3, '%" >\n	<feGaussianBlur in="SourceAlpha" stdDeviation="').concat(jt(this.blur ? this.blur / 2 : 0, a3.NUM_FRACTION_DIGITS), '"></feGaussianBlur>\n	<feOffset dx="').concat(jt(e3.x, a3.NUM_FRACTION_DIGITS), '" dy="').concat(jt(e3.y, a3.NUM_FRACTION_DIGITS), '" result="oBlur" ></feOffset>\n	<feFlood flood-color="').concat(s4.toRgb(), '" flood-opacity="').concat(s4.getAlpha(), '"/>\n	<feComposite in2="oBlur" operator="in" />\n	<feMerge>\n		<feMergeNode></feMergeNode>\n		<feMergeNode in="SourceGraphic"></feMergeNode>\n	</feMerge>\n</filter>\n');
  }
  toObject() {
    const t4 = { color: this.color, blur: this.blur, offsetX: this.offsetX, offsetY: this.offsetY, affectStroke: this.affectStroke, nonScaling: this.nonScaling, type: this.constructor.type }, e3 = ws.ownDefaults;
    return this.includeDefaultValues ? t4 : Tt(t4, (t5, s4) => t5 !== e3[s4]);
  }
  static async fromObject(t4) {
    return new this(t4);
  }
}
s3(ws, "ownDefaults", { color: "rgb(0,0,0)", blur: 0, offsetX: 0, offsetY: 0, affectStroke: false, includeDefaultValues: true, nonScaling: false }), s3(ws, "type", "shadow"), I2.setClass(ws, "shadow");
const Ss = (t4) => JSON.parse(JSON.stringify(t4)), Ts = [E2, P, "scaleX", "scaleY", "flipX", "flipY", "originX", "originY", "angle", "opacity", "globalCompositeOperation", "shadow", "visible", "skewX", "skewY"], Os = ["fill", "stroke", "strokeWidth", "strokeDashArray", "width", "height", "paintFirst", "strokeUniform", "strokeLineCap", "strokeDashOffset", "strokeLineJoin", "strokeMiterLimit", "backgroundColor", "clipPath"], ks = { top: 0, left: 0, width: 0, height: 0, angle: 0, flipX: false, flipY: false, scaleX: 1, scaleY: 1, minScaleLimit: 0, skewX: 0, skewY: 0, originX: P, originY: E2, strokeWidth: 1, strokeUniform: false, padding: 0, opacity: 1, paintFirst: "fill", fill: "rgb(0,0,0)", fillRule: "nonzero", stroke: null, strokeDashArray: null, strokeDashOffset: 0, strokeLineCap: "butt", strokeLineJoin: "miter", strokeMiterLimit: 4, globalCompositeOperation: "source-over", backgroundColor: "", shadow: null, visible: true, includeDefaultValues: true, excludeFromExport: false, objectCaching: true, clipPath: void 0, inverted: false, absolutePositioned: false, centeredRotation: true, centeredScaling: false, dirty: true }, Ds = ["type"], Ms = ["extraParam"];
let Ps = class t3 extends as {
  static getDefaults() {
    return t3.ownDefaults;
  }
  get type() {
    const t4 = this.constructor.type;
    return "FabricObject" === t4 ? "object" : t4.toLowerCase();
  }
  set type(t4) {
    h$1("warn", "Setting type has no effect", t4);
  }
  constructor(e3) {
    super(), s3(this, "_cacheContext", null), Object.assign(this, t3.ownDefaults), this.setOptions(e3);
  }
  _createCacheCanvas() {
    this._cacheCanvas = et$1(), this._cacheContext = this._cacheCanvas.getContext("2d"), this._updateCacheCanvas(), this.dirty = true;
  }
  _limitCacheSize(t4) {
    const e3 = t4.width, s4 = t4.height, i3 = a3.maxCacheSideLimit, r2 = a3.minCacheSideLimit;
    if (e3 <= i3 && s4 <= i3 && e3 * s4 <= a3.perfLimitSizeTotal)
      return e3 < r2 && (t4.width = r2), s4 < r2 && (t4.height = r2), t4;
    const n2 = e3 / s4, [o2, h4] = x2.limitDimsByArea(n2), c3 = Ie(r2, o2, i3), l2 = Ie(r2, h4, i3);
    return e3 > c3 && (t4.zoomX /= e3 / c3, t4.width = c3, t4.capped = true), s4 > l2 && (t4.zoomY /= s4 / l2, t4.height = l2, t4.capped = true), t4;
  }
  _getCacheCanvasDimensions() {
    const t4 = this.getTotalObjectScaling(), e3 = this._getTransformedDimensions({ skewX: 0, skewY: 0 }), s4 = e3.x * t4.x / this.scaleX, i3 = e3.y * t4.y / this.scaleY;
    return { width: s4 + 2, height: i3 + 2, zoomX: t4.x, zoomY: t4.y, x: s4, y: i3 };
  }
  _updateCacheCanvas() {
    const t4 = this._cacheCanvas, e3 = this._cacheContext, s4 = this._limitCacheSize(this._getCacheCanvasDimensions()), i3 = a3.minCacheSideLimit, r2 = s4.width, n2 = s4.height, o2 = s4.zoomX, h4 = s4.zoomY, c3 = r2 !== this.cacheWidth || n2 !== this.cacheHeight, l2 = this.zoomX !== o2 || this.zoomY !== h4;
    if (!t4 || !e3)
      return false;
    let u3, d4, g2 = c3 || l2, f2 = 0, p2 = 0, m4 = false;
    if (c3) {
      const t5 = this._cacheCanvas.width, e4 = this._cacheCanvas.height, o3 = r2 > t5 || n2 > e4;
      m4 = o3 || (r2 < 0.9 * t5 || n2 < 0.9 * e4) && t5 > i3 && e4 > i3, o3 && !s4.capped && (r2 > i3 || n2 > i3) && (f2 = 0.1 * r2, p2 = 0.1 * n2);
    }
    return Wt(this) && this.path && (g2 = true, m4 = true, f2 += this.getHeightOfLine(0) * this.zoomX, p2 += this.getHeightOfLine(0) * this.zoomY), !!g2 && (m4 ? (t4.width = Math.ceil(r2 + f2), t4.height = Math.ceil(n2 + p2)) : (e3.setTransform(1, 0, 0, 1, 0, 0), e3.clearRect(0, 0, t4.width, t4.height)), u3 = s4.x / 2, d4 = s4.y / 2, this.cacheTranslationX = Math.round(t4.width / 2 - u3) + u3, this.cacheTranslationY = Math.round(t4.height / 2 - d4) + d4, this.cacheWidth = r2, this.cacheHeight = n2, e3.translate(this.cacheTranslationX, this.cacheTranslationY), e3.scale(o2, h4), this.zoomX = o2, this.zoomY = h4, true);
  }
  setOptions() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this._setOptions(t4);
  }
  transform(t4) {
    const e3 = this.group && !this.group._transformDone || this.group && this.canvas && t4 === this.canvas.contextTop, s4 = this.calcTransformMatrix(!e3);
    t4.transform(s4[0], s4[1], s4[2], s4[3], s4[4], s4[5]);
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    const s4 = a3.NUM_FRACTION_DIGITS, i3 = this.clipPath && !this.clipPath.excludeFromExport ? e2(e2({}, this.clipPath.toObject(t4)), {}, { inverted: this.clipPath.inverted, absolutePositioned: this.clipPath.absolutePositioned }) : null, r2 = e2(e2({}, St(this, t4)), {}, { type: this.constructor.type, version: C, originX: this.originX, originY: this.originY, left: jt(this.left, s4), top: jt(this.top, s4), width: jt(this.width, s4), height: jt(this.height, s4), fill: Xt(this.fill) ? this.fill.toObject() : this.fill, stroke: Xt(this.stroke) ? this.stroke.toObject() : this.stroke, strokeWidth: jt(this.strokeWidth, s4), strokeDashArray: this.strokeDashArray ? this.strokeDashArray.concat() : this.strokeDashArray, strokeLineCap: this.strokeLineCap, strokeDashOffset: this.strokeDashOffset, strokeLineJoin: this.strokeLineJoin, strokeUniform: this.strokeUniform, strokeMiterLimit: jt(this.strokeMiterLimit, s4), scaleX: jt(this.scaleX, s4), scaleY: jt(this.scaleY, s4), angle: jt(this.angle, s4), flipX: this.flipX, flipY: this.flipY, opacity: jt(this.opacity, s4), shadow: this.shadow && this.shadow.toObject ? this.shadow.toObject() : this.shadow, visible: this.visible, backgroundColor: this.backgroundColor, fillRule: this.fillRule, paintFirst: this.paintFirst, globalCompositeOperation: this.globalCompositeOperation, skewX: jt(this.skewX, s4), skewY: jt(this.skewY, s4) }, i3 ? { clipPath: i3 } : null);
    return this.includeDefaultValues ? r2 : this._removeDefaultValues(r2);
  }
  toDatalessObject(t4) {
    return this.toObject(t4);
  }
  _removeDefaultValues(t4) {
    const e3 = this.constructor.getDefaults(), s4 = Object.keys(e3).length > 0 ? e3 : Object.getPrototypeOf(this);
    return Tt(t4, (t5, e4) => {
      if (e4 === P || e4 === E2 || "type" === e4)
        return true;
      const i3 = s4[e4];
      return t5 !== i3 && !(Array.isArray(t5) && Array.isArray(i3) && 0 === t5.length && 0 === i3.length);
    });
  }
  toString() {
    return "#<".concat(this.constructor.type, ">");
  }
  getObjectScaling() {
    if (!this.group)
      return new U(Math.abs(this.scaleX), Math.abs(this.scaleY));
    const t4 = dt$1(this.calcTransformMatrix());
    return new U(Math.abs(t4.scaleX), Math.abs(t4.scaleY));
  }
  getTotalObjectScaling() {
    const t4 = this.getObjectScaling();
    if (this.canvas) {
      const e3 = this.canvas.getZoom(), s4 = this.getCanvasRetinaScaling();
      return t4.scalarMultiply(e3 * s4);
    }
    return t4;
  }
  getObjectOpacity() {
    let t4 = this.opacity;
    return this.group && (t4 *= this.group.getObjectOpacity()), t4;
  }
  _constrainScale(t4) {
    return Math.abs(t4) < this.minScaleLimit ? t4 < 0 ? -this.minScaleLimit : this.minScaleLimit : 0 === t4 ? 1e-4 : t4;
  }
  _set(t4, e3) {
    "scaleX" !== t4 && "scaleY" !== t4 || (e3 = this._constrainScale(e3)), "scaleX" === t4 && e3 < 0 ? (this.flipX = !this.flipX, e3 *= -1) : "scaleY" === t4 && e3 < 0 ? (this.flipY = !this.flipY, e3 *= -1) : "shadow" !== t4 || !e3 || e3 instanceof ws || (e3 = new ws(e3));
    const s4 = this[t4] !== e3;
    return this[t4] = e3, s4 && this.constructor.cacheProperties.includes(t4) && (this.dirty = true), this.parent && (this.dirty || s4 && this.constructor.stateProperties.includes(t4)) && this.parent._set("dirty", true), this;
  }
  isNotVisible() {
    return 0 === this.opacity || !this.width && !this.height && 0 === this.strokeWidth || !this.visible;
  }
  render(t4) {
    this.isNotVisible() || this.canvas && this.canvas.skipOffscreen && !this.group && !this.isOnScreen() || (t4.save(), this._setupCompositeOperation(t4), this.drawSelectionBackground(t4), this.transform(t4), this._setOpacity(t4), this._setShadow(t4), this.shouldCache() ? (this.renderCache(), this.drawCacheOnCanvas(t4)) : (this._removeCacheCanvas(), this.drawObject(t4), this.dirty = false), t4.restore());
  }
  drawSelectionBackground(t4) {
  }
  renderCache(t4) {
    t4 = t4 || {}, this._cacheCanvas && this._cacheContext || this._createCacheCanvas(), this.isCacheDirty() && this._cacheContext && (this.drawObject(this._cacheContext, t4.forClipping), this.dirty = false);
  }
  _removeCacheCanvas() {
    this._cacheCanvas = void 0, this._cacheContext = null, this.cacheWidth = 0, this.cacheHeight = 0;
  }
  hasStroke() {
    return this.stroke && "transparent" !== this.stroke && 0 !== this.strokeWidth;
  }
  hasFill() {
    return this.fill && "transparent" !== this.fill;
  }
  needsItsOwnCache() {
    return !!("stroke" === this.paintFirst && this.hasFill() && this.hasStroke() && this.shadow) || !!this.clipPath;
  }
  shouldCache() {
    return this.ownCaching = this.needsItsOwnCache() || this.objectCaching && (!this.parent || !this.parent.isOnACache()), this.ownCaching;
  }
  willDrawShadow() {
    return !!this.shadow && (0 !== this.shadow.offsetX || 0 !== this.shadow.offsetY);
  }
  drawClipPathOnCache(t4, e3) {
    if (t4.save(), e3.inverted ? t4.globalCompositeOperation = "destination-out" : t4.globalCompositeOperation = "destination-in", e3.absolutePositioned) {
      const e4 = ht$1(this.calcTransformMatrix());
      t4.transform(e4[0], e4[1], e4[2], e4[3], e4[4], e4[5]);
    }
    e3.transform(t4), t4.scale(1 / e3.zoomX, 1 / e3.zoomY), t4.drawImage(e3._cacheCanvas, -e3.cacheTranslationX, -e3.cacheTranslationY), t4.restore();
  }
  drawObject(t4, e3) {
    const s4 = this.fill, i3 = this.stroke;
    e3 ? (this.fill = "black", this.stroke = "", this._setClippingProperties(t4)) : this._renderBackground(t4), this._render(t4), this._drawClipPath(t4, this.clipPath), this.fill = s4, this.stroke = i3;
  }
  _drawClipPath(t4, e3) {
    e3 && (e3._set("canvas", this.canvas), e3.shouldCache(), e3._transformDone = true, e3.renderCache({ forClipping: true }), this.drawClipPathOnCache(t4, e3));
  }
  drawCacheOnCanvas(t4) {
    t4.scale(1 / this.zoomX, 1 / this.zoomY), t4.drawImage(this._cacheCanvas, -this.cacheTranslationX, -this.cacheTranslationY);
  }
  isCacheDirty() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
    if (this.isNotVisible())
      return false;
    if (this._cacheCanvas && this._cacheContext && !t4 && this._updateCacheCanvas())
      return true;
    if (this.dirty || this.clipPath && this.clipPath.absolutePositioned) {
      if (this._cacheCanvas && this._cacheContext && !t4) {
        const t5 = this.cacheWidth / this.zoomX, e3 = this.cacheHeight / this.zoomY;
        this._cacheContext.clearRect(-t5 / 2, -e3 / 2, t5, e3);
      }
      return true;
    }
    return false;
  }
  _renderBackground(t4) {
    if (!this.backgroundColor)
      return;
    const e3 = this._getNonTransformedDimensions();
    t4.fillStyle = this.backgroundColor, t4.fillRect(-e3.x / 2, -e3.y / 2, e3.x, e3.y), this._removeShadow(t4);
  }
  _setOpacity(t4) {
    this.group && !this.group._transformDone ? t4.globalAlpha = this.getObjectOpacity() : t4.globalAlpha *= this.opacity;
  }
  _setStrokeStyles(t4, e3) {
    const s4 = e3.stroke;
    s4 && (t4.lineWidth = e3.strokeWidth, t4.lineCap = e3.strokeLineCap, t4.lineDashOffset = e3.strokeDashOffset, t4.lineJoin = e3.strokeLineJoin, t4.miterLimit = e3.strokeMiterLimit, It(s4) ? "percentage" === s4.gradientUnits || s4.gradientTransform || s4.patternTransform ? this._applyPatternForTransformedGradient(t4, s4) : (t4.strokeStyle = s4.toLive(t4), this._applyPatternGradientTransform(t4, s4)) : t4.strokeStyle = e3.stroke);
  }
  _setFillStyles(t4, e3) {
    let { fill: s4 } = e3;
    s4 && (It(s4) ? (t4.fillStyle = s4.toLive(t4), this._applyPatternGradientTransform(t4, s4)) : t4.fillStyle = s4);
  }
  _setClippingProperties(t4) {
    t4.globalAlpha = 1, t4.strokeStyle = "transparent", t4.fillStyle = "#000000";
  }
  _setLineDash(t4, e3) {
    e3 && 0 !== e3.length && (1 & e3.length && e3.push(...e3), t4.setLineDash(e3));
  }
  _setShadow(t4) {
    if (!this.shadow)
      return;
    const e3 = this.shadow, s4 = this.canvas, i3 = this.getCanvasRetinaScaling(), [r2, , , n2] = (null == s4 ? void 0 : s4.viewportTransform) || O2, o2 = r2 * i3, h4 = n2 * i3, c3 = e3.nonScaling ? new U(1, 1) : this.getObjectScaling();
    t4.shadowColor = e3.color, t4.shadowBlur = e3.blur * a3.browserShadowBlurConstant * (o2 + h4) * (c3.x + c3.y) / 4, t4.shadowOffsetX = e3.offsetX * o2 * c3.x, t4.shadowOffsetY = e3.offsetY * h4 * c3.y;
  }
  _removeShadow(t4) {
    this.shadow && (t4.shadowColor = "", t4.shadowBlur = t4.shadowOffsetX = t4.shadowOffsetY = 0);
  }
  _applyPatternGradientTransform(t4, e3) {
    if (!It(e3))
      return { offsetX: 0, offsetY: 0 };
    const s4 = e3.gradientTransform || e3.patternTransform, i3 = -this.width / 2 + e3.offsetX || 0, r2 = -this.height / 2 + e3.offsetY || 0;
    return "percentage" === e3.gradientUnits ? t4.transform(this.width, 0, 0, this.height, i3, r2) : t4.transform(1, 0, 0, 1, i3, r2), s4 && t4.transform(s4[0], s4[1], s4[2], s4[3], s4[4], s4[5]), { offsetX: i3, offsetY: r2 };
  }
  _renderPaintInOrder(t4) {
    "stroke" === this.paintFirst ? (this._renderStroke(t4), this._renderFill(t4)) : (this._renderFill(t4), this._renderStroke(t4));
  }
  _render(t4) {
  }
  _renderFill(t4) {
    this.fill && (t4.save(), this._setFillStyles(t4, this), "evenodd" === this.fillRule ? t4.fill("evenodd") : t4.fill(), t4.restore());
  }
  _renderStroke(t4) {
    if (this.stroke && 0 !== this.strokeWidth) {
      if (this.shadow && !this.shadow.affectStroke && this._removeShadow(t4), t4.save(), this.strokeUniform) {
        const e3 = this.getObjectScaling();
        t4.scale(1 / e3.x, 1 / e3.y);
      }
      this._setLineDash(t4, this.strokeDashArray), this._setStrokeStyles(t4, this), t4.stroke(), t4.restore();
    }
  }
  _applyPatternForTransformedGradient(t4, e3) {
    var s4;
    const i3 = this._limitCacheSize(this._getCacheCanvasDimensions()), r2 = et$1(), n2 = this.getCanvasRetinaScaling(), o2 = i3.x / this.scaleX / n2, a4 = i3.y / this.scaleY / n2;
    r2.width = Math.ceil(o2), r2.height = Math.ceil(a4);
    const h4 = r2.getContext("2d");
    h4 && (h4.beginPath(), h4.moveTo(0, 0), h4.lineTo(o2, 0), h4.lineTo(o2, a4), h4.lineTo(0, a4), h4.closePath(), h4.translate(o2 / 2, a4 / 2), h4.scale(i3.zoomX / this.scaleX / n2, i3.zoomY / this.scaleY / n2), this._applyPatternGradientTransform(h4, e3), h4.fillStyle = e3.toLive(t4), h4.fill(), t4.translate(-this.width / 2 - this.strokeWidth / 2, -this.height / 2 - this.strokeWidth / 2), t4.scale(n2 * this.scaleX / i3.zoomX, n2 * this.scaleY / i3.zoomY), t4.strokeStyle = null !== (s4 = h4.createPattern(r2, "no-repeat")) && void 0 !== s4 ? s4 : "");
  }
  _findCenterFromElement() {
    return new U(this.left + this.width / 2, this.top + this.height / 2);
  }
  clone(t4) {
    const e3 = this.toObject(t4);
    return this.constructor.fromObject(e3);
  }
  cloneAsImage(t4) {
    const e3 = this.toCanvasElement(t4);
    return new (I2.getClass("image"))(e3);
  }
  toCanvasElement() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    const e3 = he(this), s4 = this.group, i3 = this.shadow, r2 = Math.abs, n2 = t4.enableRetinaScaling ? _() : 1, o2 = (t4.multiplier || 1) * n2, a4 = t4.canvasProvider || ((t5) => new Qt(t5, { enableRetinaScaling: false, renderOnAddRemove: false, skipOffscreen: false }));
    delete this.group, t4.withoutTransform && ae(this), t4.withoutShadow && (this.shadow = null), t4.viewportTransform && ge(this, this.getViewportTransform()), this.setCoords();
    const h4 = et$1(), c3 = this.getBoundingRect(), l2 = this.shadow, u3 = new U();
    if (l2) {
      const t5 = l2.blur, e4 = l2.nonScaling ? new U(1, 1) : this.getObjectScaling();
      u3.x = 2 * Math.round(r2(l2.offsetX) + t5) * r2(e4.x), u3.y = 2 * Math.round(r2(l2.offsetY) + t5) * r2(e4.y);
    }
    const d4 = c3.width + u3.x, g2 = c3.height + u3.y;
    h4.width = Math.ceil(d4), h4.height = Math.ceil(g2);
    const f2 = a4(h4);
    "jpeg" === t4.format && (f2.backgroundColor = "#fff"), this.setPositionByOrigin(new U(f2.width / 2, f2.height / 2), M3, M3);
    const p2 = this.canvas;
    f2._objects = [this], this.set("canvas", f2), this.setCoords();
    const m4 = f2.toCanvasElement(o2 || 1, t4);
    return this.set("canvas", p2), this.shadow = i3, s4 && (this.group = s4), this.set(e3), this.setCoords(), f2._objects = [], f2.destroy(), m4;
  }
  toDataURL() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return it$1(this.toCanvasElement(t4), t4.format || "png", t4.quality || 1);
  }
  isType() {
    for (var t4 = arguments.length, e3 = new Array(t4), s4 = 0; s4 < t4; s4++)
      e3[s4] = arguments[s4];
    return e3.includes(this.constructor.type) || e3.includes(this.type);
  }
  complexity() {
    return 1;
  }
  toJSON() {
    return this.toObject();
  }
  rotate(t4) {
    const { centeredRotation: e3, originX: s4, originY: i3 } = this;
    if (e3) {
      const { x: t5, y: e4 } = this.getRelativeCenterPoint();
      this.originX = M3, this.originY = M3, this.left = t5, this.top = e4;
    }
    if (this.set("angle", t4), e3) {
      const { x: t5, y: e4 } = this.translateToOriginPoint(this.getRelativeCenterPoint(), s4, i3);
      this.left = t5, this.top = e4, this.originX = s4, this.originY = i3;
    }
  }
  setOnGroup() {
  }
  _setupCompositeOperation(t4) {
    this.globalCompositeOperation && (t4.globalCompositeOperation = this.globalCompositeOperation);
  }
  dispose() {
    X2.cancelByTarget(this), this.off(), this._set("canvas", void 0), this._cacheCanvas && m3().dispose(this._cacheCanvas), this._cacheCanvas = void 0, this._cacheContext = null;
  }
  static _fromObject(t4) {
    let s4 = i2(t4, Ds), r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, { extraParam: o2 } = r2, a4 = i2(r2, Ms);
    return wt(Ss(s4), a4).then((t5) => {
      const s5 = e2(e2({}, a4), t5);
      if (o2) {
        const { [o2]: t6 } = s5;
        return new this(t6, i2(s5, [o2].map(n)));
      }
      return new this(s5);
    });
  }
  static fromObject(t4, e3) {
    return this._fromObject(t4, e3);
  }
};
s3(Ps, "stateProperties", Ts), s3(Ps, "cacheProperties", Os), s3(Ps, "ownDefaults", ks), s3(Ps, "type", "FabricObject"), I2.setClass(Ps), I2.setClass(Ps, "object");
const Es = (t4, e3) => (s4, i3, r2, n2) => {
  const o2 = e3(s4, i3, r2, n2);
  return o2 && fe(t4, Ce(s4, i3, r2, n2)), o2;
};
function As(t4) {
  return (e3, s4, i3, r2) => {
    const { target: n2, originX: o2, originY: a4 } = s4, h4 = n2.getRelativeCenterPoint(), c3 = n2.translateToOriginPoint(h4, o2, a4), l2 = t4(e3, s4, i3, r2);
    return n2.setPositionByOrigin(c3, s4.originX, s4.originY), l2;
  };
}
const js = Es("resizing", As((t4, e3, s4, i3) => {
  const r2 = we(e3, e3.originX, e3.originY, s4, i3);
  if (e3.originX === M3 || e3.originX === j && r2.x < 0 || e3.originX === P && r2.x > 0) {
    const { target: t5 } = e3, s5 = t5.strokeWidth / (t5.strokeUniform ? t5.scaleX : 1), i4 = ye(e3) ? 2 : 1, n2 = t5.width, o2 = Math.ceil(Math.abs(r2.x * i4 / t5.scaleX) - s5);
    return t5.set("width", Math.max(o2, 0)), n2 !== t5.width;
  }
  return false;
}));
function Fs(t4, e3, s4, i3, r2) {
  i3 = i3 || {};
  const n2 = this.sizeX || i3.cornerSize || r2.cornerSize, o2 = this.sizeY || i3.cornerSize || r2.cornerSize, a4 = void 0 !== i3.transparentCorners ? i3.transparentCorners : r2.transparentCorners, h4 = a4 ? "stroke" : "fill", c3 = !a4 && (i3.cornerStrokeColor || r2.cornerStrokeColor);
  let l2, u3 = e3, d4 = s4;
  t4.save(), t4.fillStyle = i3.cornerColor || r2.cornerColor || "", t4.strokeStyle = i3.cornerStrokeColor || r2.cornerStrokeColor || "", n2 > o2 ? (l2 = n2, t4.scale(1, o2 / n2), d4 = s4 * n2 / o2) : o2 > n2 ? (l2 = o2, t4.scale(n2 / o2, 1), u3 = e3 * o2 / n2) : l2 = n2, t4.lineWidth = 1, t4.beginPath(), t4.arc(u3, d4, l2 / 2, 0, S3, false), t4[h4](), c3 && t4.stroke(), t4.restore();
}
function Ls(t4, e3, s4, i3, r2) {
  i3 = i3 || {};
  const n2 = this.sizeX || i3.cornerSize || r2.cornerSize, o2 = this.sizeY || i3.cornerSize || r2.cornerSize, a4 = void 0 !== i3.transparentCorners ? i3.transparentCorners : r2.transparentCorners, h4 = a4 ? "stroke" : "fill", c3 = !a4 && (i3.cornerStrokeColor || r2.cornerStrokeColor), l2 = n2 / 2, u3 = o2 / 2;
  t4.save(), t4.fillStyle = i3.cornerColor || r2.cornerColor || "", t4.strokeStyle = i3.cornerStrokeColor || r2.cornerStrokeColor || "", t4.lineWidth = 1, t4.translate(e3, s4);
  const d4 = r2.getTotalAngle();
  t4.rotate(rt$1(d4)), t4["".concat(h4, "Rect")](-l2, -u3, n2, o2), c3 && t4.strokeRect(-l2, -u3, n2, o2), t4.restore();
}
class Rs {
  constructor(t4) {
    s3(this, "visible", true), s3(this, "actionName", "scale"), s3(this, "angle", 0), s3(this, "x", 0), s3(this, "y", 0), s3(this, "offsetX", 0), s3(this, "offsetY", 0), s3(this, "sizeX", 0), s3(this, "sizeY", 0), s3(this, "touchSizeX", 0), s3(this, "touchSizeY", 0), s3(this, "cursorStyle", "crosshair"), s3(this, "withConnection", false), Object.assign(this, t4);
  }
  shouldActivate(t4, e3, s4, i3) {
    var r2;
    let { tl: n2, tr: o2, br: a4, bl: h4 } = i3;
    return (null === (r2 = e3.canvas) || void 0 === r2 ? void 0 : r2.getActiveObject()) === e3 && e3.isControlVisible(t4) && is.isPointInPolygon(s4, [n2, o2, a4, h4]);
  }
  getActionHandler(t4, e3, s4) {
    return this.actionHandler;
  }
  getMouseDownHandler(t4, e3, s4) {
    return this.mouseDownHandler;
  }
  getMouseUpHandler(t4, e3, s4) {
    return this.mouseUpHandler;
  }
  cursorStyleHandler(t4, e3, s4) {
    return e3.cursorStyle;
  }
  getActionName(t4, e3, s4) {
    return e3.actionName;
  }
  getVisibility(t4, e3) {
    var s4, i3;
    return null !== (s4 = null === (i3 = t4._controlsVisibility) || void 0 === i3 ? void 0 : i3[e3]) && void 0 !== s4 ? s4 : this.visible;
  }
  setVisibility(t4, e3, s4) {
    this.visible = t4;
  }
  positionHandler(t4, e3, s4, i3) {
    return new U(this.x * t4.x + this.offsetX, this.y * t4.y + this.offsetY).transform(e3);
  }
  calcCornerCoords(t4, e3, s4, i3, r2, n2) {
    const o2 = lt$1([gt$1(s4, i3), ft$1({ angle: t4 }), pt$1((r2 ? this.touchSizeX : this.sizeX) || e3, (r2 ? this.touchSizeY : this.sizeY) || e3)]);
    return { tl: new U(-0.5, -0.5).transform(o2), tr: new U(0.5, -0.5).transform(o2), br: new U(0.5, 0.5).transform(o2), bl: new U(-0.5, 0.5).transform(o2) };
  }
  render(t4, e3, s4, i3, r2) {
    if ("circle" === ((i3 = i3 || {}).cornerStyle || r2.cornerStyle))
      Fs.call(this, t4, e3, s4, i3, r2);
    else
      Ls.call(this, t4, e3, s4, i3, r2);
  }
}
const Bs = (t4, e3, s4) => s4.lockRotation ? ve : e3.cursorStyle, Is = Es("rotating", As((t4, e3, s4, i3) => {
  let { target: r2, ex: n2, ey: o2, theta: a4, originX: h4, originY: c3 } = e3;
  const l2 = r2.translateToOriginPoint(r2.getRelativeCenterPoint(), h4, c3);
  if (xe$1(r2, "lockRotation"))
    return false;
  const u3 = Math.atan2(o2 - l2.y, n2 - l2.x), d4 = Math.atan2(i3 - l2.y, s4 - l2.x);
  let g2 = nt$1(d4 - u3 + a4);
  if (r2.snapAngle && r2.snapAngle > 0) {
    const t5 = r2.snapAngle, e4 = r2.snapThreshold || t5, s5 = Math.ceil(g2 / t5) * t5, i4 = Math.floor(g2 / t5) * t5;
    Math.abs(g2 - i4) < e4 ? g2 = i4 : Math.abs(g2 - s5) < e4 && (g2 = s5);
  }
  g2 < 0 && (g2 = 360 + g2), g2 %= 360;
  const f2 = r2.angle !== g2;
  return r2.angle = g2, f2;
}));
function Xs(t4, e3) {
  const s4 = e3.canvas, i3 = t4[s4.uniScaleKey];
  return s4.uniformScaling && !i3 || !s4.uniformScaling && i3;
}
function Ys(t4, e3, s4) {
  const i3 = xe$1(t4, "lockScalingX"), r2 = xe$1(t4, "lockScalingY");
  if (i3 && r2)
    return true;
  if (!e3 && (i3 || r2) && s4)
    return true;
  if (i3 && "x" === e3)
    return true;
  if (r2 && "y" === e3)
    return true;
  const { width: n2, height: o2, strokeWidth: a4 } = t4;
  return 0 === n2 && 0 === a4 && "y" !== e3 || 0 === o2 && 0 === a4 && "x" !== e3;
}
const Ws = ["e", "se", "s", "sw", "w", "nw", "n", "ne", "e"], Vs = (t4, e3, s4) => {
  const i3 = Xs(t4, s4);
  if (Ys(s4, 0 !== e3.x && 0 === e3.y ? "x" : 0 === e3.x && 0 !== e3.y ? "y" : "", i3))
    return ve;
  const r2 = be(s4, e3);
  return "".concat(Ws[r2], "-resize");
};
function zs(t4, e3, s4, i3) {
  let r2 = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : {};
  const n2 = e3.target, o2 = r2.by, a4 = Xs(t4, n2);
  let h4, c3, l2, u3, d4, g2;
  if (Ys(n2, o2, a4))
    return false;
  if (e3.gestureScale)
    c3 = e3.scaleX * e3.gestureScale, l2 = e3.scaleY * e3.gestureScale;
  else {
    if (h4 = we(e3, e3.originX, e3.originY, s4, i3), d4 = "y" !== o2 ? Math.sign(h4.x || e3.signX || 1) : 1, g2 = "x" !== o2 ? Math.sign(h4.y || e3.signY || 1) : 1, e3.signX || (e3.signX = d4), e3.signY || (e3.signY = g2), xe$1(n2, "lockScalingFlip") && (e3.signX !== d4 || e3.signY !== g2))
      return false;
    if (u3 = n2._getTransformedDimensions(), a4 && !o2) {
      const t5 = Math.abs(h4.x) + Math.abs(h4.y), { original: s5 } = e3, i4 = t5 / (Math.abs(u3.x * s5.scaleX / n2.scaleX) + Math.abs(u3.y * s5.scaleY / n2.scaleY));
      c3 = s5.scaleX * i4, l2 = s5.scaleY * i4;
    } else
      c3 = Math.abs(h4.x * n2.scaleX / u3.x), l2 = Math.abs(h4.y * n2.scaleY / u3.y);
    ye(e3) && (c3 *= 2, l2 *= 2), e3.signX !== d4 && "y" !== o2 && (e3.originX = _e(e3.originX), c3 *= -1, e3.signX = d4), e3.signY !== g2 && "x" !== o2 && (e3.originY = _e(e3.originY), l2 *= -1, e3.signY = g2);
  }
  const f2 = n2.scaleX, p2 = n2.scaleY;
  return o2 ? ("x" === o2 && n2.set("scaleX", c3), "y" === o2 && n2.set("scaleY", l2)) : (!xe$1(n2, "lockScalingX") && n2.set("scaleX", c3), !xe$1(n2, "lockScalingY") && n2.set("scaleY", l2)), f2 !== n2.scaleX || p2 !== n2.scaleY;
}
const Hs = Es("scaling", As((t4, e3, s4, i3) => zs(t4, e3, s4, i3))), Gs = Es("scaling", As((t4, e3, s4, i3) => zs(t4, e3, s4, i3, { by: "x" }))), Us = Es("scaling", As((t4, e3, s4, i3) => zs(t4, e3, s4, i3, { by: "y" }))), Ns = ["target", "ex", "ey", "skewingSide"], qs = { x: { counterAxis: "y", scale: "scaleX", skew: "skewX", lockSkewing: "lockSkewingX", origin: "originX", flip: "flipX" }, y: { counterAxis: "x", scale: "scaleY", skew: "skewY", lockSkewing: "lockSkewingY", origin: "originY", flip: "flipY" } }, Ks = ["ns", "nesw", "ew", "nwse"], Js = (t4, e3, s4) => {
  if (0 !== e3.x && xe$1(s4, "lockSkewingY"))
    return ve;
  if (0 !== e3.y && xe$1(s4, "lockSkewingX"))
    return ve;
  const i3 = be(s4, e3) % 4;
  return "".concat(Ks[i3], "-resize");
};
function Zs(t4, s4, r2, n2, o2) {
  const { target: a4 } = r2, { counterAxis: h4, origin: c3, lockSkewing: l2, skew: u3, flip: d4 } = qs[t4];
  if (xe$1(a4, l2))
    return false;
  const { origin: g2, flip: f2 } = qs[h4], p2 = me(r2[g2]) * (a4[f2] ? -1 : 1), m4 = -Math.sign(p2) * (a4[d4] ? -1 : 1), v2 = 0.5 * -((0 === a4[u3] && we(r2, M3, M3, n2, o2)[t4] > 0 || a4[u3] > 0 ? 1 : -1) * m4) + 0.5, y4 = Es("skewing", As((e3, s5, r3, n3) => function(t5, e4, s6) {
    let { target: r4, ex: n4, ey: o3, skewingSide: a5 } = e4, h5 = i2(e4, Ns);
    const { skew: c4 } = qs[t5], l3 = s6.subtract(new U(n4, o3)).divide(new U(r4.scaleX, r4.scaleY))[t5], u4 = r4[c4], d5 = h5[c4], g3 = Math.tan(rt$1(d5)), f3 = "y" === t5 ? r4._getTransformedDimensions({ scaleX: 1, scaleY: 1, skewX: 0 }).x : r4._getTransformedDimensions({ scaleX: 1, scaleY: 1 }).y, p3 = 2 * l3 * a5 / Math.max(f3, 1) + g3, m5 = nt$1(Math.atan(p3));
    r4.set(c4, m5);
    const v3 = u4 !== r4[c4];
    if (v3 && "y" === t5) {
      const { skewX: t6, scaleX: e5 } = r4, s7 = r4._getTransformedDimensions({ skewY: u4 }), i3 = r4._getTransformedDimensions(), n5 = 0 !== t6 ? s7.x / i3.x : 1;
      1 !== n5 && r4.set("scaleX", n5 * e5);
    }
    return v3;
  }(t4, s5, new U(r3, n3))));
  return y4(s4, e2(e2({}, r2), {}, { [c3]: v2, skewingSide: m4 }), n2, o2);
}
const Qs = (t4, e3, s4, i3) => Zs("x", t4, e3, s4, i3), $s = (t4, e3, s4, i3) => Zs("y", t4, e3, s4, i3);
function ti(t4, e3) {
  return t4[e3.canvas.altActionKey];
}
const ei = (t4, e3, s4) => {
  const i3 = ti(t4, s4);
  return 0 === e3.x ? i3 ? "skewX" : "scaleY" : 0 === e3.y ? i3 ? "skewY" : "scaleX" : "";
}, si = (t4, e3, s4) => ti(t4, s4) ? Js(0, e3, s4) : Vs(t4, e3, s4), ii = (t4, e3, s4, i3) => ti(t4, e3.target) ? $s(t4, e3, s4, i3) : Gs(t4, e3, s4, i3), ri = (t4, e3, s4, i3) => ti(t4, e3.target) ? Qs(t4, e3, s4, i3) : Us(t4, e3, s4, i3), ni = () => ({ ml: new Rs({ x: -0.5, y: 0, cursorStyleHandler: si, actionHandler: ii, getActionName: ei }), mr: new Rs({ x: 0.5, y: 0, cursorStyleHandler: si, actionHandler: ii, getActionName: ei }), mb: new Rs({ x: 0, y: 0.5, cursorStyleHandler: si, actionHandler: ri, getActionName: ei }), mt: new Rs({ x: 0, y: -0.5, cursorStyleHandler: si, actionHandler: ri, getActionName: ei }), tl: new Rs({ x: -0.5, y: -0.5, cursorStyleHandler: Vs, actionHandler: Hs }), tr: new Rs({ x: 0.5, y: -0.5, cursorStyleHandler: Vs, actionHandler: Hs }), bl: new Rs({ x: -0.5, y: 0.5, cursorStyleHandler: Vs, actionHandler: Hs }), br: new Rs({ x: 0.5, y: 0.5, cursorStyleHandler: Vs, actionHandler: Hs }), mtr: new Rs({ x: 0, y: -0.5, actionHandler: Is, cursorStyleHandler: Bs, offsetY: -40, withConnection: true, actionName: "rotate" }) }), oi = () => ({ mr: new Rs({ x: 0.5, y: 0, actionHandler: js, cursorStyleHandler: si, actionName: "resizing" }), ml: new Rs({ x: -0.5, y: 0, actionHandler: js, cursorStyleHandler: si, actionName: "resizing" }) }), ai = () => e2(e2({}, ni()), oi());
class hi extends Ps {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), hi.ownDefaults);
  }
  constructor(t4) {
    super(), Object.assign(this, this.constructor.createControls(), hi.ownDefaults), this.setOptions(t4);
  }
  static createControls() {
    return { controls: ni() };
  }
  _updateCacheCanvas() {
    const t4 = this.canvas;
    if (this.noScaleCache && t4 && t4._currentTransform) {
      const e3 = t4._currentTransform, s4 = e3.target, i3 = e3.action;
      if (this === s4 && i3 && i3.startsWith("scale"))
        return false;
    }
    return super._updateCacheCanvas();
  }
  getActiveControl() {
    const t4 = this.__corner;
    return t4 ? { key: t4, control: this.controls[t4], coord: this.oCoords[t4] } : void 0;
  }
  findControl(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
    if (!this.hasControls || !this.canvas)
      return;
    this.__corner = void 0;
    const s4 = Object.entries(this.oCoords);
    for (let i3 = s4.length - 1; i3 >= 0; i3--) {
      const [r2, n2] = s4[i3], o2 = this.controls[r2];
      if (o2.shouldActivate(r2, this, t4, e3 ? n2.touchCorner : n2.corner))
        return this.__corner = r2, { key: r2, control: o2, coord: this.oCoords[r2] };
    }
  }
  calcOCoords() {
    const t4 = this.getViewportTransform(), e3 = this.getCenterPoint(), s4 = gt$1(e3.x, e3.y), i3 = ft$1({ angle: this.getTotalAngle() - (this.group && this.flipX ? 180 : 0) }), r2 = ct$1(s4, i3), n2 = ct$1(t4, r2), o2 = ct$1(n2, [1 / t4[0], 0, 0, 1 / t4[3], 0, 0]), a4 = this.group ? dt$1(this.calcTransformMatrix()) : void 0;
    a4 && (a4.scaleX = Math.abs(a4.scaleX), a4.scaleY = Math.abs(a4.scaleY));
    const h4 = this._calculateCurrentDimensions(a4), c3 = {};
    return this.forEachControl((t5, e4) => {
      const s5 = t5.positionHandler(h4, o2, this, t5);
      c3[e4] = Object.assign(s5, this._calcCornerCoords(t5, s5));
    }), c3;
  }
  _calcCornerCoords(t4, e3) {
    const s4 = this.getTotalAngle();
    return { corner: t4.calcCornerCoords(s4, this.cornerSize, e3.x, e3.y, false, this), touchCorner: t4.calcCornerCoords(s4, this.touchCornerSize, e3.x, e3.y, true, this) };
  }
  setCoords() {
    super.setCoords(), this.canvas && (this.oCoords = this.calcOCoords());
  }
  forEachControl(t4) {
    for (const e3 in this.controls)
      t4(this.controls[e3], e3, this);
  }
  drawSelectionBackground(t4) {
    if (!this.selectionBackgroundColor || this.canvas && this.canvas._activeObject !== this)
      return;
    t4.save();
    const e3 = this.getRelativeCenterPoint(), s4 = this._calculateCurrentDimensions(), i3 = this.getViewportTransform();
    t4.translate(e3.x, e3.y), t4.scale(1 / i3[0], 1 / i3[3]), t4.rotate(rt$1(this.angle)), t4.fillStyle = this.selectionBackgroundColor, t4.fillRect(-s4.x / 2, -s4.y / 2, s4.x, s4.y), t4.restore();
  }
  strokeBorders(t4, e3) {
    t4.strokeRect(-e3.x / 2, -e3.y / 2, e3.x, e3.y);
  }
  _drawBorders(t4, s4) {
    let i3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    const r2 = e2({ hasControls: this.hasControls, borderColor: this.borderColor, borderDashArray: this.borderDashArray }, i3);
    t4.save(), t4.strokeStyle = r2.borderColor, this._setLineDash(t4, r2.borderDashArray), this.strokeBorders(t4, s4), r2.hasControls && this.drawControlsConnectingLines(t4, s4), t4.restore();
  }
  _renderControls(t4) {
    let s4 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const { hasBorders: i3, hasControls: r2 } = this, n2 = e2({ hasBorders: i3, hasControls: r2 }, s4), o2 = this.getViewportTransform(), a4 = n2.hasBorders, h4 = n2.hasControls, c3 = ct$1(o2, this.calcTransformMatrix()), l2 = dt$1(c3);
    t4.save(), t4.translate(l2.translateX, l2.translateY), t4.lineWidth = 1 * this.borderScaleFactor, this.group === this.parent && (t4.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1), this.flipX && (l2.angle -= 180), t4.rotate(rt$1(this.group ? l2.angle : this.angle)), a4 && this.drawBorders(t4, l2, s4), h4 && this.drawControls(t4, s4), t4.restore();
  }
  drawBorders(t4, e3, s4) {
    let i3;
    if (s4 && s4.forActiveSelection || this.group) {
      const t5 = ce(this.width, this.height, _t(e3)), s5 = this.isStrokeAccountedForInDimensions() ? N : (this.strokeUniform ? new U().scalarAdd(this.canvas ? this.canvas.getZoom() : 1) : new U(e3.scaleX, e3.scaleY)).scalarMultiply(this.strokeWidth);
      i3 = t5.add(s5).scalarAdd(this.borderScaleFactor).scalarAdd(2 * this.padding);
    } else
      i3 = this._calculateCurrentDimensions().scalarAdd(this.borderScaleFactor);
    this._drawBorders(t4, i3, s4);
  }
  drawControlsConnectingLines(t4, e3) {
    let s4 = false;
    t4.beginPath(), this.forEachControl((i3, r2) => {
      i3.withConnection && i3.getVisibility(this, r2) && (s4 = true, t4.moveTo(i3.x * e3.x, i3.y * e3.y), t4.lineTo(i3.x * e3.x + i3.offsetX, i3.y * e3.y + i3.offsetY));
    }), s4 && t4.stroke();
  }
  drawControls(t4) {
    let s4 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    t4.save();
    const i3 = this.getCanvasRetinaScaling(), { cornerStrokeColor: r2, cornerDashArray: n2, cornerColor: o2 } = this, a4 = e2({ cornerStrokeColor: r2, cornerDashArray: n2, cornerColor: o2 }, s4);
    t4.setTransform(i3, 0, 0, i3, 0, 0), t4.strokeStyle = t4.fillStyle = a4.cornerColor, this.transparentCorners || (t4.strokeStyle = a4.cornerStrokeColor), this._setLineDash(t4, a4.cornerDashArray), this.setCoords(), this.forEachControl((e3, s5) => {
      if (e3.getVisibility(this, s5)) {
        const i4 = this.oCoords[s5];
        e3.render(t4, i4.x, i4.y, a4, this);
      }
    }), t4.restore();
  }
  isControlVisible(t4) {
    return this.controls[t4] && this.controls[t4].getVisibility(this, t4);
  }
  setControlVisible(t4, e3) {
    this._controlsVisibility || (this._controlsVisibility = {}), this._controlsVisibility[t4] = e3;
  }
  setControlsVisibility() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    Object.entries(t4).forEach((t5) => {
      let [e3, s4] = t5;
      return this.setControlVisible(e3, s4);
    });
  }
  clearContextTop(t4) {
    if (!this.canvas)
      return;
    const e3 = this.canvas.contextTop;
    if (!e3)
      return;
    const s4 = this.canvas.viewportTransform;
    e3.save(), e3.transform(s4[0], s4[1], s4[2], s4[3], s4[4], s4[5]), this.transform(e3);
    const i3 = this.width + 4, r2 = this.height + 4;
    return e3.clearRect(-i3 / 2, -r2 / 2, i3, r2), t4 || e3.restore(), e3;
  }
  onDeselect(t4) {
    return false;
  }
  onSelect(t4) {
    return false;
  }
  shouldStartDragging(t4) {
    return false;
  }
  onDragStart(t4) {
    return false;
  }
  canDrop(t4) {
    return false;
  }
  renderDragSourceEffect(t4) {
  }
  renderDropTargetEffect(t4) {
  }
}
function ci(t4, e3) {
  return e3.forEach((e4) => {
    Object.getOwnPropertyNames(e4.prototype).forEach((s4) => {
      "constructor" !== s4 && Object.defineProperty(t4.prototype, s4, Object.getOwnPropertyDescriptor(e4.prototype, s4) || /* @__PURE__ */ Object.create(null));
    });
  }), t4;
}
s3(hi, "ownDefaults", { noScaleCache: true, lockMovementX: false, lockMovementY: false, lockRotation: false, lockScalingX: false, lockScalingY: false, lockSkewingX: false, lockSkewingY: false, lockScalingFlip: false, cornerSize: 13, touchCornerSize: 24, transparentCorners: true, cornerColor: "rgb(178,204,255)", cornerStrokeColor: "", cornerStyle: "rect", cornerDashArray: null, hasControls: true, borderColor: "rgb(178,204,255)", borderDashArray: null, borderOpacityWhenMoving: 0.4, borderScaleFactor: 1, hasBorders: true, selectionBackgroundColor: "", selectable: true, evented: true, perPixelTargetFind: false, activeOn: "down", hoverCursor: null, moveCursor: null });
class li extends hi {
}
ci(li, [Te]), I2.setClass(li), I2.setClass(li, "object");
const ui = (t4, e3, s4, i3) => {
  const r2 = 2 * (i3 = Math.round(i3)) + 1, { data: n2 } = t4.getImageData(e3 - i3, s4 - i3, r2, r2);
  for (let t5 = 3; t5 < n2.length; t5 += 4) {
    if (n2[t5] > 0)
      return false;
  }
  return true;
};
class di {
  constructor(t4) {
    this.options = t4, this.strokeProjectionMagnitude = this.options.strokeWidth / 2, this.scale = new U(this.options.scaleX, this.options.scaleY), this.strokeUniformScalar = this.options.strokeUniform ? new U(1 / this.options.scaleX, 1 / this.options.scaleY) : new U(1, 1);
  }
  createSideVector(t4, e3) {
    const s4 = qe(t4, e3);
    return this.options.strokeUniform ? s4.multiply(this.scale) : s4;
  }
  projectOrthogonally(t4, e3, s4) {
    return this.applySkew(t4.add(this.calcOrthogonalProjection(t4, e3, s4)));
  }
  isSkewed() {
    return 0 !== this.options.skewX || 0 !== this.options.skewY;
  }
  applySkew(t4) {
    const e3 = new U(t4);
    return e3.y += e3.x * Math.tan(rt$1(this.options.skewY)), e3.x += e3.y * Math.tan(rt$1(this.options.skewX)), e3;
  }
  scaleUnitVector(t4, e3) {
    return t4.multiply(this.strokeUniformScalar).scalarMultiply(e3);
  }
}
const gi = new U();
class fi extends di {
  static getOrthogonalRotationFactor(t4, e3) {
    const s4 = e3 ? Je$1(t4, e3) : Ze$1(t4);
    return Math.abs(s4) < w2 ? -1 : 1;
  }
  constructor(t4, e3, i3, r2) {
    super(r2), s3(this, "AB", void 0), s3(this, "AC", void 0), s3(this, "alpha", void 0), s3(this, "bisector", void 0), this.A = new U(t4), this.B = new U(e3), this.C = new U(i3), this.AB = this.createSideVector(this.A, this.B), this.AC = this.createSideVector(this.A, this.C), this.alpha = Je$1(this.AB, this.AC), this.bisector = Qe$1(Ne$1(this.AB.eq(gi) ? this.AC : this.AB, this.alpha / 2));
  }
  calcOrthogonalProjection(t4, e3) {
    let s4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.strokeProjectionMagnitude;
    const i3 = this.createSideVector(t4, e3), r2 = $e(i3), n2 = fi.getOrthogonalRotationFactor(r2, this.bisector);
    return this.scaleUnitVector(r2, s4 * n2);
  }
  projectBevel() {
    const t4 = [];
    return (this.alpha % S3 == 0 ? [this.B] : [this.B, this.C]).forEach((e3) => {
      t4.push(this.projectOrthogonally(this.A, e3)), t4.push(this.projectOrthogonally(this.A, e3, -this.strokeProjectionMagnitude));
    }), t4;
  }
  projectMiter() {
    const t4 = [], e3 = Math.abs(this.alpha), s4 = 1 / Math.sin(e3 / 2), i3 = this.scaleUnitVector(this.bisector, -this.strokeProjectionMagnitude * s4), r2 = this.options.strokeUniform ? Ke$1(this.scaleUnitVector(this.bisector, this.options.strokeMiterLimit)) : this.options.strokeMiterLimit;
    return Ke$1(i3) / this.strokeProjectionMagnitude <= r2 && t4.push(this.applySkew(this.A.add(i3))), t4.push(...this.projectBevel()), t4;
  }
  projectRoundNoSkew(t4, e3) {
    const s4 = [], i3 = new U(fi.getOrthogonalRotationFactor(this.bisector), fi.getOrthogonalRotationFactor(new U(this.bisector.y, this.bisector.x)));
    return [new U(1, 0).scalarMultiply(this.strokeProjectionMagnitude).multiply(this.strokeUniformScalar).multiply(i3), new U(0, 1).scalarMultiply(this.strokeProjectionMagnitude).multiply(this.strokeUniformScalar).multiply(i3)].forEach((i4) => {
      ss(i4, t4, e3) && s4.push(this.A.add(i4));
    }), s4;
  }
  projectRoundWithSkew(t4, e3) {
    const s4 = [], { skewX: i3, skewY: r2, scaleX: n2, scaleY: o2, strokeUniform: a4 } = this.options, h4 = new U(Math.tan(rt$1(i3)), Math.tan(rt$1(r2))), c3 = this.strokeProjectionMagnitude, l2 = a4 ? c3 / o2 / Math.sqrt(1 / o2 ** 2 + 1 / n2 ** 2 * h4.y ** 2) : c3 / Math.sqrt(1 + h4.y ** 2), u3 = new U(Math.sqrt(Math.max(c3 ** 2 - l2 ** 2, 0)), l2), d4 = a4 ? c3 / Math.sqrt(1 + h4.x ** 2 * (1 / o2) ** 2 / (1 / n2 + 1 / n2 * h4.x * h4.y) ** 2) : c3 / Math.sqrt(1 + h4.x ** 2 / (1 + h4.x * h4.y) ** 2), g2 = new U(d4, Math.sqrt(Math.max(c3 ** 2 - d4 ** 2, 0)));
    return [g2, g2.scalarMultiply(-1), u3, u3.scalarMultiply(-1)].map((t5) => this.applySkew(a4 ? t5.multiply(this.strokeUniformScalar) : t5)).forEach((i4) => {
      ss(i4, t4, e3) && s4.push(this.applySkew(this.A).add(i4));
    }), s4;
  }
  projectRound() {
    const t4 = [];
    t4.push(...this.projectBevel());
    const e3 = this.alpha % S3 == 0, s4 = this.applySkew(this.A), i3 = t4[e3 ? 0 : 2].subtract(s4), r2 = t4[e3 ? 1 : 0].subtract(s4), n2 = e3 ? this.applySkew(this.AB.scalarMultiply(-1)) : this.applySkew(this.bisector.multiply(this.strokeUniformScalar).scalarMultiply(-1)), o2 = ts(i3, n2) > 0, a4 = o2 ? i3 : r2, h4 = o2 ? r2 : i3;
    return this.isSkewed() ? t4.push(...this.projectRoundWithSkew(a4, h4)) : t4.push(...this.projectRoundNoSkew(a4, h4)), t4;
  }
  projectPoints() {
    switch (this.options.strokeLineJoin) {
      case "miter":
        return this.projectMiter();
      case "round":
        return this.projectRound();
      default:
        return this.projectBevel();
    }
  }
  project() {
    return this.projectPoints().map((t4) => ({ originPoint: this.A, projectedPoint: t4, angle: this.alpha, bisector: this.bisector }));
  }
}
class pi extends di {
  constructor(t4, e3, s4) {
    super(s4), this.A = new U(t4), this.T = new U(e3);
  }
  calcOrthogonalProjection(t4, e3) {
    let s4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.strokeProjectionMagnitude;
    const i3 = this.createSideVector(t4, e3);
    return this.scaleUnitVector($e(i3), s4);
  }
  projectButt() {
    return [this.projectOrthogonally(this.A, this.T, this.strokeProjectionMagnitude), this.projectOrthogonally(this.A, this.T, -this.strokeProjectionMagnitude)];
  }
  projectRound() {
    const t4 = [];
    if (!this.isSkewed() && this.A.eq(this.T)) {
      const e3 = new U(1, 1).scalarMultiply(this.strokeProjectionMagnitude).multiply(this.strokeUniformScalar);
      t4.push(this.applySkew(this.A.add(e3)), this.applySkew(this.A.subtract(e3)));
    } else
      t4.push(...new fi(this.A, this.T, this.T, this.options).projectRound());
    return t4;
  }
  projectSquare() {
    const t4 = [];
    if (this.A.eq(this.T)) {
      const e3 = new U(1, 1).scalarMultiply(this.strokeProjectionMagnitude).multiply(this.strokeUniformScalar);
      t4.push(this.A.add(e3), this.A.subtract(e3));
    } else {
      const e3 = this.calcOrthogonalProjection(this.A, this.T, this.strokeProjectionMagnitude), s4 = this.scaleUnitVector(Qe$1(this.createSideVector(this.A, this.T)), -this.strokeProjectionMagnitude), i3 = this.A.add(s4);
      t4.push(i3.add(e3), i3.subtract(e3));
    }
    return t4.map((t5) => this.applySkew(t5));
  }
  projectPoints() {
    switch (this.options.strokeLineCap) {
      case "round":
        return this.projectRound();
      case "square":
        return this.projectSquare();
      default:
        return this.projectButt();
    }
  }
  project() {
    return this.projectPoints().map((t4) => ({ originPoint: this.A, projectedPoint: t4 }));
  }
}
const mi = function(t4, e3) {
  let s4 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
  const i3 = [];
  if (0 === t4.length)
    return i3;
  const r2 = t4.reduce((t5, e4) => (t5[t5.length - 1].eq(e4) || t5.push(new U(e4)), t5), [new U(t4[0])]);
  if (1 === r2.length)
    s4 = true;
  else if (!s4) {
    const t5 = r2[0], e4 = ((t6, e5) => {
      for (let s5 = t6.length - 1; s5 >= 0; s5--)
        if (e5(t6[s5], s5, t6))
          return s5;
      return -1;
    })(r2, (e5) => !e5.eq(t5));
    r2.splice(e4 + 1);
  }
  return r2.forEach((t5, r3, n2) => {
    let o2, a4;
    0 === r3 ? (a4 = n2[1], o2 = s4 ? t5 : n2[n2.length - 1]) : r3 === n2.length - 1 ? (o2 = n2[r3 - 1], a4 = s4 ? t5 : n2[0]) : (o2 = n2[r3 - 1], a4 = n2[r3 + 1]), s4 && 1 === n2.length ? i3.push(...new pi(t5, t5, e3).project()) : !s4 || 0 !== r3 && r3 !== n2.length - 1 ? i3.push(...new fi(t5, o2, a4, e3).project()) : i3.push(...new pi(t5, 0 === r3 ? a4 : o2, e3).project());
  }), i3;
}, vi = (t4) => t4.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), yi = (t4) => {
  const e3 = [];
  for (let s4, i3 = 0; i3 < t4.length; i3++)
    false !== (s4 = _i(t4, i3)) && e3.push(s4);
  return e3;
}, _i = (t4, e3) => {
  const s4 = t4.charCodeAt(e3);
  if (isNaN(s4))
    return "";
  if (s4 < 55296 || s4 > 57343)
    return t4.charAt(e3);
  if (55296 <= s4 && s4 <= 56319) {
    if (t4.length <= e3 + 1)
      throw "High surrogate without following low surrogate";
    const s5 = t4.charCodeAt(e3 + 1);
    if (56320 > s5 || s5 > 57343)
      throw "High surrogate without following low surrogate";
    return t4.charAt(e3) + t4.charAt(e3 + 1);
  }
  if (0 === e3)
    throw "Low surrogate without preceding high surrogate";
  const i3 = t4.charCodeAt(e3 - 1);
  if (55296 > i3 || i3 > 56319)
    throw "Low surrogate without preceding high surrogate";
  return false;
};
const Ci = function(t4, e3) {
  let s4 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
  return t4.fill !== e3.fill || t4.stroke !== e3.stroke || t4.strokeWidth !== e3.strokeWidth || t4.fontSize !== e3.fontSize || t4.fontFamily !== e3.fontFamily || t4.fontWeight !== e3.fontWeight || t4.fontStyle !== e3.fontStyle || t4.textBackgroundColor !== e3.textBackgroundColor || t4.deltaY !== e3.deltaY || s4 && (t4.overline !== e3.overline || t4.underline !== e3.underline || t4.linethrough !== e3.linethrough);
}, bi = (t4, e3) => {
  const s4 = e3.split("\n"), i3 = [];
  let r2 = -1, n2 = {};
  t4 = Ss(t4);
  for (let e4 = 0; e4 < s4.length; e4++) {
    const o2 = yi(s4[e4]);
    if (t4[e4])
      for (let s5 = 0; s5 < o2.length; s5++) {
        r2++;
        const o3 = t4[e4][s5];
        o3 && Object.keys(o3).length > 0 && (Ci(n2, o3, true) ? i3.push({ start: r2, end: r2 + 1, style: o3 }) : i3[i3.length - 1].end++), n2 = o3 || {};
      }
    else
      r2 += o2.length, n2 = {};
  }
  return i3;
}, wi = (t4, s4) => {
  if (!Array.isArray(t4))
    return Ss(t4);
  const i3 = s4.split(L2), r2 = {};
  let n2 = -1, o2 = 0;
  for (let s5 = 0; s5 < i3.length; s5++) {
    const a4 = yi(i3[s5]);
    for (let i4 = 0; i4 < a4.length; i4++)
      n2++, t4[o2] && t4[o2].start <= n2 && n2 < t4[o2].end && (r2[s5] = r2[s5] || {}, r2[s5][i4] = e2({}, t4[o2].style), n2 === t4[o2].end - 1 && o2++);
  }
  return r2;
}, Si = ["display", "transform", "fill", "fill-opacity", "fill-rule", "opacity", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-dashoffset", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "id", "paint-order", "vector-effect", "instantiated_by_use", "clip-path"];
function Ti(t4, e3) {
  const s4 = t4.nodeName, i3 = t4.getAttribute("class"), r2 = t4.getAttribute("id"), n2 = "(?![a-zA-Z\\-]+)";
  let o2;
  if (o2 = new RegExp("^" + s4, "i"), e3 = e3.replace(o2, ""), r2 && e3.length && (o2 = new RegExp("#" + r2 + n2, "i"), e3 = e3.replace(o2, "")), i3 && e3.length) {
    const t5 = i3.split(" ");
    for (let s5 = t5.length; s5--; )
      o2 = new RegExp("\\." + t5[s5] + n2, "i"), e3 = e3.replace(o2, "");
  }
  return 0 === e3.length;
}
function Oi(t4, e3) {
  let s4 = true;
  const i3 = Ti(t4, e3.pop());
  return i3 && e3.length && (s4 = function(t5, e4) {
    let s5, i4 = true;
    for (; t5.parentElement && 1 === t5.parentElement.nodeType && e4.length; )
      i4 && (s5 = e4.pop()), i4 = Ti(t5 = t5.parentElement, s5);
    return 0 === e4.length;
  }(t4, e3)), i3 && s4 && 0 === e3.length;
}
const ki = (t4) => {
  var e3;
  return null !== (e3 = fs[t4]) && void 0 !== e3 ? e3 : t4;
}, Di = new RegExp("(".concat(us, ")"), "gi"), Mi = (t4) => t4.replace(Di, " $1 ").replace(/,/gi, " ").replace(/\s+/gi, " ");
var Pi, Ei, Ai, ji, Fi, Li, Ri;
const Bi = "(".concat(us, ")"), Ii = String.raw(Pi || (Pi = r(["(skewX)(", ")"], ["(skewX)\\(", "\\)"])), Bi), Xi = String.raw(Ei || (Ei = r(["(skewY)(", ")"], ["(skewY)\\(", "\\)"])), Bi), Yi = String.raw(Ai || (Ai = r(["(rotate)(", "(?: ", " ", ")?)"], ["(rotate)\\(", "(?: ", " ", ")?\\)"])), Bi, Bi, Bi), Wi = String.raw(ji || (ji = r(["(scale)(", "(?: ", ")?)"], ["(scale)\\(", "(?: ", ")?\\)"])), Bi, Bi), Vi = String.raw(Fi || (Fi = r(["(translate)(", "(?: ", ")?)"], ["(translate)\\(", "(?: ", ")?\\)"])), Bi, Bi), zi = String.raw(Li || (Li = r(["(matrix)(", " ", " ", " ", " ", " ", ")"], ["(matrix)\\(", " ", " ", " ", " ", " ", "\\)"])), Bi, Bi, Bi, Bi, Bi, Bi), Hi = "(?:".concat(zi, "|").concat(Vi, "|").concat(Yi, "|").concat(Wi, "|").concat(Ii, "|").concat(Xi, ")"), Gi = "(?:".concat(Hi, "*)"), Ui = String.raw(Ri || (Ri = r(["^s*(?:", "?)s*$"], ["^\\s*(?:", "?)\\s*$"])), Gi), Ni = new RegExp(Ui), qi = new RegExp(Hi), Ki = new RegExp(Hi, "g");
function Ji(t4) {
  const e3 = [];
  if (!(t4 = Mi(t4).replace(/\s*([()])\s*/gi, "$1")) || t4 && !Ni.test(t4))
    return [...O2];
  for (const s4 of t4.matchAll(Ki)) {
    const t5 = qi.exec(s4[0]);
    if (!t5)
      continue;
    let i3 = O2;
    const r2 = t5.filter((t6) => !!t6), [, n2, ...o2] = r2, [a4, h4, c3, l2, u3, d4] = o2.map((t6) => parseFloat(t6));
    switch (n2) {
      case "translate":
        i3 = gt$1(a4, h4);
        break;
      case "rotate":
        i3 = ft$1({ angle: a4 }, { x: h4, y: c3 });
        break;
      case "scale":
        i3 = pt$1(a4, h4);
        break;
      case "skewX":
        i3 = vt$1(a4);
        break;
      case "skewY":
        i3 = yt$1(a4);
        break;
      case "matrix":
        i3 = [a4, h4, c3, l2, u3, d4];
    }
    e3.push(i3);
  }
  return lt$1(e3);
}
function Zi(t4, e3, s4, i3) {
  const r2 = Array.isArray(e3);
  let n2, o2 = e3;
  if ("fill" !== t4 && "stroke" !== t4 || e3 !== F) {
    if ("strokeUniform" === t4)
      return "non-scaling-stroke" === e3;
    if ("strokeDashArray" === t4)
      o2 = e3 === F ? null : e3.replace(/,/g, " ").split(/\s+/).map(parseFloat);
    else if ("transformMatrix" === t4)
      o2 = s4 && s4.transformMatrix ? ct$1(s4.transformMatrix, Ji(e3)) : Ji(e3);
    else if ("visible" === t4)
      o2 = e3 !== F && "hidden" !== e3, s4 && false === s4.visible && (o2 = false);
    else if ("opacity" === t4)
      o2 = parseFloat(e3), s4 && void 0 !== s4.opacity && (o2 *= s4.opacity);
    else if ("textAnchor" === t4)
      o2 = "start" === e3 ? P : "end" === e3 ? j : M3;
    else if ("charSpacing" === t4)
      n2 = Ft(e3, i3) / i3 * 1e3;
    else if ("paintFirst" === t4) {
      const t5 = e3.indexOf("fill"), s5 = e3.indexOf("stroke");
      o2 = "fill", (t5 > -1 && s5 > -1 && s5 < t5 || -1 === t5 && s5 > -1) && (o2 = "stroke");
    } else {
      if ("href" === t4 || "xlink:href" === t4 || "font" === t4)
        return e3;
      if ("imageSmoothing" === t4)
        return "optimizeQuality" === e3;
      n2 = r2 ? e3.map(Ft) : Ft(e3, i3);
    }
  } else
    o2 = "";
  return !r2 && isNaN(n2) ? o2 : n2;
}
function Qi(t4, e3) {
  const s4 = t4.match(gs);
  if (!s4)
    return;
  const i3 = s4[1], r2 = s4[3], n2 = s4[4], o2 = s4[5], a4 = s4[6];
  i3 && (e3.fontStyle = i3), r2 && (e3.fontWeight = isNaN(parseFloat(r2)) ? r2 : parseFloat(r2)), n2 && (e3.fontSize = Ft(n2)), a4 && (e3.fontFamily = a4), o2 && (e3.lineHeight = "normal" === o2 ? 1 : o2);
}
function $i(t4) {
  const e3 = {}, s4 = t4.getAttribute("style");
  return s4 ? ("string" == typeof s4 ? function(t5, e4) {
    t5.replace(/;\s*$/, "").split(";").forEach((t6) => {
      const [s5, i3] = t6.split(":");
      e4[s5.trim().toLowerCase()] = i3.trim();
    });
  }(s4, e3) : function(t5, e4) {
    Object.entries(t5).forEach((t6) => {
      let [s5, i3] = t6;
      void 0 !== i3 && (e4[s5.toLowerCase()] = i3);
    });
  }(s4, e3), e3) : e3;
}
const tr = { stroke: "strokeOpacity", fill: "fillOpacity" };
function er(t4, s4, i3) {
  if (!t4)
    return {};
  let r2, n2 = {}, o2 = k2;
  t4.parentNode && _s.test(t4.parentNode.nodeName) && (n2 = er(t4.parentElement, s4, i3), n2.fontSize && (r2 = o2 = Ft(n2.fontSize)));
  const a4 = e2(e2(e2({}, s4.reduce((e3, s5) => {
    const i4 = t4.getAttribute(s5);
    return i4 && (e3[s5] = i4), e3;
  }, {})), function(t5) {
    let s5 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, i4 = {};
    for (const r3 in s5)
      Oi(t5, r3.split(" ")) && (i4 = e2(e2({}, i4), s5[r3]));
    return i4;
  }(t4, i3)), $i(t4));
  a4[ms] && t4.setAttribute(ms, a4[ms]), a4[ps] && (r2 = Ft(a4[ps], o2), a4[ps] = "".concat(r2));
  const h4 = {};
  for (const t5 in a4) {
    const e3 = ki(t5), s5 = Zi(e3, a4[t5], n2, r2);
    h4[e3] = s5;
  }
  h4 && h4.font && Qi(h4.font, h4);
  const c3 = e2(e2({}, n2), h4);
  return _s.test(t4.nodeName) ? c3 : function(t5) {
    const e3 = li.getDefaults();
    return Object.entries(tr).forEach((s5) => {
      let [i4, r3] = s5;
      if (void 0 === t5[r3] || "" === t5[i4])
        return;
      if (void 0 === t5[i4]) {
        if (!e3[i4])
          return;
        t5[i4] = e3[i4];
      }
      if (0 === t5[i4].indexOf("url("))
        return;
      const n3 = new At(t5[i4]);
      t5[i4] = n3.setAlpha(jt(n3.getAlpha() * t5[r3], 2)).toRgba();
    }), t5;
  }(c3);
}
const sr = ["left", "top", "width", "height", "visible"], ir = ["rx", "ry"];
class rr extends li {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), rr.ownDefaults);
  }
  constructor(t4) {
    super(), Object.assign(this, rr.ownDefaults), this.setOptions(t4), this._initRxRy();
  }
  _initRxRy() {
    const { rx: t4, ry: e3 } = this;
    t4 && !e3 ? this.ry = t4 : e3 && !t4 && (this.rx = e3);
  }
  _render(t4) {
    const { width: e3, height: s4 } = this, i3 = -e3 / 2, r2 = -s4 / 2, n2 = this.rx ? Math.min(this.rx, e3 / 2) : 0, o2 = this.ry ? Math.min(this.ry, s4 / 2) : 0, a4 = 0 !== n2 || 0 !== o2;
    t4.beginPath(), t4.moveTo(i3 + n2, r2), t4.lineTo(i3 + e3 - n2, r2), a4 && t4.bezierCurveTo(i3 + e3 - D2 * n2, r2, i3 + e3, r2 + D2 * o2, i3 + e3, r2 + o2), t4.lineTo(i3 + e3, r2 + s4 - o2), a4 && t4.bezierCurveTo(i3 + e3, r2 + s4 - D2 * o2, i3 + e3 - D2 * n2, r2 + s4, i3 + e3 - n2, r2 + s4), t4.lineTo(i3 + n2, r2 + s4), a4 && t4.bezierCurveTo(i3 + D2 * n2, r2 + s4, i3, r2 + s4 - D2 * o2, i3, r2 + s4 - o2), t4.lineTo(i3, r2 + o2), a4 && t4.bezierCurveTo(i3, r2 + D2 * o2, i3 + D2 * n2, r2, i3 + n2, r2), t4.closePath(), this._renderPaintInOrder(t4);
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return super.toObject([...ir, ...t4]);
  }
  _toSVG() {
    const { width: t4, height: e3, rx: s4, ry: i3 } = this;
    return ["<rect ", "COMMON_PARTS", 'x="'.concat(-t4 / 2, '" y="').concat(-e3 / 2, '" rx="').concat(s4, '" ry="').concat(i3, '" width="').concat(t4, '" height="').concat(e3, '" />\n')];
  }
  static async fromElement(t4, s4, r2) {
    const n2 = er(t4, this.ATTRIBUTE_NAMES, r2), { left: o2 = 0, top: a4 = 0, width: h4 = 0, height: c3 = 0, visible: l2 = true } = n2, u3 = i2(n2, sr);
    return new this(e2(e2(e2({}, s4), u3), {}, { left: o2, top: a4, width: h4, height: c3, visible: Boolean(l2 && h4 && c3) }));
  }
}
s3(rr, "type", "Rect"), s3(rr, "cacheProperties", [...Os, ...ir]), s3(rr, "ownDefaults", { rx: 0, ry: 0 }), s3(rr, "ATTRIBUTE_NAMES", [...Si, "x", "y", "rx", "ry", "width", "height"]), I2.setClass(rr), I2.setSVGClass(rr);
const nr = "initialization", or = "added", ar = "removed", hr = "imperative", cr = (t4, e3) => {
  const { strokeUniform: s4, strokeWidth: i3, width: r2, height: n2, group: o2 } = e3, a4 = o2 && o2 !== t4 ? le(o2.calcTransformMatrix(), t4.calcTransformMatrix()) : null, h4 = a4 ? e3.getRelativeCenterPoint().transform(a4) : e3.getRelativeCenterPoint(), c3 = !e3.isStrokeAccountedForInDimensions(), l2 = s4 && c3 ? de(new U(i3, i3), void 0, t4.calcTransformMatrix()) : N, u3 = !s4 && c3 ? i3 : 0, d4 = ce(r2 + u3, n2 + u3, lt$1([a4, e3.calcOwnMatrix()], true)).add(l2).scalarDivide(2);
  return [h4.subtract(d4), h4.add(d4)];
};
class lr {
  calcLayoutResult(t4, e3) {
    if (this.shouldPerformLayout(t4))
      return this.calcBoundingBox(e3, t4);
  }
  shouldPerformLayout(t4) {
    return t4.type === nr || t4.type === hr || !!t4.prevStrategy && t4.strategy !== t4.prevStrategy;
  }
  shouldLayoutClipPath(t4) {
    let { type: e3, target: { clipPath: s4 } } = t4;
    return e3 !== nr && s4 && !s4.absolutePositioned;
  }
  getInitialSize(t4, e3) {
    return e3.size;
  }
  calcBoundingBox(t4, e3) {
    if (e3.type === hr && e3.overrides)
      return e3.overrides;
    if (0 === t4.length)
      return;
    const { target: s4 } = e3, { left: i3, top: r2, width: n2, height: o2 } = ie(t4.map((t5) => cr(s4, t5)).reduce((t5, e4) => t5.concat(e4), [])), a4 = new U(n2, o2), h4 = new U(i3, r2).add(a4.scalarDivide(2));
    if (e3.type === nr) {
      const t5 = this.getInitialSize(e3, { size: a4, center: h4 });
      return { center: h4, relativeCorrection: new U(0, 0), size: t5 };
    }
    return { center: h4.transform(s4.calcOwnMatrix()), size: a4 };
  }
}
s3(lr, "type", "strategy");
class ur extends lr {
  shouldPerformLayout(t4) {
    return true;
  }
}
s3(ur, "type", "fit-content"), I2.setClass(ur);
const dr = ["strategy"], gr = ["target", "strategy", "bubbles", "prevStrategy"], fr = "layoutManager";
class pr {
  constructor() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : new ur();
    s3(this, "strategy", void 0), this.strategy = t4, this._subscriptions = /* @__PURE__ */ new Map();
  }
  performLayout(t4) {
    const s4 = e2(e2({ bubbles: true, strategy: this.strategy }, t4), {}, { prevStrategy: this._prevLayoutStrategy, stopPropagation() {
      this.bubbles = false;
    } });
    this.onBeforeLayout(s4);
    const i3 = this.getLayoutResult(s4);
    i3 && this.commitLayout(s4, i3), this.onAfterLayout(s4, i3), this._prevLayoutStrategy = s4.strategy;
  }
  attachHandlers(t4, e3) {
    const { target: s4 } = e3;
    return ["modified", "moving", "resizing", "rotating", "scaling", "skewing", "changed", "modifyPoly"].map((e4) => t4.on(e4, (t5) => this.performLayout("modified" === e4 ? { type: "object_modified", trigger: e4, e: t5, target: s4 } : { type: "object_modifying", trigger: e4, e: t5, target: s4 })));
  }
  subscribe(t4, e3) {
    this.unsubscribe(t4, e3);
    const s4 = this.attachHandlers(t4, e3);
    this._subscriptions.set(t4, s4);
  }
  unsubscribe(t4, e3) {
    (this._subscriptions.get(t4) || []).forEach((t5) => t5()), this._subscriptions.delete(t4);
  }
  unsubscribeTargets(t4) {
    t4.targets.forEach((e3) => this.unsubscribe(e3, t4));
  }
  subscribeTargets(t4) {
    t4.targets.forEach((e3) => this.subscribe(e3, t4));
  }
  onBeforeLayout(t4) {
    const { target: s4, type: r2 } = t4, { canvas: n2 } = s4;
    if (r2 === nr || r2 === or ? this.subscribeTargets(t4) : r2 === ar && this.unsubscribeTargets(t4), s4.fire("layout:before", { context: t4 }), n2 && n2.fire("object:layout:before", { target: s4, context: t4 }), r2 === hr && t4.deep) {
      const r3 = i2(t4, dr);
      s4.forEachObject((t5) => t5.layoutManager && t5.layoutManager.performLayout(e2(e2({}, r3), {}, { bubbles: false, target: t5 })));
    }
  }
  getLayoutResult(t4) {
    const { target: e3 } = t4, s4 = t4.strategy.calcLayoutResult(t4, e3.getObjects());
    if (!s4)
      return;
    const i3 = t4.type === nr ? new U() : e3.getRelativeCenterPoint(), { center: r2, correction: n2 = new U(), relativeCorrection: o2 = new U() } = s4, a4 = i3.subtract(r2).add(n2).transform(t4.type === nr ? O2 : ht$1(e3.calcOwnMatrix()), true).add(o2);
    return { result: s4, prevCenter: i3, nextCenter: r2, offset: a4 };
  }
  commitLayout(t4, e3) {
    const { target: s4 } = t4, { result: { size: i3 }, nextCenter: r2 } = e3;
    var n2, o2;
    (s4.set({ width: i3.x, height: i3.y }), this.layoutObjects(t4, e3), t4.type === nr) ? s4.set({ left: null !== (n2 = t4.x) && void 0 !== n2 ? n2 : r2.x + i3.x * me(s4.originX), top: null !== (o2 = t4.y) && void 0 !== o2 ? o2 : r2.y + i3.y * me(s4.originY) }) : (s4.setPositionByOrigin(r2, M3, M3), s4.setCoords(), s4.set("dirty", true));
  }
  layoutObjects(t4, e3) {
    const { target: s4 } = t4;
    s4.forEachObject((i3) => {
      i3.group === s4 && this.layoutObject(t4, e3, i3);
    }), t4.strategy.shouldLayoutClipPath(t4) && this.layoutObject(t4, e3, s4.clipPath);
  }
  layoutObject(t4, e3, s4) {
    let { offset: i3 } = e3;
    s4.set({ left: s4.left + i3.x, top: s4.top + i3.y });
  }
  onAfterLayout(t4, s4) {
    const { target: r2, strategy: n2, bubbles: o2, prevStrategy: a4 } = t4, h4 = i2(t4, gr), { canvas: c3 } = r2;
    r2.fire("layout:after", { context: t4, result: s4 }), c3 && c3.fire("object:layout:after", { context: t4, result: s4, target: r2 });
    const l2 = r2.parent;
    o2 && null != l2 && l2.layoutManager && ((h4.path || (h4.path = [])).push(r2), l2.layoutManager.performLayout(e2(e2({}, h4), {}, { target: l2 }))), r2.set("dirty", true);
  }
  dispose() {
    this._subscriptions.forEach((t4) => t4.forEach((t5) => t5())), this._subscriptions.clear();
  }
  toObject() {
    return { type: fr, strategy: this.strategy.constructor.type };
  }
  toJSON() {
    return this.toObject();
  }
}
I2.setClass(pr, fr);
const mr = ["type", "objects", "layoutManager"];
class vr extends pr {
  performLayout() {
  }
}
class yr extends K2(li) {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), yr.ownDefaults);
  }
  constructor() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(), s3(this, "_activeObjects", []), s3(this, "__objectSelectionTracker", void 0), s3(this, "__objectSelectionDisposer", void 0), Object.assign(this, yr.ownDefaults), this.setOptions(e3), this._objects = [...t4], this.__objectSelectionTracker = this.__objectSelectionMonitor.bind(this, true), this.__objectSelectionDisposer = this.__objectSelectionMonitor.bind(this, false), this.forEachObject((t5) => {
      this.enterGroup(t5, false);
    }), this.layoutManager = e3.layoutManager || new pr(), this.layoutManager.performLayout({ type: nr, target: this, targets: [...t4], x: e3.left, y: e3.top });
  }
  canEnterGroup(t4) {
    return t4 === this || this.isDescendantOf(t4) ? (h$1("error", "Group: circular object trees are not supported, this call has no effect"), false) : -1 === this._objects.indexOf(t4) || (h$1("error", "Group: duplicate objects are not supported inside group, this call has no effect"), false);
  }
  _filterObjectsBeforeEnteringGroup(t4) {
    return t4.filter((t5, e3, s4) => this.canEnterGroup(t5) && s4.indexOf(t5) === e3);
  }
  add() {
    for (var t4 = arguments.length, e3 = new Array(t4), s4 = 0; s4 < t4; s4++)
      e3[s4] = arguments[s4];
    const i3 = this._filterObjectsBeforeEnteringGroup(e3), r2 = super.add(...i3);
    return this._onAfterObjectsChange(or, i3), r2;
  }
  insertAt(t4) {
    for (var e3 = arguments.length, s4 = new Array(e3 > 1 ? e3 - 1 : 0), i3 = 1; i3 < e3; i3++)
      s4[i3 - 1] = arguments[i3];
    const r2 = this._filterObjectsBeforeEnteringGroup(s4), n2 = super.insertAt(t4, ...r2);
    return this._onAfterObjectsChange(or, r2), n2;
  }
  remove() {
    const t4 = super.remove(...arguments);
    return this._onAfterObjectsChange(ar, t4), t4;
  }
  _onObjectAdded(t4) {
    this.enterGroup(t4, true), this.fire("object:added", { target: t4 }), t4.fire("added", { target: this });
  }
  _onObjectRemoved(t4, e3) {
    this.exitGroup(t4, e3), this.fire("object:removed", { target: t4 }), t4.fire("removed", { target: this });
  }
  _onAfterObjectsChange(t4, e3) {
    this.layoutManager.performLayout({ type: t4, targets: e3, target: this });
  }
  _onStackOrderChanged() {
    this._set("dirty", true);
  }
  _set(t4, e3) {
    const s4 = this[t4];
    return super._set(t4, e3), "canvas" === t4 && s4 !== e3 && (this._objects || []).forEach((s5) => {
      s5._set(t4, e3);
    }), this;
  }
  _shouldSetNestedCoords() {
    return this.subTargetCheck;
  }
  removeAll() {
    return this._activeObjects = [], this.remove(...this._objects);
  }
  __objectSelectionMonitor(t4, e3) {
    let { target: s4 } = e3;
    const i3 = this._activeObjects;
    if (t4)
      i3.push(s4), this._set("dirty", true);
    else if (i3.length > 0) {
      const t5 = i3.indexOf(s4);
      t5 > -1 && (i3.splice(t5, 1), this._set("dirty", true));
    }
  }
  _watchObject(t4, e3) {
    t4 && this._watchObject(false, e3), t4 ? (e3.on("selected", this.__objectSelectionTracker), e3.on("deselected", this.__objectSelectionDisposer)) : (e3.off("selected", this.__objectSelectionTracker), e3.off("deselected", this.__objectSelectionDisposer));
  }
  enterGroup(t4, e3) {
    t4.group && t4.group.remove(t4), t4._set("parent", this), this._enterGroup(t4, e3);
  }
  _enterGroup(t4, e3) {
    e3 && oe(t4, ct$1(ht$1(this.calcTransformMatrix()), t4.calcTransformMatrix())), this._shouldSetNestedCoords() && t4.setCoords(), t4._set("group", this), t4._set("canvas", this.canvas), this._watchObject(true, t4);
    const s4 = this.canvas && this.canvas.getActiveObject && this.canvas.getActiveObject();
    s4 && (s4 === t4 || t4.isDescendantOf(s4)) && this._activeObjects.push(t4);
  }
  exitGroup(t4, e3) {
    this._exitGroup(t4, e3), t4._set("parent", void 0), t4._set("canvas", void 0);
  }
  _exitGroup(t4, e3) {
    t4._set("group", void 0), e3 || (oe(t4, ct$1(this.calcTransformMatrix(), t4.calcTransformMatrix())), t4.setCoords()), this._watchObject(false, t4);
    const s4 = this._activeObjects.length > 0 ? this._activeObjects.indexOf(t4) : -1;
    s4 > -1 && this._activeObjects.splice(s4, 1);
  }
  shouldCache() {
    const t4 = li.prototype.shouldCache.call(this);
    if (t4) {
      for (let t5 = 0; t5 < this._objects.length; t5++)
        if (this._objects[t5].willDrawShadow())
          return this.ownCaching = false, false;
    }
    return t4;
  }
  willDrawShadow() {
    if (super.willDrawShadow())
      return true;
    for (let t4 = 0; t4 < this._objects.length; t4++)
      if (this._objects[t4].willDrawShadow())
        return true;
    return false;
  }
  isOnACache() {
    return this.ownCaching || !!this.parent && this.parent.isOnACache();
  }
  drawObject(t4) {
    this._renderBackground(t4);
    for (let s4 = 0; s4 < this._objects.length; s4++) {
      var e3;
      null !== (e3 = this.canvas) && void 0 !== e3 && e3.preserveObjectStacking && this._objects[s4].group !== this ? (t4.save(), t4.transform(...ht$1(this.calcTransformMatrix())), this._objects[s4].render(t4), t4.restore()) : this._objects[s4].group === this && this._objects[s4].render(t4);
    }
    this._drawClipPath(t4, this.clipPath);
  }
  setCoords() {
    super.setCoords(), this._shouldSetNestedCoords() && this.forEachObject((t4) => t4.setCoords());
  }
  triggerLayout() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.layoutManager.performLayout(e2({ target: this, type: hr }, t4));
  }
  render(t4) {
    this._transformDone = true, super.render(t4), this._transformDone = false;
  }
  __serializeObjects(t4, e3) {
    const s4 = this.includeDefaultValues;
    return this._objects.filter(function(t5) {
      return !t5.excludeFromExport;
    }).map(function(i3) {
      const r2 = i3.includeDefaultValues;
      i3.includeDefaultValues = s4;
      const n2 = i3[t4 || "toObject"](e3);
      return i3.includeDefaultValues = r2, n2;
    });
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    const s4 = this.layoutManager.toObject();
    return e2(e2(e2({}, super.toObject(["subTargetCheck", "interactive", ...t4])), "fit-content" !== s4.strategy || this.includeDefaultValues ? { layoutManager: s4 } : {}), {}, { objects: this.__serializeObjects("toObject", t4) });
  }
  toString() {
    return "#<Group: (".concat(this.complexity(), ")>");
  }
  dispose() {
    this.layoutManager.unsubscribeTargets({ targets: this.getObjects(), target: this }), this._activeObjects = [], this.forEachObject((t4) => {
      this._watchObject(false, t4), t4.dispose();
    }), super.dispose();
  }
  _createSVGBgRect(t4) {
    if (!this.backgroundColor)
      return "";
    const e3 = rr.prototype._toSVG.call(this), s4 = e3.indexOf("COMMON_PARTS");
    e3[s4] = 'for="group" ';
    const i3 = e3.join("");
    return t4 ? t4(i3) : i3;
  }
  _toSVG(t4) {
    const e3 = ["<g ", "COMMON_PARTS", " >\n"], s4 = this._createSVGBgRect(t4);
    s4 && e3.push("		", s4);
    for (let s5 = 0; s5 < this._objects.length; s5++)
      e3.push("		", this._objects[s5].toSVG(t4));
    return e3.push("</g>\n"), e3;
  }
  getSvgStyles() {
    const t4 = void 0 !== this.opacity && 1 !== this.opacity ? "opacity: ".concat(this.opacity, ";") : "", e3 = this.visible ? "" : " visibility: hidden;";
    return [t4, this.getSvgFilter(), e3].join("");
  }
  toClipPathSVG(t4) {
    const e3 = [], s4 = this._createSVGBgRect(t4);
    s4 && e3.push("	", s4);
    for (let s5 = 0; s5 < this._objects.length; s5++)
      e3.push("	", this._objects[s5].toClipPathSVG(t4));
    return this._createBaseClipPathSVGMarkup(e3, { reviver: t4 });
  }
  static fromObject(t4, s4) {
    let { type: r2, objects: n2 = [], layoutManager: o2 } = t4, a4 = i2(t4, mr);
    return Promise.all([bt$1(n2, s4), wt(a4, s4)]).then((t5) => {
      let [s5, i3] = t5;
      const r3 = new this(s5, e2(e2(e2({}, a4), i3), {}, { layoutManager: new vr() }));
      if (o2) {
        const t6 = I2.getClass(o2.type), e3 = I2.getClass(o2.strategy);
        r3.layoutManager = new t6(new e3());
      } else
        r3.layoutManager = new pr();
      return r3.layoutManager.subscribeTargets({ type: nr, target: r3, targets: r3.getObjects() }), r3.setCoords(), r3;
    });
  }
}
s3(yr, "type", "Group"), s3(yr, "ownDefaults", { strokeWidth: 0, subTargetCheck: false, interactive: false }), I2.setClass(yr);
const _r = (t4, e3) => Math.min(e3.width / t4.width, e3.height / t4.height), xr = (t4, e3) => Math.max(e3.width / t4.width, e3.height / t4.height);
var Cr;
const br = "(".concat(us, ")"), wr = "(M) (?:".concat(br, " ").concat(br, " ?)+"), Sr = "(L) (?:".concat(br, " ").concat(br, " ?)+"), Tr = "(H) (?:".concat(br, " ?)+"), Or = "(V) (?:".concat(br, " ?)+"), kr = String.raw(Cr || (Cr = r(["(Z)s*"], ["(Z)\\s*"]))), Dr = "(C) (?:".concat(br, " ").concat(br, " ").concat(br, " ").concat(br, " ").concat(br, " ").concat(br, " ?)+"), Mr = "(S) (?:".concat(br, " ").concat(br, " ").concat(br, " ").concat(br, " ?)+"), Pr = "(Q) (?:".concat(br, " ").concat(br, " ").concat(br, " ").concat(br, " ?)+"), Er = "(T) (?:".concat(br, " ").concat(br, " ?)+"), Ar = "(A) (?:".concat(br, " ").concat(br, " ").concat(br, " ([01]) ?([01]) ").concat(br, " ").concat(br, " ?)+"), jr = "(?:(?:".concat(wr, ")") + "|(?:".concat(Sr, ")") + "|(?:".concat(Tr, ")") + "|(?:".concat(Or, ")") + "|(?:".concat(kr, ")") + "|(?:".concat(Dr, ")") + "|(?:".concat(Mr, ")") + "|(?:".concat(Pr, ")") + "|(?:".concat(Er, ")") + "|(?:".concat(Ar, "))"), Fr = { m: "l", M: "L" }, Lr = (t4, e3, s4, i3, r2, n2, o2, a4, h4, c3, l2) => {
  const u3 = H3(t4), d4 = G$1(t4), g2 = H3(e3), f2 = G$1(e3), p2 = s4 * r2 * g2 - i3 * n2 * f2 + o2, m4 = i3 * r2 * g2 + s4 * n2 * f2 + a4;
  return ["C", c3 + h4 * (-s4 * r2 * d4 - i3 * n2 * u3), l2 + h4 * (-i3 * r2 * d4 + s4 * n2 * u3), p2 + h4 * (s4 * r2 * f2 + i3 * n2 * g2), m4 + h4 * (i3 * r2 * f2 - s4 * n2 * g2), p2, m4];
}, Rr = (t4, e3, s4, i3) => {
  const r2 = Math.atan2(e3, t4), n2 = Math.atan2(i3, s4);
  return n2 >= r2 ? n2 - r2 : 2 * Math.PI - (r2 - n2);
};
function Br(t4, e3, s4, i3, r2, n2, o2, h4) {
  let c3;
  if (a3.cachesBoundsOfCurve && (c3 = [...arguments].join(), x2.boundsOfCurveCache[c3]))
    return x2.boundsOfCurveCache[c3];
  const l2 = Math.sqrt, u3 = Math.abs, d4 = [], g2 = [[0, 0], [0, 0]];
  let f2 = 6 * t4 - 12 * s4 + 6 * r2, p2 = -3 * t4 + 9 * s4 - 9 * r2 + 3 * o2, m4 = 3 * s4 - 3 * t4;
  for (let t5 = 0; t5 < 2; ++t5) {
    if (t5 > 0 && (f2 = 6 * e3 - 12 * i3 + 6 * n2, p2 = -3 * e3 + 9 * i3 - 9 * n2 + 3 * h4, m4 = 3 * i3 - 3 * e3), u3(p2) < 1e-12) {
      if (u3(f2) < 1e-12)
        continue;
      const t6 = -m4 / f2;
      0 < t6 && t6 < 1 && d4.push(t6);
      continue;
    }
    const s5 = f2 * f2 - 4 * m4 * p2;
    if (s5 < 0)
      continue;
    const r3 = l2(s5), o3 = (-f2 + r3) / (2 * p2);
    0 < o3 && o3 < 1 && d4.push(o3);
    const a4 = (-f2 - r3) / (2 * p2);
    0 < a4 && a4 < 1 && d4.push(a4);
  }
  let v2 = d4.length;
  const y4 = v2, _2 = Wr(t4, e3, s4, i3, r2, n2, o2, h4);
  for (; v2--; ) {
    const { x: t5, y: e4 } = _2(d4[v2]);
    g2[0][v2] = t5, g2[1][v2] = e4;
  }
  g2[0][y4] = t4, g2[1][y4] = e3, g2[0][y4 + 1] = o2, g2[1][y4 + 1] = h4;
  const C2 = [new U(Math.min(...g2[0]), Math.min(...g2[1])), new U(Math.max(...g2[0]), Math.max(...g2[1]))];
  return a3.cachesBoundsOfCurve && (x2.boundsOfCurveCache[c3] = C2), C2;
}
const Ir = (t4, e3, s4) => {
  let [i3, r2, n2, o2, a4, h4, c3, l2] = s4;
  const u3 = ((t5, e4, s5, i4, r3, n3, o3) => {
    if (0 === s5 || 0 === i4)
      return [];
    let a5 = 0, h5 = 0, c4 = 0;
    const l3 = Math.PI, u4 = o3 * T$1, d4 = G$1(u4), g2 = H3(u4), f2 = 0.5 * (-g2 * t5 - d4 * e4), p2 = 0.5 * (-g2 * e4 + d4 * t5), m4 = s5 ** 2, v2 = i4 ** 2, y4 = p2 ** 2, _2 = f2 ** 2, x3 = m4 * v2 - m4 * y4 - v2 * _2;
    let C2 = Math.abs(s5), b3 = Math.abs(i4);
    if (x3 < 0) {
      const t6 = Math.sqrt(1 - x3 / (m4 * v2));
      C2 *= t6, b3 *= t6;
    } else
      c4 = (r3 === n3 ? -1 : 1) * Math.sqrt(x3 / (m4 * y4 + v2 * _2));
    const w3 = c4 * C2 * p2 / b3, S4 = -c4 * b3 * f2 / C2, O3 = g2 * w3 - d4 * S4 + 0.5 * t5, k3 = d4 * w3 + g2 * S4 + 0.5 * e4;
    let D3 = Rr(1, 0, (f2 - w3) / C2, (p2 - S4) / b3), M4 = Rr((f2 - w3) / C2, (p2 - S4) / b3, (-f2 - w3) / C2, (-p2 - S4) / b3);
    0 === n3 && M4 > 0 ? M4 -= 2 * l3 : 1 === n3 && M4 < 0 && (M4 += 2 * l3);
    const P2 = Math.ceil(Math.abs(M4 / l3 * 2)), E3 = new Array(P2), A2 = M4 / P2, j2 = 8 / 3 * Math.sin(A2 / 4) * Math.sin(A2 / 4) / Math.sin(A2 / 2);
    let F2 = D3 + A2;
    for (let t6 = 0; t6 < P2; t6++)
      E3[t6] = Lr(D3, F2, g2, d4, C2, b3, O3, k3, j2, a5, h5), a5 = E3[t6][5], h5 = E3[t6][6], D3 = F2, F2 += A2;
    return E3;
  })(c3 - t4, l2 - e3, r2, n2, a4, h4, o2);
  for (let s5 = 0, i4 = u3.length; s5 < i4; s5++)
    u3[s5][1] += t4, u3[s5][2] += e3, u3[s5][3] += t4, u3[s5][4] += e3, u3[s5][5] += t4, u3[s5][6] += e3;
  return u3;
}, Xr = (t4) => {
  let e3 = 0, s4 = 0, i3 = 0, r2 = 0;
  const n2 = [];
  let o2, a4 = 0, h4 = 0;
  for (const c3 of t4) {
    const t5 = [...c3];
    let l2;
    switch (t5[0]) {
      case "l":
        t5[1] += e3, t5[2] += s4;
      case "L":
        e3 = t5[1], s4 = t5[2], l2 = ["L", e3, s4];
        break;
      case "h":
        t5[1] += e3;
      case "H":
        e3 = t5[1], l2 = ["L", e3, s4];
        break;
      case "v":
        t5[1] += s4;
      case "V":
        s4 = t5[1], l2 = ["L", e3, s4];
        break;
      case "m":
        t5[1] += e3, t5[2] += s4;
      case "M":
        e3 = t5[1], s4 = t5[2], i3 = t5[1], r2 = t5[2], l2 = ["M", e3, s4];
        break;
      case "c":
        t5[1] += e3, t5[2] += s4, t5[3] += e3, t5[4] += s4, t5[5] += e3, t5[6] += s4;
      case "C":
        a4 = t5[3], h4 = t5[4], e3 = t5[5], s4 = t5[6], l2 = ["C", t5[1], t5[2], a4, h4, e3, s4];
        break;
      case "s":
        t5[1] += e3, t5[2] += s4, t5[3] += e3, t5[4] += s4;
      case "S":
        "C" === o2 ? (a4 = 2 * e3 - a4, h4 = 2 * s4 - h4) : (a4 = e3, h4 = s4), e3 = t5[3], s4 = t5[4], l2 = ["C", a4, h4, t5[1], t5[2], e3, s4], a4 = l2[3], h4 = l2[4];
        break;
      case "q":
        t5[1] += e3, t5[2] += s4, t5[3] += e3, t5[4] += s4;
      case "Q":
        a4 = t5[1], h4 = t5[2], e3 = t5[3], s4 = t5[4], l2 = ["Q", a4, h4, e3, s4];
        break;
      case "t":
        t5[1] += e3, t5[2] += s4;
      case "T":
        "Q" === o2 ? (a4 = 2 * e3 - a4, h4 = 2 * s4 - h4) : (a4 = e3, h4 = s4), e3 = t5[1], s4 = t5[2], l2 = ["Q", a4, h4, e3, s4];
        break;
      case "a":
        t5[6] += e3, t5[7] += s4;
      case "A":
        Ir(e3, s4, t5).forEach((t6) => n2.push(t6)), e3 = t5[6], s4 = t5[7];
        break;
      case "z":
      case "Z":
        e3 = i3, s4 = r2, l2 = ["Z"];
    }
    l2 ? (n2.push(l2), o2 = l2[0]) : o2 = "";
  }
  return n2;
}, Yr = (t4, e3, s4, i3) => Math.sqrt((s4 - t4) ** 2 + (i3 - e3) ** 2), Wr = (t4, e3, s4, i3, r2, n2, o2, a4) => (h4) => {
  const c3 = h4 ** 3, l2 = ((t5) => 3 * t5 ** 2 * (1 - t5))(h4), u3 = ((t5) => 3 * t5 * (1 - t5) ** 2)(h4), d4 = ((t5) => (1 - t5) ** 3)(h4);
  return new U(o2 * c3 + r2 * l2 + s4 * u3 + t4 * d4, a4 * c3 + n2 * l2 + i3 * u3 + e3 * d4);
}, Vr = (t4) => t4 ** 2, zr = (t4) => 2 * t4 * (1 - t4), Hr = (t4) => (1 - t4) ** 2, Gr = (t4, e3, s4, i3, r2, n2, o2, a4) => (h4) => {
  const c3 = Vr(h4), l2 = zr(h4), u3 = Hr(h4), d4 = 3 * (u3 * (s4 - t4) + l2 * (r2 - s4) + c3 * (o2 - r2)), g2 = 3 * (u3 * (i3 - e3) + l2 * (n2 - i3) + c3 * (a4 - n2));
  return Math.atan2(g2, d4);
}, Ur = (t4, e3, s4, i3, r2, n2) => (o2) => {
  const a4 = Vr(o2), h4 = zr(o2), c3 = Hr(o2);
  return new U(r2 * a4 + s4 * h4 + t4 * c3, n2 * a4 + i3 * h4 + e3 * c3);
}, Nr = (t4, e3, s4, i3, r2, n2) => (o2) => {
  const a4 = 1 - o2, h4 = 2 * (a4 * (s4 - t4) + o2 * (r2 - s4)), c3 = 2 * (a4 * (i3 - e3) + o2 * (n2 - i3));
  return Math.atan2(c3, h4);
}, qr = (t4, e3, s4) => {
  let i3 = new U(e3, s4), r2 = 0;
  for (let e4 = 1; e4 <= 100; e4 += 1) {
    const s5 = t4(e4 / 100);
    r2 += Yr(i3.x, i3.y, s5.x, s5.y), i3 = s5;
  }
  return r2;
}, Kr = (t4, s4) => {
  let i3, r2 = 0, n2 = 0, o2 = { x: t4.x, y: t4.y }, a4 = e2({}, o2), h4 = 0.01, c3 = 0;
  const l2 = t4.iterator, u3 = t4.angleFinder;
  for (; n2 < s4 && h4 > 1e-4; )
    a4 = l2(r2), c3 = r2, i3 = Yr(o2.x, o2.y, a4.x, a4.y), i3 + n2 > s4 ? (r2 -= h4, h4 /= 2) : (o2 = a4, r2 += h4, n2 += i3);
  return e2(e2({}, a4), {}, { angle: u3(c3) });
}, Jr = (t4) => {
  let e3, s4, i3 = 0, r2 = 0, n2 = 0, o2 = 0, a4 = 0;
  const h4 = [];
  for (const c3 of t4) {
    const t5 = { x: r2, y: n2, command: c3[0], length: 0 };
    switch (c3[0]) {
      case "M":
        s4 = t5, s4.x = o2 = r2 = c3[1], s4.y = a4 = n2 = c3[2];
        break;
      case "L":
        s4 = t5, s4.length = Yr(r2, n2, c3[1], c3[2]), r2 = c3[1], n2 = c3[2];
        break;
      case "C":
        e3 = Wr(r2, n2, c3[1], c3[2], c3[3], c3[4], c3[5], c3[6]), s4 = t5, s4.iterator = e3, s4.angleFinder = Gr(r2, n2, c3[1], c3[2], c3[3], c3[4], c3[5], c3[6]), s4.length = qr(e3, r2, n2), r2 = c3[5], n2 = c3[6];
        break;
      case "Q":
        e3 = Ur(r2, n2, c3[1], c3[2], c3[3], c3[4]), s4 = t5, s4.iterator = e3, s4.angleFinder = Nr(r2, n2, c3[1], c3[2], c3[3], c3[4]), s4.length = qr(e3, r2, n2), r2 = c3[3], n2 = c3[4];
        break;
      case "Z":
        s4 = t5, s4.destX = o2, s4.destY = a4, s4.length = Yr(r2, n2, o2, a4), r2 = o2, n2 = a4;
    }
    i3 += s4.length, h4.push(s4);
  }
  return h4.push({ length: i3, x: r2, y: n2 }), h4;
}, Zr = function(t4, s4) {
  let i3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : Jr(t4), r2 = 0;
  for (; s4 - i3[r2].length > 0 && r2 < i3.length - 2; )
    s4 -= i3[r2].length, r2++;
  const n2 = i3[r2], o2 = s4 / n2.length, a4 = t4[r2];
  switch (n2.command) {
    case "M":
      return { x: n2.x, y: n2.y, angle: 0 };
    case "Z":
      return e2(e2({}, new U(n2.x, n2.y).lerp(new U(n2.destX, n2.destY), o2)), {}, { angle: Math.atan2(n2.destY - n2.y, n2.destX - n2.x) });
    case "L":
      return e2(e2({}, new U(n2.x, n2.y).lerp(new U(a4[1], a4[2]), o2)), {}, { angle: Math.atan2(a4[2] - n2.y, a4[1] - n2.x) });
    case "C":
    case "Q":
      return Kr(n2, s4);
  }
}, Qr = new RegExp(jr, "gi"), $r = new RegExp(jr, "i"), tn = (t4) => {
  t4 = Mi(t4);
  const e3 = [];
  for (let [s4] of t4.matchAll(Qr)) {
    const t5 = [];
    let i3;
    do {
      if (i3 = $r.exec(s4), !i3)
        break;
      const e4 = i3.filter((t6) => t6);
      e4.shift();
      const r2 = e4.map((t6) => {
        const e5 = Number.parseFloat(t6);
        return Number.isNaN(e5) ? t6 : e5;
      });
      if (t5.push(r2), e4.length <= 1)
        break;
      e4.shift(), s4 = s4.replace(new RegExp("".concat(e4.join(" ?"), " ?$")), "");
    } while (i3);
    t5.reverse().forEach((t6, s5) => {
      const i4 = Fr[t6[0]];
      s5 > 0 && ("l" == i4 || "L" == i4) && (t6[0] = i4), e3.push(t6);
    });
  }
  return e3;
}, sn = (t4, e3) => t4.map((t5) => t5.map((t6, s4) => 0 === s4 || void 0 === e3 ? t6 : jt(t6, e3)).join(" ")).join(" ");
class an extends Jt {
  constructor(t4) {
    let { allowTouchScrolling: e3 = false, containerClass: i3 = "" } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(t4), s3(this, "upper", void 0), s3(this, "container", void 0);
    const { el: r2 } = this.lower, n2 = this.createUpperCanvas();
    this.upper = { el: n2, ctx: n2.getContext("2d") }, this.applyCanvasStyle(r2, { allowTouchScrolling: e3 }), this.applyCanvasStyle(n2, { allowTouchScrolling: e3 });
    const o2 = this.createContainerElement();
    o2.classList.add(i3), r2.parentNode && r2.parentNode.replaceChild(o2, r2), o2.append(r2, n2), this.container = o2;
  }
  createUpperCanvas() {
    const { el: t4 } = this.lower, e3 = et$1();
    return e3.className = t4.className, e3.classList.remove("lower-canvas"), e3.classList.add("upper-canvas"), e3.setAttribute("data-fabric", "top"), e3.style.cssText = t4.style.cssText, e3.setAttribute("draggable", "true"), e3;
  }
  createContainerElement() {
    const t4 = v$1().createElement("div");
    return t4.setAttribute("data-fabric", "wrapper"), Ut(t4, { position: "relative" }), Kt(t4), t4;
  }
  applyCanvasStyle(t4, e3) {
    let { allowTouchScrolling: s4 } = e3;
    Ut(t4, { position: "absolute", left: "0", top: "0" }), function(t5, e4) {
      const s5 = e4 ? "manipulation" : F;
      Ut(t5, { "touch-action": s5, "-ms-touch-action": s5 });
    }(t4, s4), Kt(t4);
  }
  setDimensions(t4, e3) {
    super.setDimensions(t4, e3);
    const { el: s4, ctx: i3 } = this.upper;
    Nt(s4, i3, t4, e3);
  }
  setCSSDimensions(t4) {
    super.setCSSDimensions(t4), qt(this.upper.el, t4), qt(this.container, t4);
  }
  cleanupDOM(t4) {
    const e3 = this.container, { el: s4 } = this.lower, { el: i3 } = this.upper;
    super.cleanupDOM(t4), e3.removeChild(i3), e3.removeChild(s4), e3.parentNode && e3.parentNode.replaceChild(s4, e3);
  }
  dispose() {
    super.dispose(), m3().dispose(this.upper.el), delete this.upper, delete this.container;
  }
}
class hn extends Qt {
  constructor() {
    super(...arguments), s3(this, "targets", []), s3(this, "_hoveredTargets", []), s3(this, "_objectsToRender", void 0), s3(this, "_currentTransform", null), s3(this, "_groupSelector", null), s3(this, "contextTopDirty", false);
  }
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), hn.ownDefaults);
  }
  get upperCanvasEl() {
    var t4;
    return null === (t4 = this.elements.upper) || void 0 === t4 ? void 0 : t4.el;
  }
  get contextTop() {
    var t4;
    return null === (t4 = this.elements.upper) || void 0 === t4 ? void 0 : t4.ctx;
  }
  get wrapperEl() {
    return this.elements.container;
  }
  initElements(t4) {
    this.elements = new an(t4, { allowTouchScrolling: this.allowTouchScrolling, containerClass: this.containerClass }), this._createCacheCanvas();
  }
  _onObjectAdded(t4) {
    this._objectsToRender = void 0, super._onObjectAdded(t4);
  }
  _onObjectRemoved(t4) {
    this._objectsToRender = void 0, t4 === this._activeObject && (this.fire("before:selection:cleared", { deselected: [t4] }), this._discardActiveObject(), this.fire("selection:cleared", { deselected: [t4] }), t4.fire("deselected", { target: t4 })), t4 === this._hoveredTarget && (this._hoveredTarget = void 0, this._hoveredTargets = []), super._onObjectRemoved(t4);
  }
  _onStackOrderChanged() {
    this._objectsToRender = void 0, super._onStackOrderChanged();
  }
  _chooseObjectsToRender() {
    const t4 = this._activeObject;
    return !this.preserveObjectStacking && t4 ? this._objects.filter((e3) => !e3.group && e3 !== t4).concat(t4) : this._objects;
  }
  renderAll() {
    this.cancelRequestedRender(), this.destroyed || (!this.contextTopDirty || this._groupSelector || this.isDrawingMode || (this.clearContext(this.contextTop), this.contextTopDirty = false), this.hasLostContext && (this.renderTopLayer(this.contextTop), this.hasLostContext = false), !this._objectsToRender && (this._objectsToRender = this._chooseObjectsToRender()), this.renderCanvas(this.getContext(), this._objectsToRender));
  }
  renderTopLayer(t4) {
    t4.save(), this.isDrawingMode && this._isCurrentlyDrawing && (this.freeDrawingBrush && this.freeDrawingBrush._render(), this.contextTopDirty = true), this.selection && this._groupSelector && (this._drawSelection(t4), this.contextTopDirty = true), t4.restore();
  }
  renderTop() {
    const t4 = this.contextTop;
    this.clearContext(t4), this.renderTopLayer(t4), this.fire("after:render", { ctx: t4 });
  }
  setTargetFindTolerance(t4) {
    t4 = Math.round(t4), this.targetFindTolerance = t4;
    const e3 = this.getRetinaScaling(), s4 = Math.ceil((2 * t4 + 1) * e3);
    this.pixelFindCanvasEl.width = this.pixelFindCanvasEl.height = s4, this.pixelFindContext.scale(e3, e3);
  }
  isTargetTransparent(t4, e3, s4) {
    const i3 = this.targetFindTolerance, r2 = this.pixelFindContext;
    this.clearContext(r2), r2.save(), r2.translate(-e3 + i3, -s4 + i3), r2.transform(...this.viewportTransform);
    const n2 = t4.selectionBackgroundColor;
    t4.selectionBackgroundColor = "", t4.render(r2), t4.selectionBackgroundColor = n2, r2.restore();
    const o2 = Math.round(i3 * this.getRetinaScaling());
    return ui(r2, o2, o2, o2);
  }
  _isSelectionKeyPressed(t4) {
    const e3 = this.selectionKey;
    return !!e3 && (Array.isArray(e3) ? !!e3.find((e4) => !!e4 && true === t4[e4]) : t4[e3]);
  }
  _shouldClearSelection(t4, e3) {
    const s4 = this.getActiveObjects(), i3 = this._activeObject;
    return !!(!e3 || e3 && i3 && s4.length > 1 && -1 === s4.indexOf(e3) && i3 !== e3 && !this._isSelectionKeyPressed(t4) || e3 && !e3.evented || e3 && !e3.selectable && i3 && i3 !== e3);
  }
  _shouldCenterTransform(t4, e3, s4) {
    if (!t4)
      return;
    let i3;
    return "scale" === e3 || "scaleX" === e3 || "scaleY" === e3 || "resizing" === e3 ? i3 = this.centeredScaling || t4.centeredScaling : "rotate" === e3 && (i3 = this.centeredRotation || t4.centeredRotation), i3 ? !s4 : s4;
  }
  _getOriginFromCorner(t4, e3) {
    const s4 = { x: t4.originX, y: t4.originY };
    return e3 ? (["ml", "tl", "bl"].includes(e3) ? s4.x = j : ["mr", "tr", "br"].includes(e3) && (s4.x = P), ["tl", "mt", "tr"].includes(e3) ? s4.y = A : ["bl", "mb", "br"].includes(e3) && (s4.y = E2), s4) : s4;
  }
  _setupCurrentTransform(t4, s4, i3) {
    var r2;
    const n2 = s4.group ? ue(this.getScenePoint(t4), void 0, s4.group.calcTransformMatrix()) : this.getScenePoint(t4), { key: o2 = "", control: a4 } = s4.getActiveControl() || {}, h4 = i3 && a4 ? null === (r2 = a4.getActionHandler(t4, s4, a4)) || void 0 === r2 ? void 0 : r2.bind(a4) : Se, c3 = ((t5, e3, s5, i4) => {
      if (!e3 || !t5)
        return "drag";
      const r3 = i4.controls[e3];
      return r3.getActionName(s5, r3, i4);
    })(i3, o2, t4, s4), l2 = t4[this.centeredKey], u3 = this._shouldCenterTransform(s4, c3, l2) ? { x: M3, y: M3 } : this._getOriginFromCorner(s4, o2), d4 = { target: s4, action: c3, actionHandler: h4, actionPerformed: false, corner: o2, scaleX: s4.scaleX, scaleY: s4.scaleY, skewX: s4.skewX, skewY: s4.skewY, offsetX: n2.x - s4.left, offsetY: n2.y - s4.top, originX: u3.x, originY: u3.y, ex: n2.x, ey: n2.y, lastX: n2.x, lastY: n2.y, theta: rt$1(s4.angle), width: s4.width, height: s4.height, shiftKey: t4.shiftKey, altKey: l2, original: e2(e2({}, he(s4)), {}, { originX: u3.x, originY: u3.y }) };
    this._currentTransform = d4, this.fire("before:transform", { e: t4, transform: d4 });
  }
  setCursor(t4) {
    this.upperCanvasEl.style.cursor = t4;
  }
  _drawSelection(t4) {
    const { x: e3, y: s4, deltaX: i3, deltaY: r2 } = this._groupSelector, n2 = new U(e3, s4).transform(this.viewportTransform), o2 = new U(e3 + i3, s4 + r2).transform(this.viewportTransform), a4 = this.selectionLineWidth / 2;
    let h4 = Math.min(n2.x, o2.x), c3 = Math.min(n2.y, o2.y), l2 = Math.max(n2.x, o2.x), u3 = Math.max(n2.y, o2.y);
    this.selectionColor && (t4.fillStyle = this.selectionColor, t4.fillRect(h4, c3, l2 - h4, u3 - c3)), this.selectionLineWidth && this.selectionBorderColor && (t4.lineWidth = this.selectionLineWidth, t4.strokeStyle = this.selectionBorderColor, h4 += a4, c3 += a4, l2 -= a4, u3 -= a4, li.prototype._setLineDash.call(this, t4, this.selectionDashArray), t4.strokeRect(h4, c3, l2 - h4, u3 - c3));
  }
  findTarget(t4) {
    if (this.skipTargetFind)
      return;
    const e3 = this.getViewportPoint(t4), s4 = this._activeObject, i3 = this.getActiveObjects();
    if (this.targets = [], s4 && i3.length >= 1) {
      if (s4.findControl(e3, ee(t4)))
        return s4;
      if (i3.length > 1 && this.searchPossibleTargets([s4], e3))
        return s4;
      if (s4 === this.searchPossibleTargets([s4], e3)) {
        if (this.preserveObjectStacking) {
          const i4 = this.targets;
          this.targets = [];
          const r2 = this.searchPossibleTargets(this._objects, e3);
          return t4[this.altSelectionKey] && r2 && r2 !== s4 ? (this.targets = i4, s4) : r2;
        }
        return s4;
      }
    }
    return this.searchPossibleTargets(this._objects, e3);
  }
  _pointIsInObjectSelectionArea(t4, e3) {
    let s4 = t4.getCoords();
    const i3 = this.getZoom(), r2 = t4.padding / i3;
    if (r2) {
      const [t5, e4, i4, n2] = s4, o2 = Math.atan2(e4.y - t5.y, e4.x - t5.x), a4 = H3(o2) * r2, h4 = G$1(o2) * r2, c3 = a4 + h4, l2 = a4 - h4;
      s4 = [new U(t5.x - l2, t5.y - c3), new U(e4.x + c3, e4.y - l2), new U(i4.x + l2, i4.y + c3), new U(n2.x - c3, n2.y + l2)];
    }
    return is.isPointInPolygon(e3, s4);
  }
  _checkTarget(t4, e3) {
    if (t4 && t4.visible && t4.evented && this._pointIsInObjectSelectionArea(t4, ue(e3, void 0, this.viewportTransform))) {
      if (!this.perPixelTargetFind && !t4.perPixelTargetFind || t4.isEditing)
        return true;
      if (!this.isTargetTransparent(t4, e3.x, e3.y))
        return true;
    }
    return false;
  }
  _searchPossibleTargets(t4, e3) {
    let s4 = t4.length;
    for (; s4--; ) {
      const i3 = t4[s4];
      if (this._checkTarget(i3, e3)) {
        if (q2(i3) && i3.subTargetCheck) {
          const t5 = this._searchPossibleTargets(i3._objects, e3);
          t5 && this.targets.push(t5);
        }
        return i3;
      }
    }
  }
  searchPossibleTargets(t4, e3) {
    const s4 = this._searchPossibleTargets(t4, e3);
    if (s4 && q2(s4) && s4.interactive && this.targets[0]) {
      const t5 = this.targets;
      for (let e4 = t5.length - 1; e4 > 0; e4--) {
        const s5 = t5[e4];
        if (!q2(s5) || !s5.interactive)
          return s5;
      }
      return t5[0];
    }
    return s4;
  }
  getViewportPoint(t4) {
    return this._pointer ? this._pointer : this.getPointer(t4, true);
  }
  getScenePoint(t4) {
    return this._absolutePointer ? this._absolutePointer : this.getPointer(t4);
  }
  getPointer(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
    const s4 = this.upperCanvasEl, i3 = s4.getBoundingClientRect();
    let r2 = te$1(t4), n2 = i3.width || 0, o2 = i3.height || 0;
    n2 && o2 || (E2 in i3 && A in i3 && (o2 = Math.abs(i3.top - i3.bottom)), j in i3 && P in i3 && (n2 = Math.abs(i3.right - i3.left))), this.calcOffset(), r2.x = r2.x - this._offset.left, r2.y = r2.y - this._offset.top, e3 || (r2 = ue(r2, void 0, this.viewportTransform));
    const a4 = this.getRetinaScaling();
    1 !== a4 && (r2.x /= a4, r2.y /= a4);
    const h4 = 0 === n2 || 0 === o2 ? new U(1, 1) : new U(s4.width / n2, s4.height / o2);
    return r2.multiply(h4);
  }
  _setDimensionsImpl(t4, e3) {
    this._resetTransformEventData(), super._setDimensionsImpl(t4, e3), this._isCurrentlyDrawing && this.freeDrawingBrush && this.freeDrawingBrush._setBrushStyles(this.contextTop);
  }
  _createCacheCanvas() {
    this.pixelFindCanvasEl = et$1(), this.pixelFindContext = this.pixelFindCanvasEl.getContext("2d", { willReadFrequently: true }), this.setTargetFindTolerance(this.targetFindTolerance);
  }
  getTopContext() {
    return this.elements.upper.ctx;
  }
  getSelectionContext() {
    return this.elements.upper.ctx;
  }
  getSelectionElement() {
    return this.elements.upper.el;
  }
  getActiveObject() {
    return this._activeObject;
  }
  getActiveObjects() {
    const t4 = this._activeObject;
    return Vt(t4) ? t4.getObjects() : t4 ? [t4] : [];
  }
  _fireSelectionEvents(t4, e3) {
    let s4 = false, i3 = false;
    const r2 = this.getActiveObjects(), n2 = [], o2 = [];
    t4.forEach((t5) => {
      r2.includes(t5) || (s4 = true, t5.fire("deselected", { e: e3, target: t5 }), o2.push(t5));
    }), r2.forEach((i4) => {
      t4.includes(i4) || (s4 = true, i4.fire("selected", { e: e3, target: i4 }), n2.push(i4));
    }), t4.length > 0 && r2.length > 0 ? (i3 = true, s4 && this.fire("selection:updated", { e: e3, selected: n2, deselected: o2 })) : r2.length > 0 ? (i3 = true, this.fire("selection:created", { e: e3, selected: n2 })) : t4.length > 0 && (i3 = true, this.fire("selection:cleared", { e: e3, deselected: o2 })), i3 && (this._objectsToRender = void 0);
  }
  setActiveObject(t4, e3) {
    const s4 = this.getActiveObjects(), i3 = this._setActiveObject(t4, e3);
    return this._fireSelectionEvents(s4, e3), i3;
  }
  _setActiveObject(t4, e3) {
    const s4 = this._activeObject;
    return s4 !== t4 && (!(!this._discardActiveObject(e3, t4) && this._activeObject) && (!t4.onSelect({ e: e3 }) && (this._activeObject = t4, Vt(t4) && s4 !== t4 && (t4.set("canvas", this), t4.setCoords()), true)));
  }
  _discardActiveObject(t4, e3) {
    const s4 = this._activeObject;
    return !!s4 && (!s4.onDeselect({ e: t4, object: e3 }) && (this._currentTransform && this._currentTransform.target === s4 && this.endCurrentTransform(t4), this._activeObject = void 0, true));
  }
  discardActiveObject(t4) {
    const e3 = this.getActiveObjects(), s4 = this.getActiveObject();
    e3.length && this.fire("before:selection:cleared", { e: t4, deselected: [s4] });
    const i3 = this._discardActiveObject(t4);
    return this._fireSelectionEvents(e3, t4), i3;
  }
  endCurrentTransform(t4) {
    const e3 = this._currentTransform;
    this._finalizeCurrentTransform(t4), e3 && e3.target && (e3.target.isMoving = false), this._currentTransform = null;
  }
  _finalizeCurrentTransform(t4) {
    const e3 = this._currentTransform, s4 = e3.target, i3 = { e: t4, target: s4, transform: e3, action: e3.action };
    s4._scaling && (s4._scaling = false), s4.setCoords(), e3.actionPerformed && (this.fire("object:modified", i3), s4.fire("modified", i3));
  }
  setViewportTransform(t4) {
    super.setViewportTransform(t4);
    const e3 = this._activeObject;
    e3 && e3.setCoords();
  }
  destroy() {
    const t4 = this._activeObject;
    Vt(t4) && (t4.removeAll(), t4.dispose()), delete this._activeObject, super.destroy(), this.pixelFindContext = null, this.pixelFindCanvasEl = void 0;
  }
  clear() {
    this.discardActiveObject(), this._activeObject = void 0, this.clearContext(this.contextTop), super.clear();
  }
  drawControls(t4) {
    const e3 = this._activeObject;
    e3 && e3._renderControls(t4);
  }
  _toObject(t4, e3, s4) {
    const i3 = this._realizeGroupTransformOnObject(t4), r2 = super._toObject(t4, e3, s4);
    return t4.set(i3), r2;
  }
  _realizeGroupTransformOnObject(t4) {
    const { group: e3 } = t4;
    if (e3 && Vt(e3) && this._activeObject === e3) {
      const s4 = St(t4, ["angle", "flipX", "flipY", P, "scaleX", "scaleY", "skewX", "skewY", E2]);
      return ne(t4, e3.calcOwnMatrix()), s4;
    }
    return {};
  }
  _setSVGObject(t4, e3, s4) {
    const i3 = this._realizeGroupTransformOnObject(e3);
    super._setSVGObject(t4, e3, s4), e3.set(i3);
  }
}
s3(hn, "ownDefaults", { uniformScaling: true, uniScaleKey: "shiftKey", centeredScaling: false, centeredRotation: false, centeredKey: "altKey", altActionKey: "shiftKey", selection: true, selectionKey: "shiftKey", selectionColor: "rgba(100, 100, 255, 0.3)", selectionDashArray: [], selectionBorderColor: "rgba(255, 255, 255, 0.3)", selectionLineWidth: 1, selectionFullyContained: false, hoverCursor: "move", moveCursor: "move", defaultCursor: "default", freeDrawingCursor: "crosshair", notAllowedCursor: "not-allowed", perPixelTargetFind: false, targetFindTolerance: 0, skipTargetFind: false, stopContextMenu: false, fireRightClick: false, fireMiddleClick: false, enablePointerEvents: false, containerClass: "canvas-container", preserveObjectStacking: false });
class cn {
  constructor(t4) {
    s3(this, "targets", []), s3(this, "__disposer", void 0);
    const e3 = () => {
      const { hiddenTextarea: e4 } = t4.getActiveObject() || {};
      e4 && e4.focus();
    }, i3 = t4.upperCanvasEl;
    i3.addEventListener("click", e3), this.__disposer = () => i3.removeEventListener("click", e3);
  }
  exitTextEditing() {
    this.target = void 0, this.targets.forEach((t4) => {
      t4.isEditing && t4.exitEditing();
    });
  }
  add(t4) {
    this.targets.push(t4);
  }
  remove(t4) {
    this.unregister(t4), z2(this.targets, t4);
  }
  register(t4) {
    this.target = t4;
  }
  unregister(t4) {
    t4 === this.target && (this.target = void 0);
  }
  onMouseMove(t4) {
    var e3;
    (null === (e3 = this.target) || void 0 === e3 ? void 0 : e3.isEditing) && this.target.updateSelectionOnMouseMove(t4);
  }
  clear() {
    this.targets = [], this.target = void 0;
  }
  dispose() {
    this.clear(), this.__disposer(), delete this.__disposer;
  }
}
const ln = ["target", "oldTarget", "fireCanvas", "e"], un = { passive: false }, dn = (t4, e3) => {
  const s4 = t4.getViewportPoint(e3), i3 = t4.getScenePoint(e3);
  return { viewportPoint: s4, scenePoint: i3, pointer: s4, absolutePointer: i3 };
}, gn = function(t4) {
  for (var e3 = arguments.length, s4 = new Array(e3 > 1 ? e3 - 1 : 0), i3 = 1; i3 < e3; i3++)
    s4[i3 - 1] = arguments[i3];
  return t4.addEventListener(...s4);
}, fn = function(t4) {
  for (var e3 = arguments.length, s4 = new Array(e3 > 1 ? e3 - 1 : 0), i3 = 1; i3 < e3; i3++)
    s4[i3 - 1] = arguments[i3];
  return t4.removeEventListener(...s4);
}, pn = { mouse: { in: "over", out: "out", targetIn: "mouseover", targetOut: "mouseout", canvasIn: "mouse:over", canvasOut: "mouse:out" }, drag: { in: "enter", out: "leave", targetIn: "dragenter", targetOut: "dragleave", canvasIn: "drag:enter", canvasOut: "drag:leave" } };
class mn extends hn {
  constructor(t4) {
    super(t4, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}), s3(this, "_isClick", void 0), s3(this, "textEditingManager", new cn(this)), ["_onMouseDown", "_onTouchStart", "_onMouseMove", "_onMouseUp", "_onTouchEnd", "_onResize", "_onMouseWheel", "_onMouseOut", "_onMouseEnter", "_onContextMenu", "_onDoubleClick", "_onDragStart", "_onDragEnd", "_onDragProgress", "_onDragOver", "_onDragEnter", "_onDragLeave", "_onDrop"].forEach((t5) => {
      this[t5] = this[t5].bind(this);
    }), this.addOrRemove(gn, "add");
  }
  _getEventPrefix() {
    return this.enablePointerEvents ? "pointer" : "mouse";
  }
  addOrRemove(t4, e3) {
    const s4 = this.upperCanvasEl, i3 = this._getEventPrefix();
    t4(Gt(s4), "resize", this._onResize), t4(s4, i3 + "down", this._onMouseDown), t4(s4, "".concat(i3, "move"), this._onMouseMove, un), t4(s4, "".concat(i3, "out"), this._onMouseOut), t4(s4, "".concat(i3, "enter"), this._onMouseEnter), t4(s4, "wheel", this._onMouseWheel), t4(s4, "contextmenu", this._onContextMenu), t4(s4, "dblclick", this._onDoubleClick), t4(s4, "dragstart", this._onDragStart), t4(s4, "dragend", this._onDragEnd), t4(s4, "dragover", this._onDragOver), t4(s4, "dragenter", this._onDragEnter), t4(s4, "dragleave", this._onDragLeave), t4(s4, "drop", this._onDrop), this.enablePointerEvents || t4(s4, "touchstart", this._onTouchStart, un);
  }
  removeListeners() {
    this.addOrRemove(fn, "remove");
    const t4 = this._getEventPrefix(), e3 = Ht(this.upperCanvasEl);
    fn(e3, "".concat(t4, "up"), this._onMouseUp), fn(e3, "touchend", this._onTouchEnd, un), fn(e3, "".concat(t4, "move"), this._onMouseMove, un), fn(e3, "touchmove", this._onMouseMove, un);
  }
  _onMouseWheel(t4) {
    this.__onMouseWheel(t4);
  }
  _onMouseOut(t4) {
    const s4 = this._hoveredTarget, i3 = e2({ e: t4 }, dn(this, t4));
    this.fire("mouse:out", e2(e2({}, i3), {}, { target: s4 })), this._hoveredTarget = void 0, s4 && s4.fire("mouseout", e2({}, i3)), this._hoveredTargets.forEach((t5) => {
      this.fire("mouse:out", e2(e2({}, i3), {}, { target: t5 })), t5 && t5.fire("mouseout", e2({}, i3));
    }), this._hoveredTargets = [];
  }
  _onMouseEnter(t4) {
    this._currentTransform || this.findTarget(t4) || (this.fire("mouse:over", e2({ e: t4 }, dn(this, t4))), this._hoveredTarget = void 0, this._hoveredTargets = []);
  }
  _onDragStart(t4) {
    this._isClick = false;
    const e3 = this.getActiveObject();
    if (e3 && e3.onDragStart(t4)) {
      this._dragSource = e3;
      const s4 = { e: t4, target: e3 };
      return this.fire("dragstart", s4), e3.fire("dragstart", s4), void gn(this.upperCanvasEl, "drag", this._onDragProgress);
    }
    se$1(t4);
  }
  _renderDragEffects(t4, e3, s4) {
    let i3 = false;
    const r2 = this._dropTarget;
    r2 && r2 !== e3 && r2 !== s4 && (r2.clearContextTop(), i3 = true), null == e3 || e3.clearContextTop(), s4 !== e3 && (null == s4 || s4.clearContextTop());
    const n2 = this.contextTop;
    n2.save(), n2.transform(...this.viewportTransform), e3 && (n2.save(), e3.transform(n2), e3.renderDragSourceEffect(t4), n2.restore(), i3 = true), s4 && (n2.save(), s4.transform(n2), s4.renderDropTargetEffect(t4), n2.restore(), i3 = true), n2.restore(), i3 && (this.contextTopDirty = true);
  }
  _onDragEnd(t4) {
    const e3 = !!t4.dataTransfer && t4.dataTransfer.dropEffect !== F, s4 = e3 ? this._activeObject : void 0, i3 = { e: t4, target: this._dragSource, subTargets: this.targets, dragSource: this._dragSource, didDrop: e3, dropTarget: s4 };
    fn(this.upperCanvasEl, "drag", this._onDragProgress), this.fire("dragend", i3), this._dragSource && this._dragSource.fire("dragend", i3), delete this._dragSource, this._onMouseUp(t4);
  }
  _onDragProgress(t4) {
    const e3 = { e: t4, target: this._dragSource, dragSource: this._dragSource, dropTarget: this._draggedoverTarget };
    this.fire("drag", e3), this._dragSource && this._dragSource.fire("drag", e3);
  }
  findDragTargets(t4) {
    this.targets = [];
    return { target: this._searchPossibleTargets(this._objects, this.getViewportPoint(t4)), targets: [...this.targets] };
  }
  _onDragOver(t4) {
    const e3 = "dragover", { target: s4, targets: i3 } = this.findDragTargets(t4), r2 = this._dragSource, n2 = { e: t4, target: s4, subTargets: i3, dragSource: r2, canDrop: false, dropTarget: void 0 };
    let o2;
    this.fire(e3, n2), this._fireEnterLeaveEvents(s4, n2), s4 && (s4.canDrop(t4) && (o2 = s4), s4.fire(e3, n2));
    for (let s5 = 0; s5 < i3.length; s5++) {
      const r3 = i3[s5];
      r3.canDrop(t4) && (o2 = r3), r3.fire(e3, n2);
    }
    this._renderDragEffects(t4, r2, o2), this._dropTarget = o2;
  }
  _onDragEnter(t4) {
    const { target: e3, targets: s4 } = this.findDragTargets(t4), i3 = { e: t4, target: e3, subTargets: s4, dragSource: this._dragSource };
    this.fire("dragenter", i3), this._fireEnterLeaveEvents(e3, i3);
  }
  _onDragLeave(t4) {
    const e3 = { e: t4, target: this._draggedoverTarget, subTargets: this.targets, dragSource: this._dragSource };
    this.fire("dragleave", e3), this._fireEnterLeaveEvents(void 0, e3), this._renderDragEffects(t4, this._dragSource), this._dropTarget = void 0, this.targets = [], this._hoveredTargets = [];
  }
  _onDrop(t4) {
    const { target: s4, targets: i3 } = this.findDragTargets(t4), r2 = this._basicEventHandler("drop:before", e2({ e: t4, target: s4, subTargets: i3, dragSource: this._dragSource }, dn(this, t4)));
    r2.didDrop = false, r2.dropTarget = void 0, this._basicEventHandler("drop", r2), this.fire("drop:after", r2);
  }
  _onContextMenu(t4) {
    const e3 = this.findTarget(t4), s4 = this.targets || [], i3 = this._basicEventHandler("contextmenu:before", { e: t4, target: e3, subTargets: s4 });
    return this.stopContextMenu && se$1(t4), this._basicEventHandler("contextmenu", i3), false;
  }
  _onDoubleClick(t4) {
    this._cacheTransformEventData(t4), this._handleEvent(t4, "dblclick"), this._resetTransformEventData();
  }
  getPointerId(t4) {
    const e3 = t4.changedTouches;
    return e3 ? e3[0] && e3[0].identifier : this.enablePointerEvents ? t4.pointerId : -1;
  }
  _isMainEvent(t4) {
    return true === t4.isPrimary || false !== t4.isPrimary && ("touchend" === t4.type && 0 === t4.touches.length || (!t4.changedTouches || t4.changedTouches[0].identifier === this.mainTouchId));
  }
  _onTouchStart(t4) {
    t4.preventDefault(), void 0 === this.mainTouchId && (this.mainTouchId = this.getPointerId(t4)), this.__onMouseDown(t4), this._resetTransformEventData();
    const e3 = this.upperCanvasEl, s4 = this._getEventPrefix(), i3 = Ht(e3);
    gn(i3, "touchend", this._onTouchEnd, un), gn(i3, "touchmove", this._onMouseMove, un), fn(e3, "".concat(s4, "down"), this._onMouseDown);
  }
  _onMouseDown(t4) {
    this.__onMouseDown(t4), this._resetTransformEventData();
    const e3 = this.upperCanvasEl, s4 = this._getEventPrefix();
    fn(e3, "".concat(s4, "move"), this._onMouseMove, un);
    const i3 = Ht(e3);
    gn(i3, "".concat(s4, "up"), this._onMouseUp), gn(i3, "".concat(s4, "move"), this._onMouseMove, un);
  }
  _onTouchEnd(t4) {
    if (t4.touches.length > 0)
      return;
    this.__onMouseUp(t4), this._resetTransformEventData(), delete this.mainTouchId;
    const e3 = this._getEventPrefix(), s4 = Ht(this.upperCanvasEl);
    fn(s4, "touchend", this._onTouchEnd, un), fn(s4, "touchmove", this._onMouseMove, un), this._willAddMouseDown && clearTimeout(this._willAddMouseDown), this._willAddMouseDown = setTimeout(() => {
      gn(this.upperCanvasEl, "".concat(e3, "down"), this._onMouseDown), this._willAddMouseDown = 0;
    }, 400);
  }
  _onMouseUp(t4) {
    this.__onMouseUp(t4), this._resetTransformEventData();
    const e3 = this.upperCanvasEl, s4 = this._getEventPrefix();
    if (this._isMainEvent(t4)) {
      const t5 = Ht(this.upperCanvasEl);
      fn(t5, "".concat(s4, "up"), this._onMouseUp), fn(t5, "".concat(s4, "move"), this._onMouseMove, un), gn(e3, "".concat(s4, "move"), this._onMouseMove, un);
    }
  }
  _onMouseMove(t4) {
    const e3 = this.getActiveObject();
    !this.allowTouchScrolling && (!e3 || !e3.shouldStartDragging(t4)) && t4.preventDefault && t4.preventDefault(), this.__onMouseMove(t4);
  }
  _onResize() {
    this.calcOffset(), this._resetTransformEventData();
  }
  _shouldRender(t4) {
    const e3 = this.getActiveObject();
    return !!e3 != !!t4 || e3 && t4 && e3 !== t4;
  }
  __onMouseUp(t4) {
    var e3;
    this._cacheTransformEventData(t4), this._handleEvent(t4, "up:before");
    const s4 = this._currentTransform, i3 = this._isClick, r2 = this._target, { button: n2 } = t4;
    if (n2)
      return (this.fireMiddleClick && 1 === n2 || this.fireRightClick && 2 === n2) && this._handleEvent(t4, "up"), void this._resetTransformEventData();
    if (this.isDrawingMode && this._isCurrentlyDrawing)
      return void this._onMouseUpInDrawingMode(t4);
    if (!this._isMainEvent(t4))
      return;
    let o2, a4, h4 = false;
    if (s4 && (this._finalizeCurrentTransform(t4), h4 = s4.actionPerformed), !i3) {
      const e4 = r2 === this._activeObject;
      this.handleSelection(t4), h4 || (h4 = this._shouldRender(r2) || !e4 && r2 === this._activeObject);
    }
    if (r2) {
      const e4 = r2.findControl(this.getViewportPoint(t4), ee(t4)), { key: i4, control: n3 } = e4 || {};
      if (a4 = i4, r2.selectable && r2 !== this._activeObject && "up" === r2.activeOn)
        this.setActiveObject(r2, t4), h4 = true;
      else if (n3) {
        const e5 = n3.getMouseUpHandler(t4, r2, n3);
        e5 && (o2 = this.getScenePoint(t4), e5.call(n3, t4, s4, o2.x, o2.y));
      }
      r2.isMoving = false;
    }
    if (s4 && (s4.target !== r2 || s4.corner !== a4)) {
      const e4 = s4.target && s4.target.controls[s4.corner], i4 = e4 && e4.getMouseUpHandler(t4, s4.target, e4);
      o2 = o2 || this.getScenePoint(t4), i4 && i4.call(e4, t4, s4, o2.x, o2.y);
    }
    this._setCursorFromEvent(t4, r2), this._handleEvent(t4, "up"), this._groupSelector = null, this._currentTransform = null, r2 && (r2.__corner = void 0), h4 ? this.requestRenderAll() : i3 || null !== (e3 = this._activeObject) && void 0 !== e3 && e3.isEditing || this.renderTop();
  }
  _basicEventHandler(t4, e3) {
    const { target: s4, subTargets: i3 = [] } = e3;
    this.fire(t4, e3), s4 && s4.fire(t4, e3);
    for (let r2 = 0; r2 < i3.length; r2++)
      i3[r2] !== s4 && i3[r2].fire(t4, e3);
    return e3;
  }
  _handleEvent(t4, s4) {
    const i3 = this._target, r2 = this.targets || [], n2 = e2(e2({ e: t4, target: i3, subTargets: r2 }, dn(this, t4)), {}, { transform: this._currentTransform }, "up:before" === s4 || "up" === s4 ? { isClick: this._isClick, currentTarget: this.findTarget(t4), currentSubTargets: this.targets } : {});
    this.fire("mouse:".concat(s4), n2), i3 && i3.fire("mouse".concat(s4), n2);
    for (let t5 = 0; t5 < r2.length; t5++)
      r2[t5] !== i3 && r2[t5].fire("mouse".concat(s4), n2);
  }
  _onMouseDownInDrawingMode(t4) {
    this._isCurrentlyDrawing = true, this.getActiveObject() && (this.discardActiveObject(t4), this.requestRenderAll());
    const e3 = this.getScenePoint(t4);
    this.freeDrawingBrush && this.freeDrawingBrush.onMouseDown(e3, { e: t4, pointer: e3 }), this._handleEvent(t4, "down");
  }
  _onMouseMoveInDrawingMode(t4) {
    if (this._isCurrentlyDrawing) {
      const e3 = this.getScenePoint(t4);
      this.freeDrawingBrush && this.freeDrawingBrush.onMouseMove(e3, { e: t4, pointer: e3 });
    }
    this.setCursor(this.freeDrawingCursor), this._handleEvent(t4, "move");
  }
  _onMouseUpInDrawingMode(t4) {
    const e3 = this.getScenePoint(t4);
    this.freeDrawingBrush ? this._isCurrentlyDrawing = !!this.freeDrawingBrush.onMouseUp({ e: t4, pointer: e3 }) : this._isCurrentlyDrawing = false, this._handleEvent(t4, "up");
  }
  __onMouseDown(t4) {
    this._isClick = true, this._cacheTransformEventData(t4), this._handleEvent(t4, "down:before");
    let e3 = this._target;
    const { button: s4 } = t4;
    if (s4)
      return (this.fireMiddleClick && 1 === s4 || this.fireRightClick && 2 === s4) && this._handleEvent(t4, "down"), void this._resetTransformEventData();
    if (this.isDrawingMode)
      return void this._onMouseDownInDrawingMode(t4);
    if (!this._isMainEvent(t4))
      return;
    if (this._currentTransform)
      return;
    let i3 = this._shouldRender(e3), r2 = false;
    if (this.handleMultiSelection(t4, e3) ? (e3 = this._activeObject, r2 = true, i3 = true) : this._shouldClearSelection(t4, e3) && this.discardActiveObject(t4), this.selection && (!e3 || !e3.selectable && !e3.isEditing && e3 !== this._activeObject)) {
      const e4 = this.getScenePoint(t4);
      this._groupSelector = { x: e4.x, y: e4.y, deltaY: 0, deltaX: 0 };
    }
    if (e3) {
      const s5 = e3 === this._activeObject;
      e3.selectable && "down" === e3.activeOn && this.setActiveObject(e3, t4);
      const i4 = e3.findControl(this.getViewportPoint(t4), ee(t4));
      if (e3 === this._activeObject && (i4 || !r2)) {
        this._setupCurrentTransform(t4, e3, s5);
        const r3 = i4 ? i4.control : void 0, n2 = this.getScenePoint(t4), o2 = r3 && r3.getMouseDownHandler(t4, e3, r3);
        o2 && o2.call(r3, t4, this._currentTransform, n2.x, n2.y);
      }
    }
    i3 && (this._objectsToRender = void 0), this._handleEvent(t4, "down"), i3 && this.requestRenderAll();
  }
  _resetTransformEventData() {
    this._target = void 0, this._pointer = void 0, this._absolutePointer = void 0;
  }
  _cacheTransformEventData(t4) {
    this._resetTransformEventData(), this._pointer = this.getViewportPoint(t4), this._absolutePointer = ue(this._pointer, void 0, this.viewportTransform), this._target = this._currentTransform ? this._currentTransform.target : this.findTarget(t4);
  }
  __onMouseMove(t4) {
    if (this._isClick = false, this._cacheTransformEventData(t4), this._handleEvent(t4, "move:before"), this.isDrawingMode)
      return void this._onMouseMoveInDrawingMode(t4);
    if (!this._isMainEvent(t4))
      return;
    const e3 = this._groupSelector;
    if (e3) {
      const s4 = this.getScenePoint(t4);
      e3.deltaX = s4.x - e3.x, e3.deltaY = s4.y - e3.y, this.renderTop();
    } else if (this._currentTransform)
      this._transformObject(t4);
    else {
      const e4 = this.findTarget(t4);
      this._setCursorFromEvent(t4, e4), this._fireOverOutEvents(t4, e4);
    }
    this.textEditingManager.onMouseMove(t4), this._handleEvent(t4, "move"), this._resetTransformEventData();
  }
  _fireOverOutEvents(t4, e3) {
    const s4 = this._hoveredTarget, i3 = this._hoveredTargets, r2 = this.targets, n2 = Math.max(i3.length, r2.length);
    this.fireSyntheticInOutEvents("mouse", { e: t4, target: e3, oldTarget: s4, fireCanvas: true });
    for (let e4 = 0; e4 < n2; e4++)
      this.fireSyntheticInOutEvents("mouse", { e: t4, target: r2[e4], oldTarget: i3[e4] });
    this._hoveredTarget = e3, this._hoveredTargets = this.targets.concat();
  }
  _fireEnterLeaveEvents(t4, s4) {
    const i3 = this._draggedoverTarget, r2 = this._hoveredTargets, n2 = this.targets, o2 = Math.max(r2.length, n2.length);
    this.fireSyntheticInOutEvents("drag", e2(e2({}, s4), {}, { target: t4, oldTarget: i3, fireCanvas: true }));
    for (let t5 = 0; t5 < o2; t5++)
      this.fireSyntheticInOutEvents("drag", e2(e2({}, s4), {}, { target: n2[t5], oldTarget: r2[t5] }));
    this._draggedoverTarget = t4;
  }
  fireSyntheticInOutEvents(t4, s4) {
    let { target: r2, oldTarget: n2, fireCanvas: o2, e: a4 } = s4, h4 = i2(s4, ln);
    const { targetIn: c3, targetOut: l2, canvasIn: u3, canvasOut: d4 } = pn[t4], g2 = n2 !== r2;
    if (n2 && g2) {
      const t5 = e2(e2({}, h4), {}, { e: a4, target: n2, nextTarget: r2 }, dn(this, a4));
      o2 && this.fire(d4, t5), n2.fire(l2, t5);
    }
    if (r2 && g2) {
      const t5 = e2(e2({}, h4), {}, { e: a4, target: r2, previousTarget: n2 }, dn(this, a4));
      o2 && this.fire(u3, t5), r2.fire(c3, t5);
    }
  }
  __onMouseWheel(t4) {
    this._cacheTransformEventData(t4), this._handleEvent(t4, "wheel"), this._resetTransformEventData();
  }
  _transformObject(t4) {
    const e3 = this.getScenePoint(t4), s4 = this._currentTransform, i3 = s4.target, r2 = i3.group ? ue(e3, void 0, i3.group.calcTransformMatrix()) : e3;
    s4.shiftKey = t4.shiftKey, s4.altKey = !!this.centeredKey && t4[this.centeredKey], this._performTransformAction(t4, s4, r2), s4.actionPerformed && this.requestRenderAll();
  }
  _performTransformAction(t4, e3, s4) {
    const i3 = s4.x, r2 = s4.y, n2 = e3.action, o2 = e3.actionHandler;
    let a4 = false;
    o2 && (a4 = o2(t4, e3, i3, r2)), "drag" === n2 && a4 && (e3.target.isMoving = true, this.setCursor(e3.target.moveCursor || this.moveCursor)), e3.actionPerformed = e3.actionPerformed || a4;
  }
  _setCursorFromEvent(t4, e3) {
    if (!e3)
      return void this.setCursor(this.defaultCursor);
    let s4 = e3.hoverCursor || this.hoverCursor;
    const i3 = Vt(this._activeObject) ? this._activeObject : null, r2 = (!i3 || e3.group !== i3) && e3.findControl(this.getViewportPoint(t4));
    if (r2) {
      const s5 = r2.control;
      this.setCursor(s5.cursorStyleHandler(t4, s5, e3));
    } else
      e3.subTargetCheck && this.targets.concat().reverse().map((t5) => {
        s4 = t5.hoverCursor || s4;
      }), this.setCursor(s4);
  }
  handleMultiSelection(t4, e3) {
    const s4 = this._activeObject, i3 = Vt(s4);
    if (s4 && this._isSelectionKeyPressed(t4) && this.selection && e3 && e3.selectable && (s4 !== e3 || i3) && (i3 || !e3.isDescendantOf(s4) && !s4.isDescendantOf(e3)) && !e3.onSelect({ e: t4 }) && !s4.getActiveControl()) {
      if (i3) {
        const i4 = s4.getObjects();
        if (e3 === s4) {
          const s5 = this.getViewportPoint(t4);
          if (!(e3 = this.searchPossibleTargets(i4, s5) || this.searchPossibleTargets(this._objects, s5)) || !e3.selectable)
            return false;
        }
        e3.group === s4 ? (s4.remove(e3), this._hoveredTarget = e3, this._hoveredTargets = [...this.targets], 1 === s4.size() && this._setActiveObject(s4.item(0), t4)) : (s4.multiSelectAdd(e3), this._hoveredTarget = s4, this._hoveredTargets = [...this.targets]), this._fireSelectionEvents(i4, t4);
      } else {
        s4.exitEditing && s4.exitEditing();
        const i4 = new (I2.getClass("ActiveSelection"))([], { canvas: this });
        i4.multiSelectAdd(s4, e3), this._hoveredTarget = i4, this._setActiveObject(i4, t4), this._fireSelectionEvents([s4], t4);
      }
      return true;
    }
    return false;
  }
  handleSelection(t4) {
    if (!this.selection || !this._groupSelector)
      return false;
    const { x: e3, y: s4, deltaX: i3, deltaY: r2 } = this._groupSelector, n2 = new U(e3, s4), o2 = n2.add(new U(i3, r2)), a4 = n2.min(o2), h4 = n2.max(o2).subtract(a4), c3 = this.collectObjects({ left: a4.x, top: a4.y, width: h4.x, height: h4.y }, { includeIntersecting: !this.selectionFullyContained }), l2 = n2.eq(o2) ? c3[0] ? [c3[0]] : [] : c3.length > 1 ? c3.filter((e4) => !e4.onSelect({ e: t4 })).reverse() : c3;
    if (1 === l2.length)
      this.setActiveObject(l2[0], t4);
    else if (l2.length > 1) {
      const e4 = I2.getClass("ActiveSelection");
      this.setActiveObject(new e4(l2, { canvas: this }), t4);
    }
    return this._groupSelector = null, true;
  }
  clear() {
    this.textEditingManager.clear(), super.clear();
  }
  destroy() {
    this.removeListeners(), this.textEditingManager.dispose(), super.destroy();
  }
}
const vn = { x1: 0, y1: 0, x2: 0, y2: 0 }, yn = e2(e2({}, vn), {}, { r1: 0, r2: 0 }), _n = /^(\d+\.\d+)%|(\d+)%$/;
function xn(t4) {
  return t4 && _n.test(t4);
}
function Cn(t4, e3) {
  const s4 = "number" == typeof t4 ? t4 : "string" == typeof t4 ? parseFloat(t4) / (xn(t4) ? 100 : 1) : NaN;
  return Ie(0, V(s4, e3), 1);
}
const bn = /\s*;\s*/, wn = /\s*:\s*/;
function Sn(t4, e3) {
  let s4, i3;
  const r2 = t4.getAttribute("style");
  if (r2) {
    const t5 = r2.split(bn);
    "" === t5[t5.length - 1] && t5.pop();
    for (let e4 = t5.length; e4--; ) {
      const [r3, n3] = t5[e4].split(wn).map((t6) => t6.trim());
      "stop-color" === r3 ? s4 = n3 : "stop-opacity" === r3 && (i3 = n3);
    }
  }
  const n2 = new At(s4 || t4.getAttribute("stop-color") || "rgb(0,0,0)");
  return { offset: Cn(t4.getAttribute("offset"), 0), color: n2.toRgb(), opacity: V(parseFloat(i3 || t4.getAttribute("stop-opacity") || ""), 1) * n2.getAlpha() * e3 };
}
function Tn(t4, e3) {
  const s4 = [], i3 = t4.getElementsByTagName("stop"), r2 = Cn(e3, 1);
  for (let t5 = i3.length; t5--; )
    s4.push(Sn(i3[t5], r2));
  return s4;
}
function On(t4) {
  return "linearGradient" === t4.nodeName || "LINEARGRADIENT" === t4.nodeName ? "linear" : "radial";
}
function kn(t4) {
  return "userSpaceOnUse" === t4.getAttribute("gradientUnits") ? "pixels" : "percentage";
}
function Dn(t4, e3) {
  return t4.getAttribute(e3);
}
function Mn(t4, s4) {
  return function(t5, e3) {
    let s5, { width: i3, height: r2, gradientUnits: n2 } = e3;
    return Object.keys(t5).reduce((e4, o2) => {
      const a4 = t5[o2];
      return "Infinity" === a4 ? s5 = 1 : "-Infinity" === a4 ? s5 = 0 : (s5 = "string" == typeof a4 ? parseFloat(a4) : a4, "string" == typeof a4 && xn(a4) && (s5 *= 0.01, "pixels" === n2 && ("x1" !== o2 && "x2" !== o2 && "r2" !== o2 || (s5 *= i3), "y1" !== o2 && "y2" !== o2 || (s5 *= r2)))), e4[o2] = s5, e4;
    }, {});
  }("linear" === On(t4) ? function(t5) {
    return { x1: Dn(t5, "x1") || 0, y1: Dn(t5, "y1") || 0, x2: Dn(t5, "x2") || "100%", y2: Dn(t5, "y2") || 0 };
  }(t4) : function(t5) {
    return { x1: Dn(t5, "fx") || Dn(t5, "cx") || "50%", y1: Dn(t5, "fy") || Dn(t5, "cy") || "50%", r1: 0, x2: Dn(t5, "cx") || "50%", y2: Dn(t5, "cy") || "50%", r2: Dn(t5, "r") || "50%" };
  }(t4), e2(e2({}, s4), {}, { gradientUnits: kn(t4) }));
}
class Pn {
  constructor(t4) {
    let { type: s4 = "linear", gradientUnits: i3 = "pixels", coords: r2 = {}, colorStops: n2 = [], offsetX: o2 = 0, offsetY: a4 = 0, gradientTransform: h4, id: c3 } = t4;
    this.id = c3 ? "".concat(c3, "_").concat(tt$1()) : tt$1(), this.type = s4, this.gradientUnits = i3, this.gradientTransform = h4, this.offsetX = o2, this.offsetY = a4, this.coords = e2(e2({}, "radial" === this.type ? yn : vn), r2), this.colorStops = n2.slice();
  }
  addColorStop(t4) {
    for (const e3 in t4) {
      const s4 = new At(t4[e3]);
      this.colorStops.push({ offset: parseFloat(e3), color: s4.toRgb(), opacity: s4.getAlpha() });
    }
    return this;
  }
  toObject(t4) {
    return e2(e2({}, St(this, t4)), {}, { type: this.type, coords: this.coords, colorStops: this.colorStops, offsetX: this.offsetX, offsetY: this.offsetY, gradientUnits: this.gradientUnits, gradientTransform: this.gradientTransform ? [...this.gradientTransform] : void 0 });
  }
  toSVG(t4) {
    let { additionalTransform: s4 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const i3 = [], r2 = this.gradientTransform ? this.gradientTransform.concat() : O2.concat(), n2 = "pixels" === this.gradientUnits ? "userSpaceOnUse" : "objectBoundingBox", o2 = this.colorStops.map((t5) => e2({}, t5)).sort((t5, e3) => t5.offset - e3.offset);
    let a4 = -this.offsetX, h4 = -this.offsetY;
    var c3;
    "objectBoundingBox" === n2 ? (a4 /= t4.width, h4 /= t4.height) : (a4 += t4.width / 2, h4 += t4.height / 2), (c3 = t4) && "function" == typeof c3._renderPathCommands && "percentage" !== this.gradientUnits && (a4 -= t4.pathOffset.x, h4 -= t4.pathOffset.y), r2[4] -= a4, r2[5] -= h4;
    const l2 = ['id="SVGID_'.concat(this.id, '"'), 'gradientUnits="'.concat(n2, '"'), 'gradientTransform="'.concat(s4 ? s4 + " " : "").concat(Rt(r2), '"'), ""].join(" ");
    if ("linear" === this.type) {
      const { x1: t5, y1: e3, x2: s5, y2: r3 } = this.coords;
      i3.push("<linearGradient ", l2, ' x1="', t5, '" y1="', e3, '" x2="', s5, '" y2="', r3, '">\n');
    } else if ("radial" === this.type) {
      const { x1: t5, y1: e3, x2: s5, y2: r3, r1: n3, r2: a5 } = this.coords, h5 = n3 > a5;
      i3.push("<radialGradient ", l2, ' cx="', h5 ? t5 : s5, '" cy="', h5 ? e3 : r3, '" r="', h5 ? n3 : a5, '" fx="', h5 ? s5 : t5, '" fy="', h5 ? r3 : e3, '">\n'), h5 && (o2.reverse(), o2.forEach((t6) => {
        t6.offset = 1 - t6.offset;
      }));
      const c4 = Math.min(n3, a5);
      if (c4 > 0) {
        const t6 = c4 / Math.max(n3, a5);
        o2.forEach((e4) => {
          e4.offset += t6 * (1 - e4.offset);
        });
      }
    }
    return o2.forEach((t5) => {
      let { color: e3, offset: s5, opacity: r3 } = t5;
      i3.push("<stop ", 'offset="', 100 * s5 + "%", '" style="stop-color:', e3, void 0 !== r3 ? ";stop-opacity: " + r3 : ";", '"/>\n');
    }), i3.push("linear" === this.type ? "</linearGradient>" : "</radialGradient>", "\n"), i3.join("");
  }
  toLive(t4) {
    const e3 = this.coords, s4 = "linear" === this.type ? t4.createLinearGradient(e3.x1, e3.y1, e3.x2, e3.y2) : t4.createRadialGradient(e3.x1, e3.y1, e3.r1, e3.x2, e3.y2, e3.r2);
    return this.colorStops.forEach((t5) => {
      let { color: e4, opacity: i3, offset: r2 } = t5;
      s4.addColorStop(r2, void 0 !== i3 ? new At(e4).setAlpha(i3).toRgba() : e4);
    }), s4;
  }
  static async fromObject(t4) {
    return new this(t4);
  }
  static fromElement(t4, s4, i3) {
    const r2 = kn(t4), n2 = s4._findCenterFromElement();
    return new this(e2({ id: t4.getAttribute("id") || void 0, type: On(t4), coords: Mn(t4, { width: i3.viewBoxWidth || i3.width, height: i3.viewBoxHeight || i3.height }), colorStops: Tn(t4, i3.opacity), gradientUnits: r2, gradientTransform: Ji(t4.getAttribute("gradientTransform") || "") }, "pixels" === r2 ? { offsetX: s4.width / 2 - n2.x, offsetY: s4.height / 2 - n2.y } : { offsetX: 0, offsetY: 0 }));
  }
}
s3(Pn, "type", "Gradient"), I2.setClass(Pn, "gradient"), I2.setClass(Pn, "linear"), I2.setClass(Pn, "radial");
const En = ["type", "source"];
class An {
  get type() {
    return "pattern";
  }
  set type(t4) {
    h$1("warn", "Setting type has no effect", t4);
  }
  constructor(t4) {
    s3(this, "repeat", "repeat"), s3(this, "offsetX", 0), s3(this, "offsetY", 0), s3(this, "crossOrigin", ""), s3(this, "patternTransform", null), this.id = tt$1(), Object.assign(this, t4);
  }
  isImageSource() {
    return !!this.source && "string" == typeof this.source.src;
  }
  isCanvasSource() {
    return !!this.source && !!this.source.toDataURL;
  }
  sourceToString() {
    return this.isImageSource() ? this.source.src : this.isCanvasSource() ? this.source.toDataURL() : "";
  }
  toLive(t4) {
    return this.source && (!this.isImageSource() || this.source.complete && 0 !== this.source.naturalWidth && 0 !== this.source.naturalHeight) ? t4.createPattern(this.source, this.repeat) : null;
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    const { repeat: s4, crossOrigin: i3 } = this;
    return e2(e2({}, St(this, t4)), {}, { type: "pattern", source: this.sourceToString(), repeat: s4, crossOrigin: i3, offsetX: jt(this.offsetX, a3.NUM_FRACTION_DIGITS), offsetY: jt(this.offsetY, a3.NUM_FRACTION_DIGITS), patternTransform: this.patternTransform ? [...this.patternTransform] : null });
  }
  toSVG(t4) {
    let { width: e3, height: s4 } = t4;
    const { source: i3, repeat: r2, id: n2 } = this, o2 = V(this.offsetX / e3, 0), a4 = V(this.offsetY / s4, 0), h4 = "repeat-y" === r2 || "no-repeat" === r2 ? 1 + Math.abs(o2 || 0) : V(i3.width / e3, 0), c3 = "repeat-x" === r2 || "no-repeat" === r2 ? 1 + Math.abs(a4 || 0) : V(i3.height / s4, 0);
    return ['<pattern id="SVGID_'.concat(n2, '" x="').concat(o2, '" y="').concat(a4, '" width="').concat(h4, '" height="').concat(c3, '">'), '<image x="0" y="0" width="'.concat(i3.width, '" height="').concat(i3.height, '" xlink:href="').concat(this.sourceToString(), '"></image>'), "</pattern>", ""].join("\n");
  }
  static async fromObject(t4, s4) {
    let { type: r2, source: n2 } = t4, o2 = i2(t4, En);
    const a4 = await Ct(n2, e2(e2({}, s4), {}, { crossOrigin: o2.crossOrigin }));
    return new this(e2(e2({}, o2), {}, { source: a4 }));
  }
}
s3(An, "type", "Pattern"), I2.setClass(An), I2.setClass(An, "pattern");
const Fn = ["path", "left", "top"], Ln = ["d"];
class Rn extends li {
  constructor(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, { path: s4, left: r2, top: n2 } = e3, o2 = i2(e3, Fn);
    super(), Object.assign(this, Rn.ownDefaults), this.setOptions(o2), this._setPath(t4 || [], true), "number" == typeof r2 && this.set(P, r2), "number" == typeof n2 && this.set(E2, n2);
  }
  _setPath(t4, e3) {
    this.path = Xr(Array.isArray(t4) ? t4 : tn(t4)), this.setBoundingBox(e3);
  }
  _findCenterFromElement() {
    const t4 = this._calcBoundsFromPath();
    return new U(t4.left + t4.width / 2, t4.top + t4.height / 2);
  }
  _renderPathCommands(t4) {
    const e3 = -this.pathOffset.x, s4 = -this.pathOffset.y;
    t4.beginPath();
    for (const i3 of this.path)
      switch (i3[0]) {
        case "L":
          t4.lineTo(i3[1] + e3, i3[2] + s4);
          break;
        case "M":
          t4.moveTo(i3[1] + e3, i3[2] + s4);
          break;
        case "C":
          t4.bezierCurveTo(i3[1] + e3, i3[2] + s4, i3[3] + e3, i3[4] + s4, i3[5] + e3, i3[6] + s4);
          break;
        case "Q":
          t4.quadraticCurveTo(i3[1] + e3, i3[2] + s4, i3[3] + e3, i3[4] + s4);
          break;
        case "Z":
          t4.closePath();
      }
  }
  _render(t4) {
    this._renderPathCommands(t4), this._renderPaintInOrder(t4);
  }
  toString() {
    return "#<Path (".concat(this.complexity(), '): { "top": ').concat(this.top, ', "left": ').concat(this.left, " }>");
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return e2(e2({}, super.toObject(t4)), {}, { path: this.path.map((t5) => t5.slice()) });
  }
  toDatalessObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    const e3 = this.toObject(t4);
    return this.sourcePath && (delete e3.path, e3.sourcePath = this.sourcePath), e3;
  }
  _toSVG() {
    const t4 = sn(this.path, a3.NUM_FRACTION_DIGITS);
    return ["<path ", "COMMON_PARTS", 'd="'.concat(t4, '" stroke-linecap="round" />\n')];
  }
  _getOffsetTransform() {
    const t4 = a3.NUM_FRACTION_DIGITS;
    return " translate(".concat(jt(-this.pathOffset.x, t4), ", ").concat(jt(-this.pathOffset.y, t4), ")");
  }
  toClipPathSVG(t4) {
    const e3 = this._getOffsetTransform();
    return "	" + this._createBaseClipPathSVGMarkup(this._toSVG(), { reviver: t4, additionalTransform: e3 });
  }
  toSVG(t4) {
    const e3 = this._getOffsetTransform();
    return this._createBaseSVGMarkup(this._toSVG(), { reviver: t4, additionalTransform: e3 });
  }
  complexity() {
    return this.path.length;
  }
  setDimensions() {
    this.setBoundingBox();
  }
  setBoundingBox(t4) {
    const { width: e3, height: s4, pathOffset: i3 } = this._calcDimensions();
    this.set({ width: e3, height: s4, pathOffset: i3 }), t4 && this.setPositionByOrigin(i3, M3, M3);
  }
  _calcBoundsFromPath() {
    const t4 = [];
    let e3 = 0, s4 = 0, i3 = 0, r2 = 0;
    for (const n2 of this.path)
      switch (n2[0]) {
        case "L":
          i3 = n2[1], r2 = n2[2], t4.push(new U(e3, s4), new U(i3, r2));
          break;
        case "M":
          i3 = n2[1], r2 = n2[2], e3 = i3, s4 = r2;
          break;
        case "C":
          t4.push(...Br(i3, r2, n2[1], n2[2], n2[3], n2[4], n2[5], n2[6])), i3 = n2[5], r2 = n2[6];
          break;
        case "Q":
          t4.push(...Br(i3, r2, n2[1], n2[2], n2[1], n2[2], n2[3], n2[4])), i3 = n2[3], r2 = n2[4];
          break;
        case "Z":
          i3 = e3, r2 = s4;
      }
    return ie(t4);
  }
  _calcDimensions() {
    const t4 = this._calcBoundsFromPath();
    return e2(e2({}, t4), {}, { pathOffset: new U(t4.left + t4.width / 2, t4.top + t4.height / 2) });
  }
  static fromObject(t4) {
    return this._fromObject(t4, { extraParam: "path" });
  }
  static async fromElement(t4, s4, r2) {
    const n2 = er(t4, this.ATTRIBUTE_NAMES, r2), { d: o2 } = n2;
    return new this(o2, e2(e2(e2({}, i2(n2, Ln)), s4), {}, { left: void 0, top: void 0 }));
  }
}
s3(Rn, "type", "Path"), s3(Rn, "cacheProperties", [...Os, "path", "fillRule"]), s3(Rn, "ATTRIBUTE_NAMES", [...Si, "d"]), I2.setClass(Rn), I2.setSVGClass(Rn);
const In = ["left", "top", "radius"], Xn = ["radius", "startAngle", "endAngle", "counterClockwise"];
class Yn extends li {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), Yn.ownDefaults);
  }
  constructor(t4) {
    super(), Object.assign(this, Yn.ownDefaults), this.setOptions(t4);
  }
  _set(t4, e3) {
    return super._set(t4, e3), "radius" === t4 && this.setRadius(e3), this;
  }
  _render(t4) {
    t4.beginPath(), t4.arc(0, 0, this.radius, rt$1(this.startAngle), rt$1(this.endAngle), this.counterClockwise), this._renderPaintInOrder(t4);
  }
  getRadiusX() {
    return this.get("radius") * this.get("scaleX");
  }
  getRadiusY() {
    return this.get("radius") * this.get("scaleY");
  }
  setRadius(t4) {
    this.radius = t4, this.set({ width: 2 * t4, height: 2 * t4 });
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return super.toObject([...Xn, ...t4]);
  }
  _toSVG() {
    const t4 = (this.endAngle - this.startAngle) % 360;
    if (0 === t4)
      return ["<circle ", "COMMON_PARTS", 'cx="0" cy="0" ', 'r="', "".concat(this.radius), '" />\n'];
    {
      const { radius: e3 } = this, s4 = rt$1(this.startAngle), i3 = rt$1(this.endAngle), r2 = H3(s4) * e3, n2 = G$1(s4) * e3, o2 = H3(i3) * e3, a4 = G$1(i3) * e3, h4 = t4 > 180 ? 1 : 0, c3 = this.counterClockwise ? 0 : 1;
      return ['<path d="M '.concat(r2, " ").concat(n2, " A ").concat(e3, " ").concat(e3, " 0 ").concat(h4, " ").concat(c3, " ").concat(o2, " ").concat(a4, '" '), "COMMON_PARTS", " />\n"];
    }
  }
  static async fromElement(t4, s4, r2) {
    const n2 = er(t4, this.ATTRIBUTE_NAMES, r2), { left: o2 = 0, top: a4 = 0, radius: h4 = 0 } = n2;
    return new this(e2(e2({}, i2(n2, In)), {}, { radius: h4, left: o2 - h4, top: a4 - h4 }));
  }
  static fromObject(t4) {
    return super._fromObject(t4);
  }
}
s3(Yn, "type", "Circle"), s3(Yn, "cacheProperties", [...Os, ...Xn]), s3(Yn, "ownDefaults", { radius: 0, startAngle: 0, endAngle: 360, counterClockwise: false }), s3(Yn, "ATTRIBUTE_NAMES", ["cx", "cy", "r", ...Si]), I2.setClass(Yn), I2.setSVGClass(Yn);
const Hn = ["x1", "y1", "x2", "y2"], Gn = ["x1", "y1", "x2", "y2"], Un = ["x1", "x2", "y1", "y2"];
class Nn extends li {
  constructor() {
    let [t4, e3, s4, i3] = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [0, 0, 0, 0], r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(), Object.assign(this, Nn.ownDefaults), this.setOptions(r2), this.x1 = t4, this.x2 = s4, this.y1 = e3, this.y2 = i3, this._setWidthHeight();
    const { left: n2, top: o2 } = r2;
    "number" == typeof n2 && this.set(P, n2), "number" == typeof o2 && this.set(E2, o2);
  }
  _setWidthHeight() {
    const { x1: t4, y1: e3, x2: s4, y2: i3 } = this;
    this.width = Math.abs(s4 - t4), this.height = Math.abs(i3 - e3);
    const { left: r2, top: n2, width: o2, height: a4 } = ie([{ x: t4, y: e3 }, { x: s4, y: i3 }]), h4 = new U(r2 + o2 / 2, n2 + a4 / 2);
    this.setPositionByOrigin(h4, M3, M3);
  }
  _set(t4, e3) {
    return super._set(t4, e3), Un.includes(t4) && this._setWidthHeight(), this;
  }
  _render(t4) {
    t4.beginPath();
    const e3 = this.calcLinePoints();
    t4.moveTo(e3.x1, e3.y1), t4.lineTo(e3.x2, e3.y2), t4.lineWidth = this.strokeWidth;
    const s4 = t4.strokeStyle;
    var i3;
    It(this.stroke) ? t4.strokeStyle = this.stroke.toLive(t4) : t4.strokeStyle = null !== (i3 = this.stroke) && void 0 !== i3 ? i3 : t4.fillStyle;
    this.stroke && this._renderStroke(t4), t4.strokeStyle = s4;
  }
  _findCenterFromElement() {
    return new U((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return e2(e2({}, super.toObject(t4)), this.calcLinePoints());
  }
  _getNonTransformedDimensions() {
    const t4 = super._getNonTransformedDimensions();
    return "butt" === this.strokeLineCap && (0 === this.width && (t4.y -= this.strokeWidth), 0 === this.height && (t4.x -= this.strokeWidth)), t4;
  }
  calcLinePoints() {
    const { x1: t4, x2: e3, y1: s4, y2: i3, width: r2, height: n2 } = this, o2 = t4 <= e3 ? -1 : 1, a4 = s4 <= i3 ? -1 : 1;
    return { x1: o2 * r2 / 2, x2: o2 * -r2 / 2, y1: a4 * n2 / 2, y2: a4 * -n2 / 2 };
  }
  _toSVG() {
    const { x1: t4, x2: e3, y1: s4, y2: i3 } = this.calcLinePoints();
    return ["<line ", "COMMON_PARTS", 'x1="'.concat(t4, '" y1="').concat(s4, '" x2="').concat(e3, '" y2="').concat(i3, '" />\n')];
  }
  static async fromElement(t4, e3, s4) {
    const r2 = er(t4, this.ATTRIBUTE_NAMES, s4), { x1: n2 = 0, y1: o2 = 0, x2: a4 = 0, y2: h4 = 0 } = r2;
    return new this([n2, o2, a4, h4], i2(r2, Hn));
  }
  static fromObject(t4) {
    let { x1: s4, y1: r2, x2: n2, y2: o2 } = t4, a4 = i2(t4, Gn);
    return this._fromObject(e2(e2({}, a4), {}, { points: [s4, r2, n2, o2] }), { extraParam: "points" });
  }
}
s3(Nn, "type", "Line"), s3(Nn, "cacheProperties", [...Os, ...Un]), s3(Nn, "ATTRIBUTE_NAMES", Si.concat(Un)), I2.setClass(Nn), I2.setSVGClass(Nn);
class qn extends li {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), qn.ownDefaults);
  }
  constructor(t4) {
    super(), Object.assign(this, qn.ownDefaults), this.setOptions(t4);
  }
  _render(t4) {
    const e3 = this.width / 2, s4 = this.height / 2;
    t4.beginPath(), t4.moveTo(-e3, s4), t4.lineTo(0, -s4), t4.lineTo(e3, s4), t4.closePath(), this._renderPaintInOrder(t4);
  }
  _toSVG() {
    const t4 = this.width / 2, e3 = this.height / 2;
    return ["<polygon ", "COMMON_PARTS", 'points="', "".concat(-t4, " ").concat(e3, ",0 ").concat(-e3, ",").concat(t4, " ").concat(e3), '" />'];
  }
}
s3(qn, "type", "Triangle"), s3(qn, "ownDefaults", { width: 100, height: 100 }), I2.setClass(qn), I2.setSVGClass(qn);
const Kn = ["rx", "ry"];
class Jn extends li {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), Jn.ownDefaults);
  }
  constructor(t4) {
    super(), Object.assign(this, Jn.ownDefaults), this.setOptions(t4);
  }
  _set(t4, e3) {
    switch (super._set(t4, e3), t4) {
      case "rx":
        this.rx = e3, this.set("width", 2 * e3);
        break;
      case "ry":
        this.ry = e3, this.set("height", 2 * e3);
    }
    return this;
  }
  getRx() {
    return this.get("rx") * this.get("scaleX");
  }
  getRy() {
    return this.get("ry") * this.get("scaleY");
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return super.toObject([...Kn, ...t4]);
  }
  _toSVG() {
    return ["<ellipse ", "COMMON_PARTS", 'cx="0" cy="0" rx="'.concat(this.rx, '" ry="').concat(this.ry, '" />\n')];
  }
  _render(t4) {
    t4.beginPath(), t4.save(), t4.transform(1, 0, 0, this.ry / this.rx, 0, 0), t4.arc(0, 0, this.rx, 0, S3, false), t4.restore(), this._renderPaintInOrder(t4);
  }
  static async fromElement(t4, e3, s4) {
    const i3 = er(t4, this.ATTRIBUTE_NAMES, s4);
    return i3.left = (i3.left || 0) - i3.rx, i3.top = (i3.top || 0) - i3.ry, new this(i3);
  }
}
function Zn(t4) {
  if (!t4)
    return [];
  const e3 = t4.replace(/,/g, " ").trim().split(/\s+/), s4 = [];
  for (let t5 = 0; t5 < e3.length; t5 += 2)
    s4.push({ x: parseFloat(e3[t5]), y: parseFloat(e3[t5 + 1]) });
  return s4;
}
s3(Jn, "type", "Ellipse"), s3(Jn, "cacheProperties", [...Os, ...Kn]), s3(Jn, "ownDefaults", { rx: 0, ry: 0 }), s3(Jn, "ATTRIBUTE_NAMES", [...Si, "cx", "cy", "rx", "ry"]), I2.setClass(Jn), I2.setSVGClass(Jn);
const Qn = ["left", "top"], $n = { exactBoundingBox: false };
class to extends li {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), to.ownDefaults);
  }
  constructor() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(), s3(this, "strokeDiff", void 0), Object.assign(this, to.ownDefaults), this.setOptions(e3), this.points = t4;
    const { left: i3, top: r2 } = e3;
    this.initialized = true, this.setBoundingBox(true), "number" == typeof i3 && this.set(P, i3), "number" == typeof r2 && this.set(E2, r2);
  }
  isOpen() {
    return true;
  }
  _projectStrokeOnPoints(t4) {
    return mi(this.points, t4, this.isOpen());
  }
  _calcDimensions(t4) {
    t4 = e2({ scaleX: this.scaleX, scaleY: this.scaleY, skewX: this.skewX, skewY: this.skewY, strokeLineCap: this.strokeLineCap, strokeLineJoin: this.strokeLineJoin, strokeMiterLimit: this.strokeMiterLimit, strokeUniform: this.strokeUniform, strokeWidth: this.strokeWidth }, t4 || {});
    const s4 = this.exactBoundingBox ? this._projectStrokeOnPoints(t4).map((t5) => t5.projectedPoint) : this.points;
    if (0 === s4.length)
      return { left: 0, top: 0, width: 0, height: 0, pathOffset: new U(), strokeOffset: new U(), strokeDiff: new U() };
    const i3 = ie(s4), r2 = _t(e2(e2({}, t4), {}, { scaleX: 1, scaleY: 1 })), n2 = ie(this.points.map((t5) => at$1(t5, r2, true))), o2 = new U(this.scaleX, this.scaleY);
    let a4 = i3.left + i3.width / 2, h4 = i3.top + i3.height / 2;
    return this.exactBoundingBox && (a4 -= h4 * Math.tan(rt$1(this.skewX)), h4 -= a4 * Math.tan(rt$1(this.skewY))), e2(e2({}, i3), {}, { pathOffset: new U(a4, h4), strokeOffset: new U(n2.left, n2.top).subtract(new U(i3.left, i3.top)).multiply(o2), strokeDiff: new U(i3.width, i3.height).subtract(new U(n2.width, n2.height)).multiply(o2) });
  }
  _findCenterFromElement() {
    const t4 = ie(this.points);
    return new U(t4.left + t4.width / 2, t4.top + t4.height / 2);
  }
  setDimensions() {
    this.setBoundingBox();
  }
  setBoundingBox(t4) {
    const { left: e3, top: s4, width: i3, height: r2, pathOffset: n2, strokeOffset: o2, strokeDiff: a4 } = this._calcDimensions();
    this.set({ width: i3, height: r2, pathOffset: n2, strokeOffset: o2, strokeDiff: a4 }), t4 && this.setPositionByOrigin(new U(e3 + i3 / 2, s4 + r2 / 2), M3, M3);
  }
  isStrokeAccountedForInDimensions() {
    return this.exactBoundingBox;
  }
  _getNonTransformedDimensions() {
    return this.exactBoundingBox ? new U(this.width, this.height) : super._getNonTransformedDimensions();
  }
  _getTransformedDimensions() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (this.exactBoundingBox) {
      let n2;
      if (Object.keys(t4).some((t5) => this.strokeUniform || this.constructor.layoutProperties.includes(t5))) {
        var e3, s4;
        const { width: i4, height: r3 } = this._calcDimensions(t4);
        n2 = new U(null !== (e3 = t4.width) && void 0 !== e3 ? e3 : i4, null !== (s4 = t4.height) && void 0 !== s4 ? s4 : r3);
      } else {
        var i3, r2;
        n2 = new U(null !== (i3 = t4.width) && void 0 !== i3 ? i3 : this.width, null !== (r2 = t4.height) && void 0 !== r2 ? r2 : this.height);
      }
      return n2.multiply(new U(t4.scaleX || this.scaleX, t4.scaleY || this.scaleY));
    }
    return super._getTransformedDimensions(t4);
  }
  _set(t4, e3) {
    const s4 = this.initialized && this[t4] !== e3, i3 = super._set(t4, e3);
    return this.exactBoundingBox && s4 && (("scaleX" === t4 || "scaleY" === t4) && this.strokeUniform && this.constructor.layoutProperties.includes("strokeUniform") || this.constructor.layoutProperties.includes(t4)) && this.setDimensions(), i3;
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return e2(e2({}, super.toObject(t4)), {}, { points: Ss(this.points) });
  }
  _toSVG() {
    const t4 = [], e3 = this.pathOffset.x, s4 = this.pathOffset.y, i3 = a3.NUM_FRACTION_DIGITS;
    for (let r2 = 0, n2 = this.points.length; r2 < n2; r2++)
      t4.push(jt(this.points[r2].x - e3, i3), ",", jt(this.points[r2].y - s4, i3), " ");
    return ["<".concat(this.constructor.type.toLowerCase(), " "), "COMMON_PARTS", 'points="'.concat(t4.join(""), '" />\n')];
  }
  _render(t4) {
    const e3 = this.points.length, s4 = this.pathOffset.x, i3 = this.pathOffset.y;
    if (e3 && !isNaN(this.points[e3 - 1].y)) {
      t4.beginPath(), t4.moveTo(this.points[0].x - s4, this.points[0].y - i3);
      for (let r2 = 0; r2 < e3; r2++) {
        const e4 = this.points[r2];
        t4.lineTo(e4.x - s4, e4.y - i3);
      }
      !this.isOpen() && t4.closePath(), this._renderPaintInOrder(t4);
    }
  }
  complexity() {
    return this.points.length;
  }
  static async fromElement(t4, s4, r2) {
    return new this(Zn(t4.getAttribute("points")), e2(e2({}, i2(er(t4, this.ATTRIBUTE_NAMES, r2), Qn)), s4));
  }
  static fromObject(t4) {
    return this._fromObject(t4, { extraParam: "points" });
  }
}
s3(to, "ownDefaults", $n), s3(to, "type", "Polyline"), s3(to, "layoutProperties", ["skewX", "skewY", "strokeLineCap", "strokeLineJoin", "strokeMiterLimit", "strokeWidth", "strokeUniform", "points"]), s3(to, "cacheProperties", [...Os, "points"]), s3(to, "ATTRIBUTE_NAMES", [...Si]), I2.setClass(to), I2.setSVGClass(to);
class eo extends to {
  isOpen() {
    return false;
  }
}
s3(eo, "ownDefaults", $n), s3(eo, "type", "Polygon"), I2.setClass(eo), I2.setSVGClass(eo);
const so = ["fontSize", "fontWeight", "fontFamily", "fontStyle"], io = ["underline", "overline", "linethrough"], ro = [...so, "lineHeight", "text", "charSpacing", "textAlign", "styles", "path", "pathStartOffset", "pathSide", "pathAlign"], no = [...ro, ...io, "textBackgroundColor", "direction"], oo = [...so, ...io, "stroke", "strokeWidth", "fill", "deltaY", "textBackgroundColor"], ao = { _reNewline: L2, _reSpacesAndTabs: /[ \t\r]/g, _reSpaceAndTab: /[ \t\r]/, _reWords: /\S+/g, fontSize: 40, fontWeight: "normal", fontFamily: "Times New Roman", underline: false, overline: false, linethrough: false, textAlign: P, fontStyle: "normal", lineHeight: 1.16, superscript: { size: 0.6, baseline: -0.35 }, subscript: { size: 0.6, baseline: 0.11 }, textBackgroundColor: "", stroke: null, shadow: null, path: void 0, pathStartOffset: 0, pathSide: P, pathAlign: "baseline", _fontSizeFraction: 0.222, offsets: { underline: 0.1, linethrough: -0.315, overline: -0.88 }, _fontSizeMult: 1.13, charSpacing: 0, deltaY: 0, direction: "ltr", CACHE_FONT_SIZE: 400, MIN_TEXT_WIDTH: 2 }, ho = "justify", co = "justify-left", lo = "justify-right", uo = "justify-center";
class go extends li {
  isEmptyStyles(t4) {
    if (!this.styles)
      return true;
    if (void 0 !== t4 && !this.styles[t4])
      return true;
    const e3 = void 0 === t4 ? this.styles : { line: this.styles[t4] };
    for (const t5 in e3)
      for (const s4 in e3[t5])
        for (const i3 in e3[t5][s4])
          return false;
    return true;
  }
  styleHas(t4, e3) {
    if (!this.styles)
      return false;
    if (void 0 !== e3 && !this.styles[e3])
      return false;
    const s4 = void 0 === e3 ? this.styles : { 0: this.styles[e3] };
    for (const e4 in s4)
      for (const i3 in s4[e4])
        if (void 0 !== s4[e4][i3][t4])
          return true;
    return false;
  }
  cleanStyle(t4) {
    if (!this.styles)
      return false;
    const e3 = this.styles;
    let s4, i3, r2 = 0, n2 = true, o2 = 0;
    for (const o3 in e3) {
      s4 = 0;
      for (const a4 in e3[o3]) {
        const h4 = e3[o3][a4] || {};
        r2++, void 0 !== h4[t4] ? (i3 ? h4[t4] !== i3 && (n2 = false) : i3 = h4[t4], h4[t4] === this[t4] && delete h4[t4]) : n2 = false, 0 !== Object.keys(h4).length ? s4++ : delete e3[o3][a4];
      }
      0 === s4 && delete e3[o3];
    }
    for (let t5 = 0; t5 < this._textLines.length; t5++)
      o2 += this._textLines[t5].length;
    n2 && r2 === o2 && (this[t4] = i3, this.removeStyle(t4));
  }
  removeStyle(t4) {
    if (!this.styles)
      return;
    const e3 = this.styles;
    let s4, i3, r2;
    for (i3 in e3) {
      for (r2 in s4 = e3[i3], s4)
        delete s4[r2][t4], 0 === Object.keys(s4[r2]).length && delete s4[r2];
      0 === Object.keys(s4).length && delete e3[i3];
    }
  }
  _extendStyles(t4, s4) {
    const { lineIndex: i3, charIndex: r2 } = this.get2DCursorLocation(t4);
    this._getLineStyle(i3) || this._setLineStyle(i3);
    const n2 = Tt(e2(e2({}, this._getStyleDeclaration(i3, r2)), s4), (t5) => void 0 !== t5);
    this._setStyleDeclaration(i3, r2, n2);
  }
  getSelectionStyles(t4, e3, s4) {
    const i3 = [];
    for (let r2 = t4; r2 < (e3 || t4); r2++)
      i3.push(this.getStyleAtPosition(r2, s4));
    return i3;
  }
  getStyleAtPosition(t4, e3) {
    const { lineIndex: s4, charIndex: i3 } = this.get2DCursorLocation(t4);
    return e3 ? this.getCompleteStyleDeclaration(s4, i3) : this._getStyleDeclaration(s4, i3);
  }
  setSelectionStyles(t4, e3, s4) {
    for (let i3 = e3; i3 < (s4 || e3); i3++)
      this._extendStyles(i3, t4);
    this._forceClearCache = true;
  }
  _getStyleDeclaration(t4, e3) {
    var s4;
    const i3 = this.styles && this.styles[t4];
    return i3 && null !== (s4 = i3[e3]) && void 0 !== s4 ? s4 : {};
  }
  getCompleteStyleDeclaration(t4, s4) {
    return e2(e2({}, St(this, this.constructor._styleProperties)), this._getStyleDeclaration(t4, s4));
  }
  _setStyleDeclaration(t4, e3, s4) {
    this.styles[t4][e3] = s4;
  }
  _deleteStyleDeclaration(t4, e3) {
    delete this.styles[t4][e3];
  }
  _getLineStyle(t4) {
    return !!this.styles[t4];
  }
  _setLineStyle(t4) {
    this.styles[t4] = {};
  }
  _deleteLineStyle(t4) {
    delete this.styles[t4];
  }
}
s3(go, "_styleProperties", oo);
const fo = /  +/g, po = /"/g;
function mo(t4, e3, s4, i3, r2) {
  return "		".concat(function(t5, e4) {
    let { left: s5, top: i4, width: r3, height: n2 } = e4, o2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : a3.NUM_FRACTION_DIGITS;
    const h4 = Bt("fill", t5, false), [c3, l2, u3, d4] = [s5, i4, r3, n2].map((t6) => jt(t6, o2));
    return "<rect ".concat(h4, ' x="').concat(c3, '" y="').concat(l2, '" width="').concat(u3, '" height="').concat(d4, '"></rect>');
  }(t4, { left: e3, top: s4, width: i3, height: r2 }), "\n");
}
const vo = ["textAnchor", "textDecoration", "dx", "dy", "top", "left", "fontSize", "strokeWidth"];
let yo;
class _o extends go {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), _o.ownDefaults);
  }
  constructor(t4, e3) {
    super(), s3(this, "__charBounds", []), Object.assign(this, _o.ownDefaults), this.setOptions(e3), this.styles || (this.styles = {}), this.text = t4, this.initialized = true, this.path && this.setPathInfo(), this.initDimensions(), this.setCoords();
  }
  setPathInfo() {
    const t4 = this.path;
    t4 && (t4.segmentsInfo = Jr(t4.path));
  }
  _splitText() {
    const t4 = this._splitTextIntoLines(this.text);
    return this.textLines = t4.lines, this._textLines = t4.graphemeLines, this._unwrappedTextLines = t4._unwrappedLines, this._text = t4.graphemeText, t4;
  }
  initDimensions() {
    this._splitText(), this._clearCache(), this.dirty = true, this.path ? (this.width = this.path.width, this.height = this.path.height) : (this.width = this.calcTextWidth() || this.cursorWidth || this.MIN_TEXT_WIDTH, this.height = this.calcTextHeight()), this.textAlign.includes(ho) && this.enlargeSpaces();
  }
  enlargeSpaces() {
    let t4, e3, s4, i3, r2, n2, o2;
    for (let a4 = 0, h4 = this._textLines.length; a4 < h4; a4++)
      if ((this.textAlign === ho || a4 !== h4 - 1 && !this.isEndOfWrapping(a4)) && (i3 = 0, r2 = this._textLines[a4], e3 = this.getLineWidth(a4), e3 < this.width && (o2 = this.textLines[a4].match(this._reSpacesAndTabs)))) {
        s4 = o2.length, t4 = (this.width - e3) / s4;
        for (let e4 = 0; e4 <= r2.length; e4++)
          n2 = this.__charBounds[a4][e4], this._reSpaceAndTab.test(r2[e4]) ? (n2.width += t4, n2.kernedWidth += t4, n2.left += i3, i3 += t4) : n2.left += i3;
      }
  }
  isEndOfWrapping(t4) {
    return t4 === this._textLines.length - 1;
  }
  missingNewlineOffset(t4) {
    return 1;
  }
  get2DCursorLocation(t4, e3) {
    const s4 = e3 ? this._unwrappedTextLines : this._textLines;
    let i3;
    for (i3 = 0; i3 < s4.length; i3++) {
      if (t4 <= s4[i3].length)
        return { lineIndex: i3, charIndex: t4 };
      t4 -= s4[i3].length + this.missingNewlineOffset(i3, e3);
    }
    return { lineIndex: i3 - 1, charIndex: s4[i3 - 1].length < t4 ? s4[i3 - 1].length : t4 };
  }
  toString() {
    return "#<Text (".concat(this.complexity(), '): { "text": "').concat(this.text, '", "fontFamily": "').concat(this.fontFamily, '" }>');
  }
  _getCacheCanvasDimensions() {
    const t4 = super._getCacheCanvasDimensions(), e3 = this.fontSize;
    return t4.width += e3 * t4.zoomX, t4.height += e3 * t4.zoomY, t4;
  }
  _render(t4) {
    const e3 = this.path;
    e3 && !e3.isNotVisible() && e3._render(t4), this._setTextStyles(t4), this._renderTextLinesBackground(t4), this._renderTextDecoration(t4, "underline"), this._renderText(t4), this._renderTextDecoration(t4, "overline"), this._renderTextDecoration(t4, "linethrough");
  }
  _renderText(t4) {
    "stroke" === this.paintFirst ? (this._renderTextStroke(t4), this._renderTextFill(t4)) : (this._renderTextFill(t4), this._renderTextStroke(t4));
  }
  _setTextStyles(t4, e3, s4) {
    if (t4.textBaseline = "alphabetic", this.path)
      switch (this.pathAlign) {
        case M3:
          t4.textBaseline = "middle";
          break;
        case "ascender":
          t4.textBaseline = E2;
          break;
        case "descender":
          t4.textBaseline = A;
      }
    t4.font = this._getFontDeclaration(e3, s4);
  }
  calcTextWidth() {
    let t4 = this.getLineWidth(0);
    for (let e3 = 1, s4 = this._textLines.length; e3 < s4; e3++) {
      const s5 = this.getLineWidth(e3);
      s5 > t4 && (t4 = s5);
    }
    return t4;
  }
  _renderTextLine(t4, e3, s4, i3, r2, n2) {
    this._renderChars(t4, e3, s4, i3, r2, n2);
  }
  _renderTextLinesBackground(t4) {
    if (!this.textBackgroundColor && !this.styleHas("textBackgroundColor"))
      return;
    const e3 = t4.fillStyle, s4 = this._getLeftOffset();
    let i3 = this._getTopOffset();
    for (let e4 = 0, r2 = this._textLines.length; e4 < r2; e4++) {
      const r3 = this.getHeightOfLine(e4);
      if (!this.textBackgroundColor && !this.styleHas("textBackgroundColor", e4)) {
        i3 += r3;
        continue;
      }
      const n2 = this._textLines[e4].length, o2 = this._getLineLeftOffset(e4);
      let a4, h4, c3 = 0, l2 = 0, u3 = this.getValueOfPropertyAt(e4, 0, "textBackgroundColor");
      for (let d4 = 0; d4 < n2; d4++) {
        const n3 = this.__charBounds[e4][d4];
        h4 = this.getValueOfPropertyAt(e4, d4, "textBackgroundColor"), this.path ? (t4.save(), t4.translate(n3.renderLeft, n3.renderTop), t4.rotate(n3.angle), t4.fillStyle = h4, h4 && t4.fillRect(-n3.width / 2, -r3 / this.lineHeight * (1 - this._fontSizeFraction), n3.width, r3 / this.lineHeight), t4.restore()) : h4 !== u3 ? (a4 = s4 + o2 + l2, "rtl" === this.direction && (a4 = this.width - a4 - c3), t4.fillStyle = u3, u3 && t4.fillRect(a4, i3, c3, r3 / this.lineHeight), l2 = n3.left, c3 = n3.width, u3 = h4) : c3 += n3.kernedWidth;
      }
      h4 && !this.path && (a4 = s4 + o2 + l2, "rtl" === this.direction && (a4 = this.width - a4 - c3), t4.fillStyle = h4, t4.fillRect(a4, i3, c3, r3 / this.lineHeight)), i3 += r3;
    }
    t4.fillStyle = e3, this._removeShadow(t4);
  }
  _measureChar(t4, e3, s4, i3) {
    const r2 = x2.getFontCache(e3), n2 = this._getFontDeclaration(e3), o2 = s4 + t4, a4 = s4 && n2 === this._getFontDeclaration(i3), h4 = e3.fontSize / this.CACHE_FONT_SIZE;
    let c3, l2, u3, d4;
    if (s4 && void 0 !== r2[s4] && (u3 = r2[s4]), void 0 !== r2[t4] && (d4 = c3 = r2[t4]), a4 && void 0 !== r2[o2] && (l2 = r2[o2], d4 = l2 - u3), void 0 === c3 || void 0 === u3 || void 0 === l2) {
      const i4 = function() {
        if (!yo) {
          const t5 = et$1();
          t5.width = t5.height = 0, yo = t5.getContext("2d");
        }
        return yo;
      }();
      this._setTextStyles(i4, e3, true), void 0 === c3 && (d4 = c3 = i4.measureText(t4).width, r2[t4] = c3), void 0 === u3 && a4 && s4 && (u3 = i4.measureText(s4).width, r2[s4] = u3), a4 && void 0 === l2 && (l2 = i4.measureText(o2).width, r2[o2] = l2, d4 = l2 - u3);
    }
    return { width: c3 * h4, kernedWidth: d4 * h4 };
  }
  getHeightOfChar(t4, e3) {
    return this.getValueOfPropertyAt(t4, e3, "fontSize");
  }
  measureLine(t4) {
    const e3 = this._measureLine(t4);
    return 0 !== this.charSpacing && (e3.width -= this._getWidthOfCharSpacing()), e3.width < 0 && (e3.width = 0), e3;
  }
  _measureLine(t4) {
    let e3, s4, i3 = 0;
    const r2 = this.pathSide === j, n2 = this.path, o2 = this._textLines[t4], a4 = o2.length, h4 = new Array(a4);
    this.__charBounds[t4] = h4;
    for (let r3 = 0; r3 < a4; r3++) {
      const n3 = o2[r3];
      s4 = this._getGraphemeBox(n3, t4, r3, e3), h4[r3] = s4, i3 += s4.kernedWidth, e3 = n3;
    }
    if (h4[a4] = { left: s4 ? s4.left + s4.width : 0, width: 0, kernedWidth: 0, height: this.fontSize, deltaY: 0 }, n2 && n2.segmentsInfo) {
      let t5 = 0;
      const e4 = n2.segmentsInfo[n2.segmentsInfo.length - 1].length;
      switch (this.textAlign) {
        case P:
          t5 = r2 ? e4 - i3 : 0;
          break;
        case M3:
          t5 = (e4 - i3) / 2;
          break;
        case j:
          t5 = r2 ? 0 : e4 - i3;
      }
      t5 += this.pathStartOffset * (r2 ? -1 : 1);
      for (let i4 = r2 ? a4 - 1 : 0; r2 ? i4 >= 0 : i4 < a4; r2 ? i4-- : i4++)
        s4 = h4[i4], t5 > e4 ? t5 %= e4 : t5 < 0 && (t5 += e4), this._setGraphemeOnPath(t5, s4), t5 += s4.kernedWidth;
    }
    return { width: i3, numOfSpaces: 0 };
  }
  _setGraphemeOnPath(t4, e3) {
    const s4 = t4 + e3.kernedWidth / 2, i3 = this.path, r2 = Zr(i3.path, s4, i3.segmentsInfo);
    e3.renderLeft = r2.x - i3.pathOffset.x, e3.renderTop = r2.y - i3.pathOffset.y, e3.angle = r2.angle + (this.pathSide === j ? Math.PI : 0);
  }
  _getGraphemeBox(t4, e3, s4, i3, r2) {
    const n2 = this.getCompleteStyleDeclaration(e3, s4), o2 = i3 ? this.getCompleteStyleDeclaration(e3, s4 - 1) : {}, a4 = this._measureChar(t4, n2, i3, o2);
    let h4, c3 = a4.kernedWidth, l2 = a4.width;
    0 !== this.charSpacing && (h4 = this._getWidthOfCharSpacing(), l2 += h4, c3 += h4);
    const u3 = { width: l2, left: 0, height: n2.fontSize, kernedWidth: c3, deltaY: n2.deltaY };
    if (s4 > 0 && !r2) {
      const t5 = this.__charBounds[e3][s4 - 1];
      u3.left = t5.left + t5.width + a4.kernedWidth - a4.width;
    }
    return u3;
  }
  getHeightOfLine(t4) {
    if (this.__lineHeights[t4])
      return this.__lineHeights[t4];
    let e3 = this.getHeightOfChar(t4, 0);
    for (let s4 = 1, i3 = this._textLines[t4].length; s4 < i3; s4++)
      e3 = Math.max(this.getHeightOfChar(t4, s4), e3);
    return this.__lineHeights[t4] = e3 * this.lineHeight * this._fontSizeMult;
  }
  calcTextHeight() {
    let t4, e3 = 0;
    for (let s4 = 0, i3 = this._textLines.length; s4 < i3; s4++)
      t4 = this.getHeightOfLine(s4), e3 += s4 === i3 - 1 ? t4 / this.lineHeight : t4;
    return e3;
  }
  _getLeftOffset() {
    return "ltr" === this.direction ? -this.width / 2 : this.width / 2;
  }
  _getTopOffset() {
    return -this.height / 2;
  }
  _renderTextCommon(t4, e3) {
    t4.save();
    let s4 = 0;
    const i3 = this._getLeftOffset(), r2 = this._getTopOffset();
    for (let n2 = 0, o2 = this._textLines.length; n2 < o2; n2++) {
      const o3 = this.getHeightOfLine(n2), a4 = o3 / this.lineHeight, h4 = this._getLineLeftOffset(n2);
      this._renderTextLine(e3, t4, this._textLines[n2], i3 + h4, r2 + s4 + a4, n2), s4 += o3;
    }
    t4.restore();
  }
  _renderTextFill(t4) {
    (this.fill || this.styleHas("fill")) && this._renderTextCommon(t4, "fillText");
  }
  _renderTextStroke(t4) {
    (this.stroke && 0 !== this.strokeWidth || !this.isEmptyStyles()) && (this.shadow && !this.shadow.affectStroke && this._removeShadow(t4), t4.save(), this._setLineDash(t4, this.strokeDashArray), t4.beginPath(), this._renderTextCommon(t4, "strokeText"), t4.closePath(), t4.restore());
  }
  _renderChars(t4, e3, s4, i3, r2, n2) {
    const o2 = this.getHeightOfLine(n2), a4 = this.textAlign.includes(ho), h4 = this.path, c3 = !a4 && 0 === this.charSpacing && this.isEmptyStyles(n2) && !h4, l2 = "ltr" === this.direction, u3 = "ltr" === this.direction ? 1 : -1, d4 = e3.direction;
    let g2, f2, p2, m4, v2, y4 = "", _2 = 0;
    if (e3.save(), d4 !== this.direction && (e3.canvas.setAttribute("dir", l2 ? "ltr" : "rtl"), e3.direction = l2 ? "ltr" : "rtl", e3.textAlign = l2 ? P : j), r2 -= o2 * this._fontSizeFraction / this.lineHeight, c3)
      return this._renderChar(t4, e3, n2, 0, s4.join(""), i3, r2), void e3.restore();
    for (let o3 = 0, c4 = s4.length - 1; o3 <= c4; o3++)
      m4 = o3 === c4 || this.charSpacing || h4, y4 += s4[o3], p2 = this.__charBounds[n2][o3], 0 === _2 ? (i3 += u3 * (p2.kernedWidth - p2.width), _2 += p2.width) : _2 += p2.kernedWidth, a4 && !m4 && this._reSpaceAndTab.test(s4[o3]) && (m4 = true), m4 || (g2 = g2 || this.getCompleteStyleDeclaration(n2, o3), f2 = this.getCompleteStyleDeclaration(n2, o3 + 1), m4 = Ci(g2, f2, false)), m4 && (h4 ? (e3.save(), e3.translate(p2.renderLeft, p2.renderTop), e3.rotate(p2.angle), this._renderChar(t4, e3, n2, o3, y4, -_2 / 2, 0), e3.restore()) : (v2 = i3, this._renderChar(t4, e3, n2, o3, y4, v2, r2)), y4 = "", g2 = f2, i3 += u3 * _2, _2 = 0);
    e3.restore();
  }
  _applyPatternGradientTransformText(t4) {
    const e3 = et$1(), s4 = this.width + this.strokeWidth, i3 = this.height + this.strokeWidth, r2 = e3.getContext("2d");
    return e3.width = s4, e3.height = i3, r2.beginPath(), r2.moveTo(0, 0), r2.lineTo(s4, 0), r2.lineTo(s4, i3), r2.lineTo(0, i3), r2.closePath(), r2.translate(s4 / 2, i3 / 2), r2.fillStyle = t4.toLive(r2), this._applyPatternGradientTransform(r2, t4), r2.fill(), r2.createPattern(e3, "no-repeat");
  }
  handleFiller(t4, e3, s4) {
    let i3, r2;
    return It(s4) ? "percentage" === s4.gradientUnits || s4.gradientTransform || s4.patternTransform ? (i3 = -this.width / 2, r2 = -this.height / 2, t4.translate(i3, r2), t4[e3] = this._applyPatternGradientTransformText(s4), { offsetX: i3, offsetY: r2 }) : (t4[e3] = s4.toLive(t4), this._applyPatternGradientTransform(t4, s4)) : (t4[e3] = s4, { offsetX: 0, offsetY: 0 });
  }
  _setStrokeStyles(t4, e3) {
    let { stroke: s4, strokeWidth: i3 } = e3;
    return t4.lineWidth = i3, t4.lineCap = this.strokeLineCap, t4.lineDashOffset = this.strokeDashOffset, t4.lineJoin = this.strokeLineJoin, t4.miterLimit = this.strokeMiterLimit, this.handleFiller(t4, "strokeStyle", s4);
  }
  _setFillStyles(t4, e3) {
    let { fill: s4 } = e3;
    return this.handleFiller(t4, "fillStyle", s4);
  }
  _renderChar(t4, e3, s4, i3, r2, n2, o2) {
    const a4 = this._getStyleDeclaration(s4, i3), h4 = this.getCompleteStyleDeclaration(s4, i3), c3 = "fillText" === t4 && h4.fill, l2 = "strokeText" === t4 && h4.stroke && h4.strokeWidth;
    if (l2 || c3) {
      if (e3.save(), e3.font = this._getFontDeclaration(h4), a4.textBackgroundColor && this._removeShadow(e3), a4.deltaY && (o2 += a4.deltaY), c3) {
        const t5 = this._setFillStyles(e3, h4);
        e3.fillText(r2, n2 - t5.offsetX, o2 - t5.offsetY);
      }
      if (l2) {
        const t5 = this._setStrokeStyles(e3, h4);
        e3.strokeText(r2, n2 - t5.offsetX, o2 - t5.offsetY);
      }
      e3.restore();
    }
  }
  setSuperscript(t4, e3) {
    this._setScript(t4, e3, this.superscript);
  }
  setSubscript(t4, e3) {
    this._setScript(t4, e3, this.subscript);
  }
  _setScript(t4, e3, s4) {
    const i3 = this.get2DCursorLocation(t4, true), r2 = this.getValueOfPropertyAt(i3.lineIndex, i3.charIndex, "fontSize"), n2 = this.getValueOfPropertyAt(i3.lineIndex, i3.charIndex, "deltaY"), o2 = { fontSize: r2 * s4.size, deltaY: n2 + r2 * s4.baseline };
    this.setSelectionStyles(o2, t4, e3);
  }
  _getLineLeftOffset(t4) {
    const e3 = this.getLineWidth(t4), s4 = this.width - e3, i3 = this.textAlign, r2 = this.direction, n2 = this.isEndOfWrapping(t4);
    let o2 = 0;
    return i3 === ho || i3 === uo && !n2 || i3 === lo && !n2 || i3 === co && !n2 ? 0 : (i3 === M3 && (o2 = s4 / 2), i3 === j && (o2 = s4), i3 === uo && (o2 = s4 / 2), i3 === lo && (o2 = s4), "rtl" === r2 && (i3 === j || i3 === ho || i3 === lo ? o2 = 0 : i3 === P || i3 === co ? o2 = -s4 : i3 !== M3 && i3 !== uo || (o2 = -s4 / 2)), o2);
  }
  _clearCache() {
    this._forceClearCache = false, this.__lineWidths = [], this.__lineHeights = [], this.__charBounds = [];
  }
  getLineWidth(t4) {
    if (void 0 !== this.__lineWidths[t4])
      return this.__lineWidths[t4];
    const { width: e3 } = this.measureLine(t4);
    return this.__lineWidths[t4] = e3, e3;
  }
  _getWidthOfCharSpacing() {
    return 0 !== this.charSpacing ? this.fontSize * this.charSpacing / 1e3 : 0;
  }
  getValueOfPropertyAt(t4, e3, s4) {
    var i3;
    return null !== (i3 = this._getStyleDeclaration(t4, e3)[s4]) && void 0 !== i3 ? i3 : this[s4];
  }
  _renderTextDecoration(t4, e3) {
    if (!this[e3] && !this.styleHas(e3))
      return;
    let s4 = this._getTopOffset();
    const i3 = this._getLeftOffset(), r2 = this.path, n2 = this._getWidthOfCharSpacing(), o2 = this.offsets[e3];
    for (let a4 = 0, h4 = this._textLines.length; a4 < h4; a4++) {
      const h5 = this.getHeightOfLine(a4);
      if (!this[e3] && !this.styleHas(e3, a4)) {
        s4 += h5;
        continue;
      }
      const c3 = this._textLines[a4], l2 = h5 / this.lineHeight, u3 = this._getLineLeftOffset(a4);
      let d4, g2, f2 = 0, p2 = 0, m4 = this.getValueOfPropertyAt(a4, 0, e3), v2 = this.getValueOfPropertyAt(a4, 0, "fill");
      const y4 = s4 + l2 * (1 - this._fontSizeFraction);
      let _2 = this.getHeightOfChar(a4, 0), x3 = this.getValueOfPropertyAt(a4, 0, "deltaY");
      for (let s5 = 0, n3 = c3.length; s5 < n3; s5++) {
        const n4 = this.__charBounds[a4][s5];
        d4 = this.getValueOfPropertyAt(a4, s5, e3), g2 = this.getValueOfPropertyAt(a4, s5, "fill");
        const h6 = this.getHeightOfChar(a4, s5), c4 = this.getValueOfPropertyAt(a4, s5, "deltaY");
        if (r2 && d4 && g2)
          t4.save(), t4.fillStyle = v2, t4.translate(n4.renderLeft, n4.renderTop), t4.rotate(n4.angle), t4.fillRect(-n4.kernedWidth / 2, o2 * h6 + c4, n4.kernedWidth, this.fontSize / 15), t4.restore();
        else if ((d4 !== m4 || g2 !== v2 || h6 !== _2 || c4 !== x3) && p2 > 0) {
          let e4 = i3 + u3 + f2;
          "rtl" === this.direction && (e4 = this.width - e4 - p2), m4 && v2 && (t4.fillStyle = v2, t4.fillRect(e4, y4 + o2 * _2 + x3, p2, this.fontSize / 15)), f2 = n4.left, p2 = n4.width, m4 = d4, v2 = g2, _2 = h6, x3 = c4;
        } else
          p2 += n4.kernedWidth;
      }
      let C2 = i3 + u3 + f2;
      "rtl" === this.direction && (C2 = this.width - C2 - p2), t4.fillStyle = g2, d4 && g2 && t4.fillRect(C2, y4 + o2 * _2 + x3, p2 - n2, this.fontSize / 15), s4 += h5;
    }
    this._removeShadow(t4);
  }
  _getFontDeclaration() {
    let { fontFamily: t4 = this.fontFamily, fontStyle: e3 = this.fontStyle, fontWeight: s4 = this.fontWeight, fontSize: i3 = this.fontSize } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = arguments.length > 1 ? arguments[1] : void 0;
    const n2 = t4.includes("'") || t4.includes('"') || t4.includes(",") || _o.genericFonts.includes(t4.toLowerCase()) ? t4 : '"'.concat(t4, '"');
    return [e3, s4, "".concat(r2 ? this.CACHE_FONT_SIZE : i3, "px"), n2].join(" ");
  }
  render(t4) {
    this.visible && (this.canvas && this.canvas.skipOffscreen && !this.group && !this.isOnScreen() || (this._forceClearCache && this.initDimensions(), super.render(t4)));
  }
  graphemeSplit(t4) {
    return yi(t4);
  }
  _splitTextIntoLines(t4) {
    const e3 = t4.split(this._reNewline), s4 = new Array(e3.length), i3 = ["\n"];
    let r2 = [];
    for (let t5 = 0; t5 < e3.length; t5++)
      s4[t5] = this.graphemeSplit(e3[t5]), r2 = r2.concat(s4[t5], i3);
    return r2.pop(), { _unwrappedLines: s4, lines: e3, graphemeText: r2, graphemeLines: s4 };
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return e2(e2({}, super.toObject([...no, ...t4])), {}, { styles: bi(this.styles, this.text) }, this.path ? { path: this.path.toObject() } : {});
  }
  set(t4, e3) {
    const { textLayoutProperties: s4 } = this.constructor;
    super.set(t4, e3);
    let i3 = false, r2 = false;
    if ("object" == typeof t4)
      for (const e4 in t4)
        "path" === e4 && this.setPathInfo(), i3 = i3 || s4.includes(e4), r2 = r2 || "path" === e4;
    else
      i3 = s4.includes(t4), r2 = "path" === t4;
    return r2 && this.setPathInfo(), i3 && this.initialized && (this.initDimensions(), this.setCoords()), this;
  }
  complexity() {
    return 1;
  }
  static async fromElement(t4, s4, r2) {
    const n2 = er(t4, _o.ATTRIBUTE_NAMES, r2), o2 = e2(e2({}, s4), n2), { textAnchor: a4 = P, textDecoration: h4 = "", dx: c3 = 0, dy: l2 = 0, top: u3 = 0, left: d4 = 0, fontSize: g2 = k2, strokeWidth: f2 = 1 } = o2, p2 = i2(o2, vo), m4 = new this((t4.textContent || "").replace(/^\s+|\s+$|\n+/g, "").replace(/\s+/g, " "), e2({ left: d4 + c3, top: u3 + l2, underline: h4.includes("underline"), overline: h4.includes("overline"), linethrough: h4.includes("line-through"), strokeWidth: 0, fontSize: g2 }, p2)), v2 = m4.getScaledHeight() / m4.height, y4 = ((m4.height + m4.strokeWidth) * m4.lineHeight - m4.height) * v2, _2 = m4.getScaledHeight() + y4;
    let x3 = 0;
    return a4 === M3 && (x3 = m4.getScaledWidth() / 2), a4 === j && (x3 = m4.getScaledWidth()), m4.set({ left: m4.left - x3, top: m4.top - (_2 - m4.fontSize * (0.07 + m4._fontSizeFraction)) / m4.lineHeight, strokeWidth: f2 }), m4;
  }
  static fromObject(t4) {
    return this._fromObject(e2(e2({}, t4), {}, { styles: wi(t4.styles || {}, t4.text) }), { extraParam: "text" });
  }
}
s3(_o, "textLayoutProperties", ro), s3(_o, "cacheProperties", [...Os, ...no]), s3(_o, "ownDefaults", ao), s3(_o, "type", "Text"), s3(_o, "genericFonts", ["sans-serif", "serif", "cursive", "fantasy", "monospace"]), s3(_o, "ATTRIBUTE_NAMES", Si.concat("x", "y", "dx", "dy", "font-family", "font-style", "font-weight", "font-size", "letter-spacing", "text-decoration", "text-anchor")), ci(_o, [class extends Te {
  _toSVG() {
    const t4 = this._getSVGLeftTopOffsets(), e3 = this._getSVGTextAndBg(t4.textTop, t4.textLeft);
    return this._wrapSVGTextAndBg(e3);
  }
  toSVG(t4) {
    return this._createBaseSVGMarkup(this._toSVG(), { reviver: t4, noStyle: true, withShadow: true });
  }
  _getSVGLeftTopOffsets() {
    return { textLeft: -this.width / 2, textTop: -this.height / 2, lineTop: this.getHeightOfLine(0) };
  }
  _wrapSVGTextAndBg(t4) {
    let { textBgRects: e3, textSpans: s4 } = t4;
    const i3 = this.getSvgTextDecoration(this);
    return [e3.join(""), '		<text xml:space="preserve" ', this.fontFamily ? 'font-family="'.concat(this.fontFamily.replace(po, "'"), '" ') : "", this.fontSize ? 'font-size="'.concat(this.fontSize, '" ') : "", this.fontStyle ? 'font-style="'.concat(this.fontStyle, '" ') : "", this.fontWeight ? 'font-weight="'.concat(this.fontWeight, '" ') : "", i3 ? 'text-decoration="'.concat(i3, '" ') : "", "rtl" === this.direction ? 'direction="'.concat(this.direction, '" ') : "", 'style="', this.getSvgStyles(true), '"', this.addPaintOrder(), " >", s4.join(""), "</text>\n"];
  }
  _getSVGTextAndBg(t4, e3) {
    const s4 = [], i3 = [];
    let r2, n2 = t4;
    this.backgroundColor && i3.push(...mo(this.backgroundColor, -this.width / 2, -this.height / 2, this.width, this.height));
    for (let t5 = 0, o2 = this._textLines.length; t5 < o2; t5++)
      r2 = this._getLineLeftOffset(t5), "rtl" === this.direction && (r2 += this.width), (this.textBackgroundColor || this.styleHas("textBackgroundColor", t5)) && this._setSVGTextLineBg(i3, t5, e3 + r2, n2), this._setSVGTextLineText(s4, t5, e3 + r2, n2), n2 += this.getHeightOfLine(t5);
    return { textSpans: s4, textBgRects: i3 };
  }
  _createTextCharSpan(t4, e3, s4, i3) {
    const r2 = this.getSvgSpanStyles(e3, t4 !== t4.trim() || !!t4.match(fo)), n2 = r2 ? 'style="'.concat(r2, '"') : "", o2 = e3.deltaY, h4 = o2 ? ' dy="'.concat(jt(o2, a3.NUM_FRACTION_DIGITS), '" ') : "";
    return '<tspan x="'.concat(jt(s4, a3.NUM_FRACTION_DIGITS), '" y="').concat(jt(i3, a3.NUM_FRACTION_DIGITS), '" ').concat(h4).concat(n2, ">").concat(vi(t4), "</tspan>");
  }
  _setSVGTextLineText(t4, e3, s4, i3) {
    const r2 = this.getHeightOfLine(e3), n2 = this.textAlign.includes(ho), o2 = this._textLines[e3];
    let a4, h4, c3, l2, u3, d4 = "", g2 = 0;
    i3 += r2 * (1 - this._fontSizeFraction) / this.lineHeight;
    for (let r3 = 0, f2 = o2.length - 1; r3 <= f2; r3++)
      u3 = r3 === f2 || this.charSpacing, d4 += o2[r3], c3 = this.__charBounds[e3][r3], 0 === g2 ? (s4 += c3.kernedWidth - c3.width, g2 += c3.width) : g2 += c3.kernedWidth, n2 && !u3 && this._reSpaceAndTab.test(o2[r3]) && (u3 = true), u3 || (a4 = a4 || this.getCompleteStyleDeclaration(e3, r3), h4 = this.getCompleteStyleDeclaration(e3, r3 + 1), u3 = Ci(a4, h4, true)), u3 && (l2 = this._getStyleDeclaration(e3, r3), t4.push(this._createTextCharSpan(d4, l2, s4, i3)), d4 = "", a4 = h4, "rtl" === this.direction ? s4 -= g2 : s4 += g2, g2 = 0);
  }
  _setSVGTextLineBg(t4, e3, s4, i3) {
    const r2 = this._textLines[e3], n2 = this.getHeightOfLine(e3) / this.lineHeight;
    let o2, a4 = 0, h4 = 0, c3 = this.getValueOfPropertyAt(e3, 0, "textBackgroundColor");
    for (let l2 = 0; l2 < r2.length; l2++) {
      const { left: r3, width: u3, kernedWidth: d4 } = this.__charBounds[e3][l2];
      o2 = this.getValueOfPropertyAt(e3, l2, "textBackgroundColor"), o2 !== c3 ? (c3 && t4.push(...mo(c3, s4 + h4, i3, a4, n2)), h4 = r3, a4 = u3, c3 = o2) : a4 += d4;
    }
    o2 && t4.push(...mo(c3, s4 + h4, i3, a4, n2));
  }
  _getSVGLineTopOffset(t4) {
    let e3, s4 = 0;
    for (e3 = 0; e3 < t4; e3++)
      s4 += this.getHeightOfLine(e3);
    const i3 = this.getHeightOfLine(e3);
    return { lineTop: s4, offset: (this._fontSizeMult - this._fontSizeFraction) * i3 / (this.lineHeight * this._fontSizeMult) };
  }
  getSvgStyles(t4) {
    return "".concat(super.getSvgStyles(t4), " white-space: pre;");
  }
  getSvgSpanStyles(t4, e3) {
    const { fontFamily: s4, strokeWidth: i3, stroke: r2, fill: n2, fontSize: o2, fontStyle: a4, fontWeight: h4, deltaY: c3 } = t4, l2 = this.getSvgTextDecoration(t4);
    return [r2 ? Bt("stroke", r2) : "", i3 ? "stroke-width: ".concat(i3, "; ") : "", s4 ? "font-family: ".concat(s4.includes("'") || s4.includes('"') ? s4 : "'".concat(s4, "'"), "; ") : "", o2 ? "font-size: ".concat(o2, "px; ") : "", a4 ? "font-style: ".concat(a4, "; ") : "", h4 ? "font-weight: ".concat(h4, "; ") : "", l2 ? "text-decoration: ".concat(l2, "; ") : l2, n2 ? Bt("fill", n2) : "", c3 ? "baseline-shift: ".concat(-c3, "; ") : "", e3 ? "white-space: pre; " : ""].join("");
  }
  getSvgTextDecoration(t4) {
    return ["overline", "underline", "line-through"].filter((e3) => t4[e3.replace("-", "")]).join(" ");
  }
}]), I2.setClass(_o), I2.setSVGClass(_o);
class xo {
  constructor(t4) {
    s3(this, "target", void 0), s3(this, "__mouseDownInPlace", false), s3(this, "__dragStartFired", false), s3(this, "__isDraggingOver", false), s3(this, "__dragStartSelection", void 0), s3(this, "__dragImageDisposer", void 0), s3(this, "_dispose", void 0), this.target = t4;
    const e3 = [this.target.on("dragenter", this.dragEnterHandler.bind(this)), this.target.on("dragover", this.dragOverHandler.bind(this)), this.target.on("dragleave", this.dragLeaveHandler.bind(this)), this.target.on("dragend", this.dragEndHandler.bind(this)), this.target.on("drop", this.dropHandler.bind(this))];
    this._dispose = () => {
      e3.forEach((t5) => t5()), this._dispose = void 0;
    };
  }
  isPointerOverSelection(t4) {
    const e3 = this.target, s4 = e3.getSelectionStartFromPointer(t4);
    return e3.isEditing && s4 >= e3.selectionStart && s4 <= e3.selectionEnd && e3.selectionStart < e3.selectionEnd;
  }
  start(t4) {
    return this.__mouseDownInPlace = this.isPointerOverSelection(t4);
  }
  isActive() {
    return this.__mouseDownInPlace;
  }
  end(t4) {
    const e3 = this.isActive();
    return e3 && !this.__dragStartFired && (this.target.setCursorByClick(t4), this.target.initDelayedCursor(true)), this.__mouseDownInPlace = false, this.__dragStartFired = false, this.__isDraggingOver = false, e3;
  }
  getDragStartSelection() {
    return this.__dragStartSelection;
  }
  setDragImage(t4, e3) {
    var s4;
    let { selectionStart: i3, selectionEnd: r2 } = e3;
    const n2 = this.target, o2 = n2.canvas, a4 = new U(n2.flipX ? -1 : 1, n2.flipY ? -1 : 1), h4 = n2._getCursorBoundaries(i3), c3 = new U(h4.left + h4.leftOffset, h4.top + h4.topOffset).multiply(a4).transform(n2.calcTransformMatrix()), l2 = o2.getScenePoint(t4).subtract(c3), u3 = n2.getCanvasRetinaScaling(), d4 = n2.getBoundingRect(), g2 = c3.subtract(new U(d4.left, d4.top)), f2 = o2.viewportTransform, p2 = g2.add(l2).transform(f2, true), m4 = n2.backgroundColor, v2 = Ss(n2.styles);
    n2.backgroundColor = "";
    const y4 = { stroke: "transparent", fill: "transparent", textBackgroundColor: "transparent" };
    n2.setSelectionStyles(y4, 0, i3), n2.setSelectionStyles(y4, r2, n2.text.length), n2.dirty = true;
    const _2 = n2.toCanvasElement({ enableRetinaScaling: o2.enableRetinaScaling, viewportTransform: true });
    n2.backgroundColor = m4, n2.styles = v2, n2.dirty = true, Ut(_2, { position: "fixed", left: "".concat(-_2.width, "px"), border: F, width: "".concat(_2.width / u3, "px"), height: "".concat(_2.height / u3, "px") }), this.__dragImageDisposer && this.__dragImageDisposer(), this.__dragImageDisposer = () => {
      _2.remove();
    }, Ht(t4.target || this.target.hiddenTextarea).body.appendChild(_2), null === (s4 = t4.dataTransfer) || void 0 === s4 || s4.setDragImage(_2, p2.x, p2.y);
  }
  onDragStart(t4) {
    this.__dragStartFired = true;
    const s4 = this.target, i3 = this.isActive();
    if (i3 && t4.dataTransfer) {
      const i4 = this.__dragStartSelection = { selectionStart: s4.selectionStart, selectionEnd: s4.selectionEnd }, r2 = s4._text.slice(i4.selectionStart, i4.selectionEnd).join(""), n2 = e2({ text: s4.text, value: r2 }, i4);
      t4.dataTransfer.setData("text/plain", r2), t4.dataTransfer.setData("application/fabric", JSON.stringify({ value: r2, styles: s4.getSelectionStyles(i4.selectionStart, i4.selectionEnd, true) })), t4.dataTransfer.effectAllowed = "copyMove", this.setDragImage(t4, n2);
    }
    return s4.abortCursorAnimation(), i3;
  }
  canDrop(t4) {
    if (this.target.editable && !this.target.getActiveControl() && !t4.defaultPrevented) {
      if (this.isActive() && this.__dragStartSelection) {
        const e3 = this.target.getSelectionStartFromPointer(t4), s4 = this.__dragStartSelection;
        return e3 < s4.selectionStart || e3 > s4.selectionEnd;
      }
      return true;
    }
    return false;
  }
  targetCanDrop(t4) {
    return this.target.canDrop(t4);
  }
  dragEnterHandler(t4) {
    let { e: e3 } = t4;
    const s4 = this.targetCanDrop(e3);
    !this.__isDraggingOver && s4 && (this.__isDraggingOver = true);
  }
  dragOverHandler(t4) {
    const { e: e3 } = t4, s4 = this.targetCanDrop(e3);
    !this.__isDraggingOver && s4 ? this.__isDraggingOver = true : this.__isDraggingOver && !s4 && (this.__isDraggingOver = false), this.__isDraggingOver && (e3.preventDefault(), t4.canDrop = true, t4.dropTarget = this.target);
  }
  dragLeaveHandler() {
    (this.__isDraggingOver || this.isActive()) && (this.__isDraggingOver = false);
  }
  dropHandler(t4) {
    var e3;
    const { e: s4 } = t4, i3 = s4.defaultPrevented;
    this.__isDraggingOver = false, s4.preventDefault();
    let r2 = null === (e3 = s4.dataTransfer) || void 0 === e3 ? void 0 : e3.getData("text/plain");
    if (r2 && !i3) {
      const e4 = this.target, i4 = e4.canvas;
      let n2 = e4.getSelectionStartFromPointer(s4);
      const { styles: o2 } = s4.dataTransfer.types.includes("application/fabric") ? JSON.parse(s4.dataTransfer.getData("application/fabric")) : {}, a4 = r2[Math.max(0, r2.length - 1)], h4 = 0;
      if (this.__dragStartSelection) {
        const t5 = this.__dragStartSelection.selectionStart, s5 = this.__dragStartSelection.selectionEnd;
        n2 > t5 && n2 <= s5 ? n2 = t5 : n2 > s5 && (n2 -= s5 - t5), e4.removeChars(t5, s5), delete this.__dragStartSelection;
      }
      e4._reNewline.test(a4) && (e4._reNewline.test(e4._text[n2]) || n2 === e4._text.length) && (r2 = r2.trimEnd()), t4.didDrop = true, t4.dropTarget = e4, e4.insertChars(r2, o2, n2), i4.setActiveObject(e4), e4.enterEditing(s4), e4.selectionStart = Math.min(n2 + h4, e4._text.length), e4.selectionEnd = Math.min(e4.selectionStart + r2.length, e4._text.length), e4.hiddenTextarea.value = e4.text, e4._updateTextarea(), e4.hiddenTextarea.focus(), e4.fire("changed", { index: n2 + h4, action: "drop" }), i4.fire("text:changed", { target: e4 }), i4.contextTopDirty = true, i4.requestRenderAll();
    }
  }
  dragEndHandler(t4) {
    let { e: e3 } = t4;
    if (this.isActive() && this.__dragStartFired && this.__dragStartSelection) {
      var s4;
      const t5 = this.target, i3 = this.target.canvas, { selectionStart: r2, selectionEnd: n2 } = this.__dragStartSelection, o2 = (null === (s4 = e3.dataTransfer) || void 0 === s4 ? void 0 : s4.dropEffect) || F;
      o2 === F ? (t5.selectionStart = r2, t5.selectionEnd = n2, t5._updateTextarea(), t5.hiddenTextarea.focus()) : (t5.clearContextTop(), "move" === o2 && (t5.removeChars(r2, n2), t5.selectionStart = t5.selectionEnd = r2, t5.hiddenTextarea && (t5.hiddenTextarea.value = t5.text), t5._updateTextarea(), t5.fire("changed", { index: r2, action: "dragend" }), i3.fire("text:changed", { target: t5 }), i3.requestRenderAll()), t5.exitEditing());
    }
    this.__dragImageDisposer && this.__dragImageDisposer(), delete this.__dragImageDisposer, delete this.__dragStartSelection, this.__isDraggingOver = false;
  }
  dispose() {
    this._dispose && this._dispose();
  }
}
const Co = /[ \n\.,;!\?\-]/;
class bo extends _o {
  constructor() {
    super(...arguments), s3(this, "_currentCursorOpacity", 1);
  }
  initBehavior() {
    this._tick = this._tick.bind(this), this._onTickComplete = this._onTickComplete.bind(this), this.updateSelectionOnMouseMove = this.updateSelectionOnMouseMove.bind(this);
  }
  onDeselect(t4) {
    return this.isEditing && this.exitEditing(), this.selected = false, super.onDeselect(t4);
  }
  _animateCursor(t4) {
    let { toValue: e3, duration: s4, delay: i3, onComplete: r2 } = t4;
    return ze$1({ startValue: this._currentCursorOpacity, endValue: e3, duration: s4, delay: i3, onComplete: r2, abort: () => !this.canvas || this.selectionStart !== this.selectionEnd, onChange: (t5) => {
      this._currentCursorOpacity = t5, this.renderCursorOrSelection();
    } });
  }
  _tick(t4) {
    this._currentTickState = this._animateCursor({ toValue: 0, duration: this.cursorDuration / 2, delay: Math.max(t4 || 0, 100), onComplete: this._onTickComplete });
  }
  _onTickComplete() {
    var t4;
    null === (t4 = this._currentTickCompleteState) || void 0 === t4 || t4.abort(), this._currentTickCompleteState = this._animateCursor({ toValue: 1, duration: this.cursorDuration, onComplete: this._tick });
  }
  initDelayedCursor(t4) {
    this.abortCursorAnimation(), this._tick(t4 ? 0 : this.cursorDelay);
  }
  abortCursorAnimation() {
    let t4 = false;
    [this._currentTickState, this._currentTickCompleteState].forEach((e3) => {
      e3 && !e3.isDone() && (t4 = true, e3.abort());
    }), this._currentCursorOpacity = 1, t4 && this.clearContextTop();
  }
  restartCursorIfNeeded() {
    [this._currentTickState, this._currentTickCompleteState].some((t4) => !t4 || t4.isDone()) && this.initDelayedCursor();
  }
  selectAll() {
    return this.selectionStart = 0, this.selectionEnd = this._text.length, this._fireSelectionChanged(), this._updateTextarea(), this;
  }
  getSelectedText() {
    return this._text.slice(this.selectionStart, this.selectionEnd).join("");
  }
  findWordBoundaryLeft(t4) {
    let e3 = 0, s4 = t4 - 1;
    if (this._reSpace.test(this._text[s4]))
      for (; this._reSpace.test(this._text[s4]); )
        e3++, s4--;
    for (; /\S/.test(this._text[s4]) && s4 > -1; )
      e3++, s4--;
    return t4 - e3;
  }
  findWordBoundaryRight(t4) {
    let e3 = 0, s4 = t4;
    if (this._reSpace.test(this._text[s4]))
      for (; this._reSpace.test(this._text[s4]); )
        e3++, s4++;
    for (; /\S/.test(this._text[s4]) && s4 < this._text.length; )
      e3++, s4++;
    return t4 + e3;
  }
  findLineBoundaryLeft(t4) {
    let e3 = 0, s4 = t4 - 1;
    for (; !/\n/.test(this._text[s4]) && s4 > -1; )
      e3++, s4--;
    return t4 - e3;
  }
  findLineBoundaryRight(t4) {
    let e3 = 0, s4 = t4;
    for (; !/\n/.test(this._text[s4]) && s4 < this._text.length; )
      e3++, s4++;
    return t4 + e3;
  }
  searchWordBoundary(t4, e3) {
    const s4 = this._text;
    let i3 = t4 > 0 && this._reSpace.test(s4[t4]) && (-1 === e3 || !L2.test(s4[t4 - 1])) ? t4 - 1 : t4, r2 = s4[i3];
    for (; i3 > 0 && i3 < s4.length && !Co.test(r2); )
      i3 += e3, r2 = s4[i3];
    return -1 === e3 && Co.test(r2) && i3++, i3;
  }
  selectWord(t4) {
    t4 = t4 || this.selectionStart;
    const e3 = this.searchWordBoundary(t4, -1), s4 = Math.max(e3, this.searchWordBoundary(t4, 1));
    this.selectionStart = e3, this.selectionEnd = s4, this._fireSelectionChanged(), this._updateTextarea(), this.renderCursorOrSelection();
  }
  selectLine(t4) {
    t4 = t4 || this.selectionStart;
    const e3 = this.findLineBoundaryLeft(t4), s4 = this.findLineBoundaryRight(t4);
    return this.selectionStart = e3, this.selectionEnd = s4, this._fireSelectionChanged(), this._updateTextarea(), this;
  }
  enterEditing(t4) {
    !this.isEditing && this.editable && (this.canvas && (this.canvas.calcOffset(), this.canvas.textEditingManager.exitTextEditing()), this.isEditing = true, this.initHiddenTextarea(), this.hiddenTextarea.focus(), this.hiddenTextarea.value = this.text, this._updateTextarea(), this._saveEditingProps(), this._setEditingProps(), this._textBeforeEdit = this.text, this._tick(), this.fire("editing:entered", t4 ? { e: t4 } : void 0), this._fireSelectionChanged(), this.canvas && (this.canvas.fire("text:editing:entered", { target: this, e: t4 }), this.canvas.requestRenderAll()));
  }
  updateSelectionOnMouseMove(t4) {
    if (this.getActiveControl())
      return;
    const e3 = this.hiddenTextarea;
    Ht(e3).activeElement !== e3 && e3.focus();
    const s4 = this.getSelectionStartFromPointer(t4), i3 = this.selectionStart, r2 = this.selectionEnd;
    (s4 === this.__selectionStartOnMouseDown && i3 !== r2 || i3 !== s4 && r2 !== s4) && (s4 > this.__selectionStartOnMouseDown ? (this.selectionStart = this.__selectionStartOnMouseDown, this.selectionEnd = s4) : (this.selectionStart = s4, this.selectionEnd = this.__selectionStartOnMouseDown), this.selectionStart === i3 && this.selectionEnd === r2 || (this._fireSelectionChanged(), this._updateTextarea(), this.renderCursorOrSelection()));
  }
  _setEditingProps() {
    this.hoverCursor = "text", this.canvas && (this.canvas.defaultCursor = this.canvas.moveCursor = "text"), this.borderColor = this.editingBorderColor, this.hasControls = this.selectable = false, this.lockMovementX = this.lockMovementY = true;
  }
  fromStringToGraphemeSelection(t4, e3, s4) {
    const i3 = s4.slice(0, t4), r2 = this.graphemeSplit(i3).length;
    if (t4 === e3)
      return { selectionStart: r2, selectionEnd: r2 };
    const n2 = s4.slice(t4, e3);
    return { selectionStart: r2, selectionEnd: r2 + this.graphemeSplit(n2).length };
  }
  fromGraphemeToStringSelection(t4, e3, s4) {
    const i3 = s4.slice(0, t4).join("").length;
    if (t4 === e3)
      return { selectionStart: i3, selectionEnd: i3 };
    return { selectionStart: i3, selectionEnd: i3 + s4.slice(t4, e3).join("").length };
  }
  _updateTextarea() {
    if (this.cursorOffsetCache = {}, this.hiddenTextarea) {
      if (!this.inCompositionMode) {
        const t4 = this.fromGraphemeToStringSelection(this.selectionStart, this.selectionEnd, this._text);
        this.hiddenTextarea.selectionStart = t4.selectionStart, this.hiddenTextarea.selectionEnd = t4.selectionEnd;
      }
      this.updateTextareaPosition();
    }
  }
  updateFromTextArea() {
    if (!this.hiddenTextarea)
      return;
    this.cursorOffsetCache = {};
    const t4 = this.hiddenTextarea;
    this.text = t4.value, this.set("dirty", true), this.initDimensions(), this.setCoords();
    const e3 = this.fromStringToGraphemeSelection(t4.selectionStart, t4.selectionEnd, t4.value);
    this.selectionEnd = this.selectionStart = e3.selectionEnd, this.inCompositionMode || (this.selectionStart = e3.selectionStart), this.updateTextareaPosition();
  }
  updateTextareaPosition() {
    if (this.selectionStart === this.selectionEnd) {
      const t4 = this._calcTextareaPosition();
      this.hiddenTextarea.style.left = t4.left, this.hiddenTextarea.style.top = t4.top;
    }
  }
  _calcTextareaPosition() {
    if (!this.canvas)
      return { left: "1px", top: "1px" };
    const t4 = this.inCompositionMode ? this.compositionStart : this.selectionStart, e3 = this._getCursorBoundaries(t4), s4 = this.get2DCursorLocation(t4), i3 = s4.lineIndex, r2 = s4.charIndex, n2 = this.getValueOfPropertyAt(i3, r2, "fontSize") * this.lineHeight, o2 = e3.leftOffset, a4 = this.getCanvasRetinaScaling(), h4 = this.canvas.upperCanvasEl, c3 = h4.width / a4, l2 = h4.height / a4, u3 = c3 - n2, d4 = l2 - n2, g2 = new U(e3.left + o2, e3.top + e3.topOffset + n2).transform(this.calcTransformMatrix()).transform(this.canvas.viewportTransform).multiply(new U(h4.clientWidth / c3, h4.clientHeight / l2));
    return g2.x < 0 && (g2.x = 0), g2.x > u3 && (g2.x = u3), g2.y < 0 && (g2.y = 0), g2.y > d4 && (g2.y = d4), g2.x += this.canvas._offset.left, g2.y += this.canvas._offset.top, { left: "".concat(g2.x, "px"), top: "".concat(g2.y, "px"), fontSize: "".concat(n2, "px"), charHeight: n2 };
  }
  _saveEditingProps() {
    this._savedProps = { hasControls: this.hasControls, borderColor: this.borderColor, lockMovementX: this.lockMovementX, lockMovementY: this.lockMovementY, hoverCursor: this.hoverCursor, selectable: this.selectable, defaultCursor: this.canvas && this.canvas.defaultCursor, moveCursor: this.canvas && this.canvas.moveCursor };
  }
  _restoreEditingProps() {
    this._savedProps && (this.hoverCursor = this._savedProps.hoverCursor, this.hasControls = this._savedProps.hasControls, this.borderColor = this._savedProps.borderColor, this.selectable = this._savedProps.selectable, this.lockMovementX = this._savedProps.lockMovementX, this.lockMovementY = this._savedProps.lockMovementY, this.canvas && (this.canvas.defaultCursor = this._savedProps.defaultCursor || this.canvas.defaultCursor, this.canvas.moveCursor = this._savedProps.moveCursor || this.canvas.moveCursor), delete this._savedProps);
  }
  _exitEditing() {
    const t4 = this.hiddenTextarea;
    this.selected = false, this.isEditing = false, t4 && (t4.blur && t4.blur(), t4.parentNode && t4.parentNode.removeChild(t4)), this.hiddenTextarea = null, this.abortCursorAnimation(), this.selectionStart !== this.selectionEnd && this.clearContextTop();
  }
  exitEditing() {
    const t4 = this._textBeforeEdit !== this.text;
    return this._exitEditing(), this.selectionEnd = this.selectionStart, this._restoreEditingProps(), this._forceClearCache && (this.initDimensions(), this.setCoords()), this.fire("editing:exited"), t4 && this.fire("modified"), this.canvas && (this.canvas.fire("text:editing:exited", { target: this }), t4 && this.canvas.fire("object:modified", { target: this })), this;
  }
  _removeExtraneousStyles() {
    for (const t4 in this.styles)
      this._textLines[t4] || delete this.styles[t4];
  }
  removeStyleFromTo(t4, e3) {
    const { lineIndex: s4, charIndex: i3 } = this.get2DCursorLocation(t4, true), { lineIndex: r2, charIndex: n2 } = this.get2DCursorLocation(e3, true);
    if (s4 !== r2) {
      if (this.styles[s4])
        for (let t5 = i3; t5 < this._unwrappedTextLines[s4].length; t5++)
          delete this.styles[s4][t5];
      if (this.styles[r2])
        for (let t5 = n2; t5 < this._unwrappedTextLines[r2].length; t5++) {
          const e4 = this.styles[r2][t5];
          e4 && (this.styles[s4] || (this.styles[s4] = {}), this.styles[s4][i3 + t5 - n2] = e4);
        }
      for (let t5 = s4 + 1; t5 <= r2; t5++)
        delete this.styles[t5];
      this.shiftLineStyles(r2, s4 - r2);
    } else if (this.styles[s4]) {
      const t5 = this.styles[s4], e4 = n2 - i3;
      for (let e5 = i3; e5 < n2; e5++)
        delete t5[e5];
      for (const i4 in this.styles[s4]) {
        const s5 = parseInt(i4, 10);
        s5 >= n2 && (t5[s5 - e4] = t5[i4], delete t5[i4]);
      }
    }
  }
  shiftLineStyles(t4, e3) {
    const s4 = Object.assign({}, this.styles);
    for (const i3 in this.styles) {
      const r2 = parseInt(i3, 10);
      r2 > t4 && (this.styles[r2 + e3] = s4[r2], s4[r2 - e3] || delete this.styles[r2]);
    }
  }
  insertNewlineStyleObject(t4, s4, i3, r2) {
    const n2 = {}, o2 = this._unwrappedTextLines[t4].length, a4 = o2 === s4;
    let h4 = false;
    i3 || (i3 = 1), this.shiftLineStyles(t4, i3);
    const c3 = this.styles[t4] ? this.styles[t4][0 === s4 ? s4 : s4 - 1] : void 0;
    for (const e3 in this.styles[t4]) {
      const i4 = parseInt(e3, 10);
      i4 >= s4 && (h4 = true, n2[i4 - s4] = this.styles[t4][e3], a4 && 0 === s4 || delete this.styles[t4][e3]);
    }
    let l2 = false;
    for (h4 && !a4 && (this.styles[t4 + i3] = n2, l2 = true), (l2 || o2 > s4) && i3--; i3 > 0; )
      r2 && r2[i3 - 1] ? this.styles[t4 + i3] = { 0: e2({}, r2[i3 - 1]) } : c3 ? this.styles[t4 + i3] = { 0: e2({}, c3) } : delete this.styles[t4 + i3], i3--;
    this._forceClearCache = true;
  }
  insertCharStyleObject(t4, s4, i3, r2) {
    this.styles || (this.styles = {});
    const n2 = this.styles[t4], o2 = n2 ? e2({}, n2) : {};
    i3 || (i3 = 1);
    for (const t5 in o2) {
      const e3 = parseInt(t5, 10);
      e3 >= s4 && (n2[e3 + i3] = o2[e3], o2[e3 - i3] || delete n2[e3]);
    }
    if (this._forceClearCache = true, r2) {
      for (; i3--; )
        Object.keys(r2[i3]).length && (this.styles[t4] || (this.styles[t4] = {}), this.styles[t4][s4 + i3] = e2({}, r2[i3]));
      return;
    }
    if (!n2)
      return;
    const a4 = n2[s4 ? s4 - 1 : 1];
    for (; a4 && i3--; )
      this.styles[t4][s4 + i3] = e2({}, a4);
  }
  insertNewStyleBlock(t4, e3, s4) {
    const i3 = this.get2DCursorLocation(e3, true), r2 = [0];
    let n2, o2 = 0;
    for (let e4 = 0; e4 < t4.length; e4++)
      "\n" === t4[e4] ? (o2++, r2[o2] = 0) : r2[o2]++;
    for (r2[0] > 0 && (this.insertCharStyleObject(i3.lineIndex, i3.charIndex, r2[0], s4), s4 = s4 && s4.slice(r2[0] + 1)), o2 && this.insertNewlineStyleObject(i3.lineIndex, i3.charIndex + r2[0], o2), n2 = 1; n2 < o2; n2++)
      r2[n2] > 0 ? this.insertCharStyleObject(i3.lineIndex + n2, 0, r2[n2], s4) : s4 && this.styles[i3.lineIndex + n2] && s4[0] && (this.styles[i3.lineIndex + n2][0] = s4[0]), s4 = s4 && s4.slice(r2[n2] + 1);
    r2[n2] > 0 && this.insertCharStyleObject(i3.lineIndex + n2, 0, r2[n2], s4);
  }
  removeChars(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : t4 + 1;
    this.removeStyleFromTo(t4, e3), this._text.splice(t4, e3 - t4), this.text = this._text.join(""), this.set("dirty", true), this.initDimensions(), this.setCoords(), this._removeExtraneousStyles();
  }
  insertChars(t4, e3, s4) {
    let i3 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : s4;
    i3 > s4 && this.removeStyleFromTo(s4, i3);
    const r2 = this.graphemeSplit(t4);
    this.insertNewStyleBlock(r2, s4, e3), this._text = [...this._text.slice(0, s4), ...r2, ...this._text.slice(i3)], this.text = this._text.join(""), this.set("dirty", true), this.initDimensions(), this.setCoords(), this._removeExtraneousStyles();
  }
  setSelectionStartEndWithShift(t4, e3, s4) {
    s4 <= t4 ? (e3 === t4 ? this._selectionDirection = P : this._selectionDirection === j && (this._selectionDirection = P, this.selectionEnd = t4), this.selectionStart = s4) : s4 > t4 && s4 < e3 ? this._selectionDirection === j ? this.selectionEnd = s4 : this.selectionStart = s4 : (e3 === t4 ? this._selectionDirection = j : this._selectionDirection === P && (this._selectionDirection = j, this.selectionStart = e3), this.selectionEnd = s4);
  }
}
class wo extends bo {
  initHiddenTextarea() {
    const t4 = this.canvas && Ht(this.canvas.getElement()) || v$1(), e3 = t4.createElement("textarea");
    Object.entries({ autocapitalize: "off", autocorrect: "off", autocomplete: "off", spellcheck: "false", "data-fabric": "textarea", wrap: "off" }).map((t5) => {
      let [s5, i4] = t5;
      return e3.setAttribute(s5, i4);
    });
    const { top: s4, left: i3, fontSize: r2 } = this._calcTextareaPosition();
    e3.style.cssText = "position: absolute; top: ".concat(s4, "; left: ").concat(i3, "; z-index: -999; opacity: 0; width: 1px; height: 1px; font-size: 1px; padding-top: ").concat(r2, ";"), (this.hiddenTextareaContainer || t4.body).appendChild(e3), Object.entries({ blur: "blur", keydown: "onKeyDown", keyup: "onKeyUp", input: "onInput", copy: "copy", cut: "copy", paste: "paste", compositionstart: "onCompositionStart", compositionupdate: "onCompositionUpdate", compositionend: "onCompositionEnd" }).map((t5) => {
      let [s5, i4] = t5;
      return e3.addEventListener(s5, this[i4].bind(this));
    }), this.hiddenTextarea = e3;
  }
  blur() {
    this.abortCursorAnimation();
  }
  onKeyDown(t4) {
    if (!this.isEditing)
      return;
    const e3 = "rtl" === this.direction ? this.keysMapRtl : this.keysMap;
    if (t4.keyCode in e3)
      this[e3[t4.keyCode]](t4);
    else {
      if (!(t4.keyCode in this.ctrlKeysMapDown) || !t4.ctrlKey && !t4.metaKey)
        return;
      this[this.ctrlKeysMapDown[t4.keyCode]](t4);
    }
    t4.stopImmediatePropagation(), t4.preventDefault(), t4.keyCode >= 33 && t4.keyCode <= 40 ? (this.inCompositionMode = false, this.clearContextTop(), this.renderCursorOrSelection()) : this.canvas && this.canvas.requestRenderAll();
  }
  onKeyUp(t4) {
    !this.isEditing || this._copyDone || this.inCompositionMode ? this._copyDone = false : t4.keyCode in this.ctrlKeysMapUp && (t4.ctrlKey || t4.metaKey) && (this[this.ctrlKeysMapUp[t4.keyCode]](t4), t4.stopImmediatePropagation(), t4.preventDefault(), this.canvas && this.canvas.requestRenderAll());
  }
  onInput(t4) {
    const e3 = this.fromPaste;
    if (this.fromPaste = false, t4 && t4.stopPropagation(), !this.isEditing)
      return;
    const s4 = () => {
      this.updateFromTextArea(), this.fire("changed"), this.canvas && (this.canvas.fire("text:changed", { target: this }), this.canvas.requestRenderAll());
    };
    if ("" === this.hiddenTextarea.value)
      return this.styles = {}, void s4();
    const i3 = this._splitTextIntoLines(this.hiddenTextarea.value).graphemeText, r2 = this._text.length, n2 = i3.length, o2 = this.selectionStart, h4 = this.selectionEnd, c3 = o2 !== h4;
    let l2, u3, d4, g2, f2 = n2 - r2;
    const p2 = this.fromStringToGraphemeSelection(this.hiddenTextarea.selectionStart, this.hiddenTextarea.selectionEnd, this.hiddenTextarea.value), v2 = o2 > p2.selectionStart;
    c3 ? (u3 = this._text.slice(o2, h4), f2 += h4 - o2) : n2 < r2 && (u3 = v2 ? this._text.slice(h4 + f2, h4) : this._text.slice(o2, o2 - f2));
    const y4 = i3.slice(p2.selectionEnd - f2, p2.selectionEnd);
    if (u3 && u3.length && (y4.length && (l2 = this.getSelectionStyles(o2, o2 + 1, false), l2 = y4.map(() => l2[0])), c3 ? (d4 = o2, g2 = h4) : v2 ? (d4 = h4 - u3.length, g2 = h4) : (d4 = h4, g2 = h4 + u3.length), this.removeStyleFromTo(d4, g2)), y4.length) {
      const { copyPasteData: t5 } = m3();
      e3 && y4.join("") === t5.copiedText && !a3.disableStyleCopyPaste && (l2 = t5.copiedTextStyle), this.insertNewStyleBlock(y4, o2, l2);
    }
    s4();
  }
  onCompositionStart() {
    this.inCompositionMode = true;
  }
  onCompositionEnd() {
    this.inCompositionMode = false;
  }
  onCompositionUpdate(t4) {
    let { target: e3 } = t4;
    const { selectionStart: s4, selectionEnd: i3 } = e3;
    this.compositionStart = s4, this.compositionEnd = i3, this.updateTextareaPosition();
  }
  copy() {
    if (this.selectionStart === this.selectionEnd)
      return;
    const { copyPasteData: t4 } = m3();
    t4.copiedText = this.getSelectedText(), a3.disableStyleCopyPaste ? t4.copiedTextStyle = void 0 : t4.copiedTextStyle = this.getSelectionStyles(this.selectionStart, this.selectionEnd, true), this._copyDone = true;
  }
  paste() {
    this.fromPaste = true;
  }
  _getWidthBeforeCursor(t4, e3) {
    let s4, i3 = this._getLineLeftOffset(t4);
    return e3 > 0 && (s4 = this.__charBounds[t4][e3 - 1], i3 += s4.left + s4.width), i3;
  }
  getDownCursorOffset(t4, e3) {
    const s4 = this._getSelectionForOffset(t4, e3), i3 = this.get2DCursorLocation(s4), r2 = i3.lineIndex;
    if (r2 === this._textLines.length - 1 || t4.metaKey || 34 === t4.keyCode)
      return this._text.length - s4;
    const n2 = i3.charIndex, o2 = this._getWidthBeforeCursor(r2, n2), a4 = this._getIndexOnLine(r2 + 1, o2);
    return this._textLines[r2].slice(n2).length + a4 + 1 + this.missingNewlineOffset(r2);
  }
  _getSelectionForOffset(t4, e3) {
    return t4.shiftKey && this.selectionStart !== this.selectionEnd && e3 ? this.selectionEnd : this.selectionStart;
  }
  getUpCursorOffset(t4, e3) {
    const s4 = this._getSelectionForOffset(t4, e3), i3 = this.get2DCursorLocation(s4), r2 = i3.lineIndex;
    if (0 === r2 || t4.metaKey || 33 === t4.keyCode)
      return -s4;
    const n2 = i3.charIndex, o2 = this._getWidthBeforeCursor(r2, n2), a4 = this._getIndexOnLine(r2 - 1, o2), h4 = this._textLines[r2].slice(0, n2), c3 = this.missingNewlineOffset(r2 - 1);
    return -this._textLines[r2 - 1].length + a4 - h4.length + (1 - c3);
  }
  _getIndexOnLine(t4, e3) {
    const s4 = this._textLines[t4];
    let i3, r2, n2 = this._getLineLeftOffset(t4), o2 = 0;
    for (let a4 = 0, h4 = s4.length; a4 < h4; a4++)
      if (i3 = this.__charBounds[t4][a4].width, n2 += i3, n2 > e3) {
        r2 = true;
        const t5 = n2 - i3, s5 = n2, h5 = Math.abs(t5 - e3);
        o2 = Math.abs(s5 - e3) < h5 ? a4 : a4 - 1;
        break;
      }
    return r2 || (o2 = s4.length - 1), o2;
  }
  moveCursorDown(t4) {
    this.selectionStart >= this._text.length && this.selectionEnd >= this._text.length || this._moveCursorUpOrDown("Down", t4);
  }
  moveCursorUp(t4) {
    0 === this.selectionStart && 0 === this.selectionEnd || this._moveCursorUpOrDown("Up", t4);
  }
  _moveCursorUpOrDown(t4, e3) {
    const s4 = this["get".concat(t4, "CursorOffset")](e3, this._selectionDirection === j);
    if (e3.shiftKey ? this.moveCursorWithShift(s4) : this.moveCursorWithoutShift(s4), 0 !== s4) {
      const t5 = this.text.length;
      this.selectionStart = Ie(0, this.selectionStart, t5), this.selectionEnd = Ie(0, this.selectionEnd, t5), this.abortCursorAnimation(), this.initDelayedCursor(), this._fireSelectionChanged(), this._updateTextarea();
    }
  }
  moveCursorWithShift(t4) {
    const e3 = this._selectionDirection === P ? this.selectionStart + t4 : this.selectionEnd + t4;
    return this.setSelectionStartEndWithShift(this.selectionStart, this.selectionEnd, e3), 0 !== t4;
  }
  moveCursorWithoutShift(t4) {
    return t4 < 0 ? (this.selectionStart += t4, this.selectionEnd = this.selectionStart) : (this.selectionEnd += t4, this.selectionStart = this.selectionEnd), 0 !== t4;
  }
  moveCursorLeft(t4) {
    0 === this.selectionStart && 0 === this.selectionEnd || this._moveCursorLeftOrRight("Left", t4);
  }
  _move(t4, e3, s4) {
    let i3;
    if (t4.altKey)
      i3 = this["findWordBoundary".concat(s4)](this[e3]);
    else {
      if (!t4.metaKey && 35 !== t4.keyCode && 36 !== t4.keyCode)
        return this[e3] += "Left" === s4 ? -1 : 1, true;
      i3 = this["findLineBoundary".concat(s4)](this[e3]);
    }
    return void 0 !== i3 && this[e3] !== i3 && (this[e3] = i3, true);
  }
  _moveLeft(t4, e3) {
    return this._move(t4, e3, "Left");
  }
  _moveRight(t4, e3) {
    return this._move(t4, e3, "Right");
  }
  moveCursorLeftWithoutShift(t4) {
    let e3 = true;
    return this._selectionDirection = P, this.selectionEnd === this.selectionStart && 0 !== this.selectionStart && (e3 = this._moveLeft(t4, "selectionStart")), this.selectionEnd = this.selectionStart, e3;
  }
  moveCursorLeftWithShift(t4) {
    return this._selectionDirection === j && this.selectionStart !== this.selectionEnd ? this._moveLeft(t4, "selectionEnd") : 0 !== this.selectionStart ? (this._selectionDirection = P, this._moveLeft(t4, "selectionStart")) : void 0;
  }
  moveCursorRight(t4) {
    this.selectionStart >= this._text.length && this.selectionEnd >= this._text.length || this._moveCursorLeftOrRight("Right", t4);
  }
  _moveCursorLeftOrRight(t4, e3) {
    const s4 = "moveCursor".concat(t4).concat(e3.shiftKey ? "WithShift" : "WithoutShift");
    this._currentCursorOpacity = 1, this[s4](e3) && (this.abortCursorAnimation(), this.initDelayedCursor(), this._fireSelectionChanged(), this._updateTextarea());
  }
  moveCursorRightWithShift(t4) {
    return this._selectionDirection === P && this.selectionStart !== this.selectionEnd ? this._moveRight(t4, "selectionStart") : this.selectionEnd !== this._text.length ? (this._selectionDirection = j, this._moveRight(t4, "selectionEnd")) : void 0;
  }
  moveCursorRightWithoutShift(t4) {
    let e3 = true;
    return this._selectionDirection = j, this.selectionStart === this.selectionEnd ? (e3 = this._moveRight(t4, "selectionStart"), this.selectionEnd = this.selectionStart) : this.selectionStart = this.selectionEnd, e3;
  }
}
const So = (t4) => !!t4.button;
class To extends wo {
  constructor() {
    super(...arguments), s3(this, "draggableTextDelegate", void 0);
  }
  initBehavior() {
    this.on("mousedown", this._mouseDownHandler), this.on("mousedown:before", this._mouseDownHandlerBefore), this.on("mouseup", this.mouseUpHandler), this.on("mousedblclick", this.doubleClickHandler), this.on("tripleclick", this.tripleClickHandler), this.__lastClickTime = +/* @__PURE__ */ new Date(), this.__lastLastClickTime = +/* @__PURE__ */ new Date(), this.__lastPointer = {}, this.on("mousedown", this.onMouseDown), this.draggableTextDelegate = new xo(this), super.initBehavior();
  }
  shouldStartDragging() {
    return this.draggableTextDelegate.isActive();
  }
  onDragStart(t4) {
    return this.draggableTextDelegate.onDragStart(t4);
  }
  canDrop(t4) {
    return this.draggableTextDelegate.canDrop(t4);
  }
  onMouseDown(t4) {
    if (!this.canvas)
      return;
    this.__newClickTime = +/* @__PURE__ */ new Date();
    const e3 = t4.pointer;
    this.isTripleClick(e3) && (this.fire("tripleclick", t4), se$1(t4.e)), this.__lastLastClickTime = this.__lastClickTime, this.__lastClickTime = this.__newClickTime, this.__lastPointer = e3, this.__lastSelected = this.selected && !this.getActiveControl();
  }
  isTripleClick(t4) {
    return this.__newClickTime - this.__lastClickTime < 500 && this.__lastClickTime - this.__lastLastClickTime < 500 && this.__lastPointer.x === t4.x && this.__lastPointer.y === t4.y;
  }
  doubleClickHandler(t4) {
    this.isEditing && this.selectWord(this.getSelectionStartFromPointer(t4.e));
  }
  tripleClickHandler(t4) {
    this.isEditing && this.selectLine(this.getSelectionStartFromPointer(t4.e));
  }
  _mouseDownHandler(t4) {
    let { e: e3 } = t4;
    this.canvas && this.editable && !So(e3) && !this.getActiveControl() && (this.draggableTextDelegate.start(e3) || (this.canvas.textEditingManager.register(this), this.selected && (this.inCompositionMode = false, this.setCursorByClick(e3)), this.isEditing && (this.__selectionStartOnMouseDown = this.selectionStart, this.selectionStart === this.selectionEnd && this.abortCursorAnimation(), this.renderCursorOrSelection())));
  }
  _mouseDownHandlerBefore(t4) {
    let { e: e3 } = t4;
    this.canvas && this.editable && !So(e3) && (this.selected = this === this.canvas._activeObject);
  }
  mouseUpHandler(t4) {
    let { e: e3, transform: s4 } = t4;
    const i3 = this.draggableTextDelegate.end(e3);
    if (this.canvas) {
      this.canvas.textEditingManager.unregister(this);
      const t5 = this.canvas._activeObject;
      if (t5 && t5 !== this)
        return;
    }
    !this.editable || this.group && !this.group.interactive || s4 && s4.actionPerformed || So(e3) || i3 || (this.__lastSelected && !this.getActiveControl() ? (this.selected = false, this.__lastSelected = false, this.enterEditing(e3), this.selectionStart === this.selectionEnd ? this.initDelayedCursor(true) : this.renderCursorOrSelection()) : this.selected = true);
  }
  setCursorByClick(t4) {
    const e3 = this.getSelectionStartFromPointer(t4), s4 = this.selectionStart, i3 = this.selectionEnd;
    t4.shiftKey ? this.setSelectionStartEndWithShift(s4, i3, e3) : (this.selectionStart = e3, this.selectionEnd = e3), this.isEditing && (this._fireSelectionChanged(), this._updateTextarea());
  }
  getSelectionStartFromPointer(t4) {
    const e3 = this.canvas.getScenePoint(t4).transform(ht$1(this.calcTransformMatrix())).add(new U(-this._getLeftOffset(), -this._getTopOffset()));
    let s4 = 0, i3 = 0, r2 = 0;
    for (let t5 = 0; t5 < this._textLines.length && s4 <= e3.y; t5++)
      s4 += this.getHeightOfLine(t5), r2 = t5, t5 > 0 && (i3 += this._textLines[t5 - 1].length + this.missingNewlineOffset(t5 - 1));
    let n2 = Math.abs(this._getLineLeftOffset(r2));
    const o2 = this._textLines[r2].length, a4 = this.__charBounds[r2];
    for (let t5 = 0; t5 < o2; t5++) {
      const s5 = n2 + a4[t5].kernedWidth;
      if (e3.x <= s5) {
        Math.abs(e3.x - s5) <= Math.abs(e3.x - n2) && i3++;
        break;
      }
      n2 = s5, i3++;
    }
    return Math.min(this.flipX ? o2 - i3 : i3, this._text.length);
  }
}
const Oo = "moveCursorUp", ko = "moveCursorDown", Do = "moveCursorLeft", Mo = "moveCursorRight", Po = "exitEditing", Eo = e2({ selectionStart: 0, selectionEnd: 0, selectionColor: "rgba(17,119,255,0.3)", isEditing: false, editable: true, editingBorderColor: "rgba(102,153,255,0.25)", cursorWidth: 2, cursorColor: "", cursorDelay: 1e3, cursorDuration: 600, caching: true, hiddenTextareaContainer: null, keysMap: { 9: Po, 27: Po, 33: Oo, 34: ko, 35: Mo, 36: Do, 37: Do, 38: Oo, 39: Mo, 40: ko }, keysMapRtl: { 9: Po, 27: Po, 33: Oo, 34: ko, 35: Do, 36: Mo, 37: Mo, 38: Oo, 39: Do, 40: ko }, ctrlKeysMapDown: { 65: "selectAll" }, ctrlKeysMapUp: { 67: "copy", 88: "cut" } }, { _selectionDirection: null, _reSpace: /\s|\r?\n/, inCompositionMode: false });
class Ao extends To {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), Ao.ownDefaults);
  }
  get type() {
    const t4 = super.type;
    return "itext" === t4 ? "i-text" : t4;
  }
  constructor(t4, s4) {
    super(t4, e2(e2({}, Ao.ownDefaults), s4)), this.initBehavior();
  }
  _set(t4, e3) {
    return this.isEditing && this._savedProps && t4 in this._savedProps ? (this._savedProps[t4] = e3, this) : ("canvas" === t4 && (this.canvas instanceof mn && this.canvas.textEditingManager.remove(this), e3 instanceof mn && e3.textEditingManager.add(this)), super._set(t4, e3));
  }
  setSelectionStart(t4) {
    t4 = Math.max(t4, 0), this._updateAndFire("selectionStart", t4);
  }
  setSelectionEnd(t4) {
    t4 = Math.min(t4, this.text.length), this._updateAndFire("selectionEnd", t4);
  }
  _updateAndFire(t4, e3) {
    this[t4] !== e3 && (this._fireSelectionChanged(), this[t4] = e3), this._updateTextarea();
  }
  _fireSelectionChanged() {
    this.fire("selection:changed"), this.canvas && this.canvas.fire("text:selection:changed", { target: this });
  }
  initDimensions() {
    this.isEditing && this.initDelayedCursor(), super.initDimensions();
  }
  getSelectionStyles() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.selectionStart || 0, e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.selectionEnd, s4 = arguments.length > 2 ? arguments[2] : void 0;
    return super.getSelectionStyles(t4, e3, s4);
  }
  setSelectionStyles(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.selectionStart || 0, s4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.selectionEnd;
    return super.setSelectionStyles(t4, e3, s4);
  }
  get2DCursorLocation() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.selectionStart, e3 = arguments.length > 1 ? arguments[1] : void 0;
    return super.get2DCursorLocation(t4, e3);
  }
  render(t4) {
    super.render(t4), this.cursorOffsetCache = {}, this.renderCursorOrSelection();
  }
  toCanvasElement(t4) {
    const e3 = this.isEditing;
    this.isEditing = false;
    const s4 = super.toCanvasElement(t4);
    return this.isEditing = e3, s4;
  }
  renderCursorOrSelection() {
    if (!this.isEditing)
      return;
    const t4 = this.clearContextTop(true);
    if (!t4)
      return;
    const e3 = this._getCursorBoundaries();
    this.selectionStart === this.selectionEnd ? this.renderCursor(t4, e3) : this.renderSelection(t4, e3), this.canvas.contextTopDirty = true, t4.restore();
  }
  _getCursorBoundaries() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.selectionStart, e3 = arguments.length > 1 ? arguments[1] : void 0;
    const s4 = this._getLeftOffset(), i3 = this._getTopOffset(), r2 = this._getCursorBoundariesOffsets(t4, e3);
    return { left: s4, top: i3, leftOffset: r2.left, topOffset: r2.top };
  }
  _getCursorBoundariesOffsets(t4, e3) {
    return e3 ? this.__getCursorBoundariesOffsets(t4) : this.cursorOffsetCache && "top" in this.cursorOffsetCache ? this.cursorOffsetCache : this.cursorOffsetCache = this.__getCursorBoundariesOffsets(t4);
  }
  __getCursorBoundariesOffsets(t4) {
    let e3 = 0, s4 = 0;
    const { charIndex: i3, lineIndex: r2 } = this.get2DCursorLocation(t4);
    for (let t5 = 0; t5 < r2; t5++)
      e3 += this.getHeightOfLine(t5);
    const n2 = this._getLineLeftOffset(r2), o2 = this.__charBounds[r2][i3];
    o2 && (s4 = o2.left), 0 !== this.charSpacing && i3 === this._textLines[r2].length && (s4 -= this._getWidthOfCharSpacing());
    const a4 = { top: e3, left: n2 + (s4 > 0 ? s4 : 0) };
    return "rtl" === this.direction && (this.textAlign === j || this.textAlign === ho || this.textAlign === lo ? a4.left *= -1 : this.textAlign === P || this.textAlign === co ? a4.left = n2 - (s4 > 0 ? s4 : 0) : this.textAlign !== M3 && this.textAlign !== uo || (a4.left = n2 - (s4 > 0 ? s4 : 0))), a4;
  }
  renderCursorAt(t4) {
    const e3 = this._getCursorBoundaries(t4, true);
    this._renderCursor(this.canvas.contextTop, e3, t4);
  }
  renderCursor(t4, e3) {
    this._renderCursor(t4, e3, this.selectionStart);
  }
  _renderCursor(t4, e3, s4) {
    const i3 = this.get2DCursorLocation(s4), r2 = i3.lineIndex, n2 = i3.charIndex > 0 ? i3.charIndex - 1 : 0, o2 = this.getValueOfPropertyAt(r2, n2, "fontSize"), a4 = this.getObjectScaling().x * this.canvas.getZoom(), h4 = this.cursorWidth / a4, c3 = this.getValueOfPropertyAt(r2, n2, "deltaY"), l2 = e3.topOffset + (1 - this._fontSizeFraction) * this.getHeightOfLine(r2) / this.lineHeight - o2 * (1 - this._fontSizeFraction);
    this.inCompositionMode && this.renderSelection(t4, e3), t4.fillStyle = this.cursorColor || this.getValueOfPropertyAt(r2, n2, "fill"), t4.globalAlpha = this._currentCursorOpacity, t4.fillRect(e3.left + e3.leftOffset - h4 / 2, l2 + e3.top + c3, h4, o2);
  }
  renderSelection(t4, e3) {
    const s4 = { selectionStart: this.inCompositionMode ? this.hiddenTextarea.selectionStart : this.selectionStart, selectionEnd: this.inCompositionMode ? this.hiddenTextarea.selectionEnd : this.selectionEnd };
    this._renderSelection(t4, s4, e3);
  }
  renderDragSourceEffect() {
    const t4 = this.draggableTextDelegate.getDragStartSelection();
    this._renderSelection(this.canvas.contextTop, t4, this._getCursorBoundaries(t4.selectionStart, true));
  }
  renderDropTargetEffect(t4) {
    const e3 = this.getSelectionStartFromPointer(t4);
    this.renderCursorAt(e3);
  }
  _renderSelection(t4, e3, s4) {
    const i3 = e3.selectionStart, r2 = e3.selectionEnd, n2 = this.textAlign.includes(ho), o2 = this.get2DCursorLocation(i3), a4 = this.get2DCursorLocation(r2), h4 = o2.lineIndex, c3 = a4.lineIndex, l2 = o2.charIndex < 0 ? 0 : o2.charIndex, u3 = a4.charIndex < 0 ? 0 : a4.charIndex;
    for (let e4 = h4; e4 <= c3; e4++) {
      const i4 = this._getLineLeftOffset(e4) || 0;
      let r3 = this.getHeightOfLine(e4), o3 = 0, a5 = 0, d4 = 0;
      if (e4 === h4 && (a5 = this.__charBounds[h4][l2].left), e4 >= h4 && e4 < c3)
        d4 = n2 && !this.isEndOfWrapping(e4) ? this.width : this.getLineWidth(e4) || 5;
      else if (e4 === c3)
        if (0 === u3)
          d4 = this.__charBounds[c3][u3].left;
        else {
          const t5 = this._getWidthOfCharSpacing();
          d4 = this.__charBounds[c3][u3 - 1].left + this.__charBounds[c3][u3 - 1].width - t5;
        }
      o3 = r3, (this.lineHeight < 1 || e4 === c3 && this.lineHeight > 1) && (r3 /= this.lineHeight);
      let g2 = s4.left + i4 + a5, f2 = r3, p2 = 0;
      const m4 = d4 - a5;
      this.inCompositionMode ? (t4.fillStyle = this.compositionColor || "black", f2 = 1, p2 = r3) : t4.fillStyle = this.selectionColor, "rtl" === this.direction && (this.textAlign === j || this.textAlign === ho || this.textAlign === lo ? g2 = this.width - g2 - m4 : this.textAlign === P || this.textAlign === co ? g2 = s4.left + i4 - d4 : this.textAlign !== M3 && this.textAlign !== uo || (g2 = s4.left + i4 - d4)), t4.fillRect(g2, s4.top + s4.topOffset + p2, m4, f2), s4.topOffset += o3;
    }
  }
  getCurrentCharFontSize() {
    const t4 = this._getCurrentCharIndex();
    return this.getValueOfPropertyAt(t4.l, t4.c, "fontSize");
  }
  getCurrentCharColor() {
    const t4 = this._getCurrentCharIndex();
    return this.getValueOfPropertyAt(t4.l, t4.c, "fill");
  }
  _getCurrentCharIndex() {
    const t4 = this.get2DCursorLocation(this.selectionStart, true), e3 = t4.charIndex > 0 ? t4.charIndex - 1 : 0;
    return { l: t4.lineIndex, c: e3 };
  }
  dispose() {
    this._exitEditing(), this.draggableTextDelegate.dispose(), super.dispose();
  }
}
s3(Ao, "ownDefaults", Eo), s3(Ao, "type", "IText"), I2.setClass(Ao), I2.setClass(Ao, "i-text");
class jo extends Ao {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), jo.ownDefaults);
  }
  constructor(t4, s4) {
    super(t4, e2(e2({}, jo.ownDefaults), s4));
  }
  static createControls() {
    return { controls: ai() };
  }
  initDimensions() {
    this.initialized && (this.isEditing && this.initDelayedCursor(), this._clearCache(), this.dynamicMinWidth = 0, this._styleMap = this._generateStyleMap(this._splitText()), this.dynamicMinWidth > this.width && this._set("width", this.dynamicMinWidth), this.textAlign.includes(ho) && this.enlargeSpaces(), this.height = this.calcTextHeight());
  }
  _generateStyleMap(t4) {
    let e3 = 0, s4 = 0, i3 = 0;
    const r2 = {};
    for (let n2 = 0; n2 < t4.graphemeLines.length; n2++)
      "\n" === t4.graphemeText[i3] && n2 > 0 ? (s4 = 0, i3++, e3++) : !this.splitByGrapheme && this._reSpaceAndTab.test(t4.graphemeText[i3]) && n2 > 0 && (s4++, i3++), r2[n2] = { line: e3, offset: s4 }, i3 += t4.graphemeLines[n2].length, s4 += t4.graphemeLines[n2].length;
    return r2;
  }
  styleHas(t4, e3) {
    if (this._styleMap && !this.isWrapping) {
      const t5 = this._styleMap[e3];
      t5 && (e3 = t5.line);
    }
    return super.styleHas(t4, e3);
  }
  isEmptyStyles(t4) {
    if (!this.styles)
      return true;
    let e3, s4 = 0, i3 = t4 + 1, r2 = false;
    const n2 = this._styleMap[t4], o2 = this._styleMap[t4 + 1];
    n2 && (t4 = n2.line, s4 = n2.offset), o2 && (i3 = o2.line, r2 = i3 === t4, e3 = o2.offset);
    const a4 = void 0 === t4 ? this.styles : { line: this.styles[t4] };
    for (const t5 in a4)
      for (const i4 in a4[t5]) {
        const n3 = parseInt(i4, 10);
        if (n3 >= s4 && (!r2 || n3 < e3))
          for (const e4 in a4[t5][i4])
            return false;
      }
    return true;
  }
  _getStyleDeclaration(t4, e3) {
    if (this._styleMap && !this.isWrapping) {
      const s4 = this._styleMap[t4];
      if (!s4)
        return {};
      t4 = s4.line, e3 = s4.offset + e3;
    }
    return super._getStyleDeclaration(t4, e3);
  }
  _setStyleDeclaration(t4, e3, s4) {
    const i3 = this._styleMap[t4];
    super._setStyleDeclaration(i3.line, i3.offset + e3, s4);
  }
  _deleteStyleDeclaration(t4, e3) {
    const s4 = this._styleMap[t4];
    super._deleteStyleDeclaration(s4.line, s4.offset + e3);
  }
  _getLineStyle(t4) {
    const e3 = this._styleMap[t4];
    return !!this.styles[e3.line];
  }
  _setLineStyle(t4) {
    const e3 = this._styleMap[t4];
    super._setLineStyle(e3.line);
  }
  _wrapText(t4, e3) {
    this.isWrapping = true;
    const s4 = this.getGraphemeDataForRender(t4), i3 = [];
    for (let t5 = 0; t5 < s4.wordsData.length; t5++)
      i3.push(...this._wrapLine(t5, e3, s4));
    return this.isWrapping = false, i3;
  }
  getGraphemeDataForRender(t4) {
    const e3 = this.splitByGrapheme, s4 = e3 ? "" : " ";
    let i3 = 0;
    return { wordsData: t4.map((t5, r2) => {
      let n2 = 0;
      const o2 = e3 ? this.graphemeSplit(t5) : this.wordSplit(t5);
      return 0 === o2.length ? [{ word: [], width: 0 }] : o2.map((t6) => {
        const o3 = e3 ? [t6] : this.graphemeSplit(t6), a4 = this._measureWord(o3, r2, n2);
        return i3 = Math.max(a4, i3), n2 += o3.length + s4.length, { word: o3, width: a4 };
      });
    }), largestWordWidth: i3 };
  }
  _measureWord(t4, e3) {
    let s4, i3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, r2 = 0;
    for (let n2 = 0, o2 = t4.length; n2 < o2; n2++) {
      r2 += this._getGraphemeBox(t4[n2], e3, n2 + i3, s4, true).kernedWidth, s4 = t4[n2];
    }
    return r2;
  }
  wordSplit(t4) {
    return t4.split(this._wordJoiners);
  }
  _wrapLine(t4, e3, s4) {
    let { largestWordWidth: i3, wordsData: r2 } = s4, n2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0;
    const o2 = this._getWidthOfCharSpacing(), a4 = this.splitByGrapheme, h4 = [], c3 = a4 ? "" : " ";
    let l2 = 0, u3 = [], d4 = 0, g2 = 0, f2 = true;
    e3 -= n2;
    const p2 = Math.max(e3, i3, this.dynamicMinWidth), m4 = r2[t4];
    let v2;
    for (d4 = 0, v2 = 0; v2 < m4.length; v2++) {
      const { word: e4, width: s5 } = m4[v2];
      d4 += e4.length, l2 += g2 + s5 - o2, l2 > p2 && !f2 ? (h4.push(u3), u3 = [], l2 = s5, f2 = true) : l2 += o2, f2 || a4 || u3.push(c3), u3 = u3.concat(e4), g2 = a4 ? 0 : this._measureWord([c3], t4, d4), d4++, f2 = false;
    }
    return v2 && h4.push(u3), i3 + n2 > this.dynamicMinWidth && (this.dynamicMinWidth = i3 - o2 + n2), h4;
  }
  isEndOfWrapping(t4) {
    return !this._styleMap[t4 + 1] || this._styleMap[t4 + 1].line !== this._styleMap[t4].line;
  }
  missingNewlineOffset(t4, e3) {
    return this.splitByGrapheme && !e3 ? this.isEndOfWrapping(t4) ? 1 : 0 : 1;
  }
  _splitTextIntoLines(t4) {
    const e3 = super._splitTextIntoLines(t4), s4 = this._wrapText(e3.lines, this.width), i3 = new Array(s4.length);
    for (let t5 = 0; t5 < s4.length; t5++)
      i3[t5] = s4[t5].join("");
    return e3.lines = i3, e3.graphemeLines = s4, e3;
  }
  getMinWidth() {
    return Math.max(this.minWidth, this.dynamicMinWidth);
  }
  _removeExtraneousStyles() {
    const t4 = /* @__PURE__ */ new Map();
    for (const e3 in this._styleMap) {
      const s4 = parseInt(e3, 10);
      if (this._textLines[s4]) {
        const s5 = this._styleMap[e3].line;
        t4.set("".concat(s5), true);
      }
    }
    for (const e3 in this.styles)
      t4.has(e3) || delete this.styles[e3];
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return super.toObject(["minWidth", "splitByGrapheme", ...t4]);
  }
}
s3(jo, "type", "Textbox"), s3(jo, "textLayoutProperties", [...Ao.textLayoutProperties, "width"]), s3(jo, "ownDefaults", { minWidth: 20, dynamicMinWidth: 2, lockScalingFlip: true, noScaleCache: false, _wordJoiners: /[ \t\r]/, splitByGrapheme: false }), I2.setClass(jo);
class Fo extends lr {
  shouldPerformLayout(t4) {
    return !!t4.target.clipPath && super.shouldPerformLayout(t4);
  }
  shouldLayoutClipPath() {
    return false;
  }
  calcLayoutResult(t4, e3) {
    const { target: s4 } = t4, { clipPath: i3 } = s4;
    if (!i3 || !this.shouldPerformLayout(t4))
      return;
    const { width: r2, height: n2 } = ie(cr(s4, i3)), o2 = new U(r2, n2);
    if (i3.absolutePositioned) {
      var a4;
      return { center: ue(i3.getRelativeCenterPoint(), void 0, null === (a4 = s4.group) || void 0 === a4 ? void 0 : a4.calcTransformMatrix()), size: o2 };
    }
    {
      const r3 = i3.getRelativeCenterPoint().transform(s4.calcOwnMatrix(), true);
      if (this.shouldPerformLayout(t4)) {
        const { center: s5 = new U(), correction: i4 = new U() } = this.calcBoundingBox(e3, t4) || {};
        return { center: s5.add(r3), correction: i4.subtract(r3), size: o2 };
      }
      return { center: s4.getRelativeCenterPoint().add(r3), size: o2 };
    }
  }
}
s3(Fo, "type", "clip-path"), I2.setClass(Fo);
class Lo extends lr {
  getInitialSize(t4, e3) {
    let { target: s4 } = t4, { size: i3 } = e3;
    return new U(s4.width || i3.x, s4.height || i3.y);
  }
}
s3(Lo, "type", "fixed"), I2.setClass(Lo);
class Ro extends pr {
  subscribeTargets(t4) {
    const e3 = t4.target;
    t4.targets.reduce((t5, e4) => (e4.parent && t5.add(e4.parent), t5), /* @__PURE__ */ new Set()).forEach((t5) => {
      t5.layoutManager.subscribeTargets({ target: t5, targets: [e3] });
    });
  }
  unsubscribeTargets(t4) {
    const e3 = t4.target, s4 = e3.getObjects();
    t4.targets.reduce((t5, e4) => (e4.parent && t5.add(e4.parent), t5), /* @__PURE__ */ new Set()).forEach((t5) => {
      !s4.some((e4) => e4.parent === t5) && t5.layoutManager.unsubscribeTargets({ target: t5, targets: [e3] });
    });
  }
}
const Bo = ["layoutManager"];
class Io extends yr {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), Io.ownDefaults);
  }
  constructor() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, { layoutManager: s4 } = e3, r2 = i2(e3, Bo);
    super(t4, { layoutManager: null != s4 ? s4 : new Ro() }), Object.assign(this, Io.ownDefaults), this.setOptions(r2);
  }
  _shouldSetNestedCoords() {
    return true;
  }
  __objectSelectionMonitor() {
  }
  multiSelectAdd() {
    for (var t4 = arguments.length, e3 = new Array(t4), s4 = 0; s4 < t4; s4++)
      e3[s4] = arguments[s4];
    "selection-order" === this.multiSelectionStacking ? this.add(...e3) : e3.forEach((t5) => {
      const e4 = this._objects.findIndex((e5) => e5.isInFrontOf(t5)), s5 = -1 === e4 ? this.size() : e4;
      this.insertAt(s5, t5);
    });
  }
  canEnterGroup(t4) {
    return this.getObjects().some((e3) => e3.isDescendantOf(t4) || t4.isDescendantOf(e3)) ? (h$1("error", "ActiveSelection: circular object trees are not supported, this call has no effect"), false) : super.canEnterGroup(t4);
  }
  enterGroup(t4, e3) {
    t4.parent && t4.parent === t4.group ? t4.parent._exitGroup(t4) : t4.group && t4.parent !== t4.group && t4.group.remove(t4), this._enterGroup(t4, e3);
  }
  exitGroup(t4, e3) {
    this._exitGroup(t4, e3), t4.parent && t4.parent._enterGroup(t4, true);
  }
  _onAfterObjectsChange(t4, e3) {
    super._onAfterObjectsChange(t4, e3);
    const s4 = /* @__PURE__ */ new Set();
    e3.forEach((t5) => {
      const { parent: e4 } = t5;
      e4 && s4.add(e4);
    }), t4 === ar ? s4.forEach((t5) => {
      t5._onAfterObjectsChange(or, e3);
    }) : s4.forEach((t5) => {
      t5._set("dirty", true);
    });
  }
  onDeselect() {
    return this.removeAll(), false;
  }
  toString() {
    return "#<ActiveSelection: (".concat(this.complexity(), ")>");
  }
  shouldCache() {
    return false;
  }
  isOnACache() {
    return false;
  }
  _renderControls(t4, s4, i3) {
    t4.save(), t4.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1, super._renderControls(t4, s4);
    const r2 = e2(e2({ hasControls: false }, i3), {}, { forActiveSelection: true });
    for (let e3 = 0; e3 < this._objects.length; e3++)
      this._objects[e3]._renderControls(t4, r2);
    t4.restore();
  }
}
s3(Io, "type", "ActiveSelection"), s3(Io, "ownDefaults", { multiSelectionStacking: "canvas-stacking" }), I2.setClass(Io), I2.setClass(Io, "activeSelection");
class Xo {
  constructor() {
    s3(this, "resources", {});
  }
  applyFilters(t4, e3, s4, i3, r2) {
    const n2 = r2.getContext("2d");
    if (!n2)
      return;
    n2.drawImage(e3, 0, 0, s4, i3);
    const o2 = { sourceWidth: s4, sourceHeight: i3, imageData: n2.getImageData(0, 0, s4, i3), originalEl: e3, originalImageData: n2.getImageData(0, 0, s4, i3), canvasEl: r2, ctx: n2, filterBackend: this };
    t4.forEach((t5) => {
      t5.applyTo(o2);
    });
    const { imageData: a4 } = o2;
    return a4.width === s4 && a4.height === i3 || (r2.width = a4.width, r2.height = a4.height), n2.putImageData(a4, 0, 0), o2;
  }
}
class Yo {
  constructor() {
    let { tileSize: t4 = a3.textureSize } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    s3(this, "aPosition", new Float32Array([0, 0, 0, 1, 1, 0, 1, 1])), s3(this, "resources", {}), this.tileSize = t4, this.setupGLContext(t4, t4), this.captureGPUInfo();
  }
  setupGLContext(t4, e3) {
    this.dispose(), this.createWebGLCanvas(t4, e3);
  }
  createWebGLCanvas(t4, e3) {
    const s4 = et$1();
    s4.width = t4, s4.height = e3;
    const i3 = s4.getContext("webgl", { alpha: true, premultipliedAlpha: false, depth: false, stencil: false, antialias: false });
    i3 && (i3.clearColor(0, 0, 0, 0), this.canvas = s4, this.gl = i3);
  }
  applyFilters(t4, e3, s4, i3, r2, n2) {
    const o2 = this.gl, a4 = r2.getContext("2d");
    if (!o2 || !a4)
      return;
    let h4;
    n2 && (h4 = this.getCachedTexture(n2, e3));
    const c3 = { originalWidth: e3.width || e3.originalWidth || 0, originalHeight: e3.height || e3.originalHeight || 0, sourceWidth: s4, sourceHeight: i3, destinationWidth: s4, destinationHeight: i3, context: o2, sourceTexture: this.createTexture(o2, s4, i3, h4 ? void 0 : e3), targetTexture: this.createTexture(o2, s4, i3), originalTexture: h4 || this.createTexture(o2, s4, i3, h4 ? void 0 : e3), passes: t4.length, webgl: true, aPosition: this.aPosition, programCache: this.programCache, pass: 0, filterBackend: this, targetCanvas: r2 }, l2 = o2.createFramebuffer();
    return o2.bindFramebuffer(o2.FRAMEBUFFER, l2), t4.forEach((t5) => {
      t5 && t5.applyTo(c3);
    }), function(t5) {
      const e4 = t5.targetCanvas, s5 = e4.width, i4 = e4.height, r3 = t5.destinationWidth, n3 = t5.destinationHeight;
      s5 === r3 && i4 === n3 || (e4.width = r3, e4.height = n3);
    }(c3), this.copyGLTo2D(o2, c3), o2.bindTexture(o2.TEXTURE_2D, null), o2.deleteTexture(c3.sourceTexture), o2.deleteTexture(c3.targetTexture), o2.deleteFramebuffer(l2), a4.setTransform(1, 0, 0, 1, 0, 0), c3;
  }
  dispose() {
    this.canvas && (this.canvas = null, this.gl = null), this.clearWebGLCaches();
  }
  clearWebGLCaches() {
    this.programCache = {}, this.textureCache = {};
  }
  createTexture(t4, e3, s4, i3, r2) {
    const { NEAREST: n2, TEXTURE_2D: o2, RGBA: a4, UNSIGNED_BYTE: h4, CLAMP_TO_EDGE: c3, TEXTURE_MAG_FILTER: l2, TEXTURE_MIN_FILTER: u3, TEXTURE_WRAP_S: d4, TEXTURE_WRAP_T: g2 } = t4, f2 = t4.createTexture();
    return t4.bindTexture(o2, f2), t4.texParameteri(o2, l2, r2 || n2), t4.texParameteri(o2, u3, r2 || n2), t4.texParameteri(o2, d4, c3), t4.texParameteri(o2, g2, c3), i3 ? t4.texImage2D(o2, 0, a4, a4, h4, i3) : t4.texImage2D(o2, 0, a4, e3, s4, 0, a4, h4, null), f2;
  }
  getCachedTexture(t4, e3, s4) {
    const { textureCache: i3 } = this;
    if (i3[t4])
      return i3[t4];
    {
      const r2 = this.createTexture(this.gl, e3.width, e3.height, e3, s4);
      return r2 && (i3[t4] = r2), r2;
    }
  }
  evictCachesForKey(t4) {
    this.textureCache[t4] && (this.gl.deleteTexture(this.textureCache[t4]), delete this.textureCache[t4]);
  }
  copyGLTo2D(t4, e3) {
    const s4 = t4.canvas, i3 = e3.targetCanvas, r2 = i3.getContext("2d");
    if (!r2)
      return;
    r2.translate(0, i3.height), r2.scale(1, -1);
    const n2 = s4.height - i3.height;
    r2.drawImage(s4, 0, n2, i3.width, i3.height, 0, 0, i3.width, i3.height);
  }
  copyGLTo2DPutImageData(t4, e3) {
    const s4 = e3.targetCanvas.getContext("2d"), i3 = e3.destinationWidth, r2 = e3.destinationHeight, n2 = i3 * r2 * 4;
    if (!s4)
      return;
    const o2 = new Uint8Array(this.imageBuffer, 0, n2), a4 = new Uint8ClampedArray(this.imageBuffer, 0, n2);
    t4.readPixels(0, 0, i3, r2, t4.RGBA, t4.UNSIGNED_BYTE, o2);
    const h4 = new ImageData(a4, i3, r2);
    s4.putImageData(h4, 0, 0);
  }
  captureGPUInfo() {
    if (this.gpuInfo)
      return this.gpuInfo;
    const t4 = this.gl, e3 = { renderer: "", vendor: "" };
    if (!t4)
      return e3;
    const s4 = t4.getExtension("WEBGL_debug_renderer_info");
    if (s4) {
      const i3 = t4.getParameter(s4.UNMASKED_RENDERER_WEBGL), r2 = t4.getParameter(s4.UNMASKED_VENDOR_WEBGL);
      i3 && (e3.renderer = i3.toLowerCase()), r2 && (e3.vendor = r2.toLowerCase());
    }
    return this.gpuInfo = e3, e3;
  }
}
let Wo;
function Vo() {
  const { WebGLProbe: t4 } = m3();
  return t4.queryWebGL(et$1()), a3.enableGLFiltering && t4.isSupported(a3.textureSize) ? new Yo({ tileSize: a3.textureSize }) : new Xo();
}
function zo() {
  return !Wo && (!(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0]) && (Wo = Vo()), Wo;
}
const Go = ["filters", "resizeFilter", "src", "crossOrigin", "type"], Uo = ["cropX", "cropY"];
class No extends li {
  static getDefaults() {
    return e2(e2({}, super.getDefaults()), No.ownDefaults);
  }
  constructor(t4, e3) {
    super(), s3(this, "_lastScaleX", 1), s3(this, "_lastScaleY", 1), s3(this, "_filterScalingX", 1), s3(this, "_filterScalingY", 1), this.filters = [], Object.assign(this, No.ownDefaults), this.setOptions(e3), this.cacheKey = "texture".concat(tt$1()), this.setElement("string" == typeof t4 ? (this.canvas && Ht(this.canvas.getElement()) || v$1()).getElementById(t4) : t4, e3);
  }
  getElement() {
    return this._element;
  }
  setElement(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    this.removeTexture(this.cacheKey), this.removeTexture("".concat(this.cacheKey, "_filtered")), this._element = t4, this._originalElement = t4, this._setWidthHeight(e3), t4.classList.add(No.CSS_CANVAS), 0 !== this.filters.length && this.applyFilters(), this.resizeFilter && this.applyResizeFilters();
  }
  removeTexture(t4) {
    const e3 = zo(false);
    e3 instanceof Yo && e3.evictCachesForKey(t4);
  }
  dispose() {
    super.dispose(), this.removeTexture(this.cacheKey), this.removeTexture("".concat(this.cacheKey, "_filtered")), this._cacheContext = null, ["_originalElement", "_element", "_filteredEl", "_cacheCanvas"].forEach((t4) => {
      const e3 = this[t4];
      e3 && m3().dispose(e3), this[t4] = void 0;
    });
  }
  getCrossOrigin() {
    return this._originalElement && (this._originalElement.crossOrigin || null);
  }
  getOriginalSize() {
    const t4 = this.getElement();
    return t4 ? { width: t4.naturalWidth || t4.width, height: t4.naturalHeight || t4.height } : { width: 0, height: 0 };
  }
  _stroke(t4) {
    if (!this.stroke || 0 === this.strokeWidth)
      return;
    const e3 = this.width / 2, s4 = this.height / 2;
    t4.beginPath(), t4.moveTo(-e3, -s4), t4.lineTo(e3, -s4), t4.lineTo(e3, s4), t4.lineTo(-e3, s4), t4.lineTo(-e3, -s4), t4.closePath();
  }
  toObject() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    const s4 = [];
    return this.filters.forEach((t5) => {
      t5 && s4.push(t5.toObject());
    }), e2(e2({}, super.toObject([...Uo, ...t4])), {}, { src: this.getSrc(), crossOrigin: this.getCrossOrigin(), filters: s4 }, this.resizeFilter ? { resizeFilter: this.resizeFilter.toObject() } : {});
  }
  hasCrop() {
    return !!this.cropX || !!this.cropY || this.width < this._element.width || this.height < this._element.height;
  }
  _toSVG() {
    const t4 = [], e3 = this._element, s4 = -this.width / 2, i3 = -this.height / 2;
    let r2 = [], n2 = [], o2 = "", a4 = "";
    if (!e3)
      return [];
    if (this.hasCrop()) {
      const t5 = tt$1();
      r2.push('<clipPath id="imageCrop_' + t5 + '">\n', '	<rect x="' + s4 + '" y="' + i3 + '" width="' + this.width + '" height="' + this.height + '" />\n', "</clipPath>\n"), o2 = ' clip-path="url(#imageCrop_' + t5 + ')" ';
    }
    if (this.imageSmoothing || (a4 = ' image-rendering="optimizeSpeed"'), t4.push("	<image ", "COMMON_PARTS", 'xlink:href="'.concat(this.getSvgSrc(true), '" x="').concat(s4 - this.cropX, '" y="').concat(i3 - this.cropY, '" width="').concat(e3.width || e3.naturalWidth, '" height="').concat(e3.height || e3.naturalHeight, '"').concat(a4).concat(o2, "></image>\n")), this.stroke || this.strokeDashArray) {
      const t5 = this.fill;
      this.fill = null, n2 = ['	<rect x="'.concat(s4, '" y="').concat(i3, '" width="').concat(this.width, '" height="').concat(this.height, '" style="').concat(this.getSvgStyles(), '" />\n')], this.fill = t5;
    }
    return r2 = "fill" !== this.paintFirst ? r2.concat(n2, t4) : r2.concat(t4, n2), r2;
  }
  getSrc(t4) {
    const e3 = t4 ? this._element : this._originalElement;
    return e3 ? e3.toDataURL ? e3.toDataURL() : this.srcFromAttribute ? e3.getAttribute("src") || "" : e3.src : this.src || "";
  }
  getSvgSrc(t4) {
    return this.getSrc(t4);
  }
  setSrc(t4) {
    let { crossOrigin: e3, signal: s4 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return Ct(t4, { crossOrigin: e3, signal: s4 }).then((t5) => {
      void 0 !== e3 && this.set({ crossOrigin: e3 }), this.setElement(t5);
    });
  }
  toString() {
    return '#<Image: { src: "'.concat(this.getSrc(), '" }>');
  }
  applyResizeFilters() {
    const t4 = this.resizeFilter, e3 = this.minimumScaleTrigger, s4 = this.getTotalObjectScaling(), i3 = s4.x, r2 = s4.y, n2 = this._filteredEl || this._originalElement;
    if (this.group && this.set("dirty", true), !t4 || i3 > e3 && r2 > e3)
      return this._element = n2, this._filterScalingX = 1, this._filterScalingY = 1, this._lastScaleX = i3, void (this._lastScaleY = r2);
    const o2 = et$1(), a4 = n2.width, h4 = n2.height;
    o2.width = a4, o2.height = h4, this._element = o2, this._lastScaleX = t4.scaleX = i3, this._lastScaleY = t4.scaleY = r2, zo().applyFilters([t4], n2, a4, h4, this._element), this._filterScalingX = o2.width / this._originalElement.width, this._filterScalingY = o2.height / this._originalElement.height;
  }
  applyFilters() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.filters || [];
    if (t4 = t4.filter((t5) => t5 && !t5.isNeutralState()), this.set("dirty", true), this.removeTexture("".concat(this.cacheKey, "_filtered")), 0 === t4.length)
      return this._element = this._originalElement, this._filteredEl = void 0, this._filterScalingX = 1, void (this._filterScalingY = 1);
    const e3 = this._originalElement, s4 = e3.naturalWidth || e3.width, i3 = e3.naturalHeight || e3.height;
    if (this._element === this._originalElement) {
      const t5 = et$1();
      t5.width = s4, t5.height = i3, this._element = t5, this._filteredEl = t5;
    } else
      this._filteredEl && (this._element = this._filteredEl, this._filteredEl.getContext("2d").clearRect(0, 0, s4, i3), this._lastScaleX = 1, this._lastScaleY = 1);
    zo().applyFilters(t4, this._originalElement, s4, i3, this._element), this._originalElement.width === this._element.width && this._originalElement.height === this._element.height || (this._filterScalingX = this._element.width / this._originalElement.width, this._filterScalingY = this._element.height / this._originalElement.height);
  }
  _render(t4) {
    t4.imageSmoothingEnabled = this.imageSmoothing, true !== this.isMoving && this.resizeFilter && this._needsResize() && this.applyResizeFilters(), this._stroke(t4), this._renderPaintInOrder(t4);
  }
  drawCacheOnCanvas(t4) {
    t4.imageSmoothingEnabled = this.imageSmoothing, super.drawCacheOnCanvas(t4);
  }
  shouldCache() {
    return this.needsItsOwnCache();
  }
  _renderFill(t4) {
    const e3 = this._element;
    if (!e3)
      return;
    const s4 = this._filterScalingX, i3 = this._filterScalingY, r2 = this.width, n2 = this.height, o2 = Math.max(this.cropX, 0), a4 = Math.max(this.cropY, 0), h4 = e3.naturalWidth || e3.width, c3 = e3.naturalHeight || e3.height, l2 = o2 * s4, u3 = a4 * i3, d4 = Math.min(r2 * s4, h4 - l2), g2 = Math.min(n2 * i3, c3 - u3), f2 = -r2 / 2, p2 = -n2 / 2, m4 = Math.min(r2, h4 / s4 - o2), v2 = Math.min(n2, c3 / i3 - a4);
    e3 && t4.drawImage(e3, l2, u3, d4, g2, f2, p2, m4, v2);
  }
  _needsResize() {
    const t4 = this.getTotalObjectScaling();
    return t4.x !== this._lastScaleX || t4.y !== this._lastScaleY;
  }
  _resetWidthHeight() {
    this.set(this.getOriginalSize());
  }
  _setWidthHeight() {
    let { width: t4, height: e3 } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    const s4 = this.getOriginalSize();
    this.width = t4 || s4.width, this.height = e3 || s4.height;
  }
  parsePreserveAspectRatioAttribute() {
    const t4 = Lt$1(this.preserveAspectRatio || ""), e3 = this.width, s4 = this.height, i3 = { width: e3, height: s4 };
    let r2, n2 = this._element.width, o2 = this._element.height, a4 = 1, h4 = 1, c3 = 0, l2 = 0, u3 = 0, d4 = 0;
    return !t4 || t4.alignX === F && t4.alignY === F ? (a4 = e3 / n2, h4 = s4 / o2) : ("meet" === t4.meetOrSlice && (a4 = h4 = _r(this._element, i3), r2 = (e3 - n2 * a4) / 2, "Min" === t4.alignX && (c3 = -r2), "Max" === t4.alignX && (c3 = r2), r2 = (s4 - o2 * h4) / 2, "Min" === t4.alignY && (l2 = -r2), "Max" === t4.alignY && (l2 = r2)), "slice" === t4.meetOrSlice && (a4 = h4 = xr(this._element, i3), r2 = n2 - e3 / a4, "Mid" === t4.alignX && (u3 = r2 / 2), "Max" === t4.alignX && (u3 = r2), r2 = o2 - s4 / h4, "Mid" === t4.alignY && (d4 = r2 / 2), "Max" === t4.alignY && (d4 = r2), n2 = e3 / a4, o2 = s4 / h4)), { width: n2, height: o2, scaleX: a4, scaleY: h4, offsetLeft: c3, offsetTop: l2, cropX: u3, cropY: d4 };
  }
  static fromObject(t4, s4) {
    let { filters: r2, resizeFilter: n2, src: o2, crossOrigin: a4, type: h4 } = t4, c3 = i2(t4, Go);
    return Promise.all([Ct(o2, e2(e2({}, s4), {}, { crossOrigin: a4 })), r2 && bt$1(r2, s4), n2 && bt$1([n2], s4), wt(c3, s4)]).then((t5) => {
      let [s5, i3 = [], [r3] = [], n3 = {}] = t5;
      return new this(s5, e2(e2({}, c3), {}, { src: o2, filters: i3, resizeFilter: r3 }, n3));
    });
  }
  static fromURL(t4) {
    let { crossOrigin: e3 = null, signal: s4 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, i3 = arguments.length > 2 ? arguments[2] : void 0;
    return Ct(t4, { crossOrigin: e3, signal: s4 }).then((t5) => new this(t5, i3));
  }
  static async fromElement(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, s4 = arguments.length > 2 ? arguments[2] : void 0;
    const i3 = er(t4, this.ATTRIBUTE_NAMES, s4);
    return this.fromURL(i3["xlink:href"], e3, i3).catch((t5) => (h$1("log", "Unable to parse Image", t5), null));
  }
}
s3(No, "type", "Image"), s3(No, "cacheProperties", [...Os, ...Uo]), s3(No, "ownDefaults", { strokeWidth: 0, srcFromAttribute: false, minimumScaleTrigger: 0.5, cropX: 0, cropY: 0, imageSmoothing: true }), s3(No, "CSS_CANVAS", "canvas-img"), s3(No, "ATTRIBUTE_NAMES", [...Si, "x", "y", "width", "height", "preserveAspectRatio", "xlink:href", "crossOrigin", "image-rendering"]), I2.setClass(No), I2.setSVGClass(No);
hs(["pattern", "defs", "symbol", "metadata", "clipPath", "mask", "desc"]);
const ma = (t4) => void 0 !== t4.webgl, ya = "precision highp float", _a = "\n    ".concat(ya, ";\n    varying vec2 vTexCoord;\n    uniform sampler2D uTexture;\n    void main() {\n      gl_FragColor = texture2D(uTexture, vTexCoord);\n    }"), xa = ["type"], Ca = ["type"], ba = new RegExp(ya, "g");
class wa {
  get type() {
    return this.constructor.type;
  }
  constructor() {
    let t4 = i2(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, xa);
    s3(this, "vertexSource", "\n    attribute vec2 aPosition;\n    varying vec2 vTexCoord;\n    void main() {\n      vTexCoord = aPosition;\n      gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);\n    }"), Object.assign(this, this.constructor.defaults, t4);
  }
  getFragmentSource() {
    return _a;
  }
  createProgram(t4) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.getFragmentSource(), s4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.vertexSource;
    const { WebGLProbe: { GLPrecision: i3 = "highp" } } = m3();
    "highp" !== i3 && (e3 = e3.replace(ba, ya.replace("highp", i3)));
    const r2 = t4.createShader(t4.VERTEX_SHADER), n2 = t4.createShader(t4.FRAGMENT_SHADER), o2 = t4.createProgram();
    if (!r2 || !n2 || !o2)
      throw new c2("Vertex, fragment shader or program creation error");
    if (t4.shaderSource(r2, s4), t4.compileShader(r2), !t4.getShaderParameter(r2, t4.COMPILE_STATUS))
      throw new c2("Vertex shader compile error for ".concat(this.type, ": ").concat(t4.getShaderInfoLog(r2)));
    if (t4.shaderSource(n2, e3), t4.compileShader(n2), !t4.getShaderParameter(n2, t4.COMPILE_STATUS))
      throw new c2("Fragment shader compile error for ".concat(this.type, ": ").concat(t4.getShaderInfoLog(n2)));
    if (t4.attachShader(o2, r2), t4.attachShader(o2, n2), t4.linkProgram(o2), !t4.getProgramParameter(o2, t4.LINK_STATUS))
      throw new c2('Shader link error for "'.concat(this.type, '" ').concat(t4.getProgramInfoLog(o2)));
    const a4 = this.getUniformLocations(t4, o2) || {};
    return a4.uStepW = t4.getUniformLocation(o2, "uStepW"), a4.uStepH = t4.getUniformLocation(o2, "uStepH"), { program: o2, attributeLocations: this.getAttributeLocations(t4, o2), uniformLocations: a4 };
  }
  getAttributeLocations(t4, e3) {
    return { aPosition: t4.getAttribLocation(e3, "aPosition") };
  }
  getUniformLocations(t4, e3) {
    return {};
  }
  sendAttributeData(t4, e3, s4) {
    const i3 = e3.aPosition, r2 = t4.createBuffer();
    t4.bindBuffer(t4.ARRAY_BUFFER, r2), t4.enableVertexAttribArray(i3), t4.vertexAttribPointer(i3, 2, t4.FLOAT, false, 0, 0), t4.bufferData(t4.ARRAY_BUFFER, s4, t4.STATIC_DRAW);
  }
  _setupFrameBuffer(t4) {
    const e3 = t4.context;
    if (t4.passes > 1) {
      const s4 = t4.destinationWidth, i3 = t4.destinationHeight;
      t4.sourceWidth === s4 && t4.sourceHeight === i3 || (e3.deleteTexture(t4.targetTexture), t4.targetTexture = t4.filterBackend.createTexture(e3, s4, i3)), e3.framebufferTexture2D(e3.FRAMEBUFFER, e3.COLOR_ATTACHMENT0, e3.TEXTURE_2D, t4.targetTexture, 0);
    } else
      e3.bindFramebuffer(e3.FRAMEBUFFER, null), e3.finish();
  }
  _swapTextures(t4) {
    t4.passes--, t4.pass++;
    const e3 = t4.targetTexture;
    t4.targetTexture = t4.sourceTexture, t4.sourceTexture = e3;
  }
  isNeutralState(t4) {
    const e3 = this.mainParameter, s4 = this.constructor.defaults[e3];
    if (e3) {
      const t5 = this[e3];
      return Array.isArray(s4) && Array.isArray(t5) ? s4.every((e4, s5) => e4 === t5[s5]) : s4 === t5;
    }
    return false;
  }
  applyTo(t4) {
    ma(t4) ? (this._setupFrameBuffer(t4), this.applyToWebGL(t4), this._swapTextures(t4)) : this.applyTo2d(t4);
  }
  applyTo2d(t4) {
  }
  getCacheKey() {
    return this.type;
  }
  retrieveShader(t4) {
    const e3 = this.getCacheKey();
    return t4.programCache[e3] || (t4.programCache[e3] = this.createProgram(t4.context)), t4.programCache[e3];
  }
  applyToWebGL(t4) {
    const e3 = t4.context, s4 = this.retrieveShader(t4);
    0 === t4.pass && t4.originalTexture ? e3.bindTexture(e3.TEXTURE_2D, t4.originalTexture) : e3.bindTexture(e3.TEXTURE_2D, t4.sourceTexture), e3.useProgram(s4.program), this.sendAttributeData(e3, s4.attributeLocations, t4.aPosition), e3.uniform1f(s4.uniformLocations.uStepW, 1 / t4.sourceWidth), e3.uniform1f(s4.uniformLocations.uStepH, 1 / t4.sourceHeight), this.sendUniformData(e3, s4.uniformLocations), e3.viewport(0, 0, t4.destinationWidth, t4.destinationHeight), e3.drawArrays(e3.TRIANGLE_STRIP, 0, 4);
  }
  bindAdditionalTexture(t4, e3, s4) {
    t4.activeTexture(s4), t4.bindTexture(t4.TEXTURE_2D, e3), t4.activeTexture(t4.TEXTURE0);
  }
  unbindAdditionalTexture(t4, e3) {
    t4.activeTexture(e3), t4.bindTexture(t4.TEXTURE_2D, null), t4.activeTexture(t4.TEXTURE0);
  }
  getMainParameter() {
    return this.mainParameter ? this[this.mainParameter] : void 0;
  }
  setMainParameter(t4) {
    this.mainParameter && (this[this.mainParameter] = t4);
  }
  sendUniformData(t4, e3) {
  }
  createHelpLayer(t4) {
    if (!t4.helpLayer) {
      const e3 = et$1();
      e3.width = t4.sourceWidth, e3.height = t4.sourceHeight, t4.helpLayer = e3;
    }
  }
  toObject() {
    const t4 = this.mainParameter;
    return e2({ type: this.type }, t4 ? { [t4]: this[t4] } : {});
  }
  toJSON() {
    return this.toObject();
  }
  static async fromObject(t4, e3) {
    return new this(i2(t4, Ca));
  }
}
s3(wa, "type", "BaseFilter");
const Sa = { multiply: "gl_FragColor.rgb *= uColor.rgb;\n", screen: "gl_FragColor.rgb = 1.0 - (1.0 - gl_FragColor.rgb) * (1.0 - uColor.rgb);\n", add: "gl_FragColor.rgb += uColor.rgb;\n", difference: "gl_FragColor.rgb = abs(gl_FragColor.rgb - uColor.rgb);\n", subtract: "gl_FragColor.rgb -= uColor.rgb;\n", lighten: "gl_FragColor.rgb = max(gl_FragColor.rgb, uColor.rgb);\n", darken: "gl_FragColor.rgb = min(gl_FragColor.rgb, uColor.rgb);\n", exclusion: "gl_FragColor.rgb += uColor.rgb - 2.0 * (uColor.rgb * gl_FragColor.rgb);\n", overlay: "\n    if (uColor.r < 0.5) {\n      gl_FragColor.r *= 2.0 * uColor.r;\n    } else {\n      gl_FragColor.r = 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - uColor.r);\n    }\n    if (uColor.g < 0.5) {\n      gl_FragColor.g *= 2.0 * uColor.g;\n    } else {\n      gl_FragColor.g = 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - uColor.g);\n    }\n    if (uColor.b < 0.5) {\n      gl_FragColor.b *= 2.0 * uColor.b;\n    } else {\n      gl_FragColor.b = 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - uColor.b);\n    }\n    ", tint: "\n    gl_FragColor.rgb *= (1.0 - uColor.a);\n    gl_FragColor.rgb += uColor.rgb;\n    " };
class Ta extends wa {
  getCacheKey() {
    return "".concat(this.type, "_").concat(this.mode);
  }
  getFragmentSource() {
    return "\n      precision highp float;\n      uniform sampler2D uTexture;\n      uniform vec4 uColor;\n      varying vec2 vTexCoord;\n      void main() {\n        vec4 color = texture2D(uTexture, vTexCoord);\n        gl_FragColor = color;\n        if (color.a > 0.0) {\n          ".concat(Sa[this.mode], "\n        }\n      }\n      ");
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    const s4 = new At(this.color).getSource(), i3 = s4[0] * this.alpha, r2 = s4[1] * this.alpha, n2 = s4[2] * this.alpha, o2 = 1 - this.alpha;
    for (let t5 = 0; t5 < e3.length; t5 += 4) {
      const s5 = e3[t5], a4 = e3[t5 + 1], h4 = e3[t5 + 2];
      switch (this.mode) {
        case "multiply":
          e3[t5] = s5 * i3 / 255, e3[t5 + 1] = a4 * r2 / 255, e3[t5 + 2] = h4 * n2 / 255;
          break;
        case "screen":
          e3[t5] = 255 - (255 - s5) * (255 - i3) / 255, e3[t5 + 1] = 255 - (255 - a4) * (255 - r2) / 255, e3[t5 + 2] = 255 - (255 - h4) * (255 - n2) / 255;
          break;
        case "add":
          e3[t5] = s5 + i3, e3[t5 + 1] = a4 + r2, e3[t5 + 2] = h4 + n2;
          break;
        case "difference":
          e3[t5] = Math.abs(s5 - i3), e3[t5 + 1] = Math.abs(a4 - r2), e3[t5 + 2] = Math.abs(h4 - n2);
          break;
        case "subtract":
          e3[t5] = s5 - i3, e3[t5 + 1] = a4 - r2, e3[t5 + 2] = h4 - n2;
          break;
        case "darken":
          e3[t5] = Math.min(s5, i3), e3[t5 + 1] = Math.min(a4, r2), e3[t5 + 2] = Math.min(h4, n2);
          break;
        case "lighten":
          e3[t5] = Math.max(s5, i3), e3[t5 + 1] = Math.max(a4, r2), e3[t5 + 2] = Math.max(h4, n2);
          break;
        case "overlay":
          e3[t5] = i3 < 128 ? 2 * s5 * i3 / 255 : 255 - 2 * (255 - s5) * (255 - i3) / 255, e3[t5 + 1] = r2 < 128 ? 2 * a4 * r2 / 255 : 255 - 2 * (255 - a4) * (255 - r2) / 255, e3[t5 + 2] = n2 < 128 ? 2 * h4 * n2 / 255 : 255 - 2 * (255 - h4) * (255 - n2) / 255;
          break;
        case "exclusion":
          e3[t5] = i3 + s5 - 2 * i3 * s5 / 255, e3[t5 + 1] = r2 + a4 - 2 * r2 * a4 / 255, e3[t5 + 2] = n2 + h4 - 2 * n2 * h4 / 255;
          break;
        case "tint":
          e3[t5] = i3 + s5 * o2, e3[t5 + 1] = r2 + a4 * o2, e3[t5 + 2] = n2 + h4 * o2;
      }
    }
  }
  getUniformLocations(t4, e3) {
    return { uColor: t4.getUniformLocation(e3, "uColor") };
  }
  sendUniformData(t4, e3) {
    const s4 = new At(this.color).getSource();
    s4[0] = this.alpha * s4[0] / 255, s4[1] = this.alpha * s4[1] / 255, s4[2] = this.alpha * s4[2] / 255, s4[3] = this.alpha, t4.uniform4fv(e3.uColor, s4);
  }
  toObject() {
    return { type: this.type, color: this.color, mode: this.mode, alpha: this.alpha };
  }
}
s3(Ta, "defaults", { color: "#F95C63", mode: "multiply", alpha: 1 }), s3(Ta, "type", "BlendColor"), I2.setClass(Ta);
const Oa = { multiply: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform sampler2D uImage;\n    uniform vec4 uColor;\n    varying vec2 vTexCoord;\n    varying vec2 vTexCoord2;\n    void main() {\n      vec4 color = texture2D(uTexture, vTexCoord);\n      vec4 color2 = texture2D(uImage, vTexCoord2);\n      color.rgba *= color2.rgba;\n      gl_FragColor = color;\n    }\n    ", mask: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform sampler2D uImage;\n    uniform vec4 uColor;\n    varying vec2 vTexCoord;\n    varying vec2 vTexCoord2;\n    void main() {\n      vec4 color = texture2D(uTexture, vTexCoord);\n      vec4 color2 = texture2D(uImage, vTexCoord2);\n      color.a = color2.a;\n      gl_FragColor = color;\n    }\n    " }, ka = ["type", "image"];
class Da extends wa {
  getCacheKey() {
    return "".concat(this.type, "_").concat(this.mode);
  }
  getFragmentSource() {
    return Oa[this.mode];
  }
  applyToWebGL(t4) {
    const e3 = t4.context, s4 = this.createTexture(t4.filterBackend, this.image);
    this.bindAdditionalTexture(e3, s4, e3.TEXTURE1), super.applyToWebGL(t4), this.unbindAdditionalTexture(e3, e3.TEXTURE1);
  }
  createTexture(t4, e3) {
    return t4.getCachedTexture(e3.cacheKey, e3.getElement());
  }
  calculateMatrix() {
    const t4 = this.image, { width: e3, height: s4 } = t4.getElement();
    return [1 / t4.scaleX, 0, 0, 0, 1 / t4.scaleY, 0, -t4.left / e3, -t4.top / s4, 1];
  }
  applyTo2d(t4) {
    let { imageData: { data: e3, width: s4, height: i3 }, filterBackend: { resources: r2 } } = t4;
    const n2 = this.image;
    r2.blendImage || (r2.blendImage = et$1());
    const o2 = r2.blendImage, a4 = o2.getContext("2d");
    o2.width !== s4 || o2.height !== i3 ? (o2.width = s4, o2.height = i3) : a4.clearRect(0, 0, s4, i3), a4.setTransform(n2.scaleX, 0, 0, n2.scaleY, n2.left, n2.top), a4.drawImage(n2.getElement(), 0, 0, s4, i3);
    const h4 = a4.getImageData(0, 0, s4, i3).data;
    for (let t5 = 0; t5 < e3.length; t5 += 4) {
      const s5 = e3[t5], i4 = e3[t5 + 1], r3 = e3[t5 + 2], n3 = e3[t5 + 3], o3 = h4[t5], a5 = h4[t5 + 1], c3 = h4[t5 + 2], l2 = h4[t5 + 3];
      switch (this.mode) {
        case "multiply":
          e3[t5] = s5 * o3 / 255, e3[t5 + 1] = i4 * a5 / 255, e3[t5 + 2] = r3 * c3 / 255, e3[t5 + 3] = n3 * l2 / 255;
          break;
        case "mask":
          e3[t5 + 3] = l2;
      }
    }
  }
  getUniformLocations(t4, e3) {
    return { uTransformMatrix: t4.getUniformLocation(e3, "uTransformMatrix"), uImage: t4.getUniformLocation(e3, "uImage") };
  }
  sendUniformData(t4, e3) {
    const s4 = this.calculateMatrix();
    t4.uniform1i(e3.uImage, 1), t4.uniformMatrix3fv(e3.uTransformMatrix, false, s4);
  }
  toObject() {
    return { type: this.type, image: this.image && this.image.toObject(), mode: this.mode, alpha: this.alpha };
  }
  static fromObject(t4, s4) {
    let { type: r2, image: n2 } = t4, o2 = i2(t4, ka);
    return No.fromObject(n2, s4).then((t5) => new this(e2(e2({}, o2), {}, { image: t5 })));
  }
}
s3(Da, "type", "BlendImage"), s3(Da, "defaults", { mode: "multiply", alpha: 1, vertexSource: "\n    attribute vec2 aPosition;\n    varying vec2 vTexCoord;\n    varying vec2 vTexCoord2;\n    uniform mat3 uTransformMatrix;\n    void main() {\n      vTexCoord = aPosition;\n      vTexCoord2 = (uTransformMatrix * vec3(aPosition, 1.0)).xy;\n      gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);\n    }\n    " }), I2.setClass(Da);
class Ma extends wa {
  getFragmentSource() {
    return "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform vec2 uDelta;\n    varying vec2 vTexCoord;\n    const float nSamples = 15.0;\n    vec3 v3offset = vec3(12.9898, 78.233, 151.7182);\n    float random(vec3 scale) {\n      /* use the fragment position for a different seed per-pixel */\n      return fract(sin(dot(gl_FragCoord.xyz, scale)) * 43758.5453);\n    }\n    void main() {\n      vec4 color = vec4(0.0);\n      float total = 0.0;\n      float offset = random(v3offset);\n      for (float t = -nSamples; t <= nSamples; t++) {\n        float percent = (t + offset - 0.5) / nSamples;\n        float weight = 1.0 - abs(percent);\n        color += texture2D(uTexture, vTexCoord + uDelta * percent) * weight;\n        total += weight;\n      }\n      gl_FragColor = color / total;\n    }\n  ";
  }
  applyTo(t4) {
    ma(t4) ? (this.aspectRatio = t4.sourceWidth / t4.sourceHeight, t4.passes++, this._setupFrameBuffer(t4), this.horizontal = true, this.applyToWebGL(t4), this._swapTextures(t4), this._setupFrameBuffer(t4), this.horizontal = false, this.applyToWebGL(t4), this._swapTextures(t4)) : this.applyTo2d(t4);
  }
  applyTo2d(t4) {
    t4.imageData = this.simpleBlur(t4);
  }
  simpleBlur(t4) {
    let { ctx: e3, imageData: s4, filterBackend: { resources: i3 } } = t4;
    const { width: r2, height: n2 } = s4;
    i3.blurLayer1 || (i3.blurLayer1 = et$1(), i3.blurLayer2 = et$1());
    const o2 = i3.blurLayer1, a4 = i3.blurLayer2;
    o2.width === r2 && o2.height === n2 || (a4.width = o2.width = r2, a4.height = o2.height = n2);
    const h4 = o2.getContext("2d"), c3 = a4.getContext("2d"), l2 = 15, u3 = 0.06 * this.blur * 0.5;
    let d4, g2, f2, p2;
    for (h4.putImageData(s4, 0, 0), c3.clearRect(0, 0, r2, n2), p2 = -15; p2 <= l2; p2++)
      d4 = (Math.random() - 0.5) / 4, g2 = p2 / l2, f2 = u3 * g2 * r2 + d4, c3.globalAlpha = 1 - Math.abs(g2), c3.drawImage(o2, f2, d4), h4.drawImage(a4, 0, 0), c3.globalAlpha = 1, c3.clearRect(0, 0, a4.width, a4.height);
    for (p2 = -15; p2 <= l2; p2++)
      d4 = (Math.random() - 0.5) / 4, g2 = p2 / l2, f2 = u3 * g2 * n2 + d4, c3.globalAlpha = 1 - Math.abs(g2), c3.drawImage(o2, d4, f2), h4.drawImage(a4, 0, 0), c3.globalAlpha = 1, c3.clearRect(0, 0, a4.width, a4.height);
    e3.drawImage(o2, 0, 0);
    const m4 = e3.getImageData(0, 0, o2.width, o2.height);
    return h4.globalAlpha = 1, h4.clearRect(0, 0, o2.width, o2.height), m4;
  }
  getUniformLocations(t4, e3) {
    return { delta: t4.getUniformLocation(e3, "uDelta") };
  }
  sendUniformData(t4, e3) {
    const s4 = this.chooseRightDelta();
    t4.uniform2fv(e3.delta, s4);
  }
  chooseRightDelta() {
    let t4 = 1;
    const e3 = [0, 0];
    this.horizontal ? this.aspectRatio > 1 && (t4 = 1 / this.aspectRatio) : this.aspectRatio < 1 && (t4 = this.aspectRatio);
    const s4 = t4 * this.blur * 0.12;
    return this.horizontal ? e3[0] = s4 : e3[1] = s4, e3;
  }
}
s3(Ma, "type", "Blur"), s3(Ma, "defaults", { blur: 0, mainParameter: "blur" }), I2.setClass(Ma);
class Pa extends wa {
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform float uBrightness;\n  varying vec2 vTexCoord;\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    color.rgb += uBrightness;\n    gl_FragColor = color;\n  }\n";
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    if (0 === this.brightness)
      return;
    const s4 = Math.round(255 * this.brightness);
    for (let t5 = 0; t5 < e3.length; t5 += 4)
      e3[t5] = e3[t5] + s4, e3[t5 + 1] = e3[t5 + 1] + s4, e3[t5 + 2] = e3[t5 + 2] + s4;
  }
  getUniformLocations(t4, e3) {
    return { uBrightness: t4.getUniformLocation(e3, "uBrightness") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1f(e3.uBrightness, this.brightness);
  }
}
s3(Pa, "type", "Brightness"), s3(Pa, "defaults", { brightness: 0, mainParameter: "brightness" }), I2.setClass(Pa);
const Ea = ["matrix"], Aa = { matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], mainParameter: "matrix", colorsOnly: true };
class ja extends wa {
  setOptions(t4) {
    let { matrix: e3 } = t4, s4 = i2(t4, Ea);
    e3 && (this.matrix = [...e3]), Object.assign(this, s4);
  }
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  varying vec2 vTexCoord;\n  uniform mat4 uColorMatrix;\n  uniform vec4 uConstants;\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    color *= uColorMatrix;\n    color += uConstants;\n    gl_FragColor = color;\n  }";
  }
  applyTo2d(t4) {
    const e3 = t4.imageData.data, s4 = this.matrix, i3 = this.colorsOnly;
    for (let t5 = 0; t5 < e3.length; t5 += 4) {
      const r2 = e3[t5], n2 = e3[t5 + 1], o2 = e3[t5 + 2];
      if (i3)
        e3[t5] = r2 * s4[0] + n2 * s4[1] + o2 * s4[2] + 255 * s4[4], e3[t5 + 1] = r2 * s4[5] + n2 * s4[6] + o2 * s4[7] + 255 * s4[9], e3[t5 + 2] = r2 * s4[10] + n2 * s4[11] + o2 * s4[12] + 255 * s4[14];
      else {
        const i4 = e3[t5 + 3];
        e3[t5] = r2 * s4[0] + n2 * s4[1] + o2 * s4[2] + i4 * s4[3] + 255 * s4[4], e3[t5 + 1] = r2 * s4[5] + n2 * s4[6] + o2 * s4[7] + i4 * s4[8] + 255 * s4[9], e3[t5 + 2] = r2 * s4[10] + n2 * s4[11] + o2 * s4[12] + i4 * s4[13] + 255 * s4[14], e3[t5 + 3] = r2 * s4[15] + n2 * s4[16] + o2 * s4[17] + i4 * s4[18] + 255 * s4[19];
      }
    }
  }
  getUniformLocations(t4, e3) {
    return { uColorMatrix: t4.getUniformLocation(e3, "uColorMatrix"), uConstants: t4.getUniformLocation(e3, "uConstants") };
  }
  sendUniformData(t4, e3) {
    const s4 = this.matrix, i3 = [s4[0], s4[1], s4[2], s4[3], s4[5], s4[6], s4[7], s4[8], s4[10], s4[11], s4[12], s4[13], s4[15], s4[16], s4[17], s4[18]], r2 = [s4[4], s4[9], s4[14], s4[19]];
    t4.uniformMatrix4fv(e3.uColorMatrix, false, i3), t4.uniform4fv(e3.uConstants, r2);
  }
}
function Fa(t4, i3) {
  var r2;
  const n2 = (s3(r2 = class extends ja {
  }, "type", t4), s3(r2, "defaults", e2(e2({}, Aa), {}, { mainParameter: void 0, matrix: i3 })), r2);
  return I2.setClass(n2, t4), n2;
}
s3(ja, "type", "ColorMatrix"), s3(ja, "defaults", Aa), I2.setClass(ja);
Fa("Brownie", [0.5997, 0.34553, -0.27082, 0, 0.186, -0.0377, 0.86095, 0.15059, 0, -0.1449, 0.24113, -0.07441, 0.44972, 0, -0.02965, 0, 0, 0, 1, 0]);
Fa("Vintage", [0.62793, 0.32021, -0.03965, 0, 0.03784, 0.02578, 0.64411, 0.03259, 0, 0.02926, 0.0466, -0.08512, 0.52416, 0, 0.02023, 0, 0, 0, 1, 0]);
Fa("Kodachrome", [1.12855, -0.39673, -0.03992, 0, 0.24991, -0.16404, 1.08352, -0.05498, 0, 0.09698, -0.16786, -0.56034, 1.60148, 0, 0.13972, 0, 0, 0, 1, 0]);
Fa("Technicolor", [1.91252, -0.85453, -0.09155, 0, 0.04624, -0.30878, 1.76589, -0.10601, 0, -0.27589, -0.2311, -0.75018, 1.84759, 0, 0.12137, 0, 0, 0, 1, 0]);
Fa("Polaroid", [1.438, -0.062, -0.062, 0, 0, -0.122, 1.378, -0.122, 0, 0, -0.016, -0.016, 1.483, 0, 0, 0, 0, 0, 1, 0]);
Fa("Sepia", [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0]);
Fa("BlackWhite", [1.5, 1.5, 1.5, 0, -1, 1.5, 1.5, 1.5, 0, -1, 1.5, 1.5, 1.5, 0, -1, 0, 0, 0, 1, 0]);
const Va = ["subFilters"];
class za extends wa {
  constructor() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, { subFilters: e3 = [] } = t4;
    super(i2(t4, Va)), this.subFilters = e3;
  }
  applyTo(t4) {
    ma(t4) && (t4.passes += this.subFilters.length - 1), this.subFilters.forEach((e3) => {
      e3.applyTo(t4);
    });
  }
  toObject() {
    return e2(e2({}, super.toObject()), {}, { subFilters: this.subFilters.map((t4) => t4.toObject()) });
  }
  isNeutralState() {
    return !this.subFilters.some((t4) => !t4.isNeutralState());
  }
  static fromObject(t4, e3) {
    return Promise.all((t4.subFilters || []).map((t5) => I2.getClass(t5.type).fromObject(t5, e3))).then((t5) => new this({ subFilters: t5 }));
  }
}
s3(za, "type", "Composed"), I2.setClass(za);
class Ha extends wa {
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform float uContrast;\n  varying vec2 vTexCoord;\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    float contrastF = 1.015 * (uContrast + 1.0) / (1.0 * (1.015 - uContrast));\n    color.rgb = contrastF * (color.rgb - 0.5) + 0.5;\n    gl_FragColor = color;\n  }";
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    if (0 === this.contrast)
      return;
    const s4 = Math.floor(255 * this.contrast), i3 = 259 * (s4 + 255) / (255 * (259 - s4));
    for (let t5 = 0; t5 < e3.length; t5 += 4)
      e3[t5] = i3 * (e3[t5] - 128) + 128, e3[t5 + 1] = i3 * (e3[t5 + 1] - 128) + 128, e3[t5 + 2] = i3 * (e3[t5 + 2] - 128) + 128;
  }
  getUniformLocations(t4, e3) {
    return { uContrast: t4.getUniformLocation(e3, "uContrast") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1f(e3.uContrast, this.contrast);
  }
}
s3(Ha, "type", "Contrast"), s3(Ha, "defaults", { contrast: 0, mainParameter: "contrast" }), I2.setClass(Ha);
const Ga = { Convolute_3_1: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[9];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 0);\n      for (float h = 0.0; h < 3.0; h+=1.0) {\n        for (float w = 0.0; w < 3.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 1), uStepH * (h - 1));\n          color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 3.0 + w)];\n        }\n      }\n      gl_FragColor = color;\n    }\n    ", Convolute_3_0: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[9];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 1);\n      for (float h = 0.0; h < 3.0; h+=1.0) {\n        for (float w = 0.0; w < 3.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 1.0), uStepH * (h - 1.0));\n          color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 3.0 + w)];\n        }\n      }\n      float alpha = texture2D(uTexture, vTexCoord).a;\n      gl_FragColor = color;\n      gl_FragColor.a = alpha;\n    }\n    ", Convolute_5_1: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[25];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 0);\n      for (float h = 0.0; h < 5.0; h+=1.0) {\n        for (float w = 0.0; w < 5.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 2.0), uStepH * (h - 2.0));\n          color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 5.0 + w)];\n        }\n      }\n      gl_FragColor = color;\n    }\n    ", Convolute_5_0: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[25];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 1);\n      for (float h = 0.0; h < 5.0; h+=1.0) {\n        for (float w = 0.0; w < 5.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 2.0), uStepH * (h - 2.0));\n          color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 5.0 + w)];\n        }\n      }\n      float alpha = texture2D(uTexture, vTexCoord).a;\n      gl_FragColor = color;\n      gl_FragColor.a = alpha;\n    }\n    ", Convolute_7_1: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[49];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 0);\n      for (float h = 0.0; h < 7.0; h+=1.0) {\n        for (float w = 0.0; w < 7.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 3.0), uStepH * (h - 3.0));\n          color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 7.0 + w)];\n        }\n      }\n      gl_FragColor = color;\n    }\n    ", Convolute_7_0: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[49];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 1);\n      for (float h = 0.0; h < 7.0; h+=1.0) {\n        for (float w = 0.0; w < 7.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 3.0), uStepH * (h - 3.0));\n          color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 7.0 + w)];\n        }\n      }\n      float alpha = texture2D(uTexture, vTexCoord).a;\n      gl_FragColor = color;\n      gl_FragColor.a = alpha;\n    }\n    ", Convolute_9_1: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[81];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 0);\n      for (float h = 0.0; h < 9.0; h+=1.0) {\n        for (float w = 0.0; w < 9.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 4.0), uStepH * (h - 4.0));\n          color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 9.0 + w)];\n        }\n      }\n      gl_FragColor = color;\n    }\n    ", Convolute_9_0: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform float uMatrix[81];\n    uniform float uStepW;\n    uniform float uStepH;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = vec4(0, 0, 0, 1);\n      for (float h = 0.0; h < 9.0; h+=1.0) {\n        for (float w = 0.0; w < 9.0; w+=1.0) {\n          vec2 matrixPos = vec2(uStepW * (w - 4.0), uStepH * (h - 4.0));\n          color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 9.0 + w)];\n        }\n      }\n      float alpha = texture2D(uTexture, vTexCoord).a;\n      gl_FragColor = color;\n      gl_FragColor.a = alpha;\n    }\n    " };
class Ua extends wa {
  getCacheKey() {
    return "".concat(this.type, "_").concat(Math.sqrt(this.matrix.length), "_").concat(this.opaque ? 1 : 0);
  }
  getFragmentSource() {
    return Ga[this.getCacheKey()];
  }
  applyTo2d(t4) {
    const e3 = t4.imageData, s4 = e3.data, i3 = this.matrix, r2 = Math.round(Math.sqrt(i3.length)), n2 = Math.floor(r2 / 2), o2 = e3.width, a4 = e3.height, h4 = t4.ctx.createImageData(o2, a4), c3 = h4.data, l2 = this.opaque ? 1 : 0;
    let u3, d4, g2, f2, p2, m4, v2, y4, _2, x3, C2, b3, w3;
    for (C2 = 0; C2 < a4; C2++)
      for (x3 = 0; x3 < o2; x3++) {
        for (p2 = 4 * (C2 * o2 + x3), u3 = 0, d4 = 0, g2 = 0, f2 = 0, w3 = 0; w3 < r2; w3++)
          for (b3 = 0; b3 < r2; b3++)
            v2 = C2 + w3 - n2, m4 = x3 + b3 - n2, v2 < 0 || v2 >= a4 || m4 < 0 || m4 >= o2 || (y4 = 4 * (v2 * o2 + m4), _2 = i3[w3 * r2 + b3], u3 += s4[y4] * _2, d4 += s4[y4 + 1] * _2, g2 += s4[y4 + 2] * _2, l2 || (f2 += s4[y4 + 3] * _2));
        c3[p2] = u3, c3[p2 + 1] = d4, c3[p2 + 2] = g2, c3[p2 + 3] = l2 ? s4[p2 + 3] : f2;
      }
    t4.imageData = h4;
  }
  getUniformLocations(t4, e3) {
    return { uMatrix: t4.getUniformLocation(e3, "uMatrix"), uOpaque: t4.getUniformLocation(e3, "uOpaque"), uHalfSize: t4.getUniformLocation(e3, "uHalfSize"), uSize: t4.getUniformLocation(e3, "uSize") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1fv(e3.uMatrix, this.matrix);
  }
  toObject() {
    return e2(e2({}, super.toObject()), {}, { opaque: this.opaque, matrix: [...this.matrix] });
  }
}
s3(Ua, "type", "Convolute"), s3(Ua, "defaults", { opaque: false, matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0] }), I2.setClass(Ua);
const Na = ["gamma"];
class qa extends wa {
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform vec3 uGamma;\n  varying vec2 vTexCoord;\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    vec3 correction = (1.0 / uGamma);\n    color.r = pow(color.r, correction.r);\n    color.g = pow(color.g, correction.g);\n    color.b = pow(color.b, correction.b);\n    gl_FragColor = color;\n    gl_FragColor.rgb *= color.a;\n  }\n";
  }
  constructor() {
    let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, { gamma: e3 = [1, 1, 1] } = t4;
    super(i2(t4, Na)), this.gamma = e3;
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    const s4 = this.gamma, i3 = 1 / s4[0], r2 = 1 / s4[1], n2 = 1 / s4[2];
    this.rgbValues || (this.rgbValues = { r: new Uint8Array(256), g: new Uint8Array(256), b: new Uint8Array(256) });
    const o2 = this.rgbValues;
    for (let t5 = 0; t5 < 256; t5++)
      o2.r[t5] = 255 * Math.pow(t5 / 255, i3), o2.g[t5] = 255 * Math.pow(t5 / 255, r2), o2.b[t5] = 255 * Math.pow(t5 / 255, n2);
    for (let t5 = 0; t5 < e3.length; t5 += 4)
      e3[t5] = o2.r[e3[t5]], e3[t5 + 1] = o2.g[e3[t5 + 1]], e3[t5 + 2] = o2.b[e3[t5 + 2]];
  }
  getUniformLocations(t4, e3) {
    return { uGamma: t4.getUniformLocation(e3, "uGamma") };
  }
  sendUniformData(t4, e3) {
    t4.uniform3fv(e3.uGamma, this.gamma);
  }
}
s3(qa, "type", "Gamma"), s3(qa, "defaults", { mainParameter: "gamma", gamma: [1, 1, 1] }), I2.setClass(qa);
const Ka = { average: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 color = texture2D(uTexture, vTexCoord);\n      float average = (color.r + color.b + color.g) / 3.0;\n      gl_FragColor = vec4(average, average, average, color.a);\n    }\n    ", lightness: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform int uMode;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 col = texture2D(uTexture, vTexCoord);\n      float average = (max(max(col.r, col.g),col.b) + min(min(col.r, col.g),col.b)) / 2.0;\n      gl_FragColor = vec4(average, average, average, col.a);\n    }\n    ", luminosity: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform int uMode;\n    varying vec2 vTexCoord;\n    void main() {\n      vec4 col = texture2D(uTexture, vTexCoord);\n      float average = 0.21 * col.r + 0.72 * col.g + 0.07 * col.b;\n      gl_FragColor = vec4(average, average, average, col.a);\n    }\n    " };
class Ja extends wa {
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    for (let t5, s4 = 0; s4 < e3.length; s4 += 4) {
      switch (this.mode) {
        case "average":
          t5 = (e3[s4] + e3[s4 + 1] + e3[s4 + 2]) / 3;
          break;
        case "lightness":
          t5 = (Math.min(e3[s4], e3[s4 + 1], e3[s4 + 2]) + Math.max(e3[s4], e3[s4 + 1], e3[s4 + 2])) / 2;
          break;
        case "luminosity":
          t5 = 0.21 * e3[s4] + 0.72 * e3[s4 + 1] + 0.07 * e3[s4 + 2];
      }
      e3[s4] = t5, e3[s4 + 1] = t5, e3[s4 + 2] = t5;
    }
  }
  getCacheKey() {
    return "".concat(this.type, "_").concat(this.mode);
  }
  getFragmentSource() {
    return Ka[this.mode];
  }
  getUniformLocations(t4, e3) {
    return { uMode: t4.getUniformLocation(e3, "uMode") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1i(e3.uMode, 1);
  }
  isNeutralState() {
    return false;
  }
}
s3(Ja, "type", "Grayscale"), s3(Ja, "defaults", { mode: "average", mainParameter: "mode" }), I2.setClass(Ja);
class Za extends ja {
  calculateMatrix() {
    const t4 = this.rotation * Math.PI, e3 = H3(t4), s4 = G$1(t4), i3 = 1 / 3, r2 = Math.sqrt(i3) * s4, n2 = 1 - e3;
    this.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], this.matrix[0] = e3 + n2 / 3, this.matrix[1] = i3 * n2 - r2, this.matrix[2] = i3 * n2 + r2, this.matrix[5] = i3 * n2 + r2, this.matrix[6] = e3 + i3 * n2, this.matrix[7] = i3 * n2 - r2, this.matrix[10] = i3 * n2 - r2, this.matrix[11] = i3 * n2 + r2, this.matrix[12] = e3 + i3 * n2;
  }
  isNeutralState() {
    return this.calculateMatrix(), super.isNeutralState();
  }
  applyTo(t4) {
    this.calculateMatrix(), super.applyTo(t4);
  }
}
s3(Za, "type", "HueRotation"), s3(Za, "defaults", { rotation: 0, mainParameter: "rotation" }), I2.setClass(Za);
class Qa extends wa {
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    for (let t5 = 0; t5 < e3.length; t5 += 4)
      e3[t5] = 255 - e3[t5], e3[t5 + 1] = 255 - e3[t5 + 1], e3[t5 + 2] = 255 - e3[t5 + 2], this.alpha && (e3[t5 + 3] = 255 - e3[t5 + 3]);
  }
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform int uInvert;\n  uniform int uAlpha;\n  varying vec2 vTexCoord;\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    if (uInvert == 1) {\n      if (uAlpha == 1) {\n        gl_FragColor = vec4(1.0 - color.r,1.0 -color.g,1.0 -color.b,1.0 -color.a);\n      } else {\n        gl_FragColor = vec4(1.0 - color.r,1.0 -color.g,1.0 -color.b,color.a);\n      }\n    } else {\n      gl_FragColor = color;\n    }\n  }\n";
  }
  isNeutralState() {
    return !this.invert;
  }
  getUniformLocations(t4, e3) {
    return { uInvert: t4.getUniformLocation(e3, "uInvert"), uAlpha: t4.getUniformLocation(e3, "uAlpha") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1i(e3.uInvert, Number(this.invert)), t4.uniform1i(e3.uAlpha, Number(this.alpha));
  }
}
s3(Qa, "type", "Invert"), s3(Qa, "defaults", { alpha: false, invert: true, mainParameter: "invert" }), I2.setClass(Qa);
class $a extends wa {
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform float uStepH;\n  uniform float uNoise;\n  uniform float uSeed;\n  varying vec2 vTexCoord;\n  float rand(vec2 co, float seed, float vScale) {\n    return fract(sin(dot(co.xy * vScale ,vec2(12.9898 , 78.233))) * 43758.5453 * (seed + 0.01) / 2.0);\n  }\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    color.rgb += (0.5 - rand(vTexCoord, uSeed, 0.1 / uStepH)) * uNoise;\n    gl_FragColor = color;\n  }\n";
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    if (0 === this.noise)
      return;
    const s4 = this.noise;
    for (let t5 = 0; t5 < e3.length; t5 += 4) {
      const i3 = (0.5 - Math.random()) * s4;
      e3[t5] += i3, e3[t5 + 1] += i3, e3[t5 + 2] += i3;
    }
  }
  getUniformLocations(t4, e3) {
    return { uNoise: t4.getUniformLocation(e3, "uNoise"), uSeed: t4.getUniformLocation(e3, "uSeed") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1f(e3.uNoise, this.noise / 255), t4.uniform1f(e3.uSeed, Math.random());
  }
  toObject() {
    return e2(e2({}, super.toObject()), {}, { noise: this.noise });
  }
}
s3($a, "type", "Noise"), s3($a, "defaults", { mainParameter: "noise", noise: 0 }), I2.setClass($a);
class th extends wa {
  applyTo2d(t4) {
    let { imageData: { data: e3, width: s4, height: i3 } } = t4;
    for (let t5 = 0; t5 < i3; t5 += this.blocksize)
      for (let r2 = 0; r2 < s4; r2 += this.blocksize) {
        const n2 = 4 * t5 * s4 + 4 * r2, o2 = e3[n2], a4 = e3[n2 + 1], h4 = e3[n2 + 2], c3 = e3[n2 + 3];
        for (let n3 = t5; n3 < Math.min(t5 + this.blocksize, i3); n3++)
          for (let t6 = r2; t6 < Math.min(r2 + this.blocksize, s4); t6++) {
            const i4 = 4 * n3 * s4 + 4 * t6;
            e3[i4] = o2, e3[i4 + 1] = a4, e3[i4 + 2] = h4, e3[i4 + 3] = c3;
          }
      }
  }
  isNeutralState() {
    return 1 === this.blocksize;
  }
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform float uBlocksize;\n  uniform float uStepW;\n  uniform float uStepH;\n  varying vec2 vTexCoord;\n  void main() {\n    float blockW = uBlocksize * uStepW;\n    float blockH = uBlocksize * uStepW;\n    int posX = int(vTexCoord.x / blockW);\n    int posY = int(vTexCoord.y / blockH);\n    float fposX = float(posX);\n    float fposY = float(posY);\n    vec2 squareCoords = vec2(fposX * blockW, fposY * blockH);\n    vec4 color = texture2D(uTexture, squareCoords);\n    gl_FragColor = color;\n  }\n";
  }
  getUniformLocations(t4, e3) {
    return { uBlocksize: t4.getUniformLocation(e3, "uBlocksize"), uStepW: t4.getUniformLocation(e3, "uStepW"), uStepH: t4.getUniformLocation(e3, "uStepH") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1f(e3.uBlocksize, this.blocksize);
  }
}
s3(th, "type", "Pixelate"), s3(th, "defaults", { blocksize: 4, mainParameter: "blocksize" }), I2.setClass(th);
class eh extends wa {
  getFragmentShader() {
    return "\nprecision highp float;\nuniform sampler2D uTexture;\nuniform vec4 uLow;\nuniform vec4 uHigh;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_FragColor = texture2D(uTexture, vTexCoord);\n  if(all(greaterThan(gl_FragColor.rgb,uLow.rgb)) && all(greaterThan(uHigh.rgb,gl_FragColor.rgb))) {\n    gl_FragColor.a = 0.0;\n  }\n}\n";
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    const s4 = 255 * this.distance, i3 = new At(this.color).getSource(), r2 = [i3[0] - s4, i3[1] - s4, i3[2] - s4], n2 = [i3[0] + s4, i3[1] + s4, i3[2] + s4];
    for (let t5 = 0; t5 < e3.length; t5 += 4) {
      const s5 = e3[t5], i4 = e3[t5 + 1], o2 = e3[t5 + 2];
      s5 > r2[0] && i4 > r2[1] && o2 > r2[2] && s5 < n2[0] && i4 < n2[1] && o2 < n2[2] && (e3[t5 + 3] = 0);
    }
  }
  getUniformLocations(t4, e3) {
    return { uLow: t4.getUniformLocation(e3, "uLow"), uHigh: t4.getUniformLocation(e3, "uHigh") };
  }
  sendUniformData(t4, e3) {
    const s4 = new At(this.color).getSource(), i3 = this.distance, r2 = [0 + s4[0] / 255 - i3, 0 + s4[1] / 255 - i3, 0 + s4[2] / 255 - i3, 1], n2 = [s4[0] / 255 + i3, s4[1] / 255 + i3, s4[2] / 255 + i3, 1];
    t4.uniform4fv(e3.uLow, r2), t4.uniform4fv(e3.uHigh, n2);
  }
  toObject() {
    return e2(e2({}, super.toObject()), {}, { color: this.color, distance: this.distance });
  }
}
s3(eh, "type", "RemoveColor"), s3(eh, "defaults", { color: "#FFFFFF", distance: 0.02, useAlpha: false }), I2.setClass(eh);
class sh extends wa {
  getUniformLocations(t4, e3) {
    return { uDelta: t4.getUniformLocation(e3, "uDelta"), uTaps: t4.getUniformLocation(e3, "uTaps") };
  }
  sendUniformData(t4, e3) {
    t4.uniform2fv(e3.uDelta, this.horizontal ? [1 / this.width, 0] : [0, 1 / this.height]), t4.uniform1fv(e3.uTaps, this.taps);
  }
  getFilterWindow() {
    const t4 = this.tempScale;
    return Math.ceil(this.lanczosLobes / t4);
  }
  getCacheKey() {
    const t4 = this.getFilterWindow();
    return "".concat(this.type, "_").concat(t4);
  }
  getFragmentSource() {
    const t4 = this.getFilterWindow();
    return this.generateShader(t4);
  }
  getTaps() {
    const t4 = this.lanczosCreate(this.lanczosLobes), e3 = this.tempScale, s4 = this.getFilterWindow(), i3 = new Array(s4);
    for (let r2 = 1; r2 <= s4; r2++)
      i3[r2 - 1] = t4(r2 * e3);
    return i3;
  }
  generateShader(t4) {
    const e3 = new Array(t4);
    for (let s4 = 1; s4 <= t4; s4++)
      e3[s4 - 1] = "".concat(s4, ".0 * uDelta");
    return "\n      ".concat(this.fragmentSourceTOP, "\n      uniform float uTaps[").concat(t4, "];\n      void main() {\n        vec4 color = texture2D(uTexture, vTexCoord);\n        float sum = 1.0;\n        ").concat(e3.map((t5, e4) => "\n              color += texture2D(uTexture, vTexCoord + ".concat(t5, ") * uTaps[").concat(e4, "] + texture2D(uTexture, vTexCoord - ").concat(t5, ") * uTaps[").concat(e4, "];\n              sum += 2.0 * uTaps[").concat(e4, "];\n            ")).join("\n"), "\n        gl_FragColor = color / sum;\n      }\n    ");
  }
  applyToForWebgl(t4) {
    t4.passes++, this.width = t4.sourceWidth, this.horizontal = true, this.dW = Math.round(this.width * this.scaleX), this.dH = t4.sourceHeight, this.tempScale = this.dW / this.width, this.taps = this.getTaps(), t4.destinationWidth = this.dW, super.applyTo(t4), t4.sourceWidth = t4.destinationWidth, this.height = t4.sourceHeight, this.horizontal = false, this.dH = Math.round(this.height * this.scaleY), this.tempScale = this.dH / this.height, this.taps = this.getTaps(), t4.destinationHeight = this.dH, super.applyTo(t4), t4.sourceHeight = t4.destinationHeight;
  }
  applyTo(t4) {
    ma(t4) ? this.applyToForWebgl(t4) : this.applyTo2d(t4);
  }
  isNeutralState() {
    return 1 === this.scaleX && 1 === this.scaleY;
  }
  lanczosCreate(t4) {
    return (e3) => {
      if (e3 >= t4 || e3 <= -t4)
        return 0;
      if (e3 < 11920929e-14 && e3 > -11920929e-14)
        return 1;
      const s4 = (e3 *= Math.PI) / t4;
      return Math.sin(e3) / e3 * Math.sin(s4) / s4;
    };
  }
  applyTo2d(t4) {
    const e3 = t4.imageData, s4 = this.scaleX, i3 = this.scaleY;
    this.rcpScaleX = 1 / s4, this.rcpScaleY = 1 / i3;
    const r2 = e3.width, n2 = e3.height, o2 = Math.round(r2 * s4), a4 = Math.round(n2 * i3);
    let h4;
    h4 = "sliceHack" === this.resizeType ? this.sliceByTwo(t4, r2, n2, o2, a4) : "hermite" === this.resizeType ? this.hermiteFastResize(t4, r2, n2, o2, a4) : "bilinear" === this.resizeType ? this.bilinearFiltering(t4, r2, n2, o2, a4) : "lanczos" === this.resizeType ? this.lanczosResize(t4, r2, n2, o2, a4) : new ImageData(o2, a4), t4.imageData = h4;
  }
  sliceByTwo(t4, e3, s4, i3, r2) {
    const n2 = t4.imageData, o2 = 0.5;
    let a4 = false, h4 = false, c3 = e3 * o2, l2 = s4 * o2;
    const u3 = t4.filterBackend.resources;
    let d4 = 0, g2 = 0;
    const f2 = e3;
    let p2 = 0;
    u3.sliceByTwo || (u3.sliceByTwo = et$1());
    const m4 = u3.sliceByTwo;
    (m4.width < 1.5 * e3 || m4.height < s4) && (m4.width = 1.5 * e3, m4.height = s4);
    const v2 = m4.getContext("2d");
    for (v2.clearRect(0, 0, 1.5 * e3, s4), v2.putImageData(n2, 0, 0), i3 = Math.floor(i3), r2 = Math.floor(r2); !a4 || !h4; )
      e3 = c3, s4 = l2, i3 < Math.floor(c3 * o2) ? c3 = Math.floor(c3 * o2) : (c3 = i3, a4 = true), r2 < Math.floor(l2 * o2) ? l2 = Math.floor(l2 * o2) : (l2 = r2, h4 = true), v2.drawImage(m4, d4, g2, e3, s4, f2, p2, c3, l2), d4 = f2, g2 = p2, p2 += l2;
    return v2.getImageData(d4, g2, i3, r2);
  }
  lanczosResize(t4, e3, s4, i3, r2) {
    const n2 = t4.imageData.data, o2 = t4.ctx.createImageData(i3, r2), a4 = o2.data, h4 = this.lanczosCreate(this.lanczosLobes), c3 = this.rcpScaleX, l2 = this.rcpScaleY, u3 = 2 / this.rcpScaleX, d4 = 2 / this.rcpScaleY, g2 = Math.ceil(c3 * this.lanczosLobes / 2), f2 = Math.ceil(l2 * this.lanczosLobes / 2), p2 = {}, m4 = { x: 0, y: 0 }, v2 = { x: 0, y: 0 };
    return function t5(y4) {
      let _2, x3, C2, b3, w3, S4, T3, O3, k3, D3, M4;
      for (m4.x = (y4 + 0.5) * c3, v2.x = Math.floor(m4.x), _2 = 0; _2 < r2; _2++) {
        for (m4.y = (_2 + 0.5) * l2, v2.y = Math.floor(m4.y), w3 = 0, S4 = 0, T3 = 0, O3 = 0, k3 = 0, x3 = v2.x - g2; x3 <= v2.x + g2; x3++)
          if (!(x3 < 0 || x3 >= e3)) {
            D3 = Math.floor(1e3 * Math.abs(x3 - m4.x)), p2[D3] || (p2[D3] = {});
            for (let t6 = v2.y - f2; t6 <= v2.y + f2; t6++)
              t6 < 0 || t6 >= s4 || (M4 = Math.floor(1e3 * Math.abs(t6 - m4.y)), p2[D3][M4] || (p2[D3][M4] = h4(Math.sqrt(Math.pow(D3 * u3, 2) + Math.pow(M4 * d4, 2)) / 1e3)), C2 = p2[D3][M4], C2 > 0 && (b3 = 4 * (t6 * e3 + x3), w3 += C2, S4 += C2 * n2[b3], T3 += C2 * n2[b3 + 1], O3 += C2 * n2[b3 + 2], k3 += C2 * n2[b3 + 3]));
          }
        b3 = 4 * (_2 * i3 + y4), a4[b3] = S4 / w3, a4[b3 + 1] = T3 / w3, a4[b3 + 2] = O3 / w3, a4[b3 + 3] = k3 / w3;
      }
      return ++y4 < i3 ? t5(y4) : o2;
    }(0);
  }
  bilinearFiltering(t4, e3, s4, i3, r2) {
    let n2, o2, a4, h4, c3, l2, u3, d4, g2, f2, p2, m4, v2, y4 = 0;
    const _2 = this.rcpScaleX, x3 = this.rcpScaleY, C2 = 4 * (e3 - 1), b3 = t4.imageData.data, w3 = t4.ctx.createImageData(i3, r2), S4 = w3.data;
    for (u3 = 0; u3 < r2; u3++)
      for (d4 = 0; d4 < i3; d4++)
        for (c3 = Math.floor(_2 * d4), l2 = Math.floor(x3 * u3), g2 = _2 * d4 - c3, f2 = x3 * u3 - l2, v2 = 4 * (l2 * e3 + c3), p2 = 0; p2 < 4; p2++)
          n2 = b3[v2 + p2], o2 = b3[v2 + 4 + p2], a4 = b3[v2 + C2 + p2], h4 = b3[v2 + C2 + 4 + p2], m4 = n2 * (1 - g2) * (1 - f2) + o2 * g2 * (1 - f2) + a4 * f2 * (1 - g2) + h4 * g2 * f2, S4[y4++] = m4;
    return w3;
  }
  hermiteFastResize(t4, e3, s4, i3, r2) {
    const n2 = this.rcpScaleX, o2 = this.rcpScaleY, a4 = Math.ceil(n2 / 2), h4 = Math.ceil(o2 / 2), c3 = t4.imageData.data, l2 = t4.ctx.createImageData(i3, r2), u3 = l2.data;
    for (let t5 = 0; t5 < r2; t5++)
      for (let s5 = 0; s5 < i3; s5++) {
        const r3 = 4 * (s5 + t5 * i3);
        let l3 = 0, d4 = 0, g2 = 0, f2 = 0, p2 = 0, m4 = 0, v2 = 0;
        const y4 = (t5 + 0.5) * o2;
        for (let i4 = Math.floor(t5 * o2); i4 < (t5 + 1) * o2; i4++) {
          const t6 = Math.abs(y4 - (i4 + 0.5)) / h4, r4 = (s5 + 0.5) * n2, o3 = t6 * t6;
          for (let t7 = Math.floor(s5 * n2); t7 < (s5 + 1) * n2; t7++) {
            let s6 = Math.abs(r4 - (t7 + 0.5)) / a4;
            const n3 = Math.sqrt(o3 + s6 * s6);
            n3 > 1 && n3 < -1 || (l3 = 2 * n3 * n3 * n3 - 3 * n3 * n3 + 1, l3 > 0 && (s6 = 4 * (t7 + i4 * e3), v2 += l3 * c3[s6 + 3], g2 += l3, c3[s6 + 3] < 255 && (l3 = l3 * c3[s6 + 3] / 250), f2 += l3 * c3[s6], p2 += l3 * c3[s6 + 1], m4 += l3 * c3[s6 + 2], d4 += l3));
          }
        }
        u3[r3] = f2 / d4, u3[r3 + 1] = p2 / d4, u3[r3 + 2] = m4 / d4, u3[r3 + 3] = v2 / g2;
      }
    return l2;
  }
  toObject() {
    return { type: this.type, scaleX: this.scaleX, scaleY: this.scaleY, resizeType: this.resizeType, lanczosLobes: this.lanczosLobes };
  }
}
s3(sh, "type", "Resize"), s3(sh, "defaults", { resizeType: "hermite", scaleX: 1, scaleY: 1, lanczosLobes: 3, fragmentSourceTOP: "\n    precision highp float;\n    uniform sampler2D uTexture;\n    uniform vec2 uDelta;\n    varying vec2 vTexCoord;\n  " }), I2.setClass(sh);
class ih extends wa {
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform float uSaturation;\n  varying vec2 vTexCoord;\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    float rgMax = max(color.r, color.g);\n    float rgbMax = max(rgMax, color.b);\n    color.r += rgbMax != color.r ? (rgbMax - color.r) * uSaturation : 0.00;\n    color.g += rgbMax != color.g ? (rgbMax - color.g) * uSaturation : 0.00;\n    color.b += rgbMax != color.b ? (rgbMax - color.b) * uSaturation : 0.00;\n    gl_FragColor = color;\n  }\n";
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    if (0 === this.saturation)
      return;
    const s4 = -this.saturation;
    for (let t5 = 0; t5 < e3.length; t5 += 4) {
      const i3 = Math.max(e3[t5], e3[t5 + 1], e3[t5 + 2]);
      e3[t5] += i3 !== e3[t5] ? (i3 - e3[t5]) * s4 : 0, e3[t5 + 1] += i3 !== e3[t5 + 1] ? (i3 - e3[t5 + 1]) * s4 : 0, e3[t5 + 2] += i3 !== e3[t5 + 2] ? (i3 - e3[t5 + 2]) * s4 : 0;
    }
  }
  getUniformLocations(t4, e3) {
    return { uSaturation: t4.getUniformLocation(e3, "uSaturation") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1f(e3.uSaturation, -this.saturation);
  }
}
s3(ih, "type", "Saturation"), s3(ih, "defaults", { saturation: 0, mainParameter: "saturation" }), I2.setClass(ih);
class rh extends wa {
  getFragmentSource() {
    return "\n  precision highp float;\n  uniform sampler2D uTexture;\n  uniform float uVibrance;\n  varying vec2 vTexCoord;\n  void main() {\n    vec4 color = texture2D(uTexture, vTexCoord);\n    float max = max(color.r, max(color.g, color.b));\n    float avg = (color.r + color.g + color.b) / 3.0;\n    float amt = (abs(max - avg) * 2.0) * uVibrance;\n    color.r += max != color.r ? (max - color.r) * amt : 0.00;\n    color.g += max != color.g ? (max - color.g) * amt : 0.00;\n    color.b += max != color.b ? (max - color.b) * amt : 0.00;\n    gl_FragColor = color;\n  }\n";
  }
  applyTo2d(t4) {
    let { imageData: { data: e3 } } = t4;
    if (0 === this.vibrance)
      return;
    const s4 = -this.vibrance;
    for (let t5 = 0; t5 < e3.length; t5 += 4) {
      const i3 = Math.max(e3[t5], e3[t5 + 1], e3[t5 + 2]), r2 = (e3[t5] + e3[t5 + 1] + e3[t5 + 2]) / 3, n2 = 2 * Math.abs(i3 - r2) / 255 * s4;
      e3[t5] += i3 !== e3[t5] ? (i3 - e3[t5]) * n2 : 0, e3[t5 + 1] += i3 !== e3[t5 + 1] ? (i3 - e3[t5 + 1]) * n2 : 0, e3[t5 + 2] += i3 !== e3[t5 + 2] ? (i3 - e3[t5 + 2]) * n2 : 0;
    }
  }
  getUniformLocations(t4, e3) {
    return { uVibrance: t4.getUniformLocation(e3, "uVibrance") };
  }
  sendUniformData(t4, e3) {
    t4.uniform1f(e3.uVibrance, -this.vibrance);
  }
}
s3(rh, "type", "Vibrance"), s3(rh, "defaults", { vibrance: 0, mainParameter: "vibrance" }), I2.setClass(rh);
const _hoisted_1$6 = { class: "zoom" };
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "Zoom",
  props: {
    value: {}
  },
  emits: ["input", "middle-clicked"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    const props = __props;
    const currentZoom = computed(() => {
      return Math.round(props.value * 100) + "%";
    });
    function middleClicked() {
      emit2("middle-clicked");
    }
    function zoomDown() {
      zoomChanged(props.value - 0.05);
    }
    function zoomUp() {
      zoomChanged(props.value + 0.05);
    }
    function zoomChanged(zoomLevel) {
      emit2("input", zoomLevel);
    }
    onMounted(() => {
      console.log("zoom-function mounted");
      emitter.on("zoom", (type3) => {
        console.log("z", type3);
        if (type3 === "in") {
          zoomUp();
        } else if (type3 === "out") {
          zoomDown();
        } else if (type3 === "reset") {
          middleClicked();
        }
      });
    });
    return (_ctx, _cache) => {
      const _component_ico = resolveComponent("ico");
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        renderSlot(_ctx.$slots, "left"),
        createBaseVNode("button", {
          class: "side-btn zoom-down is-left",
          onClick: zoomDown
        }, [
          createVNode(_component_ico, {
            icon: "minus",
            size: "small"
          })
        ]),
        createBaseVNode("button", {
          class: "zoom-btn",
          onClick: middleClicked
        }, toDisplayString(currentZoom.value), 1),
        createBaseVNode("button", {
          class: "side-btn zoom-up is-right",
          onClick: zoomUp
        }, [
          createVNode(_component_ico, {
            icon: "plus",
            size: "small"
          })
        ])
      ]);
    };
  }
});
const Zoom_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$5 = { class: "screenshot-viewer" };
const _hoisted_2$5 = { class: "btn zoom-btn gap-right" };
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "ScreenshotViewer",
  props: {
    currentCapture: {}
  },
  setup(__props) {
    let canvas;
    let canvasX;
    let canvasY;
    let lastRenderedImg;
    const showTextCopied = ref(false);
    const showOcr = ref(false);
    const currentZoomLevel = ref(0.5);
    const canvasEl = ref();
    const props = __props;
    const imagePath = computed(() => {
      let filepath = "";
      const file = props.currentCapture;
      if (file && file.Fullpath) {
        let pathParts = file.Fullpath.split("/");
        let imagePath2 = `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
        try {
          filepath = "/capture/" + imagePath2;
        } catch {
        }
      }
      return filepath;
    });
    async function captureChanged() {
      console.log(imagePath.value);
      if (imagePath.value) {
        let oImg = await No.fromURL(imagePath.value);
        oImg.left = 0;
        oImg.top = 0;
        oImg.selectable = false;
        oImg.hoverCursor = "-webkit-grab";
        oImg.moveCursor = "-webkit-grabbing";
        canvas.add(oImg);
        canvas.remove(lastRenderedImg);
        lastRenderedImg = oImg;
      } else {
        canvas.remove(lastRenderedImg);
      }
    }
    let currentDt = "";
    watch(
      () => props.currentCapture,
      () => {
        var _a2, _b;
        if (((_a2 = props.currentCapture) == null ? void 0 : _a2.Dt) != currentDt) {
          captureChanged();
          currentDt = ((_b = props.currentCapture) == null ? void 0 : _b.Dt) || "";
        }
      }
    );
    function zoomChanged(newZoom) {
      const canvasX2 = canvas.width / 2;
      const canvasY2 = canvas.height / 3;
      setCanvasZoom(canvasX2, canvasY2, newZoom);
    }
    function setCanvasZoom(canvasX2, canvasY2, newZoom) {
      if (newZoom >= 0.09 && newZoom < 2.1) {
        currentZoomLevel.value = newZoom;
        canvas.zoomToPoint(new U(canvasX2, canvasY2), newZoom);
      }
    }
    function resetCanvasZoom() {
      currentZoomLevel.value = 0.7;
      canvas.selection = false;
      canvas.defaultCursor = "-webkit-grab";
      canvas.absolutePan(new U(-50, -60));
      canvas.setZoom(currentZoomLevel.value);
      setCanvasDimensions();
    }
    function setCanvasDimensions() {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 30
      });
    }
    let lastEventDate = 0;
    function zoomFromMouseWheel(e3) {
      let wheelDelta = -e3.deltaY || -e3.detail;
      let eventDebounce = 50;
      let incAmount = 0.05;
      if (wheelDelta < -100 || wheelDelta > 100) {
        eventDebounce = 10;
        incAmount = 0.05;
      }
      if (lastEventDate + eventDebounce < Number(+/* @__PURE__ */ new Date())) {
        lastEventDate = Number(+/* @__PURE__ */ new Date());
        var delta = Math.max(-1, Math.min(1, wheelDelta));
        let newZoom = currentZoomLevel.value + delta * incAmount;
        newZoom = Math.round(newZoom * 100);
        newZoom = newZoom / 100;
        setCanvasZoom(canvasX, canvasY, newZoom);
      }
    }
    async function doOcr() {
      var _a2, _b;
      if ((_a2 = props.currentCapture) == null ? void 0 : _a2.Dt) {
        let meta = await LoadCaptureOcr({
          Dt: (_b = props.currentCapture) == null ? void 0 : _b.Dt
        });
        if (meta == null ? void 0 : meta.Meta) {
          for (let i3 = 0; i3 < meta.Meta.length; i3++) {
            const m4 = meta.Meta[i3];
            console.log(m4.Text, {
              width: m4.Width + 4,
              height: m4.Height + 4,
              left: m4.X - 2,
              top: m4.Y - 2
            });
            let rect = new rr({
              width: m4.Width,
              height: m4.Height,
              left: m4.X,
              top: m4.Y,
              fill: "transparent",
              // stroke: '#f55f5566',
              stroke: "transparent",
              strokeWidth: 1,
              lockMovementY: true,
              lockMovementX: true,
              lockScalingFlip: true,
              lockRotation: true,
              lockScalingX: true,
              lockScalingY: true,
              lockSkewingX: true,
              lockSkewingY: true,
              selectable: false,
              moveCursor: "pointer",
              hoverCursor: "pointer"
            });
            rect.on("mouseover", () => {
              rect.set("stroke", "#f55f55");
              canvas.renderAll();
            });
            rect.on("mouseout", () => {
              rect.set("stroke", "transparent");
              canvas.renderAll();
            });
            rect.on("mousedown", () => {
              if (m4.Text) {
                SetText(m4.Text);
                showTextCopied.value = true;
                setTimeout(() => {
                  showTextCopied.value = false;
                }, 2e3);
              }
            });
            canvas.add(rect);
          }
        }
      }
    }
    onMounted(() => {
      let panning = false;
      canvas = new mn("screenshot-viewer");
      canvas.selection = false;
      canvas.absolutePan(new U(-50, -50));
      canvas.on("mouse:up", (e3) => {
        canvas.defaultCursor = "-webkit-grab";
        if (e3.target) {
          e3.target.hoverCursor = "-webkit-grab";
        }
        panning = false;
      });
      canvas.on("mouse:down", (e3) => {
        canvas.defaultCursor = "-webkit-grabbing";
        if (e3.target) {
          e3.target.hoverCursor = "-webkit-grabbing";
        }
        panning = true;
      });
      canvas.on("mouse:move", (e3) => {
        let event = e3.e;
        canvasX = event.layerX;
        canvasY = event.layerY;
        if (panning && e3 && event) {
          var delta = new U(event.movementX, event.movementY);
          canvas.relativePan(delta);
        }
      });
      window.addEventListener("resize", setCanvasDimensions);
      document.addEventListener("mousewheel", zoomFromMouseWheel, false);
      captureChanged();
      resetCanvasZoom();
    });
    onUnmounted(() => {
      window.addEventListener("resize", setCanvasDimensions);
      document.removeEventListener("mousewheel", zoomFromMouseWheel, false);
    });
    return (_ctx, _cache) => {
      const _component_ico = resolveComponent("ico");
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createVNode(_sfc_main$8, {
          value: currentZoomLevel.value,
          onInput: zoomChanged,
          onMiddleClicked: resetCanvasZoom
        }, {
          left: withCtx(() => [
            createVNode(Transition, { name: "fade" }, {
              default: withCtx(() => [
                withDirectives(createBaseVNode("button", _hoisted_2$5, " Copied ", 512), [
                  [vShow, showTextCopied.value]
                ])
              ]),
              _: 1
            }),
            createBaseVNode("button", {
              class: "btn zoom-btn gap-right",
              onClick: doOcr,
              onMouseover: _cache[0] || (_cache[0] = ($event) => showOcr.value = true),
              onMouseout: _cache[1] || (_cache[1] = ($event) => showOcr.value = false)
            }, [
              createVNode(_component_ico, { icon: "searchengin" })
            ], 32)
          ]),
          _: 1
        }, 8, ["value"]),
        createBaseVNode("canvas", {
          ref_key: "canvasEl",
          ref: canvasEl,
          id: "screenshot-viewer",
          width: "1280",
          height: "800"
        }, null, 512)
      ]);
    };
  }
});
const ScreenshotViewer_vue_vue_type_style_index_0_lang = "";
(function() {
  try {
    if (typeof document < "u") {
      var e3 = document.createElement("style");
      e3.appendChild(document.createTextNode(".v3dp__popout[data-v-65eb861b]{z-index:10;position:absolute;text-align:center;width:17.5em;background-color:var(--popout-bg-color);box-shadow:var(--box-shadow);border-radius:var(--border-radius);padding:8px 0 1em;color:var(--text-color)}.v3dp__popout *[data-v-65eb861b]{color:inherit;font-size:inherit;font-weight:inherit}.v3dp__popout[data-v-65eb861b] button{background:none;border:none;outline:none}.v3dp__popout[data-v-65eb861b] button:not(:disabled){cursor:pointer}.v3dp__heading[data-v-65eb861b]{width:100%;display:flex;height:var(--heading-size);line-height:var(--heading-size);font-weight:var(--heading-weight)}.v3dp__heading__button[data-v-65eb861b]{background:none;border:none;padding:0;display:flex;justify-content:center;align-items:center;width:var(--heading-size)}button.v3dp__heading__center[data-v-65eb861b]:hover,.v3dp__heading__button[data-v-65eb861b]:not(:disabled):hover{background-color:var(--heading-hover-color)}.v3dp__heading__center[data-v-65eb861b]{flex:1}.v3dp__heading__icon[data-v-65eb861b]{height:12px;stroke:var(--arrow-color)}.v3dp__heading__button:disabled .v3dp__heading__icon[data-v-65eb861b]{stroke:var(--elem-disabled-color)}.v3dp__subheading[data-v-65eb861b],.v3dp__elements[data-v-65eb861b]{display:grid;grid-template-columns:var(--popout-column-definition);font-size:var(--elem-font-size)}.v3dp__subheading[data-v-65eb861b]{margin-top:1em}.v3dp__divider[data-v-65eb861b]{border:1px solid var(--divider-color);border-radius:3px}.v3dp__elements[data-v-65eb861b] button:disabled{color:var(--elem-disabled-color)}.v3dp__elements[data-v-65eb861b] button{padding:.3em .6em}.v3dp__elements[data-v-65eb861b] button span{display:block;line-height:1.9em;height:1.8em;border-radius:var(--elem-border-radius)}.v3dp__elements[data-v-65eb861b] button:not(:disabled):hover span{background-color:var(--elem-hover-bg-color);color:var(--elem-hover-color)}.v3dp__elements[data-v-65eb861b] button.selected span{background-color:var(--elem-selected-bg-color);color:var(--elem-selected-color)}.v3dp__elements[data-v-65eb861b] button.current span{font-weight:var(--elem-current-font-weight);outline:1px solid var(--elem-current-outline-color)}.v3dp__column[data-v-81ac698d]{display:flex;flex-direction:column;overflow-y:auto;height:190px}.v3dp__datepicker{--popout-bg-color: var(--vdp-bg-color, #fff);--box-shadow: var( --vdp-box-shadow, 0 4px 10px 0 rgba(128, 144, 160, .1), 0 0 1px 0 rgba(128, 144, 160, .81) );--text-color: var(--vdp-text-color, #000000);--border-radius: var(--vdp-border-radius, 3px);--heading-size: var(--vdp-heading-size, 2.5em);--heading-weight: var(--vdp-heading-weight, bold);--heading-hover-color: var(--vdp-heading-hover-color, #eeeeee);--arrow-color: var(--vdp-arrow-color, currentColor);--elem-color: var(--vdp-elem-color, currentColor);--elem-disabled-color: var(--vdp-disabled-color, #d5d9e0);--elem-hover-color: var(--vdp-hover-color, #fff);--elem-hover-bg-color: var(--vdp-hover-bg-color, #0baf74);--elem-selected-color: var(--vdp-selected-color, #fff);--elem-selected-bg-color: var(--vdp-selected-bg-color, #0baf74);--elem-current-outline-color: var(--vdp-current-date-outline-color, #888);--elem-current-font-weight: var(--vdp-current-date-font-weight, bold);--elem-font-size: var(--vdp-elem-font-size, .8em);--elem-border-radius: var(--vdp-elem-border-radius, 3px);--divider-color: var(--vdp-divider-color, var(--elem-disabled-color));position:relative}.v3dp__clearable{display:inline;position:relative;left:-15px;cursor:pointer}")), document.head.appendChild(e3);
    }
  } catch (o2) {
    console.error("vite-plugin-css-injected-by-js", o2);
  }
})();
const je2 = ["year", "month", "day", "time", "custom"], Ye = /* @__PURE__ */ defineComponent({
  emits: {
    elementClick: (e3) => isValid(e3),
    left: () => true,
    right: () => true,
    heading: () => true
  },
  props: {
    headingClickable: {
      type: Boolean,
      default: false
    },
    leftDisabled: {
      type: Boolean,
      default: false
    },
    rightDisabled: {
      type: Boolean,
      default: false
    },
    columnCount: {
      type: Number,
      default: 7
    },
    items: {
      type: Array,
      default: () => []
    },
    viewMode: {
      type: String,
      required: true,
      validate: (e3) => typeof e3 == "string" && je2.includes(e3)
    }
  }
});
const T2 = (e3, t4) => {
  const r2 = e3.__vccOpts || e3;
  for (const [l2, o2] of t4)
    r2[l2] = o2;
  return r2;
}, te = (e3) => (pushScopeId("data-v-65eb861b"), e3 = e3(), popScopeId(), e3), Ne = { class: "v3dp__heading" }, Ae = ["disabled"], Ue = /* @__PURE__ */ te(() => /* @__PURE__ */ createBaseVNode("svg", {
  class: "v3dp__heading__icon",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 6 8"
}, [
  /* @__PURE__ */ createBaseVNode("g", {
    fill: "none",
    "fill-rule": "evenodd"
  }, [
    /* @__PURE__ */ createBaseVNode("path", {
      stroke: "none",
      d: "M-9 16V-8h24v24z"
    }),
    /* @__PURE__ */ createBaseVNode("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      d: "M5 0L1 4l4 4"
    })
  ])
], -1)), We = ["disabled"], Ze = /* @__PURE__ */ te(() => /* @__PURE__ */ createBaseVNode("svg", {
  class: "v3dp__heading__icon",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 6 8"
}, [
  /* @__PURE__ */ createBaseVNode("g", {
    fill: "none",
    "fill-rule": "evenodd"
  }, [
    /* @__PURE__ */ createBaseVNode("path", {
      stroke: "none",
      d: "M15-8v24H-9V-8z"
    }),
    /* @__PURE__ */ createBaseVNode("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      d: "M1 8l4-4-4-4"
    })
  ])
], -1)), ze = { class: "v3dp__body" }, Ke = { class: "v3dp__subheading" }, Ge = /* @__PURE__ */ te(() => /* @__PURE__ */ createBaseVNode("hr", { class: "v3dp__divider" }, null, -1)), Je = { class: "v3dp__elements" }, Qe = ["disabled", "onClick"];
function Xe(e3, t4, r2, l2, o2, p2) {
  return openBlock(), createElementBlock("div", {
    class: normalizeClass(["v3dp__popout", `v3dp__popout-${e3.viewMode}`]),
    style: normalizeStyle({ ["--popout-column-definition"]: `repeat(${e3.columnCount}, 1fr)` }),
    onMousedown: t4[3] || (t4[3] = withModifiers(() => {
    }, ["prevent"]))
  }, [
    createBaseVNode("div", Ne, [
      createBaseVNode("button", {
        class: "v3dp__heading__button v3dp__heading__button__left",
        disabled: e3.leftDisabled,
        onClick: t4[0] || (t4[0] = withModifiers((n2) => e3.$emit("left"), ["stop", "prevent"]))
      }, [
        renderSlot(e3.$slots, "arrow-left", {}, () => [
          Ue
        ], true)
      ], 8, Ae),
      (openBlock(), createBlock(resolveDynamicComponent(e3.headingClickable ? "button" : "span"), {
        class: "v3dp__heading__center",
        onClick: t4[1] || (t4[1] = withModifiers((n2) => e3.$emit("heading"), ["stop", "prevent"]))
      }, {
        default: withCtx(() => [
          renderSlot(e3.$slots, "heading", {}, void 0, true)
        ]),
        _: 3
      })),
      createBaseVNode("button", {
        class: "v3dp__heading__button v3dp__heading__button__right",
        disabled: e3.rightDisabled,
        onClick: t4[2] || (t4[2] = withModifiers((n2) => e3.$emit("right"), ["stop", "prevent"]))
      }, [
        renderSlot(e3.$slots, "arrow-right", {}, () => [
          Ze
        ], true)
      ], 8, We)
    ]),
    createBaseVNode("div", ze, [
      "subheading" in e3.$slots ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        createBaseVNode("div", Ke, [
          renderSlot(e3.$slots, "subheading", {}, void 0, true)
        ]),
        Ge
      ], 64)) : createCommentVNode("", true),
      createBaseVNode("div", Je, [
        renderSlot(e3.$slots, "body", {}, () => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(e3.items, (n2) => (openBlock(), createElementBlock("button", {
            key: n2.key,
            disabled: n2.disabled,
            class: normalizeClass([
              {
                selected: n2.selected,
                current: n2.current
              },
              `v3dp__element__button__${e3.viewMode}`
            ]),
            onClick: withModifiers((a4) => e3.$emit("elementClick", n2.value), ["stop", "prevent"])
          }, [
            createBaseVNode("span", null, toDisplayString(n2.display), 1)
          ], 10, Qe))), 128))
        ], true)
      ])
    ])
  ], 38);
}
const G2 = /* @__PURE__ */ T2(Ye, [["render", Xe], ["__scopeId", "data-v-65eb861b"]]), xe = /* @__PURE__ */ defineComponent({
  components: {
    PickerPopup: G2
  },
  emits: {
    "update:pageDate": (e3) => isValid(e3),
    select: (e3) => isValid(e3)
  },
  props: {
    selected: {
      type: Date,
      required: false
    },
    pageDate: {
      type: Date,
      required: true
    },
    lowerLimit: {
      type: Date,
      required: false
    },
    upperLimit: {
      type: Date,
      required: false
    }
  },
  setup(e3, { emit: t4 }) {
    const r2 = computed(() => startOfDecade(e3.pageDate)), l2 = computed(() => endOfDecade(e3.pageDate)), o2 = (b3, y4, i3) => !y4 && !i3 ? true : !(y4 && getYear(b3) < getYear(y4) || i3 && getYear(b3) > getYear(i3)), p2 = computed(
      () => eachYearOfInterval({
        start: r2.value,
        end: l2.value
      }).map(
        (b3) => ({
          value: b3,
          key: String(getYear(b3)),
          display: getYear(b3),
          selected: !!e3.selected && getYear(b3) === getYear(e3.selected),
          disabled: !o2(b3, e3.lowerLimit, e3.upperLimit)
        })
      )
    ), n2 = computed(() => {
      const b3 = getYear(r2.value), y4 = getYear(l2.value);
      return `${b3} - ${y4}`;
    }), a4 = computed(
      () => e3.lowerLimit && (getDecade(e3.lowerLimit) === getDecade(e3.pageDate) || isBefore(e3.pageDate, e3.lowerLimit))
    ), f2 = computed(
      () => e3.upperLimit && (getDecade(e3.upperLimit) === getDecade(e3.pageDate) || isAfter(e3.pageDate, e3.upperLimit))
    );
    return {
      years: p2,
      heading: n2,
      leftDisabled: a4,
      rightDisabled: f2,
      previousPage: () => t4("update:pageDate", subYears(e3.pageDate, 10)),
      nextPage: () => t4("update:pageDate", addYears(e3.pageDate, 10))
    };
  }
});
function et(e3, t4, r2, l2, o2, p2) {
  const n2 = resolveComponent("picker-popup");
  return openBlock(), createBlock(n2, {
    columnCount: 3,
    leftDisabled: e3.leftDisabled,
    rightDisabled: e3.rightDisabled,
    items: e3.years,
    viewMode: "year",
    onLeft: e3.previousPage,
    onRight: e3.nextPage,
    onElementClick: t4[0] || (t4[0] = (a4) => e3.$emit("select", a4))
  }, {
    heading: withCtx(() => [
      createTextVNode(toDisplayString(e3.heading), 1)
    ]),
    _: 1
  }, 8, ["leftDisabled", "rightDisabled", "items", "onLeft", "onRight"]);
}
const tt = /* @__PURE__ */ T2(xe, [["render", et]]), at = /* @__PURE__ */ defineComponent({
  components: {
    PickerPopup: G2
  },
  emits: {
    "update:pageDate": (e3) => isValid(e3),
    select: (e3) => isValid(e3),
    back: () => true
  },
  props: {
    /**
     * Currently selected date, needed for highlighting
     */
    selected: {
      type: Date,
      required: false
    },
    pageDate: {
      type: Date,
      required: true
    },
    format: {
      type: String,
      required: false,
      default: "LLL"
    },
    locale: {
      type: Object,
      required: false
    },
    lowerLimit: {
      type: Date,
      required: false
    },
    upperLimit: {
      type: Date,
      required: false
    }
  },
  setup(e3, { emit: t4 }) {
    const r2 = computed(() => startOfYear(e3.pageDate)), l2 = computed(() => endOfYear(e3.pageDate)), o2 = computed(
      () => (y4) => format(y4, e3.format, {
        locale: e3.locale
      })
    ), p2 = (y4, i3, D3) => !i3 && !D3 ? true : !(i3 && isBefore(y4, startOfMonth(i3)) || D3 && isAfter(y4, endOfMonth(D3))), n2 = computed(
      () => eachMonthOfInterval({
        start: r2.value,
        end: l2.value
      }).map(
        (y4) => ({
          value: y4,
          display: o2.value(y4),
          key: o2.value(y4),
          selected: !!e3.selected && isSameMonth(e3.selected, y4),
          disabled: !p2(y4, e3.lowerLimit, e3.upperLimit)
        })
      )
    ), a4 = computed(() => getYear(r2.value)), f2 = computed(
      () => e3.lowerLimit && (isSameYear(e3.lowerLimit, e3.pageDate) || isBefore(e3.pageDate, e3.lowerLimit))
    ), _2 = computed(
      () => e3.upperLimit && (isSameYear(e3.upperLimit, e3.pageDate) || isAfter(e3.pageDate, e3.upperLimit))
    );
    return {
      months: n2,
      heading: a4,
      leftDisabled: f2,
      rightDisabled: _2,
      previousPage: () => t4("update:pageDate", subYears(e3.pageDate, 1)),
      nextPage: () => t4("update:pageDate", addYears(e3.pageDate, 1))
    };
  }
});
function nt(e3, t4, r2, l2, o2, p2) {
  const n2 = resolveComponent("picker-popup");
  return openBlock(), createBlock(n2, {
    headingClickable: "",
    columnCount: 3,
    items: e3.months,
    leftDisabled: e3.leftDisabled,
    rightDisabled: e3.rightDisabled,
    viewMode: "month",
    onLeft: e3.previousPage,
    onRight: e3.nextPage,
    onHeading: t4[0] || (t4[0] = (a4) => e3.$emit("back")),
    onElementClick: t4[1] || (t4[1] = (a4) => e3.$emit("select", a4))
  }, {
    heading: withCtx(() => [
      createTextVNode(toDisplayString(e3.heading), 1)
    ]),
    _: 1
  }, 8, ["items", "leftDisabled", "rightDisabled", "onLeft", "onRight"]);
}
const it = /* @__PURE__ */ T2(at, [["render", nt]]), lt = /* @__PURE__ */ defineComponent({
  components: {
    PickerPopup: G2
  },
  emits: {
    "update:pageDate": (e3) => isValid(e3),
    select: (e3) => isValid(e3),
    back: () => true
  },
  props: {
    selected: {
      type: Date,
      required: false
    },
    pageDate: {
      type: Date,
      required: true
    },
    format: {
      type: String,
      required: false,
      default: "dd"
    },
    headingFormat: {
      type: String,
      required: false,
      default: "LLLL yyyy"
    },
    weekdayFormat: {
      type: String,
      required: false,
      default: "EE"
    },
    locale: {
      type: Object,
      required: false
    },
    weekStartsOn: {
      type: Number,
      required: false,
      default: 1,
      validator: (e3) => typeof e3 == "number" && Number.isInteger(e3) && e3 >= 0 && e3 <= 6
    },
    lowerLimit: {
      type: Date,
      required: false
    },
    upperLimit: {
      type: Date,
      required: false
    },
    disabledDates: {
      type: Object,
      required: false
    },
    allowOutsideInterval: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(e3, { emit: t4 }) {
    const r2 = computed(
      () => (g2) => (v2) => format(v2, g2, {
        locale: e3.locale,
        weekStartsOn: e3.weekStartsOn
      })
    ), l2 = computed(() => startOfMonth(e3.pageDate)), o2 = computed(() => endOfMonth(e3.pageDate)), p2 = computed(() => ({
      start: l2.value,
      end: o2.value
    })), n2 = computed(() => ({
      start: startOfWeek(l2.value, {
        weekStartsOn: e3.weekStartsOn
      }),
      end: endOfWeek(o2.value, {
        weekStartsOn: e3.weekStartsOn
      })
    })), a4 = computed(() => {
      const g2 = e3.weekStartsOn, v2 = r2.value(e3.weekdayFormat);
      return Array.from(Array(7)).map((c3, k3) => (g2 + k3) % 7).map(
        (c3) => setDay(/* @__PURE__ */ new Date(), c3, {
          weekStartsOn: e3.weekStartsOn
        })
      ).map(v2);
    }), f2 = (g2, v2, c3, k3) => {
      var E3, J2;
      return (E3 = k3 == null ? void 0 : k3.dates) != null && E3.some((ae2) => isSameDay(g2, ae2)) || (J2 = k3 == null ? void 0 : k3.predicate) != null && J2.call(k3, g2) ? false : !v2 && !c3 ? true : !(v2 && isBefore(g2, startOfDay(v2)) || c3 && isAfter(g2, endOfDay(c3)));
    }, _2 = computed(() => {
      const g2 = /* @__PURE__ */ new Date(), v2 = r2.value(e3.format);
      return eachDayOfInterval(n2.value).map(
        (c3) => ({
          value: c3,
          display: v2(c3),
          selected: !!e3.selected && isSameDay(e3.selected, c3),
          current: isSameDay(g2, c3),
          disabled: !e3.allowOutsideInterval && !isWithinInterval(c3, p2.value) || !f2(
            c3,
            e3.lowerLimit,
            e3.upperLimit,
            e3.disabledDates
          ),
          key: r2.value("yyyy-MM-dd")(c3)
        })
      );
    }), d4 = computed(
      () => r2.value(e3.headingFormat)(e3.pageDate)
    ), b3 = computed(
      () => e3.lowerLimit && (isSameMonth(e3.lowerLimit, e3.pageDate) || isBefore(e3.pageDate, e3.lowerLimit))
    ), y4 = computed(
      () => e3.upperLimit && (isSameMonth(e3.upperLimit, e3.pageDate) || isAfter(e3.pageDate, e3.upperLimit))
    );
    return {
      weekDays: a4,
      days: _2,
      heading: d4,
      leftDisabled: b3,
      rightDisabled: y4,
      previousPage: () => t4("update:pageDate", subMonths(e3.pageDate, 1)),
      nextPage: () => t4("update:pageDate", addMonths(e3.pageDate, 1))
    };
  }
});
function ot(e3, t4, r2, l2, o2, p2) {
  const n2 = resolveComponent("picker-popup");
  return openBlock(), createBlock(n2, {
    headingClickable: "",
    leftDisabled: e3.leftDisabled,
    rightDisabled: e3.rightDisabled,
    items: e3.days,
    viewMode: "day",
    onLeft: e3.previousPage,
    onRight: e3.nextPage,
    onHeading: t4[0] || (t4[0] = (a4) => e3.$emit("back")),
    onElementClick: t4[1] || (t4[1] = (a4) => e3.$emit("select", a4))
  }, {
    heading: withCtx(() => [
      createTextVNode(toDisplayString(e3.heading), 1)
    ]),
    subheading: withCtx(() => [
      (openBlock(true), createElementBlock(Fragment, null, renderList(e3.weekDays, (a4, f2) => (openBlock(), createElementBlock("span", {
        key: a4,
        class: normalizeClass(`v3dp__subheading__weekday__${f2}`)
      }, toDisplayString(a4), 3))), 128))
    ]),
    _: 1
  }, 8, ["leftDisabled", "rightDisabled", "items", "onLeft", "onRight"]);
}
const st = /* @__PURE__ */ T2(lt, [["render", ot]]);
function se(e3, t4) {
  const r2 = e3.getBoundingClientRect(), l2 = {
    height: e3.clientHeight,
    width: e3.clientWidth
  }, o2 = t4.getBoundingClientRect();
  if (!(o2.top >= r2.top && o2.bottom <= r2.top + l2.height)) {
    const n2 = o2.top - r2.top, a4 = o2.bottom - r2.bottom;
    Math.abs(n2) < Math.abs(a4) ? e3.scrollTop += n2 : e3.scrollTop += a4;
  }
}
const rt = /* @__PURE__ */ defineComponent({
  components: {
    PickerPopup: G2
  },
  emits: {
    select: (e3) => isValid(e3),
    back: () => true
  },
  props: {
    selected: {
      type: Date,
      required: false
    },
    pageDate: {
      type: Date,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    },
    disabledTime: {
      type: Object,
      required: false
    }
  },
  setup(e3, { emit: t4 }) {
    const r2 = ref(null), l2 = ref(null), o2 = computed(() => e3.pageDate ?? e3.selected), p2 = ref(o2.value.getHours()), n2 = ref(o2.value.getMinutes());
    watch(
      () => e3.selected,
      (i3) => {
        let D3 = 0, g2 = 0;
        i3 && (D3 = i3.getHours(), g2 = i3.getMinutes()), p2.value = D3, n2.value = g2;
      }
    );
    const a4 = computed(
      () => [...Array(24).keys()].map(
        (i3) => ({
          value: i3,
          date: set(new Date(o2.value.getTime()), {
            hours: i3,
            minutes: n2.value,
            seconds: 0
          }),
          selected: p2.value === i3,
          ref: ref(null)
        })
      )
    ), f2 = computed(
      () => [...Array(60).keys()].map((i3) => ({
        value: i3,
        date: set(new Date(o2.value.getTime()), {
          hours: p2.value,
          minutes: i3,
          seconds: 0
        }),
        selected: n2.value === i3,
        ref: ref(null)
      }))
    ), _2 = (i3) => {
      n2.value = i3.value, t4("select", i3.date);
    }, d4 = () => {
      const i3 = a4.value.find(
        (g2) => {
          var v2, c3;
          return ((c3 = (v2 = g2.ref.value) == null ? void 0 : v2.classList) == null ? void 0 : c3.contains("selected")) ?? false;
        }
      ), D3 = f2.value.find(
        (g2) => {
          var v2, c3;
          return ((c3 = (v2 = g2.ref.value) == null ? void 0 : v2.classList) == null ? void 0 : c3.contains("selected")) ?? false;
        }
      );
      i3 && D3 && (se(r2.value, i3.ref.value), se(l2.value, D3.ref.value));
    };
    return watch(
      () => e3.visible,
      (i3) => {
        i3 && nextTick(d4);
      }
    ), {
      hoursListRef: r2,
      minutesListRef: l2,
      hours: p2,
      minutes: n2,
      hoursList: a4,
      minutesList: f2,
      padStartZero: (i3) => `0${i3}`.substr(-2),
      selectMinutes: _2,
      isEnabled: (i3) => {
        var D3, g2, v2, c3;
        return !((g2 = (D3 = e3.disabledTime) == null ? void 0 : D3.dates) != null && g2.some(
          (k3) => isSameHour(i3, k3) && isSameMinute(i3, k3)
        ) || (c3 = (v2 = e3.disabledTime) == null ? void 0 : v2.predicate) != null && c3.call(v2, i3));
      },
      scroll: d4
    };
  }
});
const dt = {
  ref: "hoursListRef",
  class: "v3dp__column"
}, ut = ["disabled", "onClick"], ct = {
  ref: "minutesListRef",
  class: "v3dp__column"
}, mt = ["disabled", "onClick"];
function ft(e3, t4, r2, l2, o2, p2) {
  const n2 = resolveComponent("picker-popup");
  return openBlock(), createBlock(n2, {
    headingClickable: "",
    columnCount: 2,
    leftDisabled: true,
    rightDisabled: true,
    viewMode: "time",
    onHeading: t4[0] || (t4[0] = (a4) => e3.$emit("back"))
  }, {
    heading: withCtx(() => [
      createTextVNode(toDisplayString(e3.padStartZero(e3.hours)) + ":" + toDisplayString(e3.padStartZero(e3.minutes)), 1)
    ]),
    body: withCtx(() => [
      createBaseVNode("div", dt, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(e3.hoursList, (a4) => (openBlock(), createElementBlock("button", {
          key: a4.value,
          ref_for: true,
          ref: a4.ref,
          class: normalizeClass([{ selected: a4.selected }, "v3dp__element_button__hour"]),
          disabled: !e3.isEnabled(a4.date),
          onClick: withModifiers((f2) => e3.hours = a4.value, ["stop", "prevent"])
        }, [
          createBaseVNode("span", null, toDisplayString(e3.padStartZero(a4.value)), 1)
        ], 10, ut))), 128))
      ], 512),
      createBaseVNode("div", ct, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(e3.minutesList, (a4) => (openBlock(), createElementBlock("button", {
          key: a4.value,
          ref_for: true,
          ref: a4.ref,
          class: normalizeClass([{ selected: a4.selected }, "v3dp__element_button__minute"]),
          disabled: !e3.isEnabled(a4.date),
          onClick: withModifiers((f2) => e3.selectMinutes(a4), ["stop", "prevent"])
        }, [
          createBaseVNode("span", null, toDisplayString(e3.padStartZero(a4.value)), 1)
        ], 10, mt))), 128))
      ], 512)
    ]),
    _: 1
  });
}
const pt = /* @__PURE__ */ T2(rt, [["render", ft], ["__scopeId", "data-v-81ac698d"]]), W = ["time", "day", "month", "year"], gt = (e3, t4, r2 = void 0) => {
  let l2 = r2 || /* @__PURE__ */ new Date();
  return e3 && (l2 = max([e3, l2])), t4 && (l2 = min([t4, l2])), l2;
}, vt = /* @__PURE__ */ defineComponent({
  components: {
    YearPicker: tt,
    MonthPicker: it,
    DayPicker: st,
    TimePicker: pt
  },
  inheritAttrs: false,
  props: {
    placeholder: {
      type: String,
      default: ""
    },
    /**
     * `v-model` for selected date
     */
    modelValue: {
      type: Date,
      required: false
    },
    /**
     * Dates not available for picking
     */
    disabledDates: {
      type: Object,
      required: false
    },
    allowOutsideInterval: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Time not available for picking
     */
    disabledTime: {
      type: Object,
      required: false
    },
    /**
     * Upper limit for available dates for picking
     */
    upperLimit: {
      type: Date,
      required: false
    },
    /**
     * Lower limit for available dates for picking
     */
    lowerLimit: {
      type: Date,
      required: false
    },
    /**
     * View on which the date picker should open. Can be either `year`, `month`, `day` or `time`
     */
    startingView: {
      type: String,
      required: false,
      default: "day",
      validate: (e3) => typeof e3 == "string" && W.includes(e3)
    },
    /**
     * Date which should be the "center" of the initial view.
     * When an empty datepicker opens, it focuses on the month/year
     * that contains this date
     */
    startingViewDate: {
      type: Date,
      required: false,
      default: () => /* @__PURE__ */ new Date()
    },
    /**
     * `date-fns`-type formatting for a month view heading
     */
    dayPickerHeadingFormat: {
      type: String,
      required: false,
      default: "LLLL yyyy"
    },
    /**
     * `date-fns`-type formatting for the month picker view
     */
    monthListFormat: {
      type: String,
      required: false,
      default: "LLL"
    },
    /**
     * `date-fns`-type formatting for a line of weekdays on day view
     */
    weekdayFormat: {
      type: String,
      required: false,
      default: "EE"
    },
    /**
     * `date-fns`-type formatting for the day picker view
     */
    dayFormat: {
      type: String,
      required: false,
      default: "dd"
    },
    /**
     * `date-fns`-type format in which the string in the input should be both
     * parsed and displayed
     */
    inputFormat: {
      type: String,
      required: false,
      default: "yyyy-MM-dd"
    },
    /**
     * [`date-fns` locale object](https://date-fns.org/v2.16.1/docs/I18n#usage).
     * Used in string formatting (see default `dayPickerHeadingFormat`)
     */
    locale: {
      type: Object,
      required: false
    },
    /**
     * Day on which the week should start.
     *
     * Number from 0 to 6, where 0 is Sunday and 6 is Saturday.
     * Week starts with a Monday (1) by default
     */
    weekStartsOn: {
      type: Number,
      required: false,
      default: 1,
      validator: (e3) => [0, 1, 2, 3, 4, 5, 6].includes(e3)
    },
    /**
     * Disables datepicker and prevents it's opening
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Clears selected date
     */
    clearable: {
      type: Boolean,
      required: false,
      default: false
    },
    /*
     * Allows user to input date manually
     */
    typeable: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * If set, lower-level views won't show
     */
    minimumView: {
      type: String,
      required: false,
      default: "day",
      validate: (e3) => typeof e3 == "string" && W.includes(e3)
    }
  },
  emits: {
    "update:modelValue": (e3) => e3 == null || isValid(e3),
    decadePageChanged: (e3) => true,
    yearPageChanged: (e3) => true,
    monthPageChanged: (e3) => true,
    opened: () => true,
    closed: () => true
  },
  setup(e3, { emit: t4, attrs: r2 }) {
    const l2 = ref("none"), o2 = ref(e3.startingViewDate), p2 = ref(null), n2 = ref(false), a4 = ref("");
    watchEffect(() => {
      const s4 = parse(a4.value, e3.inputFormat, /* @__PURE__ */ new Date(), {
        locale: e3.locale
      });
      isValid(s4) && (o2.value = s4);
    }), watchEffect(
      () => a4.value = e3.modelValue && isValid(e3.modelValue) ? format(e3.modelValue, e3.inputFormat, {
        locale: e3.locale
      }) : ""
    );
    const f2 = (s4 = "none") => {
      e3.disabled || (s4 !== "none" && l2.value === "none" && (o2.value = e3.modelValue || gt(e3.lowerLimit, e3.upperLimit, o2.value)), l2.value = s4, t4(s4 !== "none" ? "opened" : "closed"));
    };
    watchEffect(() => {
      e3.disabled && (l2.value = "none");
    });
    const _2 = (s4, V2) => {
      o2.value = V2, s4 === "year" ? t4("decadePageChanged", V2) : s4 === "month" ? t4("yearPageChanged", V2) : s4 === "day" && t4("monthPageChanged", V2);
    }, d4 = (s4) => {
      o2.value = s4, e3.minimumView === "year" ? (f2("none"), t4("update:modelValue", s4)) : l2.value = "month";
    }, b3 = (s4) => {
      o2.value = s4, e3.minimumView === "month" ? (f2("none"), t4("update:modelValue", s4)) : l2.value = "day";
    }, y4 = (s4) => {
      o2.value = s4, e3.minimumView === "day" ? (f2("none"), t4("update:modelValue", s4)) : l2.value = "time";
    }, i3 = (s4) => {
      f2("none"), t4("update:modelValue", s4);
    }, D3 = () => {
      e3.clearable && (f2("none"), t4("update:modelValue", null), o2.value = e3.startingViewDate);
    }, g2 = () => n2.value = true, v2 = () => f2(E3.value), c3 = () => {
      n2.value = false, f2();
    }, k3 = (s4) => {
      const V2 = s4.keyCode ? s4.keyCode : s4.which;
      if ([
        27,
        // escape
        13
        // enter
      ].includes(V2) && p2.value.blur(), e3.typeable) {
        const Q3 = parse(
          p2.value.value,
          e3.inputFormat,
          /* @__PURE__ */ new Date(),
          { locale: e3.locale }
        );
        isValid(Q3) && a4.value === format(Q3, e3.inputFormat, { locale: e3.locale }) && (a4.value = p2.value.value, t4("update:modelValue", Q3));
      }
    }, E3 = computed(() => {
      const s4 = W.indexOf(e3.startingView), V2 = W.indexOf(e3.minimumView);
      return s4 < V2 ? e3.minimumView : e3.startingView;
    });
    return {
      blur: c3,
      focus: v2,
      click: g2,
      input: a4,
      inputRef: p2,
      pageDate: o2,
      renderView: f2,
      updatePageDate: _2,
      selectYear: d4,
      selectMonth: b3,
      selectDay: y4,
      selectTime: i3,
      keyUp: k3,
      viewShown: l2,
      goBackFromTimepicker: () => e3.startingView === "time" && e3.minimumView === "time" ? null : l2.value = "day",
      clearModelValue: D3,
      initialView: E3,
      log: (s4) => console.log(s4),
      variables: (s4) => Object.fromEntries(
        Object.entries(s4 ?? {}).filter(([V2, fe2]) => V2.startsWith("--"))
      )
    };
  }
});
const yt = { class: "v3dp__input_wrapper" }, bt = ["readonly", "placeholder", "disabled", "tabindex"], ht = { class: "v3dp__clearable" };
function Dt(e3, t4, r2, l2, o2, p2) {
  const n2 = resolveComponent("year-picker"), a4 = resolveComponent("month-picker"), f2 = resolveComponent("day-picker"), _2 = resolveComponent("time-picker");
  return openBlock(), createElementBlock("div", {
    class: "v3dp__datepicker",
    style: normalizeStyle(e3.variables(e3.$attrs.style))
  }, [
    createBaseVNode("div", yt, [
      withDirectives(createBaseVNode("input", mergeProps({
        type: "text",
        ref: "inputRef",
        readonly: !e3.typeable,
        "onUpdate:modelValue": t4[0] || (t4[0] = (d4) => e3.input = d4)
      }, e3.$attrs, {
        placeholder: e3.placeholder,
        disabled: e3.disabled,
        tabindex: e3.disabled ? -1 : 0,
        onKeyup: t4[1] || (t4[1] = (...d4) => e3.keyUp && e3.keyUp(...d4)),
        onBlur: t4[2] || (t4[2] = (...d4) => e3.blur && e3.blur(...d4)),
        onFocus: t4[3] || (t4[3] = (...d4) => e3.focus && e3.focus(...d4)),
        onClick: t4[4] || (t4[4] = (...d4) => e3.click && e3.click(...d4))
      }), null, 16, bt), [
        [vModelText, e3.input]
      ]),
      withDirectives(createBaseVNode("div", ht, [
        renderSlot(e3.$slots, "clear", { onClear: e3.clearModelValue }, () => [
          createBaseVNode("i", {
            onClick: t4[5] || (t4[5] = (d4) => e3.clearModelValue())
          }, "x")
        ])
      ], 512), [
        [vShow, e3.clearable && e3.modelValue]
      ])
    ]),
    withDirectives(createVNode(n2, {
      pageDate: e3.pageDate,
      "onUpdate:pageDate": t4[6] || (t4[6] = (d4) => e3.updatePageDate("year", d4)),
      selected: e3.modelValue,
      lowerLimit: e3.lowerLimit,
      upperLimit: e3.upperLimit,
      onSelect: e3.selectYear
    }, null, 8, ["pageDate", "selected", "lowerLimit", "upperLimit", "onSelect"]), [
      [vShow, e3.viewShown === "year"]
    ]),
    withDirectives(createVNode(a4, {
      pageDate: e3.pageDate,
      "onUpdate:pageDate": t4[7] || (t4[7] = (d4) => e3.updatePageDate("month", d4)),
      selected: e3.modelValue,
      onSelect: e3.selectMonth,
      lowerLimit: e3.lowerLimit,
      upperLimit: e3.upperLimit,
      format: e3.monthListFormat,
      locale: e3.locale,
      onBack: t4[8] || (t4[8] = (d4) => e3.viewShown = "year")
    }, null, 8, ["pageDate", "selected", "onSelect", "lowerLimit", "upperLimit", "format", "locale"]), [
      [vShow, e3.viewShown === "month"]
    ]),
    withDirectives(createVNode(f2, {
      pageDate: e3.pageDate,
      "onUpdate:pageDate": t4[9] || (t4[9] = (d4) => e3.updatePageDate("day", d4)),
      selected: e3.modelValue,
      weekStartsOn: e3.weekStartsOn,
      lowerLimit: e3.lowerLimit,
      upperLimit: e3.upperLimit,
      headingFormat: e3.dayPickerHeadingFormat,
      disabledDates: e3.disabledDates,
      locale: e3.locale,
      weekdayFormat: e3.weekdayFormat,
      "allow-outside-interval": e3.allowOutsideInterval,
      format: e3.dayFormat,
      onSelect: e3.selectDay,
      onBack: t4[10] || (t4[10] = (d4) => e3.viewShown = "month")
    }, null, 8, ["pageDate", "selected", "weekStartsOn", "lowerLimit", "upperLimit", "headingFormat", "disabledDates", "locale", "weekdayFormat", "allow-outside-interval", "format", "onSelect"]), [
      [vShow, e3.viewShown === "day"]
    ]),
    withDirectives(createVNode(_2, {
      pageDate: e3.pageDate,
      visible: e3.viewShown === "time",
      selected: e3.modelValue,
      disabledTime: e3.disabledTime,
      onSelect: e3.selectTime,
      onBack: e3.goBackFromTimepicker
    }, null, 8, ["pageDate", "visible", "selected", "disabledTime", "onSelect", "onBack"]), [
      [vShow, e3.viewShown === "time"]
    ])
  ], 4);
}
const Lt = /* @__PURE__ */ T2(vt, [["render", Dt]]);
function fromIsoDate(dt2) {
  return new Date(dt2.replace("Z", "").replace("T", " "));
}
const _hoisted_1$4 = /* @__PURE__ */ createBaseVNode("div", { class: "splitter" }, null, -1);
const _hoisted_2$4 = /* @__PURE__ */ createBaseVNode("div", { class: "splitter" }, null, -1);
const _hoisted_3$1 = /* @__PURE__ */ createBaseVNode("div", { class: "splitter" }, null, -1);
const _hoisted_4$1 = /* @__PURE__ */ createBaseVNode("div", { class: "splitter" }, null, -1);
const _hoisted_5$1 = {
  ref: "timelineCanvas",
  id: "timeline-viewer",
  height: "40"
};
const _hoisted_6$1 = { class: "tick-text" };
const _hoisted_7$1 = /* @__PURE__ */ createBaseVNode("div", { class: "splitter" }, null, -1);
const _hoisted_8$1 = /* @__PURE__ */ createBaseVNode("div", { class: "splitter" }, null, -1);
const _hoisted_9$1 = { class: "tick hours-total" };
const _hoisted_10$1 = { class: "tick-text" };
function calculateCursorPosition(e3, width, numberTicks) {
  let canvasX = e3.e.layerX;
  let tickPercentage = canvasX / width;
  let val = Math.round(tickPercentage * numberTicks);
  if (val >= numberTicks - 1) {
    val = numberTicks - 2;
  }
  if (val <= 0) {
    val = 0;
  }
  return val;
}
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "Timeline",
  props: {
    currentImageIndex: {},
    isFollowing: { type: Boolean },
    currentDay: {}
  },
  emits: ["day-change", "minute-index-change", "toggle-follow"],
  setup(__props, { emit: __emit }) {
    const timeColor = "#86DA9D";
    const relapseStore = useRelapseStore();
    let canvas = null;
    let rect;
    let hoverRect;
    const isReady = ref(false);
    const skipChangeIncrement = ref(0);
    const skipChangeMultipler = ref(0.1);
    const skipDirection = ref("");
    function toggleFollow() {
      emit2("toggle-follow", !props.isFollowing);
    }
    const emit2 = __emit;
    const props = __props;
    const times = computed(() => {
      return relapseStore.captures;
    });
    watch(() => props.currentDay, () => {
      redrawCanvas();
    });
    watch(() => props.currentImageIndex, () => {
      redrawCanvas();
    });
    const currentCapture = computed(() => {
      if (relapseStore.currentDay && relapseStore.captures) {
        return relapseStore.captures[props.currentImageIndex];
      }
    });
    const currentCaptureDate = computed(() => {
      if (currentCapture.value && currentCapture.value.Dt) {
        return fromIsoDate(currentCapture.value.Dt);
      }
    });
    const timelineReadyStyle = computed(() => {
      if (isReady.value) {
        return "opacity:1;";
      }
      return "opacity:0;";
    });
    const hhmm = computed(() => {
      var _a2;
      if (props.currentDay) {
        let capturedMins = ((_a2 = props.currentDay.Summary) == null ? void 0 : _a2.TotalCapturedMinutes) ?? 0;
        let hours = Math.floor(capturedMins / 60);
        let mins = capturedMins % 60;
        return `${hours}h ${mins}m`;
      }
      return "";
    });
    const timesWhereIsWholeHour = computed(() => {
      const wholeHours = times.value.filter((t4) => {
        let actualDate = new Date(t4.Dt);
        if (actualDate.getMinutes() === 0 && actualDate.getSeconds() === 0) {
          return true;
        }
        return false;
      });
      return [...wholeHours];
    });
    function prevDay() {
      const newDate = subDays(currentCaptureDate.value, 1);
      relapseStore.loadDay(newDate);
    }
    function nextDay() {
      const newDate = addDays(currentCaptureDate.value, 1);
      relapseStore.loadDay(newDate);
    }
    function today() {
      relapseStore.loadToday();
    }
    function dayChanged(date) {
      if (date) {
        relapseStore.loadDay(date);
      }
    }
    function prevSkip(inc = 1) {
      inc = -1 * inc;
      var newValue = props.currentImageIndex + inc;
      minuteChanged(newValue);
    }
    function nextSkip(inc = 1) {
      var newValue = props.currentImageIndex + inc;
      minuteChanged(newValue);
    }
    function prevSkipOn() {
      skipChangeIncrement.value = 1;
      skipDirection.value = "prev";
    }
    function prevSkipOff() {
      skipChangeIncrement.value = 0;
      skipChangeMultipler.value = 0.1;
      skipDirection.value = "";
    }
    function nextSkipOn() {
      skipChangeIncrement.value = 1;
      skipDirection.value = "next";
    }
    function nextSkipOff() {
      skipChangeIncrement.value = 0;
      skipChangeMultipler.value = 0.1;
      skipDirection.value = "";
    }
    function minuteChanged(index) {
      emit2("minute-index-change", index);
      moveMinuteLinePosition(index);
    }
    function moveMinuteLinePosition(index) {
      console.log("moveMinuteLinePosition happend");
      var xPos = getLinePoint(index);
      rect.set({ left: xPos });
      canvas.renderAll();
    }
    function moveMinuteHoverLinePosition(index) {
      var xPos = getLinePoint(index);
      hoverRect.set({ left: xPos, height: 60 });
      canvas.renderAll();
    }
    function hideMinuteHoverLine() {
      hoverRect.set({ height: 0 });
      canvas.renderAll();
    }
    function markerStyle(index) {
      let percent = index / (timesWhereIsWholeHour.value.length - 1) * 100;
      return `left: ${percent}%;`;
    }
    function getLinePoint(index) {
      var linePoint = 0;
      if (canvas && canvas.width) {
        return canvas.width * (index / times.value.length * 100) / 100;
      }
      return linePoint;
    }
    function formatDateSmall(dt2) {
      if (dt2) {
        let date = fromIsoDate(dt2);
        if (date) {
          return format(date, "haa");
        }
      }
      return "";
    }
    function redrawCanvas() {
      console.log("redrawingcanvas");
      if (!canvas)
        canvas = new mn("timeline-viewer");
      let bgColor = "";
      if (document && document.documentElement) {
        bgColor = getComputedStyle(document.documentElement).getPropertyValue(
          "--theme-input-bg"
        );
      }
      canvas.setDimensions({
        width: window.innerWidth - (240 + 240 + 7 * 1),
        height: 34
      });
      canvas.clear();
      let lineWidth = 0;
      if (canvas && canvas.width) {
        lineWidth = canvas.width * (1 / times.value.length * 100) / 100;
      }
      let currentOnOffness = false;
      let lastRectIndex = 0;
      for (let i3 = 0; i3 < times.value.length; i3++) {
        let time = times.value[i3];
        let left = getLinePoint(i3);
        if (i3 === 0) {
          currentOnOffness = time.IsReal;
          lastRectIndex = left;
        } else if (currentOnOffness !== time.IsReal) {
          canvas.add(
            new rr({
              width: left - lastRectIndex,
              height: 40,
              left: lastRectIndex,
              top: 0,
              stroke: !time.IsReal ? timeColor : bgColor,
              // reversed because its not real
              fill: !time.IsReal ? timeColor : bgColor,
              // reversed because its not real
              selectable: false
            })
          );
          lastRectIndex = left;
          currentOnOffness = time.IsReal;
        } else if (i3 === times.value.length - 1) {
          canvas.add(
            new rr({
              width: left - lastRectIndex,
              height: 40,
              left: lastRectIndex,
              top: 0,
              stroke: time.IsReal ? timeColor : bgColor,
              // this is the actualness :)
              fill: time.IsReal ? timeColor : bgColor,
              // this is the actualness :)
              selectable: false
            })
          );
        }
      }
      rect = new rr({
        width: lineWidth,
        height: 60,
        left: getLinePoint(props.currentImageIndex),
        top: 0,
        stroke: "#f2ae57",
        fill: "#f2ae57",
        selectable: false
      });
      hoverRect = new rr({
        width: lineWidth * 1,
        height: 0,
        left: getLinePoint(props.currentImageIndex),
        top: -1,
        stroke: "#F65C26",
        fill: "#F65C26",
        selectable: false
      });
      canvas.add(rect);
      canvas.add(hoverRect);
      isReady.value = true;
    }
    function goleft(inc = 1) {
      prevSkip(inc);
    }
    function goRight(inc = 1) {
      nextSkip(inc);
    }
    ref(0);
    ref(100);
    function dayChanging(timeEvent) {
      if (timeEvent === "prevDay") {
        prevDay();
      } else if (timeEvent === "nextDay") {
        nextDay();
      } else if (timeEvent === "today") {
        today();
      }
      if (timeEvent === "left") {
        goleft();
      } else if (timeEvent === "right") {
        goRight();
      } else if (timeEvent === "left-1min") {
        goleft(2);
      } else if (timeEvent === "right-1min") {
        goRight(2);
      }
    }
    let interval;
    function onSchemeChange(event) {
      event.matches ? "dark" : "light";
      isReady.value = false;
      redrawCanvas();
    }
    onMounted(() => {
      let panning = false;
      if (!canvas)
        canvas = new mn("timeline-viewer");
      canvas.selection = false;
      canvas.setDimensions({ width: window.innerWidth - 40, height: 40 });
      redrawCanvas();
      emitter.on("time-function", (ev) => {
        console.log("time-function");
        dayChanging(ev);
      });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onSchemeChange);
      window.addEventListener("resize", redrawCanvas);
      canvas.on("mouse:up", (e3) => {
        minuteChanged(calculateCursorPosition(e3, canvas.width, times.value.length));
        panning = false;
      });
      canvas.on("mouse:down", (e3) => {
        minuteChanged(calculateCursorPosition(e3, canvas.width, times.value.length));
        panning = true;
      });
      canvas.on("mouse:out", (e3) => {
        hideMinuteHoverLine();
      });
      canvas.on("mouse:move", (e3) => {
        if (e3 && e3.e) {
          if (panning) {
            minuteChanged(calculateCursorPosition(e3, canvas.width, times.value.length));
          } else {
            moveMinuteHoverLinePosition(calculateCursorPosition(e3, canvas.width, times.value.length));
          }
        }
      });
    });
    onUnmounted(() => {
      clearInterval(interval);
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", onSchemeChange);
      window.removeEventListener("resize", redrawCanvas);
    });
    return (_ctx, _cache) => {
      var _a2;
      const _component_ico = resolveComponent("ico");
      return openBlock(), createElementBlock("div", {
        class: "timeline",
        style: normalizeStyle(timelineReadyStyle.value)
      }, [
        createBaseVNode("button", {
          class: "side-btn prev-day",
          onClick: prevDay,
          title: "Previous Day"
        }, [
          createVNode(_component_ico, { icon: "arrow-from-right" })
        ]),
        _hoisted_1$4,
        createBaseVNode("button", {
          class: "side-btn prev-minute",
          onClick: _cache[0] || (_cache[0] = ($event) => goleft(1)),
          onMousedown: prevSkipOn,
          onMouseup: prevSkipOff,
          title: "Previous 30 Seconds"
        }, [
          createVNode(_component_ico, { icon: "angle-left" })
        ], 32),
        _hoisted_2$4,
        createBaseVNode("button", {
          class: normalizeClass(["side-btn prev-minute", { "toggle-follow-on": _ctx.isFollowing }]),
          onClick: toggleFollow,
          title: "Follow Captures"
        }, [
          createVNode(_component_ico, { icon: "repeat-square-icon" })
        ], 2),
        _hoisted_3$1,
        (openBlock(), createElementBlock("div", {
          class: "picker",
          key: (_a2 = unref(currentCaptureDate)) == null ? void 0 : _a2.toISOString()
        }, [
          createVNode(unref(Lt), {
            "model-value": unref(currentCaptureDate),
            "input-format": "d MMM yyyy h:mm:ss aa",
            "onUpdate:modelValue": dayChanged
          }, null, 8, ["model-value"])
        ])),
        _hoisted_4$1,
        createBaseVNode("div", {
          class: "canvas-bg",
          style: normalizeStyle(timelineReadyStyle.value)
        }, [
          createBaseVNode("canvas", _hoisted_5$1, null, 512),
          (openBlock(true), createElementBlock(Fragment, null, renderList(timesWhereIsWholeHour.value, (time, index) => {
            return openBlock(), createElementBlock("div", {
              class: "tick",
              style: normalizeStyle(markerStyle(index)),
              key: index
            }, [
              createTextVNode("   "),
              createBaseVNode("div", _hoisted_6$1, toDisplayString(formatDateSmall(time.Dt)), 1)
            ], 4);
          }), 128))
        ], 4),
        _hoisted_7$1,
        createBaseVNode("button", {
          class: "side-btn next-30-sec",
          onClick: _cache[1] || (_cache[1] = ($event) => goRight(1)),
          onMousedown: nextSkipOn,
          onMouseup: nextSkipOff,
          title: "Next 30 Seconds"
        }, [
          createVNode(_component_ico, { icon: "angle-right" })
        ], 32),
        _hoisted_8$1,
        createBaseVNode("button", {
          class: "side-btn next-day",
          onClick: nextDay,
          title: "Next Day"
        }, [
          createVNode(_component_ico, { icon: "arrow-from-left" })
        ]),
        createBaseVNode("div", _hoisted_9$1, [
          createBaseVNode("div", _hoisted_10$1, [
            createVNode(_component_ico, {
              icon: "clock",
              class: "is-small-icon"
            }),
            createBaseVNode("div", null, toDisplayString(unref(hhmm)), 1)
          ])
        ])
      ], 4);
    };
  }
});
const Timeline_vue_vue_type_style_index_0_lang = "";
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "Home",
  async setup(__props) {
    let __temp, __restore;
    const relapseStore = useRelapseStore();
    const __$temp_1 = storeToRefs(relapseStore), currentDay = toRef(__$temp_1, "currentDay"), earliestCaptureIndex = toRef(__$temp_1, "earliestCaptureIndex"), latestCaptureIndex = toRef(__$temp_1, "latestCaptureIndex");
    let currentImageI = ref(-1);
    const currentImageIndex = computed(() => {
      return currentImageI.value >= 0 ? currentImageI.value : earliestCaptureIndex.value + 1;
    });
    const currentCapture = computed(() => {
      if (currentDay.value && currentDay.value.Captures) {
        return currentDay.value.Captures[currentImageIndex.value];
      }
    });
    let isFollowing = ref(false);
    [__temp, __restore] = withAsyncContext(() => relapseStore.loadToday()), await __temp, __restore();
    [__temp, __restore] = withAsyncContext(() => relapseStore.loadSettings()), await __temp, __restore();
    emitter.on("screen-captured", (day) => {
      var _a2;
      if (day && day.Bod === ((_a2 = relapseStore.currentDay) == null ? void 0 : _a2.Bod)) {
        if (isFollowing.value) {
          currentImageI.value = latestCaptureIndex.value || currentImageIndex.value;
        }
      }
      if (day.Bod) {
        relapseStore.loadDay(new Date(currentDay.value.Bod));
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        currentDay.value ? (openBlock(), createBlock(_sfc_main$6, {
          key: 0,
          "current-day": currentDay.value,
          "current-image-index": currentImageIndex.value,
          "is-following": unref(isFollowing),
          onMinuteIndexChange: _cache[0] || (_cache[0] = (i3) => isRef(currentImageI) ? currentImageI.value = i3 : currentImageI = i3),
          onToggleFollow: _cache[1] || (_cache[1] = ($event) => isRef(isFollowing) ? isFollowing.value = !unref(isFollowing) : isFollowing = !unref(isFollowing))
        }, null, 8, ["current-day", "current-image-index", "is-following"])) : createCommentVNode("", true),
        createVNode(_sfc_main$7, { "current-capture": currentCapture.value }, null, 8, ["current-capture"])
      ], 64);
    };
  }
});
const _hoisted_1$3 = {
  key: 1,
  class: "day-summary"
};
const _hoisted_2$3 = {
  class: "day-summary-table",
  border: "1"
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "DaySummary",
  setup(__props) {
    const relapseStore = useRelapseStore();
    const __$temp_1 = storeToRefs(relapseStore), currentDay = toRef(__$temp_1, "currentDay");
    toRef(__$temp_1, "earliestCaptureIndex");
    toRef(__$temp_1, "latestCaptureIndex");
    let currentImageIndex = ref(-1);
    let isFollowing = ref(false);
    const realCaptures = computed(() => {
      if (currentDay.value) {
        return currentDay.value.Captures.filter((c3) => {
          return c3.IsReal;
        });
      }
    });
    onMounted(async () => {
      await relapseStore.loadToday();
    });
    return (_ctx, _cache) => {
      const _component_summary_footer = resolveComponent("summary-footer");
      return openBlock(), createElementBlock(Fragment, null, [
        currentDay.value ? (openBlock(), createBlock(_sfc_main$6, {
          key: 0,
          "current-image-index": unref(currentImageIndex),
          onMinuteIndexChange: _cache[0] || (_cache[0] = (i3) => isRef(currentImageIndex) ? currentImageIndex.value = i3 : currentImageIndex = i3),
          "is-following": unref(isFollowing),
          onToggleFollow: _cache[1] || (_cache[1] = ($event) => isRef(isFollowing) ? isFollowing.value = !unref(isFollowing) : isFollowing = !unref(isFollowing))
        }, null, 8, ["current-image-index", "is-following"])) : createCommentVNode("", true),
        currentDay.value ? (openBlock(), createElementBlock("div", _hoisted_1$3, [
          createTextVNode(toDisplayString(currentDay.value.Summary) + " ", 1),
          createBaseVNode("table", _hoisted_2$3, [
            createBaseVNode("tbody", null, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(realCaptures.value, (capture, index) => {
                return openBlock(), createElementBlock("tr", null, [
                  createBaseVNode("td", null, toDisplayString(capture.AppName), 1)
                ]);
              }), 256))
            ])
          ])
        ])) : createCommentVNode("", true),
        createVNode(_component_summary_footer)
      ], 64);
    };
  }
});
const DaySummary_vue_vue_type_style_index_0_lang = "";
const _sfc_main$3 = {
  name: "about",
  components: {},
  computed: {},
  methods: {},
  data: function() {
    return {};
  },
  mounted() {
  }
};
const _hoisted_1$2 = /* @__PURE__ */ createBaseVNode("div", { class: "about" }, [
  /* @__PURE__ */ createBaseVNode("div", { class: "block" }, [
    /* @__PURE__ */ createBaseVNode("div"),
    /* @__PURE__ */ createBaseVNode("h1", null, "Relapse"),
    /* @__PURE__ */ createBaseVNode("h2", null, " Created by "),
    /* @__PURE__ */ createBaseVNode("h3", null, [
      /* @__PURE__ */ createTextVNode(" Lead Developer @ "),
      /* @__PURE__ */ createBaseVNode("br"),
      /* @__PURE__ */ createTextVNode(" NERDY - ")
    ])
  ])
], -1);
const _hoisted_2$2 = [
  _hoisted_1$2
];
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", null, _hoisted_2$2);
}
const About = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$1]]);
var b2 = { name: "Toggle", emits: ["input", "update:modelValue", "change"], props: { ...{ value: { validator: function(e3) {
  return (e4) => -1 !== ["number", "string", "boolean"].indexOf(typeof e4) || null == e4;
}, required: false }, modelValue: { validator: function(e3) {
  return (e4) => -1 !== ["number", "string", "boolean"].indexOf(typeof e4) || null == e4;
}, required: false } }, id: { type: [String, Number], required: false, default: "toggle" }, name: { type: [String, Number], required: false, default: "toggle" }, disabled: { type: Boolean, required: false, default: false }, required: { type: Boolean, required: false, default: false }, falseValue: { type: [String, Number, Boolean], required: false, default: false }, trueValue: { type: [String, Number, Boolean], required: false, default: true }, onLabel: { type: [String, Object], required: false, default: "" }, offLabel: { type: [String, Object], required: false, default: "" }, classes: { type: Object, required: false, default: () => ({}) }, labelledby: { type: String, required: false }, describedby: { type: String, required: false }, aria: { required: false, type: Object, default: () => ({}) } }, setup(a4, d4) {
  const n2 = function(a5, d5, n3) {
    const { value: t5, modelValue: u4, falseValue: i4, trueValue: c3, disabled: r2 } = toRefs(a5), o2 = u4 && void 0 !== u4.value ? u4 : t5, s4 = computed(() => o2.value === c3.value), g2 = (e3) => {
      d5.emit("input", e3), d5.emit("update:modelValue", e3), d5.emit("change", e3);
    }, b3 = () => {
      g2(c3.value);
    }, f2 = () => {
      g2(i4.value);
    };
    return -1 !== [null, void 0, false, 0, "0", "off"].indexOf(o2.value) && -1 === [i4.value, c3.value].indexOf(o2.value) && f2(), -1 !== [true, 1, "1", "on"].indexOf(o2.value) && -1 === [i4.value, c3.value].indexOf(o2.value) && b3(), { externalValue: o2, checked: s4, update: g2, check: b3, uncheck: f2, handleInput: (e3) => {
      g2(e3.target.checked ? c3.value : i4.value);
    }, handleClick: () => {
      r2.value || (s4.value ? f2() : b3());
    } };
  }(a4, d4), t4 = function(a5, d5, n3) {
    const { trueValue: t5, falseValue: u4, onLabel: i4, offLabel: c3 } = toRefs(a5), r2 = n3.checked, o2 = n3.update;
    return { label: computed(() => {
      let e3 = r2.value ? i4.value : c3.value;
      return e3 || (e3 = "&nbsp;"), e3;
    }), toggle: () => {
      o2(r2.value ? u4.value : t5.value);
    }, on: () => {
      o2(t5.value);
    }, off: () => {
      o2(u4.value);
    } };
  }(a4, 0, { checked: n2.checked, update: n2.update }), u3 = function(a5, d5, n3) {
    const t5 = toRefs(a5), u4 = t5.disabled, i4 = n3.checked, c3 = computed(() => ({ container: "toggle-container", toggle: "toggle", toggleOn: "toggle-on", toggleOff: "toggle-off", toggleOnDisabled: "toggle-on-disabled", toggleOffDisabled: "toggle-off-disabled", handle: "toggle-handle", handleOn: "toggle-handle-on", handleOff: "toggle-handle-off", handleOnDisabled: "toggle-handle-on-disabled", handleOffDisabled: "toggle-handle-off-disabled", label: "toggle-label", ...t5.classes.value }));
    return { classList: computed(() => ({ container: c3.value.container, toggle: [c3.value.toggle, u4.value ? i4.value ? c3.value.toggleOnDisabled : c3.value.toggleOffDisabled : i4.value ? c3.value.toggleOn : c3.value.toggleOff], handle: [c3.value.handle, u4.value ? i4.value ? c3.value.handleOnDisabled : c3.value.handleOffDisabled : i4.value ? c3.value.handleOn : c3.value.handleOff], label: c3.value.label })) };
  }(a4, 0, { checked: n2.checked }), i3 = function(l2, a5, d5) {
    const { disabled: n3 } = toRefs(l2), t5 = d5.check, u4 = d5.uncheck, i4 = d5.checked;
    return { handleSpace: () => {
      n3.value || (i4.value ? u4() : t5());
    } };
  }(a4, 0, { check: n2.check, uncheck: n2.uncheck, checked: n2.checked });
  return { ...n2, ...u3, ...t4, ...i3 };
} };
const f = ["tabindex", "aria-checked", "aria-describedby", "aria-labelledby"], h3 = ["id", "name", "value", "checked", "disabled"], v = ["innerHTML"], p = ["checked"];
b2.render = function(e3, l2, b3, k3, y4, O3) {
  return openBlock(), createElementBlock("div", mergeProps({ class: e3.classList.container, tabindex: b3.disabled ? void 0 : 0, "aria-checked": e3.checked, "aria-describedby": b3.describedby, "aria-labelledby": b3.labelledby, role: "switch" }, b3.aria, { onKeypress: l2[1] || (l2[1] = withKeys(withModifiers((...l3) => e3.handleSpace && e3.handleSpace(...l3), ["prevent"]), ["space"])) }), [withDirectives(createBaseVNode("input", { type: "checkbox", id: b3.id, name: b3.name, value: b3.trueValue, checked: e3.checked, disabled: b3.disabled }, null, 8, h3), [[vShow, false]]), createBaseVNode("div", { class: normalizeClass(e3.classList.toggle), onClick: l2[0] || (l2[0] = (...l3) => e3.handleClick && e3.handleClick(...l3)) }, [createBaseVNode("span", { class: normalizeClass(e3.classList.handle) }, null, 2), renderSlot(e3.$slots, "label", { checked: e3.checked, classList: e3.classList }, () => [createBaseVNode("span", { class: normalizeClass(e3.classList.label), innerHTML: e3.label }, null, 10, v)]), b3.required ? (openBlock(), createElementBlock("input", { key: 0, type: "checkbox", style: { appearance: "none", height: "1px", margin: "0", padding: "0", fontSize: "0", background: "transparent", position: "absolute", width: "100%", bottom: "0", outline: "none" }, checked: e3.checked, "aria-hidden": "true", tabindex: "-1", required: "" }, null, 8, p)) : createCommentVNode("v-if", true)], 2)], 16, f);
}, b2.__file = "src/Toggle.vue";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppRejectionToggle",
  props: {
    app: {},
    rejections: {}
  },
  emits: ["input"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    const props = __props;
    computed(() => {
      if (props.rejections.includes(props.app.AppName)) {
        return "is-reject";
      }
      return "is-capturing";
    });
    const val = computed(() => {
      if (props.rejections.includes(props.app.AppName)) {
        return false;
      }
      return true;
    });
    function changeToggle() {
      if (val.value) {
        setReject();
      } else {
        setCapture();
      }
    }
    function setCapture() {
      emit2("input", { app: props.app, state: "CAPTURING" });
    }
    function setReject() {
      emit2("input", { app: props.app, state: "REJECTING" });
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(b2), {
        "model-value": val.value,
        "on-label": "Capture",
        "off-label": "Ignore",
        onInput: changeToggle
      }, null, 8, ["model-value"]);
    };
  }
});
const AppRejectionToggle_vue_vue_type_style_index_0_lang = "";
const Numeric_vue_vue_type_style_index_0_lang = "";
const _sfc_main$1 = {
  name: "numeric",
  computed: {},
  props: {
    value: {
      type: Number,
      required: true
    },
    min: Number,
    max: Number
  },
  methods: {
    numberUp() {
      var newVal = this.value + 1;
      this.numberChanged(newVal);
    },
    numberDown() {
      var newVal = this.value - 1;
      this.numberChanged(newVal);
    },
    numberChanged(val) {
      if (typeof val === "number")
        ;
      else {
        val = val.target.value;
      }
      if (val > this.min && val < this.max) {
        this.$emit("updated", val);
      }
    },
    blurred() {
      this.$forceUpdate();
    }
  }
};
const _hoisted_1$1 = { class: "numeric-input-wrapper" };
const _hoisted_2$1 = ["value"];
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ico = resolveComponent("ico");
  return openBlock(), createElementBlock("div", _hoisted_1$1, [
    createBaseVNode("input", {
      class: "numeric-input",
      value: $props.value,
      onInput: _cache[0] || (_cache[0] = (...args) => $options.numberChanged && $options.numberChanged(...args)),
      onBlur: _cache[1] || (_cache[1] = (...args) => $options.blurred && $options.blurred(...args))
    }, null, 40, _hoisted_2$1),
    createBaseVNode("button", {
      class: "number-btn number-up",
      onClick: _cache[2] || (_cache[2] = (...args) => $options.numberUp && $options.numberUp(...args))
    }, [
      createVNode(_component_ico, {
        icon: "angle-up",
        size: "small"
      })
    ]),
    createBaseVNode("button", {
      class: "number-btn number-down",
      onClick: _cache[3] || (_cache[3] = (...args) => $options.numberDown && $options.numberDown(...args))
    }, [
      createVNode(_component_ico, {
        icon: "angle-down",
        size: "small"
      })
    ])
  ]);
}
const Numeric = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render]]);
function _isPlaceholder(a4) {
  return a4 != null && typeof a4 === "object" && a4["@@functional/placeholder"] === true;
}
function _curry1(fn2) {
  return function f1(a4) {
    if (arguments.length === 0 || _isPlaceholder(a4)) {
      return f1;
    } else {
      return fn2.apply(this, arguments);
    }
  };
}
function _curry2(fn2) {
  return function f2(a4, b3) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a4) ? f2 : _curry1(function(_b) {
          return fn2(a4, _b);
        });
      default:
        return _isPlaceholder(a4) && _isPlaceholder(b3) ? f2 : _isPlaceholder(a4) ? _curry1(function(_a2) {
          return fn2(_a2, b3);
        }) : _isPlaceholder(b3) ? _curry1(function(_b) {
          return fn2(a4, _b);
        }) : fn2(a4, b3);
    }
  };
}
function _curry3(fn2) {
  return function f3(a4, b3, c3) {
    switch (arguments.length) {
      case 0:
        return f3;
      case 1:
        return _isPlaceholder(a4) ? f3 : _curry2(function(_b, _c) {
          return fn2(a4, _b, _c);
        });
      case 2:
        return _isPlaceholder(a4) && _isPlaceholder(b3) ? f3 : _isPlaceholder(a4) ? _curry2(function(_a2, _c) {
          return fn2(_a2, b3, _c);
        }) : _isPlaceholder(b3) ? _curry2(function(_b, _c) {
          return fn2(a4, _b, _c);
        }) : _curry1(function(_c) {
          return fn2(a4, b3, _c);
        });
      default:
        return _isPlaceholder(a4) && _isPlaceholder(b3) && _isPlaceholder(c3) ? f3 : _isPlaceholder(a4) && _isPlaceholder(b3) ? _curry2(function(_a2, _b) {
          return fn2(_a2, _b, c3);
        }) : _isPlaceholder(a4) && _isPlaceholder(c3) ? _curry2(function(_a2, _c) {
          return fn2(_a2, b3, _c);
        }) : _isPlaceholder(b3) && _isPlaceholder(c3) ? _curry2(function(_b, _c) {
          return fn2(a4, _b, _c);
        }) : _isPlaceholder(a4) ? _curry1(function(_a2) {
          return fn2(_a2, b3, c3);
        }) : _isPlaceholder(b3) ? _curry1(function(_b) {
          return fn2(a4, _b, c3);
        }) : _isPlaceholder(c3) ? _curry1(function(_c) {
          return fn2(a4, b3, _c);
        }) : fn2(a4, b3, c3);
    }
  };
}
var type = /* @__PURE__ */ _curry1(function type2(val) {
  return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
});
const type$1 = type;
function _cloneRegExp(pattern) {
  return new RegExp(pattern.source, pattern.flags ? pattern.flags : (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "") + (pattern.sticky ? "y" : "") + (pattern.unicode ? "u" : "") + (pattern.dotAll ? "s" : ""));
}
function _clone(value, deep, map) {
  map || (map = new _ObjectMap());
  if (_isPrimitive(value)) {
    return value;
  }
  var copy = function copy2(copiedValue) {
    var cachedCopy = map.get(value);
    if (cachedCopy) {
      return cachedCopy;
    }
    map.set(value, copiedValue);
    for (var key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        copiedValue[key] = deep ? _clone(value[key], true, map) : value[key];
      }
    }
    return copiedValue;
  };
  switch (type$1(value)) {
    case "Object":
      return copy(Object.create(Object.getPrototypeOf(value)));
    case "Array":
      return copy(Array(value.length));
    case "Date":
      return new Date(value.valueOf());
    case "RegExp":
      return _cloneRegExp(value);
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
    case "BigInt64Array":
    case "BigUint64Array":
      return value.slice();
    default:
      return value;
  }
}
function _isPrimitive(param) {
  var type3 = typeof param;
  return param == null || type3 != "object" && type3 != "function";
}
var _ObjectMap = /* @__PURE__ */ function() {
  function _ObjectMap2() {
    this.map = {};
    this.length = 0;
  }
  _ObjectMap2.prototype.set = function(key, value) {
    var hashedKey = this.hash(key);
    var bucket = this.map[hashedKey];
    if (!bucket) {
      this.map[hashedKey] = bucket = [];
    }
    bucket.push([key, value]);
    this.length += 1;
  };
  _ObjectMap2.prototype.hash = function(key) {
    var hashedKey = [];
    for (var value in key) {
      hashedKey.push(Object.prototype.toString.call(key[value]));
    }
    return hashedKey.join();
  };
  _ObjectMap2.prototype.get = function(key) {
    if (this.length <= 180) {
      for (var p2 in this.map) {
        var bucket = this.map[p2];
        for (var i3 = 0; i3 < bucket.length; i3 += 1) {
          var element = bucket[i3];
          if (element[0] === key) {
            return element[1];
          }
        }
      }
      return;
    }
    var hashedKey = this.hash(key);
    var bucket = this.map[hashedKey];
    if (!bucket) {
      return;
    }
    for (var i3 = 0; i3 < bucket.length; i3 += 1) {
      var element = bucket[i3];
      if (element[0] === key) {
        return element[1];
      }
    }
  };
  return _ObjectMap2;
}();
var clone = /* @__PURE__ */ _curry1(function clone2(value) {
  return value != null && typeof value.clone === "function" ? value.clone() : _clone(value, true);
});
const clone$1 = clone;
var remove = /* @__PURE__ */ _curry3(function remove2(start, count, list) {
  var result = Array.prototype.slice.call(list, 0);
  result.splice(start, count);
  return result;
});
const remove$1 = remove;
const _hoisted_1 = { class: "settings" };
const _hoisted_2 = /* @__PURE__ */ createBaseVNode("div", { class: "title-bar" }, [
  /* @__PURE__ */ createBaseVNode("h4", { class: "title is-4 has-text-centered pt-1" }, "Settings")
], -1);
const _hoisted_3 = {
  key: 0,
  class: "settings-content"
};
const _hoisted_4 = { class: "form-field" };
const _hoisted_5 = /* @__PURE__ */ createBaseVNode("label", null, "Retain Screenshots for Days", -1);
const _hoisted_6 = { class: "form-field" };
const _hoisted_7 = /* @__PURE__ */ createBaseVNode("label", null, " Active application capture rejection ", -1);
const _hoisted_8 = { class: "app-exclusions" };
const _hoisted_9 = { class: "app-name" };
const _hoisted_10 = { class: "app-toggle" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Settings",
  setup(__props) {
    const relapseModule = useRelapseStore();
    const isLoaded = computed(() => {
      if (relapseModule.appSettings) {
        return true;
      }
      return false;
    });
    const appSettings = computed(() => {
      var _a2;
      return (_a2 = relapseModule.appSettings) == null ? void 0 : _a2.Settings;
    });
    const rejections = computed(() => {
      var _a2;
      return ((_a2 = relapseModule.appSettings) == null ? void 0 : _a2.Settings.Rejections) || [];
    });
    const options = computed(() => {
      var _a2;
      return (_a2 = relapseModule.appSettings) == null ? void 0 : _a2.SettingsOptions;
    });
    onMounted(() => {
      relapseModule.loadSettings();
    });
    function updateRetainForX(val) {
      if (appSettings.value) {
        let settings = relapseModule.appSettings.Settings;
        settings.RetainForXDays = val;
      }
    }
    function updateRejections({
      app: app2,
      state
    }) {
      console.log(app2, state);
      if (appSettings.value) {
        let settings = clone$1(relapseModule.appSettings.Settings);
        if (!settings.Rejections) {
          settings.Rejections = [];
        }
        let appNameIndex = settings.Rejections.indexOf(app2.AppName);
        console.log("appNameIndex", settings.Rejections, app2.AppName, appNameIndex);
        if (state === "CAPTURING") {
          if (appNameIndex >= 0) {
            settings.Rejections = remove$1(
              appNameIndex,
              1,
              settings.Rejections
            );
          }
        } else {
          if (appNameIndex === -1) {
            settings.Rejections.push(app2.AppName);
          }
        }
        relapseModule.saveSettings(settings);
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _hoisted_2,
        isLoaded.value && appSettings.value && options.value ? (openBlock(), createElementBlock("div", _hoisted_3, [
          createBaseVNode("div", _hoisted_4, [
            _hoisted_5,
            createVNode(Numeric, {
              min: 6,
              max: 91,
              value: appSettings.value.RetainForXDays,
              onUpdated: updateRetainForX
            }, null, 8, ["value"])
          ]),
          createBaseVNode("div", _hoisted_6, [
            _hoisted_7,
            createBaseVNode("div", _hoisted_8, [
              createBaseVNode("table", null, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(options.value.CapturedApplications, (app2) => {
                  return openBlock(), createElementBlock("tr", {
                    class: "",
                    key: app2.AppName
                  }, [
                    createBaseVNode("td", _hoisted_9, toDisplayString(app2.AppName), 1),
                    createBaseVNode("td", _hoisted_10, [
                      createVNode(_sfc_main$2, {
                        app: app2,
                        rejections: rejections.value,
                        onInput: updateRejections
                      }, null, 8, ["app", "rejections"])
                    ])
                  ]);
                }), 128))
              ])
            ])
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const default_css_vue_type_style_index_0_src_true_lang = "";
const Settings_vue_vue_type_style_index_1_lang = "";
const app = createApp(_sfc_main$9);
const routes = [
  { path: "/", component: _sfc_main$5 },
  { path: "/summary", component: _sfc_main$4 },
  { path: "/about", component: About },
  { path: "/settings", component: _sfc_main }
];
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes
  // short for `routes: routes`
});
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.component("ico", Icons);
app.mount("#app");
On$1("screen-captured", (event) => {
  console.log("screen-captured", event);
  emitter.emit("screen-captured", event.data);
});
On$1("zoom", (event) => emitter.emit("zoom", event.data));
On$1("zoom", (event) => emitter.emit("zoom", event.data));
On$1("zoom", (event) => emitter.emit("zoom", event.data));
On$1("time-function", (event) => emitter.emit("time-function", event.data));
On$1("time-function", (event) => emitter.emit("time-function", event.data));
On$1("time-function", (event) => emitter.emit("time-function", event.data));
On$1("time-function", (event) => emitter.emit("time-function", event.data));
On$1("time-function", (event) => emitter.emit("time-function", event.data));
