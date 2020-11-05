const electron = require('electron')
const fs = require('fs')
const {ipcRenderer} = electron;

const submit = document.getElementById('subbtn');

let data = {
    name: null,
    css: null,
    js: null
}

submit.onclick = () =>{
    data.name = document.getElementById('name').value;
    data.css = document.getElementById('css').value;
    data.js = document.getElementById('js').value;

    let dirname = './custom/' + data.name;
    fs.mkdir(dirname, (err) => {
        console.log(err);
    })
    fs.copyFile(data.css, dirname+'/'+data.css, (err) => {
        console.log(err);
    })
    fs.copyFile(data.js, dirname+'/'+data.js, (err) => {
        console.log(err);
    })
    ipcRenderer.send('closemodal');
}
