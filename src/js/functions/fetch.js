
import { invoke } from '@tauri-apps/api/core';

export const fetchUrl = async (url) => {
    url ??= "https://api.loe.lviv.ua/api/menus?page=1&type=photo-grafic";
    const resolve = await invoke("fetch_site", ({ url }))
    // const json = await JSON.parse(resolve);


    const content = JSON.parse(resolve).content;
    const data = content.match(/\"https[^\"]+\.mp3\"/gi);



    return resolve;
}