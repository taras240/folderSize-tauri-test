import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { ui } from "../../../main.js";
import { WIDGET_TYPES } from "../../enums/widgetTypes.js";
export function openWidget(widgetName, props) {
    switch (widgetName) {
        case (WIDGET_TYPES.tags):
            openTagEditor(props);
            break;
        default:
            break;
    }
}
async function openTagEditor({ file }) {
    await (await WebviewWindow.getByLabel(WIDGET_TYPES.tags))?.close();
    const win = new WebviewWindow(WIDGET_TYPES.tags, {
        url: `/widgets/widget.html`,
        title: "Tags Editor",
        decorations: false,
        transparent: true,
        visible: false,
        width: 300,
        height: 400,
        resizable: false,
        maximizable: false,
        minimizable: false,
    });
    win.once("widget-ready", async () => {
        await win.emit("load-widget", {
            type: WIDGET_TYPES.tags,
            file,
        });
    });

    win.once("tauri://error", (e) => {
        console.error(e);
    });
    win.once("save-tags", (event) => {
        const { file } = event.payload;
        ui.updateWithMeta(file);
    });
}
