//application dependencies
const electron = require('electron')
const {ipcRenderer} = electron;
const fs = require('fs')

//get html components
const frameworkdropdown = document.getElementById('frameworkdropdown')
const frameworkname = document.getElementById('framework-name')
const customdropdown = document.getElementById('customdropdown')
const myconsole = document.getElementById('console')
const deletesection = document.getElementById('delete-section')
const display = document.getElementById('framework').contentWindow
const collection = document.getElementById('collection')

//get buttons
const custombtn = document.getElementById('create-custom')
const centerbtns = document.getElementById('centerbtns')
const homebtns = document.getElementById('homebtns')
const enlargebtn = document.getElementById('enlarge-btn')

let curComponent = null

//store framework paths
let origframeworks = [];
let customframeworks = [];

//make sure temp.html file is cleared on application launch
fs.writeFileSync('./temp.html', fs.readFileSync('./framework.html', 'utf-8'))

//populate path information for built in frameworks
fs.readdirSync('./frameworks').forEach(file => {
        let path = './frameworks/' + file
        origframeworks.push(path)
})

//populate path information for custom frameworks
fs.readdirSync('./custom').forEach(newdir => {
    fs.readdirSync('./custom/'+newdir).forEach(file => {
        let path = './custom/' + newdir + '/' + file;
        if(path.endsWith('.json')){
            customframeworks.push(path)
        }
    })
})

//initialize the dropdown list
updateDropdown(origframeworks, 'frameworks')
updateDropdown(customframeworks, 'customs')

//set up ace editor
let editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.setOptions({
    vScrollBarAlwaysVisible: true
})
editor.session.setMode("ace/mode/html");
editor.resize()

//enable dropdown effect in the navbar
let dropdowns = document.querySelectorAll('.dropdown-trigger')
for (let i = 0; i < dropdowns.length; i++){
    M.Dropdown.init(dropdowns[i]);
}

//open new custom framework window
custombtn.onclick = ()=> {
    ipcRenderer.send('openmodal');
}

//setup enlarge button
enlargebtn.onclick = (e => {
    ipcRenderer.send('enlarge')
})

//rewrite the temp.html file to equal the framework.html file (this file is used to create new window above)
window.addEventListener("message", (event) => {
    console.log(event.data.doc)
    fs.writeFileSync('./temp.html', event.data.doc)
})

//listen for 'refresh' event from main window and update the list of custom frameworks
ipcRenderer.on('refresh', (e, data) => {
    refreshCustoms()
    updateDropdown(customframeworks, 'customs')
    let log = "A new framework named \"" + data.name + "\" has been successfully created. Files are located in \"/custom/" + data.name + "\""
    logmsg(log)
})

//update the list of custom frameworks
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
    return customframeworks
}

