import * as React from "react"

export function Sidebar(){
    return(
        <aside id="sidebar">
        <img id="company-logo" src="./assets/TextoIngeBIM.png" alt="IngeBIM"></img>
        <ul id="nav-buttons">
            <li><span className="material-symbols-outlined">apartment</span>Projects</li>
            <li><span className="material-symbols-outlined">group</span>Users</li>
        </ul>
    </aside>
    )
}