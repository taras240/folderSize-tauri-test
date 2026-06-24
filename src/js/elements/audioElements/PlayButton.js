import { iconsHtml } from "../icons.js";
import { AudioControlButton } from "./ControlButton.js";

export function PlayButtonElement() {
    return AudioControlButton({
        id: "audio__play-button",
        icon: iconsHtml.play_audio
    });
}