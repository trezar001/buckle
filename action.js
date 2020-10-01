const materialize = require('./materialize.json')
const highlighter = require('./syntax.js')
const output = document.getElementById('component-output')

let curComponent = null

let editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.setOptions({
    vScrollBarAlwaysVisible: true
})
editor.session.setMode("ace/mode/html");
editor.resize()

components = document.querySelectorAll('.component')

components.forEach(component =>{
    component.onclick = (e =>{
        //let description = document.getElementById('component-description')
        curComponent = component;
        materialize.components.forEach(entry => {
            if (component.innerHTML == entry.name){
                editor.session.setValue(entry.code)
                output.innerHTML =  entry.code
            }
        })      
    })
}) 

render = document.getElementById('render-btn');
render.onclick = (e =>{
    code = editor.session.getValue();
    console.log(code);

    output.innerHTML = code;
})

refresh = document.getElementById('refresh-btn');
refresh.onclick = (e =>{
    materialize.components.forEach(entry => {
        if (curComponent.innerHTML == entry.name){
            editor.session.setValue(entry.code)
            output.innerHTML =  entry.code
        }
    })
    output.innerHTML =  entry.code
})

let dropdowns = document.querySelectorAll('.dropdown-trigger')
for (let i = 0; i < dropdowns.length; i++){
    M.Dropdown.init(dropdowns[i]);
}


