const electron = require('electron');

const { app, BrowserWindow } = electron;

let mainWindow;

//listee for app to be ready
app.on('ready',function(){

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true
        }
    })
})

