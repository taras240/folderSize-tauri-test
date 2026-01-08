import { fromHtml } from "./functions/html.js";

const buttonsHtml = {
    back: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "back-button", ...classList],
        iconHtml: iconsHtml.back
    }),
    forward: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "forward-button", ...classList],
        iconHtml: iconsHtml.forward
    }),
    home: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "home-button", ...classList],
        iconHtml: iconsHtml.home
    }),
    folderSize: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "folder-size-button", ...classList],
        iconHtml: iconsHtml.folderInfo
    }),
}
export const buttons = {
    back: ({ id, classList = [] }) => fromHtml(buttonsHtml.back({ id, classList })),
    forward: ({ id, classList = [] }) => fromHtml(buttonsHtml.forward({ id, classList })),
    home: ({ id, classList = [] }) => fromHtml(buttonsHtml.home({ id, classList })),
    folderSize: ({ id, classList = [] }) => fromHtml(buttonsHtml.folderSize({ id, classList })),
}
const iconButton = ({ id, classList, iconHtml }) => {
    return `
        <button id="${id}" class="${classList.join(" ")}">
          ${iconHtml}
        </button>
    `
}
const iconTemplate = (iconName) => `<i class="svg-icon ${iconName}-icon"></i>`;
const iconsHtml = {
    back: iconTemplate("back"),
    forward: iconTemplate("forward"),
    home: iconTemplate("home"),
    folderInfo: iconTemplate("folder_info"),
}
export const curentPathPanel = ({ id }) => fromHtml(`
          <input id="${id}" class="header-control header__file-path" value="C:\\" />
    `)

export const statusLine = () => fromHtml(`
    <div id="status-line" class="status-line">Status</div>
    `)


