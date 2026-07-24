import { ui } from "../../main.js";
import { LIST_ITEM_TYPES } from "../enums/listItems.js";
import { isAudio } from "../functions/fileFormats.js";
import { fromHtml } from "../functions/html.js";
import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { iconsHtml } from "./icons.js";
import { LIST_VIEW_TYPES } from "../enums/listViews.js";
import { getSizeClass } from "../functions/metaData/normalizedSize.js";
import { fileTypeHtml, sizeHtml } from "./listItems/components/badges.js";
import { DriveElement } from "./listItems/DriveItem.js";
import { FileElement } from "./listItems/FileItem.js";
import { FolderElement } from "./listItems/FolderItem.js";
import { AudioElement } from "./listItems/AudioItem.js";
import { VideoElement } from "./listItems/VideoItem.js";
import { AudioUriElement } from "./listItems/UriItem.js";
import { RetroElement } from "./listItems/RetroItem.js";




export const listElement = (item, listViewType) => {

    switch (item.type) {
        case LIST_ITEM_TYPES.DRIVE:
            return DriveElement(item, listViewType);
        case LIST_ITEM_TYPES.FILE:
            if (listViewType === LIST_VIEW_TYPES.audio)
                return AudioElement(item);
            if (listViewType === LIST_VIEW_TYPES.video)
                return VideoElement(item);
            if (listViewType === LIST_VIEW_TYPES.retro)
                return RetroElement(item);
            return FileElement(item, listViewType);
        case LIST_ITEM_TYPES.FOLDER:
            return FolderElement(item, listViewType);
        case LIST_ITEM_TYPES.URL:
            return AudioUriElement(item, listViewType);
        default:
            return;
    }
}





export const fileHtml = (item) => {
    const { name, normalizedName, is_dir, is_file, is_symlink, size, normalizedSize, modifiedDate, readonly, hidden, type, fileType } = item;

    const sizeClass = getSizeClass(size);

    return `
        ${fileTypeHtml(fileType)}
        ${normalizedSize ? sizeHtml(normalizedSize, sizeClass) : ""}
        

        <div class="list-item__column list-item__title">${normalizedName}</div>
        
        <div class="list-item__space"></div>
        <div class="list-item__column list-item__date text-badge">${modifiedDate}</div>
        <div class="list-item__column list-item__button-container delete-button">
            <button class="list-item__button delete-button">
                ${iconsHtml.delete}
            </button>
        </div>
    `;
}
export const itemBadge = ({ text, classList = [] }) => fromHtml(`
        <div class="list-item__column text-badge ${classList.join(" ")}">
            ${text}
        </div>
    `)







