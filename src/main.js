import { UI } from "./ui.js";
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
export const appWindow = getCurrentWindow();

await appWindow.setEffects({
    effects: ['mica'],//'acrylic'
    state: 'active'
});
let originalSize = null;
let isResizing = false;
const hideWebviewTitle = (appWindow) => {
    // Збережіть початковий розмір
    appWindow.innerSize().then(size => {
        originalSize = size;
    });


    appWindow.onFocusChanged(async ({ payload: focused }) => {
        if (true || (focused && !isResizing)) {
            isResizing = true;

            // Використовуємо збережений розмір
            if (originalSize) {
                await appWindow.setSize({
                    type: "Physical",
                    width: originalSize.width,
                    height: originalSize.height
                });

                setTimeout(async () => {
                    await appWindow.setSize({
                        type: "Physical",
                        width: originalSize.width,
                        height: originalSize.height
                    });
                    isResizing = false;
                }, 10);
            }
        }
    });

    appWindow.listen('tauri://resize', async () => {
        if (!isResizing) {
            originalSize = await appWindow.innerSize();
        }
    });
}


export const ui = new UI();
window.ui = ui;
// window.addEventListener("contextmenu", (e) => {
//     e.preventDefault();
//     invoke("open_context_menu", {
//         x: e.clientX,
//         y: e.clientY
//     });
// });