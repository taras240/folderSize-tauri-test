import { getCurrentWebview } from "@tauri-apps/api/webview";
import { TagEditorElement } from "../../elements/audioElements/tagsModalWindow.js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getMetaData } from "../../functions/metaData/metaData.js";


export async function openTagEditor({ app, file }) {
    app.innerHTML = "";
    const tags = await getMetaData(file, { isAudio: true });
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