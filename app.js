const electron = require('electron');

const { app, BrowserWindow } = electron;

let mainWindow;

//listen for app to be ready
app.on('ready',function(){

    mainWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        webPreferences: {
          nodeIntegration: true
        }
    })

    mainWindow.loadFile('index.html')
})




