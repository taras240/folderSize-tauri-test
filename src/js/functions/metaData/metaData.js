import { invoke } from '@tauri-apps/api/core';
import { LIST_ITEM_TYPES } from '../../enums/listItems.js';
export const getMetaData = async (file) => {
    if (file.type === LIST_ITEM_TYPES.URL) return file;
    try {
        const meta = await invoke("get_metadata", file);
        return meta;
    } catch (e) {
        console.log(e);
        return {};
    }
}
export const setMetaData = async ({ path, tags }) => {
    if (!path || !tags) return;
    try {
        console.log(path, tags);
        const res = await invoke("set_metadata", { path, metadata: tags });
        return res;
    } catch (e) {
        console.log(e);
        return e;
    }
}