export const sortBy = {
    size: (a, b) => {
        const sizeA = a.size ?? 0;
        const sizeB = b.size ?? 0;

        return sizeB - sizeA;
    },
    isDir: (a, b) => {
        if (b.is_dir && a.is_dir) return a.name.localeCompare(b.name);
        return b.is_dir - a.is_dir;
    },
    fileName: (a, b) => a.name.localeCompare(b.name),
    modified: (a, b) => {
        return b.modified - a.modified
    },
    created: (a, b) => {
        return b.created - a.created
    },
    shuffle: (a, b) => {
        return Math.round(Math.random() * 2 - 1)
    },

}
export const SORT_NAMES = {
    size: "size",
    fileName: "fileName",
    modified: "modified",
    created: "created",
    shuffle: "shuffle",
}
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.sort(sortBy.isDir);
}
