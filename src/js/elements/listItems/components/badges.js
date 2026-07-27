export const textBadgeHtml = (text) => `
        <i class="text-badge">${text}</i>
    `;
export const sizeHtml = (size, sizeClass, is_drive) => `
        <div class="list-item__column list-item__size ${sizeClass || "size-0"}">
            ${textBadgeHtml(size)}
        </div>
    `;
export const fileTypeHtml = (type) => `
        <div class="list-item__file-type" >
            ${textBadgeHtml(type)}
        </div>
    `;
export const raBadgeHtml = () => `
            <i class="ra-badge"></i>
    `;