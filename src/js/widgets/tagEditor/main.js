import { getCurrentWebview } from "@tauri-apps/api/webview";
import { TagEditorElement } from "../../elements/audioElements/tagsModalWindow.js";
import { getCurrentWindow } from "@tauri-apps/api/window";
export const appWindow = getCurrentWindow();

await appWindow.setEffects({
    effects: ['mica'],//'acrylic'
    state: 'active'
});
const webview = getCurrentWebview();
const app = document.getElementById("app");

function openTagEditor(props) {
    app.innerHTML = "";
    const content = generateContent(props);
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
    const { props } = event.payload;
    console.log(props);
    openTagEditor(props)
});

webview.emit("widget-ready");
