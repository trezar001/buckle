//application dependencies
const electron = require('electron');
const { remote, app, BrowserWindow, ipcMain } = electron;

//variables to store window data
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

//listen for when application tells us to create window
ipcMain.on('openmodal', (e)=>{
  openModal();
})

//listen for when application tells us to close window

ipcMain.on('closemodal', (e, data)=>{
  modal.close();
  mainWindow.webContents.send('refresh', data)
})

//create a new window with the temp.html file
ipcMain.on('enlarge', (e)=>{
  enlarge();
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

//pop out the viewport from buckle.js
function enlarge() {
  modal = new BrowserWindow({
    width: 720,
    height: 480,
    resizable: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true
    },
  });

  modal.loadFile('temp.html')
}



