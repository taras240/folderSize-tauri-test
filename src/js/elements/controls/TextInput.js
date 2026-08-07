import { fromHtml } from "../../functions/html.js";

export function TextInputElement({ classList = [], onChange, onInput, hint, placeholder = "", value = "", isSearch }) {
    const inputElement = fromHtml(`
            <input 
                class="text-input 
                ${classList.join(" ")}" 
                type="${isSearch ? "search" : "text"}" 
                value="${value ?? ""}" 
                placeholder="${[placeholder]}"
                
                >
        `);
    onChange && inputElement.addEventListener("change", onChange);
    onInput && inputElement.addEventListener("input", onInput);
    return inputElement;
}   