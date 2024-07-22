const { contextBridge, ipcRenderer } = require('electron')

/**
 * preload script를 통해 renderer process에서 node 환경 정보를 global 객체로 미리 선언된 것을 가치고 올 수 있다 (bridge역할)
 * -> context brige라 하는 것.
 */
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    // we can also expose variables, not just functions

    ping: () => ipcRenderer.invoke('ping'),
})
