export const formatSongDuration = (durationInSeconds) => {
    durationInSeconds = ~~durationInSeconds;
    const minutes = ~~(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`

}