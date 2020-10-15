let framework = document.getElementById('framework')
let javascript =  document.getElementById('javascript')
let css = document.getElementById('css')
let output = document.getElementById('component-output')

window.addEventListener("message", (event) => {
    // if (event.origin !== "http://example.org:8080")
    //   return;
    if (event.data.action == 'switch'){
        javascript.src = event.data.javascript
        css.href = event.data.css
        output.innerHTML = '';
    }
    else{
        output.innerHTML = event.data.code;
    }
  }, false);



