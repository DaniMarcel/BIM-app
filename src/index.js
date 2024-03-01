import { Project } from "./class/Project"
//
function showModal(id){
    const modal = document.getElementById(id)
    if(modal){
        modal.showModal()
    }else{
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}
//Btn form click
const newProjectBtn = document.getElementById("new-project-btn")
if(newProjectBtn){
    newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
}else{
    console.warn("New projects button was not found")
}
// Form
const projectForm = document.getElementById("new-project-form")
if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const formData = new FormData(projectForm)
        const projectData = {
            name: formData.get("name"),
            description: formData.get("description"),
            status: formData.get("status"),
            userRole: formData.get("userRole"),
            finishDate: formData.get("finishDate")
        }
        const project = new Project(projectData)
        console.log(project)
    })
}else{
    console.warn("The project form was not found. Check the ID!")
}