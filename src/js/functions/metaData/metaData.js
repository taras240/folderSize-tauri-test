import { invoke } from '@tauri-apps/api/core';
export const getMetaData = async (file) => {
    try {
        const meta = await invoke("get_metadata", file);
        return meta;
    } catch (e) {
        console.log(e);
        return {};
    }
}