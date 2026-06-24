import { iconsHtml } from "../icons.js";
import { AudioControlButton } from "./ControlButton.js";

export function VolumeButtonElement() {
    return AudioControlButton({
        id: "audio__mute-button",
        icon: iconsHtml.volume
    });
}