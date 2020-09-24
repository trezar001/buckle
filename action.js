const materialize = require('./materialize.json')
const highlighter = require('./syntax.js')

console.log(materialize)
components = document.querySelectorAll('.component')

components.forEach(component =>{
    component.onclick = (e =>{
        let description = document.getElementById('component-description')
        let output = document.getElementById('component-output')
        materialize.components.forEach(entry => {
            if (component.innerHTML == entry.name){
                description.innerText = entry.code
                highlighter.w3CodeColor(description)
                output.innerHTML =  entry.code
            }
        })      
    })
}) 

var dropdowns = document.querySelectorAll('.dropdown-trigger')
for (var i = 0; i < dropdowns.length; i++){
    M.Dropdown.init(dropdowns[i]);
}