//update the framework data for the dropdown list
function updateDropdown(frameworkPaths, type){

    //check which dropdown we're working with and clear it to start
    if (type == 'customs'){
        customdropdown.innerHTML = '';
        frameworkPaths = refreshCustoms()
    }
    else{
        frameworkdropdown.innerHTML = '';
    }

    frameworkPaths.forEach(path => {
        //get framework data
        let data = fs.readFileSync(path)
        let framework = JSON.parse(data);
 
        //create framework element for the navbar
        let li = document.createElement('li');
        let a = document.createElement('a');
        let divider = document.createElement('li');

        //add attributes
        a.href = '#';
        a.id = framework.name;
        a.appendChild(document.createTextNode(framework.name));

        li.appendChild(a);
        li.className = 'collection-item'

        divider.className = 'divider';

        //generate framework on click
        li.onclick = (e =>{
            if(type == 'customs'){
                generateCustom(framework, path)
            }
            else{
                generate(framework)
            }
            let log = 'Switching to framework \"' + framework.name + '\".'
            logmsg(log)
        })

        //add frameworks to the right dropdown
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

//generate the data for a custom framework in the application
function generateCustom(framework, path){

    //remove last part of the path to get the parent directory
    let dir = path.split('/');
    dir.pop();
    dir = dir.join('/')

    //create paths for necessary files
    let js = dir+'/'+framework.javascript
    let css = dir+'/'+framework.css
    let resources = framework.resources

    //display framework delete button
    deletesection.innerHTML = '---<i class="material-icons delete-framework waves-effect waves-light" id="delete-framework" style="font-size: 27px">delete</i>---'
    createFrameworkDeleteButton(path)

    //update selected framework on the navbar
    frameworkname.innerHTML = '<b>Current Framework: </b><em>' + framework.name + '</em>'

    //tell the render viewport that we're switching frameworks and clear the component list
    display.postMessage({'action': 'switch', 'javascript': js, 'css': css, 'resources': resources})
    collection.innerHTML = ''

    //reset ace editor back to html mode and clear the content
    editor.session.setMode("ace/mode/html");
    editor.session.setValue('')

    //remove any additional buttons that were active
    homebtns.innerHTML = ''

    //setup buttons
    createHomeButton()
    createFilesButton()
    setupHomeButton(path)
    setupFilesButton(dir)
    setupRefreshButton(framework)
    setupRenderButton()

    //generate components 
    generateCustomComponents(framework, path)
    createComponentAddButton(path)

}

//generate the data for built in frameworks
function generate(framework){

    //tell the render viewport that we're switching frameworks and clear the component list
    display.postMessage({'action': 'switch', 'javascript': framework.javascript, 'css': framework.css, 'resources': framework.resources})
    collection.innerHTML = ''

    //reset ace editor back to html mode and clear the content
    editor.session.setMode("ace/mode/html");
    editor.session.setValue('')

    //remove any additional buttons that were active
    centerbtns.innerHTML = ''
    homebtns.innerHTML = ''
    setupRefreshButton(framework)
    setupRenderButton()

    //remove the ability to delete a framework
    deletesection.innerHTML = '-------'

    //update selected framework on the navbar
    frameworkname.innerHTML = '<b>Current Framework: </b><em>' + framework.name + '</em>'

    //generate components
    generateComponents(framework)
}

//generate components for custom frameworks
function generateCustomComponents(framework, path){
    framework.components.forEach(component =>{
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(component.name));
        li.className = 'collection-item component'
        setupCustomComponentButtons(li, component, path)
    })
}

//generate components for built in frameworks
function generateComponents(framework){
    framework.components.forEach(component =>{
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(component.name));
        li.className = 'collection-item component'   
        setupComponentButtons(li, component)
    }) 
}

//create component name field button
function createComponentNameField(){
    //create elements
    let div = document.createElement('div')
    let input = document.createElement('input')

    //add attributes
    div.className = 'input-field col s9 myinput'

    input.className = 'input-field myinput'
    input.id = 'component-name'
    input.placeholder = 'Name'

    //build and add element to center buttons
    div.appendChild(input)
    centerbtns.appendChild(div)
}

//create component submit button
function createComponentSubmitButton(){
    //create elements
    let div = document.createElement('div')
    let btn = document.createElement('a')
    let icon = document.createElement('i')

    //add attributes
    div.className = 'col s3'

    btn.style = 'width: 100%'
    btn.className = 'waves-effect waves-light savebutton btn-large'
    btn.id = 'add-btn'

    icon.className = 'material-icons'
    icon.style = 'font-size: 27px'
    icon.innerHTML = 'check'
    
    //build and add element to center buttons
    btn.appendChild(icon)
    div.appendChild(btn)
    centerbtns.appendChild(div)
}

//create component save button
function createSaveButton(){
    //create elements
    let div = document.createElement('div')
    let btn = document.createElement('a')

    //add attributes
    div.className = 'col s9'

    btn.style = 'width: 100%'
    btn.className = 'waves-effect waves-light savebutton mybutton btn-large'
    btn.id = 'save-btn'
    btn.innerHTML = 'Save'

    //build and add element to center buttons
    div.appendChild(btn)
    centerbtns.appendChild(div)
}

//create component delete button
function createDeleteComponentButton(){
    //create elements
    let div = document.createElement('div')
    let btn = document.createElement('a')
    let icon = document.createElement('i')

    //add attributes
    div.className = 'col s3'

    btn.style = 'width: 100%'
    btn.className = 'waves-effect waves-light delbutton btn-large'
    btn.id = 'delete-btn'

    icon.className = 'material-icons'
    icon.style = 'font-size: 27px'
    icon.innerHTML = 'delete'

    //build and add element to center buttons
    btn.appendChild(icon)
    div.appendChild(btn) 
    centerbtns.appendChild(div)
}

//create home button
function createHomeButton(){
    //create elements
    let div = document.createElement('div')
    let btn = document.createElement('a')
    let icon = document.createElement('i')

    //add attributes
    div.className = 'col s6'

    btn.style = 'width: 100%'
    btn.className = 'waves-effect waves-light btn-large mybutton'
    btn.id = 'home-btn'

    icon.className = 'material-icons'
    icon.style = 'font-size: 27px'
    icon.innerHTML = 'home'

    //build and add element to home buttons
    btn.appendChild(icon)
    div.appendChild(btn)
    homebtns.appendChild(div)
}

//create file button
function createFilesButton(){
    //create elements
    let div = document.createElement('div')
    let btn = document.createElement('a')

    //add attributes
    div.className = 'col s6'

    btn.style = 'width: 100%'
    btn.className = 'waves-effect waves-light btn-large mybutton'
    btn.id = 'files-btn'
    btn.innerHTML = 'Files'

    //build and add element to home buttons
    div.appendChild(btn)
    homebtns.appendChild(div)
}

function generateFiles(path){
    //refresh the component list and clear ace editor and center buttons
    collection.innerHTML = ''
    centerbtns.innerHTML = ''
    editor.session.setValue('')

    //read in files for the framework
    fs.readdirSync(path).forEach(file => {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(file));
        li.className = 'collection-item component'

        li.onclick = (e =>{
            //clear out the center buttons and console
            centerbtns.innerHTML = ''
            myconsole.innerHTML = ''

            let fullpath = path+'/'+file

            //add 
            createSaveButton()
            createDeleteComponentButton()
            setupFileSaveButton(fullpath)
            setupFileDeleteButton(path)

            //display other buttons as unselected
            let components = document.querySelectorAll('.component')
            components.forEach(item => {
                item.className = 'collection-item component'
            })

            //display current component as selected
            li.className = 'collection-item component active'
     
            //set ace editor to the proper syntax and populate it with the file contents
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
            
            let log = 'Now editing file \"' + li.innerHTML + '\".'
            logmsg(log)
        })

        collection.appendChild(li)

    })   
}

