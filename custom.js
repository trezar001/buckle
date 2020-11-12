const electron = require('electron')
const fs = require('fs')
const {ipcRenderer} = electron;

const submit = document.getElementById('subbtn');

let data = {
    name: null,
    javascript: null,
    css: null,
    resources: [],
    components: []
}

submit.onclick = () =>{
    data.name = document.getElementById('name').value;
    data.css = document.getElementById('css').value;
    data.javascript = document.getElementById('js').value;

    let dirname = './custom/' + data.name;
    fs.mkdir(dirname, (err) => {
        console.log(err);
    })
    fs.copyFile(data.css, dirname+'/'+data.css, (err) => {
        console.log(err);
    })
    fs.copyFile(data.javascript, dirname+'/'+data.javascript, (err) => {
        console.log(err);
    })

    let json = JSON.stringify(data);
    fs.writeFile(dirname+'/'+data.name+'.json', json, (err) => {
        console.log(err);
    })

    ipcRenderer.send('closemodal');
}
