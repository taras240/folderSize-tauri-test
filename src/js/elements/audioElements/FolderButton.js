import { iconsHtml } from "../icons.js";
import { AudioControlButton } from "./ControlButton.js";

export function FolderButtonElement() {
    return AudioControlButton({
        id: "audio__current-list",
        icon: iconsHtml.folderList
    });
}