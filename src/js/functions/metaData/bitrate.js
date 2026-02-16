export const getBitrate = ({ duration, size }) => {
    return Math.round(size / (duration * 1e3));
}