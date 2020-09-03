const electron = require('electron');

const { app, BrowserWindow } = electron;

let mainWindow;

//listen for app to be ready
app.on('ready',function(){

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true
        }
    })

    mainWindow.loadFile('index.html')
})




