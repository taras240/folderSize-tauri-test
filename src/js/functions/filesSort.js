export const sortBy = {
    size: (a, b) => {
        const sizeA = a.size ?? 0;
        const sizeB = b.size ?? 0;

        return sizeB - sizeA;
    },
    isDir: (a, b) => b.is_dir - a.is_dir,
    fileName: (a, b) => b.name - a.name,
    modified: (a, b) => {
        return b.modified - a.modified
    },
    created: (a, b) => {
        console.log(new Date(a.created), new Date(a.modified))
        return b.created - a.created
    }
}
export const SORT_NAMES = {
    size: "size",
    fileName: "fileName",
    modified: "modified",
    created: "created",
}
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
