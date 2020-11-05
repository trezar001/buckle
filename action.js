let frameworkdropdown = document.getElementById('frameworkdropdown')
let customdropdown = document.getElementById('customdropdown')

const electron = require('electron')
const {ipcRenderer} = electron;
const fs = require('fs')

const highlighter = require('./syntax.js');
const { fstat } = require('fs');
const display = document.getElementById('framework').contentWindow
const collection = document.getElementById('collection')

const materializebtn = document.getElementById('materialize')
const bootstrapbtn = document.getElementById('bootstrap')
const custombtn = document.getElementById('create-custom')

let curComponent = null

let frameworks = [];
let customframeworks = [];

fs.readdir('./frameworks', (err, files) => {
    files.forEach(file => {
        let path = './frameworks/' + file
        frameworks.push(path)
    })
    console.log(frameworks)
    updateDropdown(frameworks, 'frameworks')
})

fs.readdir('./custom', (err, dir) => {
    dir.forEach(newdir => {
        fs.readdir('./custom/'+newdir, (err, files) => {
            files.forEach(file => {
                let path = './custom/' + newdir + '/' + file;
                if(path.endsWith('.json')){
                    customframeworks.push(path)
                }
            })
        })
    });
    
    console.log(customframeworks)
    updateDropdown(customframeworks, 'customs')
})


let editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.setOptions({
    vScrollBarAlwaysVisible: true
})
editor.session.setMode("ace/mode/html");
editor.resize()

components = document.querySelectorAll('.component')

let dropdowns = document.querySelectorAll('.dropdown-trigger')
for (let i = 0; i < dropdowns.length; i++){
    M.Dropdown.init(dropdowns[i]);
}

custombtn.onclick = ()=> {
    ipcRenderer.send('openmodal');
}

function generate(framework){

    display.postMessage({'action': 'switch', 'javascript': framework.javascript, 'css': framework.css, 'resources': framework.resources})
    collection.innerHTML = ''
    editor.session.setValue('')

    framework.components.forEach(component =>{
        console.log(component.name)
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(component.name));
        li.className = 'collection-item component'
        li.onclick = (e =>{
            //let description = document.getElementById('component-description')
            curComponent = li;
            editor.session.setValue(component.code)
            display.postMessage({'action': 'render', 'code': editor.session.getValue()})
        })
        collection.appendChild(li)
    }) 

    render = document.getElementById('render-btn');
    render.onclick = (e =>{
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
    })

    refresh = document.getElementById('refresh-btn');
    refresh.onclick = (e =>{
        framework.components.forEach(entry => {
            if (curComponent.innerHTML == entry.name){
                editor.session.setValue(entry.code)
                display.postMessage({'action': 'refresh', 'code': editor.session.getValue()})
            }
        })
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})

    })
}

function updateDropdown(frameworks, type){
    if (type == 'customs'){
        customdropdown.innerHTML = '';
    }
    else{
        frameworkdropdown.innerHTML = '';
    }
    
    frameworks.forEach(framework => {
        let data = fs.readFileSync(framework)
        let component = JSON.parse(data);
 
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.href = '#';
        a.id = component.name;
        a.appendChild(document.createTextNode(component.name));
        li.appendChild(a);
        li.className = 'collection-item'
        li.onclick = (e =>{
            generate(component)
        })
        let divider = document.createElement('li');
        divider.className = 'divider';
        if (type == 'customs'){
            customdropdown.appendChild(li);
            customdropdown.appendChild(divider);
        }
        else{
            frameworkdropdown.appendChild(li);
            frameworkdropdown.appendChild(divider);
        }
    })
}


