import { iconsHtml } from "../icons.js";
import { AudioControlButton } from "./ControlButton.js";

export function PrevButtonElement() {
    return AudioControlButton({
        id: "audio__prev-button",
        icon: iconsHtml.prev_audio
    });
}
