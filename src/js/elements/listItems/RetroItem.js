import { invoke } from "@tauri-apps/api/core";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isRetro } from "../../functions/fileFormats.js";
import { deletePath } from "../../functions/listFuncs.js";
import { fileTypeHtml } from "./components/badges.js";
import { getRASystemID } from "../../functions/metaData/raSystem.js";
import { iconsHtml } from "../icons.js";

const retroFileHtml = (item) => {
    const { name, normalizedName, is_dir, is_file, is_symlink, size, normalizedSize, modifiedDate, readonly, hidden, type, fileType } = item;

    return `
            ${fileTypeHtml(fileType)}
            <div class="list-item__column list-item__date text-badge">${normalizedSize}</div>
            <div class="list-item__column list-item__title">${normalizedName}</div>
            
            <div class="list-item__space"></div>
            <div class="list-item__column list-item__button-container delete-button">
                <button class="list-item__button delete-button">
                    ${iconsHtml.delete}
                </button>
            </div>
        `;


    // const { name, normalizedName, is_dir, is_file, is_symlink, size, normalizedSize, modifiedDate, readonly, hidden, type, fileType } = item;
    // return `
    //     ${fileTypeHtml(fileType)}
    //     <div class="list-item__column list-item__title">${normalizedName} 🔹 ${normalizedSize}</div>
    //     <div class="list-item__space"></div>
    // `;
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
        if (fileType === "zip") {
            fileType = await invoke("get_zip_file_extension", {
                path
            })
            console.warn(fileType);
        }
        const system = getRASystemID({ fileType }).toString();
        if (!system) return;
        // retroarchPath: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\RetroArch\\retroarch.exe"
        try {
            hash = await invoke("launch_retroarch", {
                gamePath: item.path,
                path: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\RetroArch\\retroarch.exe",
            })

            console.log({ hash });
        } catch (e) {
            console.log(e)
        }

    });
    li.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
    });
    return li;
}
