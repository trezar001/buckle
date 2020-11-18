let framework = document.getElementById('framework')
let javascript =  document.getElementById('javascript')
let css = document.getElementById('css')
let output = document.getElementById('component-output')
let resources = document.getElementById("head")


window.addEventListener("message", (event) => {
    // if (event.origin !== "http://example.org:8080")
    //   return;
    if (event.data.action == 'switch'){
        javascript.src = event.data.javascript
        css.href = event.data.css
        output.innerHTML = '';
        let trash = document.querySelectorAll(".temp")
        trash.forEach(child => {
            resources.removeChild(child)
        })
 
        event.data.resources.forEach(resource => {
            let item = document.createElement(resource.type)
            if(resource.type == "link"){
                item.href = resource.href
                item.rel = resource.rel
            }
            if(resource.type == "script"){
                item.src = resource.src
            }

            item.className = 'temp'    
            resources.appendChild(item)
        })
    }
    else if (event.data.action == 'refresh'){
        output.innerHTML = '';
    }
    else if (event.data.action == 'log'){
        let text = document.createElement('p')
        text.innerHTML = event.data.log
        output.appendChild(text)
    }
    else if (event.data.action == 'render'){
        output.innerHTML = event.data.code;
    }
  }, false);



