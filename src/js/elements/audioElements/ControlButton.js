import { fromHtml } from "../../functions/html.js";

export function AudioControlButton({ id, classList = [], icon }) {
    return fromHtml(`
        <button 
            id="${id}" 
            class="audio__control-button ${classList.length ? classList.join(" ") : id}" >
                ${icon}
        </button>`);
}