
components = document.querySelectorAll('.component')

components.forEach(component =>{
    component.onclick = (e =>{
        let description = document.getElementById('component-description')
        let output = document.getElementById('component-output')

        description.innerHTML = component.innerHTML
        output.innerHTML = component.innerHTML + ' output'
    })
}) 
