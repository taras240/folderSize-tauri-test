import { fromHtml } from "../../functions/html.js";

export function ModalWindowElement({ title, classList = [], id, onClose }) {
    const window = fromHtml(`
        <div class="modal ${classList.join(" ")}" id="${id ?? Number(Math.random() * 1e6)}">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        </div>
    `);
    window.querySelector(".close-btn").addEventListener("click", () => {
        onClose?.();
        window.remove();
    })
    return window;
}