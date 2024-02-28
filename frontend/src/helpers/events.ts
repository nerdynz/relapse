class EventStreamer {
  src: EventSource;
  callbacks: {
    [eventType: string]: Set<(arg?: any, arg2?: any) => any>; // will a set here ensure uniqueness
  };

  constructor(url: string = "http://localhost:5020/events?stream=messages") {
    (this.src = new EventSource(url)), (this.callbacks = {});
    this.src.onmessage = (e) => {
      const data: { messageType: string; data: any } = JSON.parse(e.data);
      if (this.callbacks[data.messageType]) {
        for (let cb of Array.from(this.callbacks[data.messageType])) {
          cb(data.data);
        }
      }
    };
  }

  addEvent(eventType: string, callback: (arg?: any, arg2?: any) => any) {
    if (this.callbacks[eventType]) {
      this.callbacks[eventType].add(callback);
    } else {
      this.callbacks[eventType] = new Set();
      this.callbacks[eventType].add(callback);
    }
  }
}

const eventStreamer = new EventStreamer();
export function eventsOn(
  eventType: string,
  callback: (arg?: any, arg2?: any) => any
) {
  eventStreamer.addEvent(eventType, callback);
}

export function trigger(
  event: string,
  payload: any = null,
  window = "MainWindow"
) {
  console.log("triggering event", event, "on window", window);
  let url = "http://localhost:5020/trigger?qs=1";
  if (event) {
    url += `&event=${event}`;
  }
  if (window) {
    url += `&window=${window}`;
  }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: payload, 
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
}
