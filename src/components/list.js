import { fromHtml } from "./functions/html.js";

export const mainList = () => fromHtml(`
        <ul id="list" class="files-list"></ul>
    `)