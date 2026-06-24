import { getNormalizedSize } from "../../functions/metaData/normalizedSize.js";
import { fileTypeHtml, textBadgeHtml } from "./components/badges.js";
export const driveHtml = (drive) => {
    const { name, total, available, path } = drive;
    const normalizedSize = getNormalizedSize(total);
    const normalizedAvailableSize = getNormalizedSize(available);

    const fileType = "drive";
    return `
        ${fileTypeHtml(fileType)}
        ${textBadgeHtml(`${normalizedSize}[${normalizedAvailableSize}]`)}
        <div class="list-item__column list-item__title">[${name}] ${path} </div>
        <div class="list-item__space"></div>
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