//attaches functionality for when the save button is clicked for a file
function setupFileSaveButton(path){
    //get element
    let savebtn = document.getElementById('save-btn')

    savebtn.onclick = (e => {  
        //write the code in the editor to file and regenerate frameworks
        fs.writeFileSync(path, editor.session.getValue())
        generateCustom(customframeworks, path)

        let log = "file \"" +path+ "\" has been saved."
        logmsg(log)
    })
}

//attaches functionality for when the delete button is clicked for a file
function setupFileDeleteButton(path, fullpath){
    //get element
    let deletebtn = document.getElementById('delete-btn')

    deletebtn.onclick = (e => {
        //delete file
        fs.unlinkSync(fullpath)

        //clear the editor and center buttons then refresh the files list
        editor.session.setValue('')      
        centerbtns.innerHTML = ''
        generateFiles(path)

        let log = "file \"" +fullpath+ "\" has been deleted."
        logmsg(log)     
    })
}

//attaches functionality for when the component buttons are clicked
function setupComponentButtons(li, component){
    li.onclick = (e =>{
        
        //display other buttons as unselected
        components = document.querySelectorAll('.component')
        components.forEach(item => {
            item.className = 'collection-item component'
        })

        //set component to display as selected
        li.className = 'collection-item component active'

        //display the current component's code to the editor and render it
        curComponent = li;
        editor.session.setValue(component.code)
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})

        let log = 'Now editing component \"' + component.name + '\".'
        logmsg(log)
    })
    collection.appendChild(li)
}

