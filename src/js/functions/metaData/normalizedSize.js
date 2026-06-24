export const getNormalizedSize = (size) => {
    if (typeof (size) !== "number") return "";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;

    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${Number(size.toFixed(2))}${units[i]}`;
};
export const getSizeClass = (size) => {
    if (size > 500e6) return "size-7";
    if (size > 200e6) return "size-6";
    if (size > 75e6) return "size-5";
    if (size > 20e6) return "size-4";
    if (size > 7e6) return "size-3";
    if (size > 1e6) return "size-2";
    return "size-1";
}