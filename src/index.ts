import { Project, IProject, ProjectStatus, UserRole } from "./class/Project"
//
function showModal(id: string){
    const modal = document.getElementById(id)
    if(modal && modal instanceof HTMLDialogElement){
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
        const project = new Project(projectData)
        console.log(project)
    })
}else{
    console.warn("The project form was not found. Check the ID!")
}