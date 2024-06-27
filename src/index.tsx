import * as React from "react"
import * as ReactDOM from "react-dom/client"
import * as Router from "react-router-dom"
import * as OBC from "openbim-components"
import { Sidebar } from "../src/react-components/Sidebar"
import { ProjectsPage } from "../src/react-components/ProjectsPage"
import { ProjectDetailsPage } from "./react-components/ProjectDetailsPage"
import { FragmentsGroup } from "bim-fragment"
import { ProjectsManager } from "./classes/ProjectsManager"

const projectsManager = new ProjectsManager()

const rootElement = document.getElementById("app") as HTMLDivElement
const appRoot = ReactDOM.createRoot(rootElement)
appRoot.render(
    <>
        <Router.BrowserRouter>
            <Sidebar />
            <Router.Routes>
                <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager} />}></Router.Route>
                <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager} />}></Router.Route>
            </Router.Routes>
        </Router.BrowserRouter>
    </>
)