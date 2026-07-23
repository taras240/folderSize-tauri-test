import { getCurrentWebview } from "@tauri-apps/api/webview";
import { TagEditorElement } from "../../elements/audioElements/tagsModalWindow.js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getMetaData } from "../../functions/metaData/metaData.js";
export const appWindow = getCurrentWindow();

await appWindow.setEffects({
    effects: ['mica'],//'acrylic'
    state: 'active'
});
const webview = getCurrentWebview();
const app = document.getElementById("app");

async function openTagEditor(file) {
    app.innerHTML = "";
    const tags = await getMetaData(file);
    const content = generateContent({ tags, file });
    app.append(content);
}

function generateContent({ tags, file }) {
    const content = TagEditorElement({
        tags,
        file,
    })
    return content;
}

webview.listen("load-widget", (event) => {
    const { file } = event.payload;
    openTagEditor(file)
});

webview.emit("widget-ready");
