import { fromHtml } from "../../functions/html.js";

const progressbarHtml = ({ classPrefix = "", id }) => `
                <div id="${id || ~~(Math.random() * 1e6)}" class="${classPrefix}-container control__progressbar-container">
                    <div class="control__progressbar-hint"></div>
                    <div class="${classPrefix} control__progressbar"></div>
                </div>
`;

function ProgressSeekbarElement() {
    return fromHtml(`
            <div class="audio__progress-container">
                <div class="audio__seekbar-elapsed"></div>
                ${progressbarHtml({ classPrefix: "audio__seekbar" })}
                <div class="audio__seekbar-duration"></div>
            </div>
        `)
}
function VolumeSeekbarElement() {
    return fromHtml(
        progressbarHtml({
            classPrefix: "audio__volumebar",
            id: "audio-volume-slider"
        })
    );
}
export { VolumeSeekbarElement, ProgressSeekbarElement }