let framework = document.getElementById('framework')
let javascript =  document.getElementById('javascript')
let css = document.getElementById('css')
let output = document.getElementById('component-output')
let resources = document.getElementById("head")
let scripts = document.getElementById("scripts")


window.addEventListener("message", (event) => {
    // if (event.origin !== "http://example.org:8080")
    //   return;
    if (event.data.action == 'switch'){

        output.innerHTML = '';
        let trash = document.querySelectorAll(".tempcss")
        trash.forEach(child => {
            resources.removeChild(child)
        })
        trash = document.querySelectorAll(".tempscript")
        trash.forEach(child => {
            scripts.removeChild(child)
        })
         
        event.data.resources.forEach(resource => {
            if(resource.type == "css"){
                let item = document.createElement('link')
                item.href = resource.href
                item.rel = "stylesheet"
                item.className = 'tempcss'    
                resources.appendChild(item)
            }
            if(resource.type == "script"){
                let item = document.createElement('script')
                item.type = 'text/javascript'
                item.src = resource.src
                item.className = 'tempscript'    
                scripts.appendChild(item)
            }

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

        let doc = ('<html lang="en">\n')
        doc += (document.getElementById('document').innerHTML)
        doc += '\n</html>'

        event.source.postMessage({'doc': doc})
    }
  }, false);



