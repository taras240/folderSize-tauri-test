
const iconTemplate = (iconName) => `<i class="svg-icon ${iconName}-icon"></i>`;

export const iconsHtml = {
    back: iconTemplate("back"),
    forward: iconTemplate("forward"),
    home: iconTemplate("home"),
    refresh: iconTemplate("refresh"),

    folderInfo: iconTemplate("folder_info"),
    videoLibrary: iconTemplate("video_library"),
    folderList: iconTemplate("folder_list"),
    fullFolder: iconTemplate("swap_folder"),

    play_audio: iconTemplate("play_audio"),
    next_audio: iconTemplate("next_audio"),
    prev_audio: iconTemplate("prev_audio"),
    sort: iconTemplate("sort"),
    mute: iconTemplate("mute"),
    shuffle: iconTemplate("shuffle"),
    volume: iconTemplate("volume"),
    delete: iconTemplate("delete"),
}