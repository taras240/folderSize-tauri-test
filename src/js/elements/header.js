import { curentPathPanel } from "./controls.js";
import { GO_TO_DIRECTIONS } from "../enums/gotoDirections.js";
import { fromHtml } from "../functions/html.js";
import { controlButtons } from "./buttons.js";

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
    const backButton = controlButtons.back({ id: "control-back" });
    controls.append(
        backButton,
        controlButtons.forward({ id: "control-forvard" }),
        controlButtons.home({ id: "control-home" }),
        controlButtons.refresh({ id: "control-refresh" }),

        curentPathPanel({ id: "path" }),
        controlButtons.sort({ id: "control-sort-list" }),
        controlButtons.folderSize({ id: "control-show-size" }),
        controlButtons.fullFolder({ id: "control-show-all-files" }),
        controlButtons.videoLibrary({ id: "control-switch-video-view" })
    )
    return controls;
}