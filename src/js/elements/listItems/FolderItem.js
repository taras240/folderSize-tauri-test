import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
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
export const FolderElement = (item) => {
    const { name, size, modified, readonly, hidden, path } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FOLDER;
    li.classList.add("folder__list-item");
    li.innerHTML = fileHtml(item);
    li.querySelector(".delete-button")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deletePath({ path, onDeleted: () => li.remove() });
    })
    return li;
}