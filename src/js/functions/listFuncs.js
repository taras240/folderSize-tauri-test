import { ui } from "../../main.js";
import { LIST_ITEM_TYPES } from "../enums/listItems.js";


import { invoke } from '@tauri-apps/api/core';
import { STATUS_STATES } from "../enums/statusLineStates.js";



export const getDrives = async () => {
    const disks = await invoke("list_disks");
    // [{
    //   available: 3453085432,
    //   path:"C:\\",
    //   name:"Win11",
    //   total:239166550016,
    // },...]
    return disks?.map(d => ({ ...d, type: LIST_ITEM_TYPES.DRIVE }));
}
export const getFolderItems = async (path, sizeCache = {}, isFullList = false) => {
    const getType = ({ is_dir, is_file, is_symlink, is_drive, path }) => {
        if (is_drive) return LIST_ITEM_TYPES.DRIVE;
        if (is_symlink) return LIST_ITEM_TYPES.LINK;
        if (is_dir) return LIST_ITEM_TYPES.FOLDER;
        if (is_file) return LIST_ITEM_TYPES.FILE;

        return LIST_ITEM_TYPES.UNKNOWN;
    };
    const getFileType = (file) => {
        const { name, is_dir, is_file, is_symlink } = file;
        if (is_dir) return "dir";
        if (is_symlink) return "lnk";
        else return name.includes(".") ? name.split(".").pop() : "?unk";
    }
    if (path) {
        let items;
        if (isFullList) {
            items = await invoke("full_files_list", { path });
        }
        else {
            items = (await invoke("list_dir", { path }));

        }
        // console.log(path, items)
        const normalizedItems = items.map((item) => {
            const { is_dir, is_file, is_symlink, is_drive, name, modified, path } = item;

            const type = getType(item);
            const modifiedDate = new Date(modified).toLocaleDateString();
            const normalizedName = is_file ? name.replace(/\.([a-z0-9.]+)$/i, "") : name;
            const fileType = getFileType(item);
            const cachedSize = sizeCache[path];
            if (is_dir && isFinite(cachedSize)) {
                item.size = cachedSize;
            }
            const normalizedItem = {
                ...item,
                type,
                modifiedDate,
                normalizedName,
                fileType,
            }
            return normalizedItem
        })
        return normalizedItems;
    }
    else {
        const drives = await getDrives();

        return drives.map(drive => ({ ...drive, type: LIST_ITEM_TYPES.DRIVE }));
    }

}
export const deletePath = async (path) => {
    console.log("delete:", path);
    try {
        await invoke("delete_path_to_trash", ({ path }));
    } catch (e) {
        console.warn(e);
    }
}

export const doSizeCache = async ({ path, onUpdate, onFinish }) => {
    let message = ` Calculating size: "${path}" ...`;
    let statusState = STATUS_STATES.busy;
    onUpdate({ statusState, message });
    const sizeCache = await invoke("calc_folder_sizes", { path });
    message = ` Calculated: "${path}"`;
    statusState = STATUS_STATES.ok;
    onUpdate({ statusState, message });
    onFinish(sizeCache);

    // const sizeCache = {};
    // onUpdate(`Scan size: ${path}`);
    // const size = await getFolderSize(path, sizeCache, onUpdate);
    // sizeCache[path] = size;
    // onUpdate(`OK`);
    // onFinish(sizeCache);

}
const getFolderSize = async (folderPath, sizeCache, onUpdate) => {
    let message = ` Calculating size: "${folderPath}" ...`;
    let statusState = STATUS_STATES.busy;
    onUpdate({ statusState, message });
    // console.log(sizeCache);
    let folderSize = 0;
    const files = await invoke("list_dir", { path: folderPath });
    for (let file of files) {
        const { name, is_dir, is_file, size, path } = file;
        if (is_dir) {
            try {
                const size = (await getFolderSize(path, sizeCache, onUpdate) ?? 0)
                folderSize += size;
                sizeCache[path] = size;
            }
            catch (e) {
                console.warn(name, e)
            }

        }
        else if (is_file && size) {

            isFinite(size) && (folderSize += size);
        }
    }

    return folderSize;
}