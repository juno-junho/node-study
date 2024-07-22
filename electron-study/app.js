/**
 * 이 app.js가 electron application의 entry point
 * main process를 컨트롤한다.
 * responsible for controlling your app's lifecycle,
 * - displaying native interfaces,
 * - performing privileged operations, and managing renderer processes ..etc
 */
console.log('Hello from Electron 👋')

const { app, BrowserWindow } = require('electron')
// app : controls your application's event lifecycle.
// BrowserWindow : creates and manages app windows

const createWindow = () => { // load web page into new BrowserWindow
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    win.loadFile('index.html')
}

/**
 * 많은 electron의 코어 모듈들은 Node.js event emitter로 node의 비동기 이벤트 드리븐 아키텍처를 준수한다.
 * app module이 이 emitter중 하나이다.
 *
 * electron에서는 BrowserWindows는 앱 모듈의 ready 이벤트가 발생한 직후 시작될 수 있다.
 * app.whenReady() api를 통해서 ready 이벤트를 기다릴 수 있고, 프로미스가 fulfilled 되면 createWindow()를 호출 가능
 */
app.whenReady().then(() => {
    createWindow()
})
