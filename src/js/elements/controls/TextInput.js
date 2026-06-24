import { fromHtml } from "../../functions/html.js";

export function TextInputElement({ classList = [], onChange, onInput, hint, placeholder = "", value = "" }) {
    const inputElement = fromHtml(`
            <input 
                class="text-input 
                ${classList.join(" ")}" 
                type="text" 
                value="${value ?? ""}" 
                placeholder="${[placeholder]}"
                >
        `);
    onChange && inputElement.addEventListener("change", onChange);
    return inputElement;
}   