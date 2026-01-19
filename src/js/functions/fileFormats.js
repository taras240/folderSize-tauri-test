export const isAudio = ({ fileType }) => {
    const audioFormatsArray = ["mp3", "flac", "m4a"];
    return audioFormatsArray.includes(fileType?.toLowerCase());
}