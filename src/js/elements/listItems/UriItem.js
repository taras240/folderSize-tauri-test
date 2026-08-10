import { invoke } from "@tauri-apps/api/core";
import { ui } from "../../../main.js";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { LIST_VIEW_TYPES } from "../../enums/listViews.js";
import { isAudio } from "../../functions/fileFormats.js";
import { fromHtml } from "../../functions/html.js";
import { fileHtml } from "../listItems.js";
import { fileTypeHtml, textBadgeHtml } from "./components/badges.js";
import { formatSongDuration } from "../../functions/timeFormat.js";
function sanitizeFileName(name) {
    return name
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // заборонені символи та керуючі символи
        .replace(/[. ]+$/g, "")                // прибрати крапки/пробіли в кінці
        .trim();
}
const audioUrlHtml = (item) => {
    const { name, artist, channel, title, duration } = item;
    const normalizedDuration = formatSongDuration(duration);
    return `
        ${fileTypeHtml("url")}
        <div class="list-item__column list-item__title">${name || title}</div>
        <div class="list-item__space"></div>
        ${textBadgeHtml(normalizedDuration)}
    `;
}
export const AudioUriElement = (item, listViewType = LIST_VIEW_TYPES.files) => {
    const getYTAudioUrl = async (item) => {
        const audioUrl = (await invoke("youtube_audio_url", { videoUrl: item.ytUrl }))?.url;
        item.url = audioUrl;
        item.path = audioUrl;
        li.dataset.path = audioUrl;
    }
    const { name, url, title, artist, fileType, ytUrl } = item;
    const li = document.createElement("li");
    li.dataset.type = LIST_ITEM_TYPES.FILE;
    li.classList.add("folder__list-item");
    li.dataset.name = name;
    li.dataset.path = url;
    // li.dataset.size = size;
    li.innerHTML = audioUrlHtml(item);
    const dwnButton = fromHtml(`<button> ⬇️  </button>`);
    dwnButton.addEventListener("click", async (event) => {
        dwnButton.innerText = " ⏳ ";
        if (!item.url && item.ytUrl) {
            await getYTAudioUrl(item);
        }
        const downloadsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Downloads" });
        console.log(`dwn: ${item.url}`)
        await invoke("download_file", {
            url: item.url,
            path: `${downloadsPath}\\${sanitizeFileName(name || title)}.${fileType}`,
        });
        dwnButton.innerText = " ✅  ";
        dwnButton.addEventListener("click", () => { })
    })
    li.append(dwnButton);
    li.addEventListener("click", async (event) => {
        if (!item.url && item.ytUrl) {
            await getYTAudioUrl(item);
        }
        ui.startPlayer(item);
    });
    li.addEventListener("dblclick", async (event) => {
        console.log(isAudio(item), item);
        ui.startPlayer(item);
    });
    return li;
}
