import { buttons, curentPathPanel } from "./controls.js";
import { GO_TO_DIRECTIONS } from "./enums/gotoDirections.js";
import { fromHtml } from "./functions/html.js";

export const headerElement = () => {
    const header = document.createElement("div");
    header.classList.add("app-header");
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
        buttons.folderSize({ id: "control-show-size" })
    )
    return controls;
}