import { fromHtml } from "./functions/html.js";

export function sideBarElement() {
    return fromHtml(`
            <aside id="app-sidebar" class="sidebar">
                <div class="sidebar-container">
                    <div id="sidebar-user-user" class="sidebar-element">User</div>
                    <div id="sidebar-user-downloads" class="sidebar-element">Downloads</div>
                    <div id="sidebar-user-desktop" class="sidebar-element">Desktop</div>
                    <div id="sidebar-user-music" class="sidebar-element">Music</div>
                    <div id="sidebar-user-videos" class="sidebar-element">Videos</div>
                    <div id="sidebar-user-pictures" class="sidebar-element">Pictures</div>
                    <div id="sidebar-user-docs" class="sidebar-element">Documents</div>
                </div>
            </aside>
        `)
}