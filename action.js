let frameworkdropdown = document.getElementById('frameworkdropdown')
let customdropdown = document.getElementById('customdropdown')
let componentName = document.getElementById('component-name')
let addbtn = document.getElementById('add-btn')

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

let origframeworks = [];
let customframeworks = [];


fs.readdirSync('./frameworks').forEach(file => {
        let path = './frameworks/' + file
        origframeworks.push(path)
})

updateDropdown(origframeworks, 'frameworks')


fs.readdirSync('./custom').forEach(newdir => {
    fs.readdirSync('./custom/'+newdir).forEach(file => {
        let path = './custom/' + newdir + '/' + file;
        if(path.endsWith('.json')){
            customframeworks.push(path)
        }
    })
})
    
updateDropdown(customframeworks, 'customs')


let editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.setOptions({
    vScrollBarAlwaysVisible: true
})
editor.session.setMode("ace/mode/html");
editor.resize()

let dropdowns = document.querySelectorAll('.dropdown-trigger')
for (let i = 0; i < dropdowns.length; i++){
    M.Dropdown.init(dropdowns[i]);
}

custombtn.onclick = ()=> {
    ipcRenderer.send('openmodal');
}

ipcRenderer.on('refresh', () => {
    refreshCustoms()
    updateDropdown(customframeworks, 'customs')
})

function refreshCustoms(){
    customframeworks = []
    fs.readdirSync('./custom').forEach(newdir => {
        fs.readdirSync('./custom/'+newdir).forEach(file => {
            let path = './custom/' + newdir + '/' + file;
            if(path.endsWith('.json')){
                customframeworks.push(path)
            }
        })
    })
}

function generateCustom(framework, path){
    let dir = path.split('/');
    dir.pop();
    dir = dir.join('/')

    let js = dir+'/'+framework.javascript
    let css = dir+'/'+framework.css
    let resources = framework.resources

    display.postMessage({'action': 'switch', 'javascript': js, 'css': css, 'resources': resources})
    collection.innerHTML = ''
    addbtn.style = 'width: 20%; visibility: hidden;'
    componentName.style = 'width: 75%; visibility: hidden;'
    editor.session.setValue('')

    framework.components.forEach(component =>{
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(component.name));
        li.className = 'collection-item component'
        li.onclick = (e =>{
            components = document.querySelectorAll('.component')
            components.forEach(item => {
                item.className = 'collection-item component'
            })
            add = document.querySelector('.addbtn')
            add.className = 'collection-item addbtn center teal-text text-lighten-2'
            addbtn.style = 'width: 20%; visibility: hidden;'
            componentName.style = 'width: 75%; visibility: hidden;'
            li.className = 'collection-item component active'
            curComponent = li;
            editor.session.setValue(component.code)
            display.postMessage({'action': 'render', 'code': editor.session.getValue()})
        })
        collection.appendChild(li)
    }) 

    let li = document.createElement('li');
    let icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.style = 'font-size: 16px';
    icon.appendChild(document.createTextNode('add'));
    li.appendChild(icon)
    li.className = 'collection-item addbtn center teal-text text-lighten-2'
    li.onclick = (e =>{
        display.postMessage({'action': 'refresh'})

        components = document.querySelectorAll('.component')
        components.forEach(item => {
            item.className = 'collection-item component'
        })
        li.className = 'collection-item addbtn center white-text active'
        editor.session.setValue('')
        addbtn.style = 'width: 20%; visibility: visible;'
        componentName.style = 'width: 75%; visibility: visible;'
        addbtn.onclick = (e =>{
            let data = fs.readFileSync(path)
            let fw = JSON.parse(data);
            console.log(componentName.value)
            let component = {
                'name': componentName.value,
                'code': editor.session.getValue()
            }
            fw.components.push(component)
            fs.writeFileSync(path, JSON.stringify(fw))
            refreshCustoms()
            updateDropdown(customframeworks, 'customs')
            generateCustom(fw, path)
        })
    })
    collection.appendChild(li)

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

function generate(framework){

    display.postMessage({'action': 'switch', 'javascript': framework.javascript, 'css': framework.css, 'resources': framework.resources})
    collection.innerHTML = ''
    editor.session.setValue('')
    addbtn.style = 'width: 20%; visibility: hidden;'
    componentName.style = 'width: 75%; visibility: hidden;'

    framework.components.forEach(component =>{
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
            if(type == 'customs'){
                generateCustom(component, framework)
            }
            else{
                generate(component)
            }
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


