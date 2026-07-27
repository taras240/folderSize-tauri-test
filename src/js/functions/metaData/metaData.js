import { invoke } from '@tauri-apps/api/core';
import { LIST_ITEM_TYPES } from '../../enums/listItems.js';
import { isAudio, isRetro } from '../fileFormats.js';
import { getRASystemID } from './raSystem.js';
let hashes;
let isWorking = false;
let query = [];
export const getMetaData = async (file) => {
    if (file.type === LIST_ITEM_TYPES.URL) return file;
    if (isAudio(file)) {
        try {
            const meta = await invoke("get_metadata", file);
            return meta;
        } catch (e) {
            console.log(e);
            return {};
        }
    }
    if (isRetro(file)) {
        isWorking = true;
        let { fileType, path } = file;
        if (fileType === "zip") {
            fileType = await invoke("get_zip_file_extension", {
                path
            })
        }
        const system = await getRASystemID({ fileType }) + "";
        if (!hashes) {
            hashes = await fetch("/all-hashes.json").then(resp => resp.json());
        }
        try {
            const hash = await invoke("get_ra_hash", {
                path: file.path,
                system,
            })
            const meta = hashes[hash];
            // console.log({ hash, meta });
            return meta;
        } catch (e) {
            console.log(e);
        }
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