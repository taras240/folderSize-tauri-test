export const isAudio = ({ fileType }) => {
    const audioFormatsArray = ["mp3", "flac", "m4a"];
    return audioFormatsArray.includes(fileType?.toLowerCase());
}
export const isVideo = ({ fileType }) => {
    const videoFormatsArray = ["mp4"];
    return videoFormatsArray.includes(fileType?.toLowerCase());
}