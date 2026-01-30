import { fromHtml } from "../functions/html.js";
import { controlButtons } from "./buttons.js";
import { iconsHtml } from "./icons.js";

const progressbarHtml = ({ classPrefix = "", id }) => `
                <div id="${id || ~~(Math.random() * 1e6)}" class="${classPrefix}-container control__progressbar-container">
                    <div class="control__progressbar-hint"></div>
                    <div class="${classPrefix} control__progressbar"></div>
                </div>
`;

const playButtonElement = () => fromHtml(`
            <button id="audio__play-button" class="audio__control-button audio__play-button">
                ${iconsHtml.play_audio}
            </button>`
);

const prevButtonElement = () => fromHtml(`
            <button id="audio__prev-button" class="audio__control-button audio__prev-button" >
                ${iconsHtml.prev_audio}
            </button>`
);

const nextButtonElement = () => fromHtml(`
            <button id="audio__next-button" class="audio__control-button audio__next-button" >
                ${iconsHtml.next_audio}
            </button>`
);
const shuffleButtonElement = () => fromHtml(`
            <button id="audio__shuffle-button" class="audio__control-button audio__shuffle-button" >
                ${iconsHtml.shuffle}
            </button>`
);
const audioTitleElement = () => fromHtml(`<div class="audio__title"></div>`);

const audioSeekbarElement = () => fromHtml(`
            <div class="audio__progress-container">
                <div class="audio__seekbar-elapsed"></div>
                ${progressbarHtml({ classPrefix: "audio__seekbar" })}
                <div class="audio__seekbar-duration"></div>
            </div>`
);

const volumeButtonElement = () => fromHtml(`
            <button id="audio__mute-button" class="audio__control-button audio__mute-button" >
                ${iconsHtml.volume}
            </button>`
);

const volumeBarElement = () => fromHtml(`
    ${progressbarHtml({ classPrefix: "audio__volumebar", id: "audio-volume-slider" })}`
);

const audioContainerElement = () => fromHtml(`<div class="audio__container"></div`);

const controlsContainerElement = () => fromHtml(`<div class="audio__controls"></div>`);

const contentContainerElement = () => fromHtml(`<div class="audio__main-content"></div>`);

const audioElement = () => fromHtml(`<audio id="audio-player" />`);

export function audioPlayerElement() {
    const audioContainer = audioContainerElement();
    const audioControlsLeft = controlsContainerElement();
    const mainContent = contentContainerElement();
    const audioControlsRight = controlsContainerElement();

    audioControlsLeft.append(

        playButtonElement(),
        prevButtonElement(),
        nextButtonElement(),

    );
    mainContent.append(
        audioTitleElement(),
        audioSeekbarElement()
    )
    audioControlsRight.append(
        shuffleButtonElement(),
        volumeButtonElement(),
        volumeBarElement(),
        controlButtons.folderList({
            id: "audio__current-list",
            classList: ["audio__control-button"],
        })
    )

    audioContainer.append(
        audioElement(),
        audioControlsLeft,
        mainContent,
        audioControlsRight
    )
    return audioContainer;
}
