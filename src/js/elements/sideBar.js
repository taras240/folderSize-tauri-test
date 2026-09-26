import { fromHtml } from "../functions/html.js";

export function sideBarElement({ sidebarItems, onClick }) {
    const sidebar = fromHtml(`
            <aside#app-sidebar.sidebar/>
        `)
    const sidebarPathList = fromHtml(`<.sidebar-container/>`)
    const pathElements = sidebarItems
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map(pathItem => {
            const pathElement = fromHtml(`
            <.sidebar-element>${pathItem.label}</>
            `);
            pathElement.addEventListener("click", (event) => onClick?.(pathItem.path));
            return pathElement;
        });

    sidebarPathList.append(...pathElements);
    sidebar.append(sidebarPathList);
    return sidebar;
}