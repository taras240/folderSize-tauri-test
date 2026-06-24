import { ui } from "../../../main.js";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isAudio } from "../../functions/fileFormats.js";
import { fromHtml } from "../../functions/html.js";
import { deletePath } from "../../functions/listFuncs.js";
import { getSizeClass } from "../../functions/metaData/normalizedSize.js";
import { iconsHtml } from "../icons.js";
import { fileTypeHtml, sizeHtml } from "./components/badges.js";

const fileHtml = (item) => {
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

export const FileElement = (item, listViewType = LIST_VIEW_TYPES.files) => {
    const { name, size, modified, readonly, hidden, path, fileType } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FILE;
    li.classList.add("folder__list-item");
    li.dataset.name = name;
    li.dataset.path = path;
    li.dataset.size = size;
    li.innerHTML = fileHtml(item);

    li.addEventListener("click", async (event) => {
        if (event.target.closest(".delete-button")) {
            event.stopPropagation();
            await deletePath(path);
            li.remove();
            console.log("delete", path)
        }
        else {
            if (isAudio(item)) {
                ui.startPlayer(item);
            }
        }
    });
    li.addEventListener("dblclick", async (event) => {
        console.log(isAudio(item), item)
        if (isAudio(item)) {
            ui.startPlayer(item);
        }

    });
    return li;
}