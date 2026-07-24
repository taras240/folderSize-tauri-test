export function getRASystemID({ fileType }) {
    if (["nes"].includes(fileType)) return 7;
    if (["smc", "sfc"].includes(fileType)) return 3;
    return "";
}