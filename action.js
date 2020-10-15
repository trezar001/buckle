const materialize = require('./materialize.json')
const bootstrap = require('./bootstrap.json')

const highlighter = require('./syntax.js')
const display = document.getElementById('framework').contentWindow
const collection = document.getElementById('collection')

const materializebtn = document.getElementById('materialize')
const bootstrapbtn = document.getElementById('bootstrap')

let curComponent = null

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

materializebtn.onclick = ()=> {
    generate(materialize)
}
bootstrapbtn.onclick = ()=> {
    generate(bootstrap)
}

function generate(framework){

    display.postMessage({'action': 'switch', 'javascript': framework.javascript, 'css': framework.css})
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


