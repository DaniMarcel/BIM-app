import * as React from "react"
import * as Router from "react-router-dom"
import { ProjectsManager } from "../classes/ProjectsManager"
import { IFCViewer } from "./IFCViewer"
import { ViewerContext } from "./IFCViewer"
import { deleteDocument } from "../firebase"
import { updateDocument } from "../firebase"
import { IProject, ProjectStatus, UserRole } from "../classes/Project"
import { TodoCreator, ToDo } from "../bim-components/TodoCreator" // Asegúrate de importar el tipo ToDo


interface Props {
    projectsManager: ProjectsManager
}
export function ProjectDetailsPage(props: Props) {
    
    const { viewer } = React.useContext(ViewerContext)
    const [todos, setTodos] = React.useState<ToDo[]>([])

    const fetchAndListTodos = async () => {
        if (!viewer) { return }
        const todoCreator = await viewer.tools.get(TodoCreator)
        const todos = todoCreator.get() // Obtiene la lista de To-Do
        setTodos(todos) // Actualiza el estado con la lista de To-Do
    }
    const createTodo = async () => {
        if (!viewer) { return }
        const todoCreator = await viewer.tools.get(TodoCreator)
        await todoCreator.addTodo("Custom To-Do", "High")
        fetchAndListTodos() // Refresca la lista de To-Do después de crear uno nuevo
    }
    
    React.useEffect(() => {
        fetchAndListTodos() // Obtiene la lista de To-Do cuando el componente se monta
    }, [viewer])



    const routeParams = Router.useParams<{ id: string }>()
    if (!routeParams.id) {return (<p>Project ID is needed to see this page</p>)}
    const project = props.projectsManager.getProject(routeParams.id)
    if (!project) {return (<p>The project with ID {routeParams.id} wasn't found.</p>)}


    const navigateTo = Router.useNavigate()
    props.projectsManager.onProjectDeleted = async (id) => {
        await deleteDocument("/projects", id)
        navigateTo("/")
    }

    const onEditProjectClick = () => {
        const modal = document.getElementById("edit-project-modal")
        if (!(modal && modal instanceof HTMLDialogElement)) {return}
        modal.showModal()
    }

    const onFormSubit = (e: React.FormEvent) => {
        e.preventDefault()
        const projectForm = document.getElementById("edit-project-form")
        if (!(projectForm && projectForm instanceof HTMLFormElement)) {return}
        const formData = new FormData(projectForm)
        const projectData: IProject = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ProjectStatus,
            userRole: formData.get("userRole") as UserRole,
            finishDate: new Date(formData.get("finishDate") as string)
        }
        try {
            console.log(projectData)
            updateDocument<Partial<IProject>>("/projects", project.id, projectData)
            projectForm.reset()
            const modal = document.getElementById("edit-project-modal")
            if (!(modal && modal instanceof HTMLDialogElement)) {return}
            modal.close()
        } catch (err) {
            alert(err)
        }
    }

    return(
        <div className="page" id="project-details">
            <dialog id="edit-project-modal">
                <form onSubmit={(e) => onFormSubit(e)} id="edit-project-form">
                    <h2>Edit Project</h2>
                    <div className="input-list">
                        <div className="form-field-container">
                            <label>
                                <span className="material-icons-round">apartment</span>Name
                            </label>
                            <input name="name" type="text" placeholder="What's the name of your project?" defaultValue={project.name}/>
                            <p style={{color: "gray", fontSize: "var(--font-sm)",marginTop: "5px",fontStyle: "italic"}}></p>
                        </div>
                        <div className="form-field-container">
                            <label>
                                <span className="material-icons-round">subject</span>Description
                            </label>
                            <textarea name="description" cols={30} rows={5} defaultValue={project.description}/>
                        </div>
                        <div className="form-field-container">
                            <label>
                                <span className="material-icons-round">person</span>Role
                            </label>
                            <select name="userRole" defaultValue={project.userRole}>
                                <option>Architect</option>
                                <option>Engineer</option>
                                <option>Developer</option>
                            </select>
                        </div>
                        <div className="form-field-container">
                            <label>
                                <span className="material-icons-round">not_listed_location</span>Status
                            </label>
                            <select name="status" defaultValue={project.status}>
                                <option>Pending</option>
                                <option>Active</option>
                                <option>Finished</option>
                            </select>
                        </div>
                        <div className="form-field-container">
                            <label htmlFor="finishDate">
                                <span className="material-icons-round">calendar_month</span>Finish Date
                            </label>
                            <input name="finishDate" type="date"   defaultValue={new Date(project.finishDate).toISOString().split('T')[0]} />
                        </div>
                        <div style={{ display: "flex", margin: "10px 0px 10px auto", columnGap: 10 }}>
                            <button type="button" style={{ backgroundColor: "transparent" }}>Cancel</button>
                            <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>Accept</button>
                        </div>
                    </div>
                </form>
            </dialog>
            <header>
                <div>
                    <h2 data-project-info="name">{project.name}</h2>
                    <p style={{ color: "#969696" }}>{project.description}</p>
                </div>
                <button onClick={() => {props.projectsManager.deleteProject(project.id)}} style={{backgroundColor: "red"}}>Delete project</button>
            </header>
            <div className="main-page-content">
                <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
                    <div className="dashboard-card" style={{ padding: "30px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0px 30px", marginBottom: 30 }}>
                            <p style={{ fontSize: 20, backgroundColor: "#ca8134", aspectRatio: 1, borderRadius: "100%", padding: 12 }}>HC</p>
                            <button className="btn-secondary">
                            <p onClick={onEditProjectClick} style={{ width: "100%" }}>Edit</p>
                            </button>
                        </div>
                        <div style={{ padding: "0 30px" }}>
                            <div>
                                <h5>{project.name}</h5>
                                <p>{project.description}</p>
                            </div>
                            <div style={{ display: "flex", columnGap: 30, padding: "30px 0px", justifyContent: "space-between" }}>
                                <div>
                                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Status</p>
                                    <p>{project.status}</p>
                                </div>
                                <div>
                                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Cost</p>
                                    <p>${project.cost}</p>
                                </div>
                                <div>
                                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Role</p>
                                    <p>{project.userRole}</p>
                                </div>
                                <div>
                                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Finish Date</p>
                                    <p>{project.finishDate.toDateString()}</p>
                                </div>
                            </div>
                            <div style={{ backgroundColor: "#404040", borderRadius: 9999, overflow: "auto"}}>
                                <div style={{ width: `${project.progress * 100}%`, backgroundColor: "green", padding: "4px 0", textAlign: "center" }}>
                                    {project.progress * 100}%
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-card" style={{ flexGrow: 1, height: "300px", overflowY: "scroll" }}>
                        <div style={{ padding: "20px 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h4>To-Do</h4>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "end", columnGap: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                                    <span className="material-icons-round">search</span>
                                    <input type="text" placeholder="Search To-Do's by name" style={{ width: "100%" }}/>
                                </div>
                                <button onClick={createTodo}>
                                    <span className="material-icons-round">add</span>
                                </button>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", padding: "10px 30px", rowGap: 20 }}>
                            {todos.map((todo, index) => (
                                <div className="todo-item" key={index}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", columnGap: 15, alignItems: "center" }}>
                                            <span className="material-icons-round" style={{ padding: 10, backgroundColor: "#686868", borderRadius: 10 }}> construction </span>
                                            <p>{todo.description}</p>
                                        </div>
                                        <p style={{ marginLeft: 10 }}>{todo.date.toDateString()}</p>
                                        <p style={{ marginLeft: 10, marginRight: 10 }}>{todo.priority}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <IFCViewer />
            </div>
        </div>
    )
}