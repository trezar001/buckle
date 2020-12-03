//get html components
const framework = document.getElementById('framework')
const javascript =  document.getElementById('javascript')
const css = document.getElementById('css')
const output = document.getElementById('component-output')
const resources = document.getElementById("head")
const scripts = document.getElementById("scripts")

//listen for requests from the main application
window.addEventListener("message", (event) => {

    //do when switching framework
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

    //do when refreshing viewport
    else if (event.data.action == 'refresh'){
        output.innerHTML = '';
    }

    //do when logging console message
    else if (event.data.action == 'log'){
        let text = document.createElement('p')
        text.innerHTML = event.data.log
        output.appendChild(text)
    }

    //do when rendering to viewport 
    else if (event.data.action == 'render'){
        output.innerHTML = event.data.code;

        let doc = ('<html lang="en">\n')
        doc += (document.getElementById('document').innerHTML)
        doc += '\n</html>'

        event.source.postMessage({'doc': doc})
    }
  }, false);



