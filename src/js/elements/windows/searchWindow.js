import { invoke } from "@tauri-apps/api/core";
import { fromHtml } from "../../functions/html.js";
import { ModalWindowElement } from "./modalWindow.js";
import { LIST_ITEM_TYPES } from "../../enums/listItems.js";
import { listElement } from "../listItems.js";

async function spacesSearch(query) {
    let links = [];
    for (let i = 1; i < 6; i++) {
        const url = `https://spaces.im/ajax1772834143892/music-online/search/index/?Link_id=1527673&T=28&P=${i}&sq=${query}`;
        const resp = await invoke("fetch_site", { url });
        const contentHtml = JSON.parse(resp).content;
        const content = fromHtml(`<div>${contentHtml}</div>`);
        links = links.concat([...content.querySelectorAll(".list>.block")].map(el => {
            const artist = el.querySelector("div")?.innerText.replace(/\:.*$/, "").trim();
            const title = el.querySelector(".block div a")?.innerText;
            const name = `${artist} – ${title}`;
            const url = el.querySelector("div>a:nth-of-type(2)")?.href;
            if (!url) return;
            return ({ name, url, path: url, artist, title, fileType: "mp3", type: LIST_ITEM_TYPES.URL });
        }).filter(el => el));
    }
    return links;
}
async function ytSearch(query) {
    let results = await invoke("youtube_search", { query, limit: 30 });
    results = results.map(item => {
        return {
            ...item,
            artist: item.channel,
            ytUrl: item.url,
            url: null,
            type: LIST_ITEM_TYPES.URL,
            fileType: "m4a",
        }
    })
    return results;
    //      channel: "Марія Гайова"
    //      duration:  221
    //      id: "LsMvBf-qiBo"
    //      thumbnail: null
    //      title:  "#NK-#почуття ( cover Mari Gayova)  #річниця #почуття #свято #музичне_привітання #вітання"
    //      url: "https://www.youtube.com/watch?v=LsMvBf-qiBo"
}
export async function SearchWindowElement(query) {

    const window = ModalWindowElement({
        title: `search [${query}]`,
        classList: ["modal-window"]
    })
    const content = fromHtml(`
        <ul class="files-list"></ul>
    `);
    const links = await ytSearch(query);
    console.log(links);
    content.append(...links.map(link => listElement(link)));
    window.querySelector(".modal-body").append(content);
    return window;
}