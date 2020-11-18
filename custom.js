const electron = require('electron')
const fs = require('fs')
const {ipcRenderer} = electron;

const submit = document.getElementById('subbtn');

let data = {
    name: null,
    resources: [],
    components: []
}

submit.onclick = () =>{
    data.name = document.getElementById('name').value;
    let dirname = './custom/' + data.name;

    fs.mkdir(dirname, (err) => {
        console.log(err);
    })

    if (document.getElementById('css').value){
        let css = {"type": "css", "href": ""}
        css.href = document.getElementById('css').value;
        data.resources.push(css)
        let dest = dirname+'/'+css.href
        fs.copyFileSync(css.href, dest)
        css.href = dest
    }
    if (document.getElementById('js').value){
        let javascript =  {"type": "script", "src": ""}
        javascript.src = document.getElementById('js').value;  
        data.resources.push(javascript)  
        let dest = dirname+'/'+javascript.src
        fs.copyFileSync(javascript.src, dest)
        javascript.src = dest
    }
    
    
    

    let json = JSON.stringify(data);
    fs.writeFile(dirname+'/'+data.name+'.json', json, (err) => {
        console.log(err);
    })

    ipcRenderer.send('closemodal', {'name' : data.name});
}
