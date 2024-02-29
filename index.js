function showModal(id){
    const modal = document.getElementById(id)
    if(modal){
        modal.showModal()
    }else{
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}

const newProjectBtn = document.getElementById("new-project-btn")
if(newProjectBtn){
    newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
}else{
    console.warn("New projects button was not found")
}

const projectForm = document.getElementById("new-project-form")
if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(projectForm)
    console.log("Description:", formData.get("description"))
    })
} else {
    console.warn("The project form was not found. Check the ID!")
}