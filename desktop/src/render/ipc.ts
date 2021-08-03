import { Plugin } from 'vue'

declare module "@vue/runtime-core" {
  //Bind to `this` keyword
  interface ComponentCustomProperties {
    $ipc: IIpcModule;
  }
}

export interface IIpcModule {
  send(channel:string, arg1?: any, arg2?: any, arg3?: any) : void
  receive(channel:string, func: (arg1?: any, arg2?: any, arg3?: any) => void) : void
}

export const ipcPlugin: Plugin = {
  install (app, options?: { [key: string]: any }) {
    app.config.globalProperties.$ipc = ipc;
  }
}

const ipc : IIpcModule = {
  send (channel:string, arg1?: any, arg2?: any, arg3?: any) {
    console.log('IPC SEND: ', channel, arg1 || '', arg2 || '', arg3 || '')

    // @ts-ignore
    window.ipcRenderer.send(channel, arg1, arg2, arg3)
  },
  receive (channel:string, func: (arg1?: any, arg2?: any, arg3?: any) => void) {
    // @ts-ignore
    window.ipcRenderer.receive(channel, (arg1?: any, arg2?: any, arg3?: any) => {
      console.log('IPC RECEIVE: ', channel, arg1 || '', arg2 || '', arg3 || '')
      func(arg1, arg2, arg3)
    })
  }
}
export default ipc;