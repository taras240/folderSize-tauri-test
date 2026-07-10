import { invoke } from "@tauri-apps/api/core";
import { ui } from "../../../main.js";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isAudio } from "../../functions/fileFormats.js";
import { fromHtml } from "../../functions/html.js";
import { fileHtml } from "../listItems.js";
import { fileTypeHtml } from "./components/badges.js";
function sanitizeFileName(name) {
    return name
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // заборонені символи та керуючі символи
        .replace(/[. ]+$/g, "")                // прибрати крапки/пробіли в кінці
        .trim();
}
const audioUrlHtml = (item) => {
    const { name } = item;
    return `
        ${fileTypeHtml("url")}
        <div class="list-item__column list-item__title">${name}</div>
        <div class="list-item__space"></div>
    `;
}
export const AudioUriElement = (item, listViewType = LIST_VIEW_TYPES.files) => {
    const { name, url, title, artist, fileType } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FILE;
    li.classList.add("folder__list-item");
    li.dataset.name = name;
    li.dataset.path = url;
    // li.dataset.size = size;
    li.innerHTML = audioUrlHtml(item);
    const dwnButton = fromHtml(`<button> ⬇️  </button>`);
    dwnButton.addEventListener("click", async (event) => {
        const downloadsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Downloads" });
        dwnButton.innerText = " ⏳ ";
        await invoke("download_file", {
            url,
            path: `${downloadsPath}\\${sanitizeFileName(name)}.${fileType}`,
        });
        dwnButton.innerText = " ✅  ";
        dwnButton.addEventListener("click", () => { })
    })
    li.append(dwnButton);
    li.addEventListener("click", async (event) => {
        ui.startPlayer(item);
    });
    li.addEventListener("dblclick", async (event) => {
        console.log(isAudio(item), item);
        ui.startPlayer(item);
    });
    return li;
}
