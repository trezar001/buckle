let frameworkdropdown = document.getElementById('frameworkdropdown')
let frameworkname = document.getElementById('framework-name')
let customdropdown = document.getElementById('customdropdown')
let centerbtns = document.getElementById('centerbtns')
let homebtns = document.getElementById('homebtns')
let enlargebtn = document.getElementById('enlarge-btn')
let myconsole = document.getElementById('console')
let deletesection = document.getElementById('delete-section')

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

fs.writeFileSync('./temp.html', fs.readFileSync('./framework.html', 'utf-8'))

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

enlargebtn.onclick = (e => {
    ipcRenderer.send('enlarge')
})
window.addEventListener("message", (event) => {
    console.log(event.data.doc)
    fs.writeFileSync('./temp.html', event.data.doc)
})

ipcRenderer.on('refresh', (e, data) => {
    refreshCustoms()
    updateDropdown(customframeworks, 'customs')
    let log = "A new framework named \"" + data.name + "\" has been successfully created. Files are located in \"/custom/" + data.name + "\""
    logmsg(log)
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

    deletesection.innerHTML = '---<i class="material-icons delete-framework waves-effect waves-light" id="delete-framework" style="font-size: 27px">delete</i>---'

    let deleteframework = document.getElementById('delete-framework')
    deleteframework.onclick = (e => {
        collection.innerHTML = ''
        homebtns.innerHTML = ''
        editor.session.setValue('')
        deletesection.innerHTML = '-------'

        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
        fs.rmdirSync(dir, {recursive: true})

        refreshCustoms()
        updateDropdown(customframeworks, 'customs')

        let log = "Framework \"" + framework.name + "\" has been deleted!"
        logmsg(log)
    })

    frameworkname.innerHTML = '<b>Current Framework: </b><em>' + framework.name + '</em>'

    display.postMessage({'action': 'switch', 'javascript': js, 'css': css, 'resources': resources})
    collection.innerHTML = ''

    editor.session.setMode("ace/mode/html");
    editor.session.setValue('')

    homebtns.innerHTML = ''
    addFiles()

    let filesbtn = document.getElementById('files-btn')
    filesbtn.onclick = (e => {
        editor.session.setValue('')
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
        generateFiles(dir)
        let log = 'Switched to file view.'
        logmsg(log)
    })

    let homebtn = document.getElementById('home-btn')
    homebtn.onclick = (e => {
        centerbtns.innerHTML = ''
        editor.session.setValue('')
        newframework = JSON.parse(fs.readFileSync(path))
        generateCustom(newframework, path)
        let log = 'Switched to component view.'
        logmsg(log)
    })

    framework.components.forEach(component =>{
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(component.name));
        li.className = 'collection-item component'
        buttonpress(li, component.code, path)
            
        collection.appendChild(li)
    }) 

    let li = document.createElement('li');
    let icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.style = 'font-size: 16px';
    icon.appendChild(document.createTextNode('add'));
    li.appendChild(icon)
    li.className = 'collection-item add-component addbtn center'
    li.onclick = (e =>{
        centerbtns.innerHTML = ''
        myconsole.innerHTML = ''

        updatecenter();
        let addbtn = document.getElementById('add-btn')
        let componentName = document.getElementById('component-name')

        display.postMessage({'action': 'refresh'})

        components = document.querySelectorAll('.component')
        components.forEach(item => {
            item.className = 'collection-item component'
        })
        li.className = 'collection-item add-component active addbtn center'
        editor.session.setValue('')
        addbtn.style = 'width: 100%; visibility: visible;'
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
            centerbtns.innerHTML = ''

            let log = 'A new component by the name of \"' + component.name + "\" has been added to the framework \"" + framework.name + "\"."
            logmsg(log)

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
    editor.session.setMode("ace/mode/html");
    editor.session.setValue('')

    centerbtns.innerHTML = ''
    homebtns.innerHTML = ''

    deletesection.innerHTML = '-------'

    frameworkname.innerHTML = '<b>Current Framework: </b><em>' + framework.name + '</em>'

    framework.components.forEach(component =>{

        let li = document.createElement('li');
        li.appendChild(document.createTextNode(component.name));
        li.className = 'collection-item component'
        li.onclick = (e =>{
            let log = 'Now editing component \"' + component.name + '\".'
            logmsg(log)
            //let description = document.getElementById('component-description')
            components = document.querySelectorAll('.component')
            components.forEach(item => {
                item.className = 'collection-item component'
            })
            li.className = 'collection-item component active'
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
            let log = 'Switching to framework \"' + component.name + '\".'
            logmsg(log)

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

function updatecenter(){
    let div1 = document.createElement('div')
    let div2 = document.createElement('div')

    let btn = document.createElement('a')

    let input = document.createElement('input')
    let icon = document.createElement('i')

    div2.className = 'col s3'
    div1.className = 'input-field col s9 myinput'

    input.className = 'input-field myinput'
    input.id = 'component-name'
    input.placeholder = 'Name'

    btn.style = 'width: 100%'
    btn.className = 'waves-effect waves-light savebutton btn-large'
    btn.id = 'add-btn'
    icon.className = 'material-icons'
    icon.style = 'font-size: 27px'
    icon.innerHTML = 'check'

    div1.appendChild(input)
    
    btn.appendChild(icon)
    div2.appendChild(btn)
    
    centerbtns.appendChild(div1)
    centerbtns.appendChild(div2)

}

function addSave(){
    let div1 = document.createElement('div')
    let div2 = document.createElement('div')

    let btn1 = document.createElement('a')
    let btn2 = document.createElement('a')

    let icon = document.createElement('i')

    div1.className = 'col s9'
    div2.className = 'col s3'

    btn1.style = 'width: 100%'
    btn1.className = 'waves-effect waves-light savebutton mybutton btn-large'
    btn1.id = 'save-btn'
    btn1.innerHTML = 'Save'

    btn2.style = 'width: 100%'
    btn2.className = 'waves-effect waves-light delbutton btn-large'
    btn2.id = 'delete-btn'
    icon.className = 'material-icons'
    icon.style = 'font-size: 27px'
    icon.innerHTML = 'delete'

    div1.appendChild(btn1)
    
    btn2.appendChild(icon)
    div2.appendChild(btn2)
    
    centerbtns.appendChild(div1)
    centerbtns.appendChild(div2)

}

function addFiles(){
    let div1 = document.createElement('div')
    let div2 = document.createElement('div')

    let btn1 = document.createElement('a')
    let btn2 = document.createElement('a')

    let icon = document.createElement('i')

    div1.className = 'col s6'
    div2.className = 'col s6'

    btn1.style = 'width: 100%'
    btn1.className = 'waves-effect waves-light btn-large mybutton'
    btn1.id = 'home-btn'
    icon.className = 'material-icons'
    icon.style = 'font-size: 27px'
    icon.innerHTML = 'home'

    btn2.style = 'width: 100%'
    btn2.className = 'waves-effect waves-light btn-large mybutton'
    btn2.id = 'files-btn'
    btn2.innerHTML = 'Files'

    btn1.appendChild(icon)
    div1.appendChild(btn1)
    
    div2.appendChild(btn2)
    
    homebtns.appendChild(div1)
    homebtns.appendChild(div2)

}

// div class="col s1">
// <a style="width: 100%" class="waves-effect waves-light btn-large  deep-purple lighten-2" id="home-btn"><i class="material-icons" style="font-size: 27px">home</i></a>
// </div>  
// <div class="col s1">
// <a style="width: 100%" class="waves-effect waves-light btn-large deep-purple lighten-2" id="files-btn">Files</a>
// </div> 

function generateFiles(path){

    editor.session.setValue('')

    centerbtns.innerHTML = ''

    refreshComponents(path)
}

function refreshComponents(path){
    collection.innerHTML = ''

    fs.readdirSync(path).forEach(file => {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(file));
        li.className = 'collection-item component'

        

        li.onclick = (e =>{
            centerbtns.innerHTML = ''
            myconsole.innerHTML = ''

            let log = 'Now editing file \"' + li.innerHTML + '\".'
            logmsg(log)

            addSave()
            let savebtn = document.getElementById('save-btn')
            let deletebtn = document.getElementById('delete-btn')
            let fullpath = path+'/'+file

            let components = document.querySelectorAll('.component')
            components.forEach(item => {
                item.className = 'collection-item component'
            })

            li.className = 'collection-item component active'

            data = fs.readFileSync(fullpath, 'utf-8')
            
            if(file.endsWith('.css')){
                editor.session.setMode("ace/mode/css");
            }
            if(file.endsWith('.json')){
                editor.session.setMode("ace/mode/json");
            }
            if(file.endsWith('.js')){
                editor.session.setMode("ace/mode/javascript");
            }
            
            editor.session.setValue(data)

            savebtn.onclick = (e => {  
                fs.writeFileSync(fullpath, editor.session.getValue())
                updateDropdown(customframeworks, 'customs')

                let log = "file \"" +fullpath+ "\" has been saved."
                logmsg(log)
            })

            deletebtn.onclick = (e => {
                fs.unlinkSync(fullpath)
                let log = "file \"" +fullpath+ "\" has been deleted."
                logmsg(log)

                editor.session.setValue('')      
                centerbtns.innerHTML = ''
                refreshComponents(path)
            })
        })
        collection.appendChild(li)
    })   
}

function logmsg(msg){
    myconsole.innerHTML = ''

    let p = document.createElement('p')
    let span = document.createElement('span')
    let span2 = document.createElement('span')
    let b = document.createElement('b')

    p.className = 'text'
    span.className = 'buckle'
    span2.className = 'arrow'

    b.innerHTML = ' buckle'
    span.appendChild(b)

    span2.innerHTML = '> '

    p.appendChild(span)
    p.appendChild(span2)
    p.append(document.createTextNode(msg))

    myconsole.appendChild(p)
    //<p class="text"><span class="buckle"><b>buckle</b></span><span class="arrow">></span> stuff is happening</p>
}

function buttonpress(li, code, path){
    li.onclick = (e => {
        centerbtns.innerHTML = ''
        myconsole.innerHTML = ''

        let log = 'Now editing component \"' + li.innerHTML + '\".'
        logmsg(log)

        addSave()
        let savebtn = document.getElementById('save-btn')
        let deletebtn = document.getElementById('delete-btn')
        components = document.querySelectorAll('.component')
        components.forEach(item => {
            item.className = 'collection-item component'
        })
        add = document.querySelector('.addbtn')
        add.className = 'collection-item add-component addbtn center'
    
        li.className = 'collection-item component active'
        curComponent = li;
        editor.session.setValue(code)
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
    
        savebtn.onclick = (e => {
            let data = fs.readFileSync(path)
            let fw = JSON.parse(data);
    
            let temp = {
                'name': curComponent.innerHTML,
                'code': editor.session.getValue()
            }
    
            fw.components.forEach(component => {
                if (component.name == temp.name){
                    component.code = temp.code
                }
            })
    
            fs.writeFileSync(path, JSON.stringify(fw))
    
            editor.session.setValue(temp.code)
            display.postMessage({'action': 'render', 'code': editor.session.getValue()})
            updateDropdown(customframeworks, 'customs')
    
            let log = 'New code for the component \"' + temp.name + "\" from framework \"" + framework.name + "\" has been saved to disk."
            
            logmsg(log)
            buttonpress(li, temp.code, path)
        })
    
        deletebtn.onclick = (e => {
            let data = fs.readFileSync(path)
            let fw = JSON.parse(data);
    
            let temp = {
                'name': curComponent.innerHTML,
                'code': editor.session.getValue()
            }
    
            fw.components = fw.components.filter(component => component.name != temp.name)
    
            fs.writeFileSync(path, JSON.stringify(fw))
            refreshCustoms()
            updateDropdown(customframeworks, 'customs')
            generateCustom(fw, path)
            centerbtns.innerHTML = ''
            let log = 'Component by the name of \"' + temp.name + "\" has been removed from the framework \"" + framework.name + "\"."
            logmsg(log)
        })
    })
   
}



