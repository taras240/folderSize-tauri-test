import { ui } from "../../../main.js";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isAudio } from "../../functions/fileFormats.js";
import { deletePath } from "../../functions/listFuncs.js";
import { fileHtml } from "../listItems.js";
import { fileTypeHtml } from "./components/badges.js";

const audioFileHtml = (item) => {
    const { name, normalizedName, is_dir, is_file, is_symlink, size, normalizedSize, modifiedDate, readonly, hidden, type, fileType } = item;
    return `
        ${fileTypeHtml(fileType)}
        <div class="list-item__column list-item__title">${normalizedName} 🔹 ${normalizedSize}</div>
        <div class="list-item__space"></div>
    `;
}
export const AudioElement = (item, listViewType = LIST_VIEW_TYPES.files) => {
    if (!isAudio(item)) return;
    const { name, size, modified, readonly, hidden, path, fileType } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FILE;
    li.classList.add("folder__list-item");
    li.dataset.name = name;
    li.dataset.path = path;
    li.dataset.size = size;
    li.innerHTML = audioFileHtml(item);
    li.addEventListener("click", async (event) => {
        if (event.target.closest(".delete-button")) {
            event.stopPropagation();
            await deletePath({ path, onDeleted: () => li.remove() });
        }
        else {
            ui.startPlayer(item);

        }
    });
    li.addEventListener("dblclick", async (event) => {
        console.log(isAudio(item), item);
        ui.startPlayer(item);
    });
    return li;
}
