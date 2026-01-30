import { fromHtml } from "../functions/html.js";


export const curentPathPanel = ({ id }) => fromHtml(`
          <input id="${id}" class="header-control header__file-path" value="C:\\" />
    `)

export const statusLine = () => fromHtml(`
    <div id="status-line" class="status-line"></div>
    `)


