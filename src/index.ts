import * as THREE from "three"
import * as OBC from "openbim-components"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { IProject, ProjectStatus, UserRole } from "./class/Project"
import { ProjectsManager } from "./class/ProjectsManager"
//
function showModal(id: string){
    const modal = document.getElementById(id)
    if(modal && modal instanceof HTMLDialogElement){
        modal.showModal()
    }else{
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}

function closeModal(id: string){
    const modal = document.getElementById(id)
    if(modal && modal instanceof HTMLDialogElement){
        modal.close()
    }else{
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}
// list and projectsManager
const projectListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectListUI)

//Btn form click
const newProjectBtn = document.getElementById("new-project-btn")
if(newProjectBtn){
    newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
}else{
    console.warn("New projects button was not found")
}
// Form
const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const formData = new FormData(projectForm)
        const projectData: IProject = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ProjectStatus,
            userRole: formData.get("userRole") as UserRole,
            finishDate: new Date(formData.get("finishDate") as string)
        }
        try {
            const project = projectsManager.newProject(projectData)
            console.log(project)
            projectForm.reset()
            closeModal("new-project-modal")
        } catch (err) {
            alert(err)
        }
    })
}else{
    console.warn("The project form was not found. Check the ID!")
}
//Export to JSON
const exportProjectsBtn= document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
    exportProjectsBtn.addEventListener("click", () => {
        projectsManager.exportToJSON()
    })
}
// Import from JSON
const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
    importProjectsBtn.addEventListener("click", () => {
        projectsManager.importFromJSON()
    })
}




// OpenBIM-Components viewer
// Set up Scene
const viewer = new OBC.Components()

const sceneComponent = new OBC.SimpleScene(viewer)
sceneComponent.setup()
viewer.scene = sceneComponent
// Obtiene la escena de THREE.Scene
const scene = sceneComponent.get()
scene.background = null

// Componente renderizador
const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement
const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
viewer.renderer = rendererComponent

// Camera
const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
viewer.camera = cameraComponent
// ray selector
const raycasterComponent = new OBC.SimpleRaycaster(viewer)
viewer.raycaster = raycasterComponent

//inicializacion, correction camera, sombra
viewer.init()
cameraComponent.updateAspect()
rendererComponent.postproduction.enabled = true

const ifcLoader = new OBC.FragmentIfcLoader(viewer)
// ruta absoluta biblioteca WebIFC
ifcLoader.settings.wasm = {
    path: "https://unpkg.com/web-ifc@0.0.43/",
    absolute: true
}
// Light resaltar
const highlighter = new OBC.FragmentHighlighter(viewer)
highlighter.setup()

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
// procesador de propiedades limpia las lista de propiedades
highlighter.events.select.onClear.add(() => {
    propertiesProcessor.cleanPropertiesList()
})

// Clasificar modelos en grupos
const classifier = new OBC.FragmentClassifier(viewer)
// Ventana de propiedades
const classificationWindow = new OBC.FloatingWindow(viewer)
classificationWindow.visible = false
viewer.ui.add(classificationWindow)
classificationWindow.title = "Grupo de Modelos"

// boton ocultar window
const classificationsBtn = new OBC.Button(viewer)
classificationsBtn.materialIcon = "account_tree"

classificationsBtn.onClick.add(() => {
    classificationWindow.visible = !classificationWindow.visible
    classificationsBtn.active = classificationWindow.visible
})

async function createModelTree(){
    // grupo de modelos para la ventana storeys=pisos entities=entidades
    const fragmentTree = new OBC.FragmentTree(viewer)
    await fragmentTree.init()
    await fragmentTree.update(["storeys", "entities"])
    fragmentTree.onHovered.add((fragmentMap) => {
        highlighter.highlightByID("hover", fragmentMap)
    })
    fragmentTree.onSelected.add((fragmentMap) =>{
        highlighter.highlightByID("select", fragmentMap)
    })
    const tree = fragmentTree.get().uiElement.get("tree")
    return tree
}

ifcLoader.onIfcLoaded.add(async (model) => {
    // highlighter resaltador elemnto seleccionado
    highlighter.update()
    // Claseficar modelos en grupos
    classifier.byStorey(model)
    classifier.byEntity(model)
    const tree = await createModelTree()
    // Agrupar las propiedades de los modelos
    await classificationWindow.slots.content.dispose(true)
    classificationWindow.addChild(tree)

    // Propiedades de modelo seleccionado a traves de expresID con highlighter
    propertiesProcessor.process(model)
    highlighter.events.select.onHighlight.add((fragmentMap) =>{
        const expressID = [...Object.values(fragmentMap)[0]][0]
        propertiesProcessor.renderProperties(model, Number(expressID))
    })
})

// Tools bar
const toolbar = new OBC.Toolbar(viewer)
toolbar.addChild(
    ifcLoader.uiElement.get("main"),
    classificationsBtn,
    propertiesProcessor.uiElement.get("main")
)
viewer.ui.addToolbar(toolbar)