import { getNormalizedSize } from "../../functions/metaData/normalizedSize.js";
import { iconsHtml } from "../icons.js";
import { fileTypeHtml, textBadgeHtml } from "./components/badges.js";
export const driveHtml = (drive) => {
    const { name, total, available, path } = drive;
    const normalizedSize = getNormalizedSize(total);
    const normalizedAvailableSize = getNormalizedSize(available);

    // ${fileTypeHtml(fileType)}
    const fileType = "drive";
    return `
        <div class="list-item__column list-item__icon">${iconsHtml.drive}</div>
        
        <div class="list-item__column list-item__title">[${name}] ${path} </div>
        <div class="list-item__space"></div>
        ${textBadgeHtml(`${normalizedSize}[${normalizedAvailableSize}]`)}
    `;
}
export const DriveElement = (drive) => {
    const { name, total, available, path } = drive;

    const li = document.createElement("li");
    li.dataset.type = "drive";
    li.classList.add("folder__list-item");
    li.innerHTML = driveHtml(drive);

    return li;
}