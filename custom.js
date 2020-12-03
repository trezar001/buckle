//application dependencies
const electron = require('electron')
const fs = require('fs')
const {ipcRenderer} = electron;

//get html components
const submit = document.getElementById('subbtn');

//create empty object to store framework data
let data = {
    name: null,
    resources: [],
    components: []
}

submit.onclick = () =>{
    //get the name and create a new directory 
    data.name = document.getElementById('name').value;
    let dirname = './custom/' + data.name;

    fs.mkdir(dirname, (err) => {
        console.log(err);
    })

    //if a css file was added, then record it for framework json and copy it to the directory
    if (document.getElementById('css').value){
        let css = {"type": "css", "href": ""}
        css.href = document.getElementById('css').value;
        data.resources.push(css)

        let dest = dirname+'/'+css.href
        fs.copyFileSync(css.href, dest)
        css.href = dest
    }

    //if a javascript file was added, then record it for framework json and copy it to the directory
    if (document.getElementById('js').value){
        let javascript =  {"type": "script", "src": ""}
        javascript.src = document.getElementById('js').value;  
        data.resources.push(javascript)  

        let dest = dirname+'/'+javascript.src
        fs.copyFileSync(javascript.src, dest)
        javascript.src = dest
    }
    
    //create the json file  
    let json = JSON.stringify(data);
    fs.writeFile(dirname+'/'+data.name+'.json', json, (err) => {
        console.log(err);
    })

    //tell the main window that we're done
    ipcRenderer.send('closemodal', {'name' : data.name});
}
