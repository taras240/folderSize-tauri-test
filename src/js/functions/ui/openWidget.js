import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { ui } from "../../../main.js";
export function openWidget(widgetName, props) {
    switch (widgetName) {
        case ("tags"):
            openTagEditor(props);
            break;
        default:
            break;
    }
}
async function openTagEditor(data) {
    const win = new WebviewWindow(`tags`, {
        url: `/widgets/tag-editor/index.html`,
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
        console.log("ready", data);
        await win.emit("load-widget", {
            props: data,
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
