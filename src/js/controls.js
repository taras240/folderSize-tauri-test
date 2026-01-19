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
    refresh: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "refresh-button", ...classList],
        iconHtml: iconsHtml.refresh
    }),
    folderSize: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "folder-size-button", ...classList],
        iconHtml: iconsHtml.folderInfo
    }),
    sort: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "sort-list-button", ...classList],
        iconHtml: iconsHtml.sort
    }),
}
export const buttons = {
    back: ({ id, classList = [] }) => fromHtml(buttonsHtml.back({ id, classList })),
    forward: ({ id, classList = [] }) => fromHtml(buttonsHtml.forward({ id, classList })),
    home: ({ id, classList = [] }) => fromHtml(buttonsHtml.home({ id, classList })),
    refresh: ({ id, classList = [] }) => fromHtml(buttonsHtml.refresh({ id, classList })),

    folderSize: ({ id, classList = [] }) => fromHtml(buttonsHtml.folderSize({ id, classList })),
    sort: ({ id, classList = [] }) => fromHtml(buttonsHtml.sort({ id, classList })),
}
const iconButton = ({ id, classList, iconHtml }) => {
    return `
        <button id="${id}" class="${classList.join(" ")}">
          ${iconHtml}
        </button>
    `
}
const iconTemplate = (iconName) => `<i class="svg-icon ${iconName}-icon"></i>`;
export const iconsHtml = {
    back: iconTemplate("back"),
    forward: iconTemplate("forward"),
    home: iconTemplate("home"),
    refresh: iconTemplate("refresh"),

    folderInfo: iconTemplate("folder_info"),

    play_audio: iconTemplate("play_audio"),
    next_audio: iconTemplate("next_audio"),
    prev_audio: iconTemplate("prev_audio"),
    sort: iconTemplate("sort"),
}
export const curentPathPanel = ({ id }) => fromHtml(`
          <input id="${id}" class="header-control header__file-path" value="C:\\" />
    `)

export const statusLine = () => fromHtml(`
    <div id="status-line" class="status-line"></div>
    `)


