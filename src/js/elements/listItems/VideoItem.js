import { convertFileSrc } from "@tauri-apps/api/core";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { isVideo } from "../../functions/fileFormats.js";
import { getNormalizedSize } from "../../functions/metaData/normalizedSize.js";
import { iconsHtml } from "../icons.js";
import { deletePath } from "../../functions/listFuncs.js";

const videoHtml = (item) => {
    const { name, normalizedName, is_dir, is_file, is_symlink, size, modifiedDate, readonly, hidden, type, fileType, path } = item;
    const normalizedSize = getNormalizedSize(size);
    return `
        <video class="list__video-container" controls muted loop src="${convertFileSrc(path)}" loading="lazy"></video>
        <div class="list__video-details" title="${name}">${normalizedSize} :: ${normalizedName}</div>
        <div class="list__video-buttons">
            <button class="list-item__button delete-button">
                ${iconsHtml.delete}
            </button>
        </div>
        
     `
}
export const VideoElement = (item) => {
    if (!isVideo(item)) return;
    const { name, size, modified, readonly, hidden, path, fileType } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.VIDEO;
    li.classList.add("folder__list-item", "video-item");
    li.dataset.name = name;
    li.dataset.path = path;
    li.dataset.size = size;
    li.innerHTML = videoHtml(item);
    li.addEventListener("click", async (event) => {
        if (event.target.closest(".delete-button")) {
            event.stopPropagation();
            await deletePath({ path, onDeleted: () => li.remove() });
        }
    });
    li.addEventListener("dblclick", async (event) => {
        console.log(isAudio(item), item)
    });
    return li;
}
