import { invoke } from '@tauri-apps/api/core';
import { LIST_ITEM_TYPES } from '../../enums/listItems.js';
import { getRASystemID } from './raSystem.js';
import { getFromMetaLibrary, pushToMetaLibrary } from '../../config.js';
let hashes;
let isWorking = false;
let query = [];
export const getMetaData = async (file, { isVideo, isAudio, isRetro } = {}) => {
    if (file.type === LIST_ITEM_TYPES.URL) return file;
    if (isAudio) {
        try {
            const meta = await invoke("get_metadata", file);
            return meta;
        } catch (e) {
            console.log(e);
            return {};
        }
    }
    if (isVideo) {
        try {
            const hash = await invoke("hash_file", { path: file.path });
            // const meta = await invoke("get_metadata", file);
            console.log(await getFromMetaLibrary(hash));
            ;
            return hash;
        } catch (e) {
            console.log(e);
            return {};
        }
    }
    if (isRetro) {
        isWorking = true;
        let { fileType, path } = file;

        if (!hashes) {
            hashes = await fetch("/all-hashes.json").then(resp => resp.json());
        }
        try {
            if (fileType === "zip") {
                fileType = await invoke("get_zip_file_extension", {
                    path
                })
            }
            const system = await getRASystemID({ fileType }) + "";
            const hash = await invoke("get_ra_hash", {
                path: file.path,
                system,
            })
            const meta = hashes[hash];
            // console.log({ hash, meta });
            return meta;
        } catch (e) {
            console.log(e);
            return false;
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