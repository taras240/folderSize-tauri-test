import { invoke } from "@tauri-apps/api/core";
import { ui } from "../../../main.js";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isAudio } from "../../functions/fileFormats.js";
import { deletePath } from "../../functions/listFuncs.js";
import { fileHtml } from "../listItems.js";
import { fileTypeHtml } from "./components/badges.js";
import { getMetaData } from "../../functions/metaData/metaData.js";
import { CONTEXT_ITEM_TYPES } from "../../enums/contextMenuItemTypes.js";
import { openWithRetroarch } from "./RetroItem.js";
import { ContextMenu, setPosition } from "../contextMenu/contextMenu.js";

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
    const element = document.createElement("li");
    element.dataset.type = LIST_ITEM_TYPES.FILE;
    element.classList.add("folder__list-item");
    element.dataset.name = name;
    element.dataset.path = path;
    element.dataset.size = size;
    element.innerHTML = audioFileHtml(item);
    element.addEventListener("click", async (event) => {
        ui.clearSelection();
        if (event.target.closest(".delete-button")) {
            event.stopPropagation();
            await deletePath({ path, onDeleted: () => element.remove() });
        }
        else {
            ui.startPlayer(item);
        }
    });
    element.addEventListener("dblclick", async (event) => {
        console.log(isAudio(item), item);
        ui.startPlayer(item);
    });
    element.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
        ui.clearSelection();
        ui.addSelection({ element, file: item });
        const menu = ContextMenu(contextMenu(item, element));
        ui.app.append(menu);
        const rect = event.currentTarget.getBoundingClientRect();
        const position = { X: event.x, Y: event.y };
        setPosition({ element: menu, position, event });

        menu.addEventListener("click", () => ui.clearSelection());
    });
    item.element = element;
    return element;
}
const contextMenu = (item, element) => [
    {
        label: "Edit Metadata",
        type: CONTEXT_ITEM_TYPES.button,
        onClick: () => ui.editMetaData({ file: item }),
    },
    {
        label: "Delete",
        type: CONTEXT_ITEM_TYPES.button,
        onClick: async () => await deletePath({
            path: item.path,
            onDeleted: () => element?.remove()
        }),
    }
];
