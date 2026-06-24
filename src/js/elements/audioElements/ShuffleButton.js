import { iconsHtml } from "../icons.js";
import { AudioControlButton } from "./ControlButton.js";

export function ShuffleButtonElement() {
    return AudioControlButton({
        id: "audio__shuffle-button",
        icon: iconsHtml.shuffle
    });
}