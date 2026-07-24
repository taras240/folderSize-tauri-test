import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { WIDGET_TYPES } from "../../src/js/enums/widgetTypes.js";
import { openTagEditor } from "../../src/js/widgets/tagEditor/main.js";

const appWindow = getCurrentWindow();
const webview = getCurrentWebview();

const app = document.getElementById("app");

await appWindow.setEffects({
    effects: ['mica'],//'acrylic'
    state: 'active'
});

webview.listen("load-widget", (event) => {
    const { type } = event.payload;
    switch (type) {
        case WIDGET_TYPES.tags:
            const { file } = event.payload;
            openTagEditor({ app, file });
            break;
        default:
            break;
    }
});

webview.emit("widget-ready");