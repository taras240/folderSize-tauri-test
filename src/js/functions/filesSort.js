export const sortBy = {
    size: (a, b) => b.size - a.size,
    isDir: (a, b) => b.is_dir - a.is_dir,
}
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
