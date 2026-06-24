import { iconsHtml } from "../icons.js";
import { AudioControlButton } from "./ControlButton.js";

export function NextButtonElement() {
    return AudioControlButton({
        id: "audio__next-button",
        icon: iconsHtml.next_audio
    });
}