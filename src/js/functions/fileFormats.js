import { invoke } from "@tauri-apps/api/core";
import { getRASystemID } from "./metaData/raSystem.js";

export const isAudio = ({ fileType }) => {
    const audioFormatsArray = ["mp3", "flac", "m4a"];
    return audioFormatsArray.includes(fileType?.toLowerCase());
}
export const isVideo = ({ fileType }) => {
    const videoFormatsArray = ["mp4"];
    return videoFormatsArray.includes(fileType?.toLowerCase());
}
export const isRetro = ({ fileType, path }) => {
    if (fileType === "zip") {
        return true;
    }
    return !!getRASystemID({ fileType })
    const retroFormatsArray = ["nes", "smc", "sfc"];
    return retroFormatsArray.includes(fileType?.toLowerCase());
}