import { ui } from "../../../main.js";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isAudio } from "../../functions/fileFormats.js";
import { fromHtml } from "../../functions/html.js";
import { fileHtml } from "../listItems.js";
import { fileTypeHtml } from "./components/badges.js";

const audioUrlHtml = (item) => {
    const { name } = item;
    return `
        ${fileTypeHtml("url")}
        <div class="list-item__column list-item__title">${name}</div>
        <div class="list-item__space"></div>
    `;
}
export const AudioUriElement = (item, listViewType = LIST_VIEW_TYPES.files) => {
    const { name, url, title, artist } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FILE;
    li.classList.add("folder__list-item");
    li.dataset.name = name;
    li.dataset.path = url;
    // li.dataset.size = size;
    li.innerHTML = audioUrlHtml(item);
    const dwnButton = fromHtml(`<a href="${url}" download="${name}">download</a>`);
    li.append(dwnButton);
    // dwnButton = 
    li.addEventListener("click", async (event) => {
        ui.startPlayer(item);
    });
    li.addEventListener("dblclick", async (event) => {
        console.log(isAudio(item), item);
        ui.startPlayer(item);
    });
    return li;
}
