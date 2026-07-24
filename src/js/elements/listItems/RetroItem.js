import { invoke } from "@tauri-apps/api/core";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isRetro } from "../../functions/fileFormats.js";
import { deletePath } from "../../functions/listFuncs.js";
import { fileTypeHtml } from "./components/badges.js";
import { getRASystemID } from "../../functions/metaData/raSystem.js";

const retroFileHtml = (item) => {
    const { name, normalizedName, is_dir, is_file, is_symlink, size, normalizedSize, modifiedDate, readonly, hidden, type, fileType } = item;
    return `
        ${fileTypeHtml(fileType)}
        <div class="list-item__column list-item__title">${normalizedName} 🔹 ${normalizedSize}</div>
        <div class="list-item__space"></div>
    `;
}
export const RetroElement = (item, listViewType = LIST_VIEW_TYPES.retro) => {
    if (!isRetro(item)) return;
    const { name, size, modified, readonly, hidden, path, fileType } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FILE;
    li.classList.add("folder__list-item");
    li.dataset.name = name;
    li.dataset.path = path;
    li.dataset.size = size;
    li.innerHTML = retroFileHtml(item);
    li.addEventListener("click", async (event) => {
        if (event.target.closest(".delete-button")) {
            event.stopPropagation();
            await deletePath({ path, onDeleted: () => li.remove() });
        }
    });
    li.addEventListener("dblclick", async (event) => {
        let hash;
        const system = getRASystemID(item).toString();
        if (!system) return;
        try {
            hash = await invoke("get_ra_hash", {
                path: item.path,
                system,
            })
            console.log(hash);
        } catch (e) {
            console.log(e)
        }

    });
    li.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
    });
    return li;
}
