
const { invoke } = window.__TAURI__.core;

export const fetchUrl = async (url) => {
    url ??= "https://api.loe.lviv.ua/api/menus?page=1&type=photo-grafic";
    const resolve = await invoke("fetch_site", ({ url }))
    const json = await JSON.parse(resolve);
    const data = json["hydra:member"][0].menuItems[0].children.at(-1).rawHtml;
    const groupRegex = /(?<=Група 2\.2.*?)(з\s\d{2}:\d{2}\sдо\s\d{2}:\d{2})/gis;
    const groupData = [...data.matchAll(groupRegex)];
    console.log(data, groupData);
    return resolve;
}