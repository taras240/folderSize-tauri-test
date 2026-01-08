import { LIST_ITEM_TYPES } from "./enums/listItems.js";
import { fromHtml } from "./functions/html.js";
import { deletePath } from "./functions/listFuncs.js";



export const listElement = (item) => {

    switch (item.type) {
        case LIST_ITEM_TYPES.DRIVE:
            return driveElement(item);
        case LIST_ITEM_TYPES.FILE:
            return fileElement(item);
        case LIST_ITEM_TYPES.FOLDER:
            return folderElement(item);
        default:
            return;
    }
}
const folderElement = (item) => {
    const { name, size, modified, readonly, hidden, path } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FOLDER;
    li.classList.add("folder__list-item");
    li.innerHTML = fileHtml(item);
    li.querySelector(".delete-button")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deletePath(path);
        li.remove();
    })
    return li;
}
const fileElement = (item) => {
    const { name, size, modified, readonly, hidden, path } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FILE;
    li.classList.add("folder__list-item");
    li.innerHTML = fileHtml(item);
    li.querySelector(".delete-button")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deletePath(path);
        li.remove();
    })
    return li;
}
export const driveElement = (drive) => {
    const { name, total, available, path } = drive;

    const li = document.createElement("li");
    li.dataset.type = "drive";
    li.classList.add("folder__list-item");
    li.innerHTML = driveHtml(drive);

    return li;
}
const fileHtml = (item) => {
    const { name, normalizedName, is_dir, is_file, is_symlink, size, modifiedDate, readonly, hidden, type, fileType } = item;
    const normalizedSize = getNormalizedSize(size);
    const sizeClass = getSizeClass(size);

    return `
        ${fileTypeHtml(fileType)}
        ${normalizedSize ? sizeHtml(normalizedSize, sizeClass) : ""}
        

        <div class="list-item__column list-item__title">${normalizedName}</div>
        
        <div class="list-item__space"></div>
        <div class="list-item__column list-item__date text-badge">${modifiedDate}</div>
        <div class="list-item__column list-item__button-container">
            <button class="list-item__button delete-button">
                <i class="svg-icon delete-icon"></i>
            </button>
        </div>
    `;
}
const driveHtml = (drive) => {
    const { name, total, available, path } = drive;
    const normalizedSize = getNormalizedSize(total);
    const normalizedAvailableSize = getNormalizedSize(available);

    const fileType = "drive";
    return `
        ${fileTypeHtml(fileType)}
        ${sizeHtml(`${normalizedSize}[${normalizedAvailableSize}]`)}
        <div class="list-item__column list-item__title">[${name}] ${path} </div>
        <div class="list-item__space"></div>
    `;
}
const getNormalizedSize = (size) => {
    if (typeof (size) !== "number") return "";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;

    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${Number(size.toFixed(2))}${units[i]}`;
};

const getSizeClass = (size) => {
    if (size > 500e6) return "size-7";
    if (size > 200e6) return "size-6";
    if (size > 75e6) return "size-5";
    if (size > 20e6) return "size-4";
    if (size > 7e6) return "size-3";
    if (size > 1e6) return "size-2";
    return "size-1";
}


const textBadgeHtml = (text) => `
        <i class="text-badge">${text}</i>
    `;
const sizeHtml = (size, sizeClass) => `
        <div class="list-item__column list-item__size ${sizeClass}">
            ${textBadgeHtml(size)}
        </div>
    `;
const fileTypeHtml = (type) => `
        <div class="list-item__file-type" >
            ${textBadgeHtml(type)}
        </div>
    `