//attaches functionality for when the custom component buttons are clicked
function setupCustomComponentButtons(li, component, path){
    li.onclick = (e => {
        //remove current center buttons
        centerbtns.innerHTML = ''
        myconsole.innerHTML = ''

        //add new center buttons
        createSaveButton()
        createDeleteComponentButton()
        setupSaveButton(li, path)
        setupComponentDeleteButton(path)

        //display other buttons as unselected
        components = document.querySelectorAll('.component')
        components.forEach(item => {
            item.className = 'collection-item component'
        })
        add = document.querySelector('.addbtn')
        add.className = 'collection-item add-component addbtn center'
    
        //set component to display as selected
        li.className = 'collection-item component active'

        //display current component's code and render it
        curComponent = li;
        editor.session.setValue(component.code)
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
    
        let log = 'Now editing component \"' + li.innerHTML + '\".'
        logmsg(log)
    })
    collection.appendChild(li)
}

//display delete button for framework
function createFrameworkDeleteButton(path){
    let deleteframework = document.getElementById('delete-framework')
    deleteframework.onclick = (e => {
        //wipe current values
        collection.innerHTML = ''
        homebtns.innerHTML = ''
        editor.session.setValue('')
        deletesection.innerHTML = '-------'

        //rerender a blank screen and delete framework files
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
        fs.rmdirSync(dir, {recursive: true})

        //refresh custom framework list and regenerate frameworks
        refreshCustoms()
        generateCustom(customframeworks,path)

        let log = "Framework \"" + framework.name + "\" has been deleted!"
        logmsg(log)
    })
}

//attaches functionality for the files button to switch to file view
function setupFilesButton(dir){
    let filesbtn = document.getElementById('files-btn')
    filesbtn.onclick = (e => {
        //rerender a blank screen 
        editor.session.setValue('')
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})

        //generate file view
        generateFiles(dir)
        let log = 'Switched to file view.'
        logmsg(log)
    })
}

//attaches functionality for the home button to switch to component view
function setupHomeButton(path){
    let homebtn = document.getElementById('home-btn')
    homebtn.onclick = (e => {
        //rerender a blank screen and remove center buttons
        centerbtns.innerHTML = ''
        editor.session.setValue('')
        
        //generate the components for the framework
        newframework = JSON.parse(fs.readFileSync(path))
        generateCustom(newframework, path)
        let log = 'Switched to component view.'
        logmsg(log)
    })
}

//attaches functionality for the component add button
function createComponentAddButton(path){

    //create new element
    let li = document.createElement('li');
    let icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.style = 'font-size: 16px';
    icon.appendChild(document.createTextNode('add'));
    li.appendChild(icon)
    li.className = 'collection-item add-component addbtn center'

    li.onclick = (e =>{
        //clear the console and center buttons
        centerbtns.innerHTML = ''
        myconsole.innerHTML = ''

        //create new center buttons
        createComponentNameField()
        createComponentSubmitButton()
        setupComponentSubmitButton(li, path)
    })
        
    collection.appendChild(li)
}

//attaches functionality to submit the values for a new component
function setupComponentSubmitButton(li, path){

    //get elements that were created earlier for the center buttons
    let addbtn = document.getElementById('add-btn')
    let componentName = document.getElementById('component-name')
    addbtn.style = 'width: 100%; visibility: visible;'
    componentName.style = 'width: 75%; visibility: visible;'

    //refresh render viewport
    display.postMessage({'action': 'refresh'})

    //change all other components to unclicked status
    components = document.querySelectorAll('.component')
    components.forEach(item => {
        item.className = 'collection-item component'
    })

    //change current component to clicked status
    li.className = 'collection-item add-component active addbtn center'

    //clear editor
    editor.session.setValue('')
    
    addbtn.onclick = (e =>{
        //read in data for new component and write it to file
        let data = fs.readFileSync(path)
        let fw = JSON.parse(data);
        let component = {
            'name': componentName.value,
            'code': editor.session.getValue()
        }
        fw.components.push(component)
        fs.writeFileSync(path, JSON.stringify(fw))

        //refresh application to use new data
        refreshCustoms()
        updateDropdown(customframeworks, 'customs')
        generateCustom(fw, path)

        //clear center buttons
        centerbtns.innerHTML = ''

        let log = 'A new component by the name of \"' + component.name + "\" has been added to the framework \"" + framework.name + "\"."
        logmsg(log)

    })
}

