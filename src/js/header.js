import { buttons, curentPathPanel } from "./controls.js";
import { GO_TO_DIRECTIONS } from "./enums/gotoDirections.js";
import { fromHtml } from "./functions/html.js";

export const windowHeader = () => {
    return fromHtml(
        `<header class="window-header">
            <h1 class="window-title">X@rT Explorer</h1>
            <div class="window-controls">
                <button id="close-window-button" class="window-control-button">close</button>
            </div>
        </header>`)
}

export const headerElement = () => {
    const header = fromHtml(`
            <div id="app-header" class="app-header"></div>
        `);
    header.appendChild(headerControls());
    return header;
}
const headerControls = () => {
    const controls = document.createElement("div");
    controls.classList.add("header__controls-container");
    const backButton = buttons.back({ id: "control-back" });
    controls.append(
        backButton,
        buttons.forward({ id: "control-forvard" }),
        buttons.home({ id: "control-home" }),
        buttons.refresh({ id: "control-refresh" }),

        curentPathPanel({ id: "path" }),
        buttons.sort({ id: "control-sort-list" }),
        buttons.folderSize({ id: "control-show-size" })
    )
    return controls;
}