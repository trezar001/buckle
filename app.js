const electron = require('electron');

const { remote, app, BrowserWindow, ipcMain } = electron;

let mainWindow;
let modal;

//listen for app to be ready
app.on('ready',function(){

    mainWindow = new BrowserWindow({
        minWidth: 1080,
        minHeight: 720,
        resizable: true,
        webPreferences: {
          nodeIntegration: true
        }
    })

    mainWindow.loadFile('index.html')
})

//catch requests
ipcMain.on('openmodal', (e)=>{
  openModal();
})

ipcMain.on('closemodal', (e)=>{
  modal.close();
  mainWindow.webContents.send('refresh')
})


//open new window
function openModal() {
  modal = new BrowserWindow({
    width: 720,
    height: 480,
    resizable: false,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true
    },
    modal: true
  });

  modal.loadFile('custom.html')
}



