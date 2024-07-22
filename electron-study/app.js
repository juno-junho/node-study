/**
 * 이 app.js가 electron application의 entry point
 * main process를 컨트롤한다.
 * responsible for controlling your app's lifecycle,
 * - displaying native interfaces,
 * - performing privileged operations, and managing renderer processes ..etc
 */
console.log('Hello from Electron 👋')

const { app, BrowserWindow , ipcMain} = require('electron')
// app : controls your application's event lifecycle.
// BrowserWindow : creates and manages app windows
const path = require('node:path')


const createWindow = () => { // load web page into new BrowserWindow
    const girhubWin = new BrowserWindow({
        width: 800,
        height: 1500
    })
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html');
    girhubWin.loadURL('https://github.com');

    console.log(win.webContents);
    console.log(girhubWin.webContents);
}

/**
 * 많은 electron의 코어 모듈들은 Node.js event emitter로 node의 비동기 이벤트 드리븐 아키텍처를 준수한다.
 * app module이 이 emitter중 하나이다.
 *
 * electron에서는 BrowserWindows는 앱 모듈의 ready 이벤트가 발생한 직후 시작될 수 있다.
 * app.whenReady() api를 통해서 ready 이벤트를 기다릴 수 있고, 프로미스가 fulfilled 되면 createWindow()를 호출 가능
 */
app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

console.log(process.platform); // 'darwin' -> macOS, 'win32' -> Windows, 'linux' -> Linux

/**
 * application window는 운영체제에 따라 다르게 동작한다.
 * electron은 이러한 컨벤션을 default로 따르는대신, 따를지 선택 가능하다.
 *
 */
// window나 linux에서 window 닫는 것은 application을 전체 종료하는 것이다.
// 반면 macOS에서는 window가 열려있지 않아도 계쏙 동작한다. window가 사용가능하지 않을 때 app을 동작시키기 위해서 새로운 창을 열어야한다
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