//attaches functionality to the save button for components/files
function setupSaveButton(li, path){

    //get elements
    let savebtn = document.getElementById('save-btn')

    savebtn.onclick = (e => {
        //compile data of current component
        let data = fs.readFileSync(path)
        let fw = JSON.parse(data);
        let temp = {
            'name': curComponent.innerHTML,
            'code': editor.session.getValue()
        }

        //write the current component's modified code to file
        fw.components.forEach(component => {
            if (component.name == temp.name){
                component.code = temp.code
            }
        })
        fs.writeFileSync(path, JSON.stringify(fw))

        //setup component to load the new code on click and regenerate frameworks
        setupCustomComponentButtons(li, temp.code, path)
        updateDropdown(customframeworks,'customs')
        generateCustom(fw, path)

        //set the editor's code to the new code and rerender
        editor.session.setValue(temp.code)
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})

        let log = 'New code for the component \"' + temp.name + "\" from framework \"" + framework.name + "\" has been saved to disk."      
        logmsg(log)
    })
}

//attaches functionality for the delete button for components/files
function setupComponentDeleteButton(path){
    //get element
    let deletebtn = document.getElementById('delete-btn')

    deletebtn.onclick = (e => {
        //compile data of current component
        let data = fs.readFileSync(path)
        let fw = JSON.parse(data);
        let temp = {
            'name': curComponent.innerHTML,
            'code': editor.session.getValue()
        }

        //remove component from framework that matches current component and write changes to file
        fw.components = fw.components.filter(component => component.name != temp.name)
        fs.writeFileSync(path, JSON.stringify(fw))

        //regenerate the framework data to reflect changes
        updateDropdown(customframeworks,'customs')
        generateCustom(fw, path)

        //clear any center buttons
        centerbtns.innerHTML = ''

        let log = 'Component by the name of \"' + temp.name + "\" has been removed from the framework \"" + framework.name + "\"."
        logmsg(log)
    })
}

//attaches functionality for the refresh button
function setupRefreshButton(framework){
    //get element
    refresh = document.getElementById('refresh-btn');

    refresh.onclick = (e =>{
        framework.components.forEach(entry => {
            if (curComponent.innerHTML == entry.name){

                //set the editor's code back to the original code of the component
                editor.session.setValue(entry.code)
                display.postMessage({'action': 'refresh', 'code': editor.session.getValue()})
            }
        })
        //render the new code
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
    })
}

//attaches functionality for the render button
function setupRenderButton(){
    //get element
    render = document.getElementById('render-btn');

    render.onclick = (e =>{
        //render the current code that's in the editor
        display.postMessage({'action': 'render', 'code': editor.session.getValue()})
    })
}

//log a messasge in the custom application console
function logmsg(msg){
    //clear console
    myconsole.innerHTML = ''

    //create elements
    let p = document.createElement('p')
    let span = document.createElement('span')
    let span2 = document.createElement('span')
    let b = document.createElement('b')

    //style elements with css classes and create prompt
    p.className = 'text'
    span.className = 'buckle'
    span2.className = 'arrow'

    b.innerHTML = ' buckle'
    span.appendChild(b)
    span2.innerHTML = '> '

    p.appendChild(span)
    p.appendChild(span2)

    //write message
    p.append(document.createTextNode(msg))
    myconsole.appendChild(p)
}



