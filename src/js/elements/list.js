import { fromHtml } from "../functions/html.js";

export const mainList = () => fromHtml(`
        <ul id="app-list" class="files-list"></ul>
    `)