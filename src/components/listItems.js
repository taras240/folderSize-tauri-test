const { invoke } = window.__TAURI__.core;
export const listElement = (item) => {
    const { name, is_dir, is_file, is_symlink, size, modified, readonly, hidden, } = item;

    const li = document.createElement("li");
    li.dataset.type = is_dir ? fileTypes.folder : is_file ? fileTypes.file : fileTypes.link;
    li.classList.add("folder__list-item");
    li.innerHTML = fileHtml(item);
    li.querySelector(".delete-button")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        console.log("delete:", item.path);
        try {
            await invoke("delete_path", ({ path: item.path }));
            li.remove()
        } catch (e) {
            console.warn(e);
        }

    })
    return li;
}
export const driveElement = (drive) => {
    const { name, total, available, mount_point } = drive;

    const li = document.createElement("li");
    li.dataset.type = "drive";
    li.classList.add("folder__list-item");
    li.innerHTML = driveHtml(drive);

    return li;
}
const fileHtml = (item) => {
    const { name, is_dir, is_file, is_symlink, size, modified, readonly, hidden, } = item;
    const normalizedSize = getNormalizedSize(size);
    const sizeClass = getSizeClass(size);
    const fileType = getFileType(item);
    const normalizedDate = new Date(modified).toLocaleDateString();
    const normalizedName = is_file ? name.replace(/\.([a-z0-9.]+)$/i, "") : name;
    return `
        ${fileTypeHtml(fileType)}
        ${normalizedSize ? sizeHtml(normalizedSize, sizeClass) : ""}
        

        <div class="list-item__column list-item__title">${normalizedName}</div>
        
        <div class="list-item__space"></div>
        <div class="list-item__column list-item__date text-badge">${normalizedDate}</div>
        <div class="list-item__column list-item__button-container">
            <button class="list-item__button delete-button">
                <i class="svg-icon delete-icon"></i>
            </button>
        </div>
    `;
}
const driveHtml = (drive) => {
    const { name, total, available, mount_point } = drive;
    const normalizedSize = getNormalizedSize(total);
    const normalizedAvailableSize = getNormalizedSize(available);

    const fileType = "drive";
    return `
        ${fileTypeHtml(fileType)}
        ${sizeHtml(`${normalizedSize}[${normalizedAvailableSize}]`)}
        <div class="list-item__column list-item__title">[${name}] ${mount_point} </div>
        <div class="list-item__space"></div>
    `;
}
const getNormalizedSize = (size) => {
    if (typeof (size) !== "number") return "";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;

    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${Number(size.toFixed(2))}${units[i]}`;
};

const getSizeClass = (size) => {
    if (size > 500e6) return "size-7";
    if (size > 200e6) return "size-6";
    if (size > 75e6) return "size-5";
    if (size > 20e6) return "size-4";
    if (size > 7e6) return "size-3";
    if (size > 1e6) return "size-2";
    return "size-1";
}
export const getFileType = (file) => {
    const { name, is_dir, is_file, is_symlink } = file;
    if (is_dir) return "dir";
    if (is_symlink) return "lnk";
    else return name.includes(".") ? name.split(".").pop() : "?unk";
}
const fileTypes = {
    folder: "folder",
    file: "file",
    link: "link"
}
const textBadgeHtml = (text) => `
        <i class="text-badge">${text}</i>
    `;
const sizeHtml = (size, sizeClass) => `
        <div class="list-item__column list-item__size ${sizeClass}">
            ${textBadgeHtml(size)}
        </div>
    `;
const fileTypeHtml = (type) => `
        <div class="list-item__file-type" >
            ${textBadgeHtml(type)}
        </div>
    `