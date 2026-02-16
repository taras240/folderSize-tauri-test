import { fromHtml } from "../functions/html.js";
import { iconsHtml } from "./icons.js";
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
        iconHtml: iconsHtml.folderInfo,
        title: "Folder Size"
    }),
    fullFolder: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", ...classList],
        iconHtml: iconsHtml.fullFolder,
        title: "Inner Files"
    }),
    videoLibrary: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "folder-library-button", ...classList],
        iconHtml: iconsHtml.videoLibrary,
        title: "View"
    }),
    folderList: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["control-button", "folder-list-button", ...classList],
        iconHtml: iconsHtml.folderList
    }),
    sort: ({ id, classList = [] }) => iconButton({
        id,
        classList: ["header-control", "control-button", "sort-list-button", ...classList],
        iconHtml: iconsHtml.sort,
        title: "Sort"
    }),
}
export const controlButtons = {
    back: ({ id, classList }) => fromHtml(buttonsHtml.back({ id, classList })),
    forward: ({ id, classList }) => fromHtml(buttonsHtml.forward({ id, classList })),
    home: ({ id, classList }) => fromHtml(buttonsHtml.home({ id, classList })),
    refresh: ({ id, classList }) => fromHtml(buttonsHtml.refresh({ id, classList })),

    folderSize: ({ id, classList }) => fromHtml(buttonsHtml.folderSize({ id, classList })),
    fullFolder: ({ id }) => fromHtml(buttonsHtml.fullFolder({ id })),

    videoLibrary: ({ id }) => fromHtml(buttonsHtml.videoLibrary({ id })),
    folderList: ({ id, classList }) => fromHtml(buttonsHtml.folderList({ id, classList })),
    sort: ({ id, classList }) => fromHtml(buttonsHtml.sort({ id, classList })),
}
const buttonTextHtml = (text) => text ? `
    <p class="control-button-text">${text}</p>
` : ``;
const iconButton = ({ id, classList, iconHtml, title = "" }) => {
    return `
        <button id="${id}" class="${classList.join(" ")}">
          ${iconHtml}${buttonTextHtml(title)}
        </button>
    `
}