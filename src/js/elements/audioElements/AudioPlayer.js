import { fromHtml } from "../../functions/html.js";
import { NextButtonElement } from "./NextButton.js";
import { PlayButtonElement } from "./PlayButton.js";
import { PrevButtonElement } from "./PrevButton.js";
import { ProgressSeekbarElement, VolumeSeekbarElement } from "./SeekBar.js";
import { ShuffleButtonElement } from "./ShuffleButton.js";
import { VolumeButtonElement } from "./VolumeButton.js";
import { FolderButtonElement } from "./FolderButton.js";

const AudioTitleElement = () => fromHtml(`<div class="audio__title"></div>`);


const AudioContainerElement = () => fromHtml(`<div class="audio__container"></div`);

const ControlsContainerElement = () => fromHtml(`<div class="audio__controls"></div>`);

const ContentContainerElement = () => fromHtml(`<div class="audio__main-content"></div>`);

const AudioElement = () => fromHtml(`<audio id="audio-player" />`);

export function AudioPlayerElement() {
    const audioContainer = AudioContainerElement();
    const audioControlsLeft = ControlsContainerElement();
    const mainContent = ContentContainerElement();
    const audioControlsRight = ControlsContainerElement();

    audioControlsLeft.append(
        PlayButtonElement(),
        PrevButtonElement(),
        NextButtonElement(),
    );
    mainContent.append(
        AudioTitleElement(),
        ProgressSeekbarElement()
    )
    audioControlsRight.append(
        ShuffleButtonElement(),
        VolumeButtonElement(),
        VolumeSeekbarElement(),
        FolderButtonElement()
    )

    audioContainer.append(
        AudioElement(),
        audioControlsLeft,
        mainContent,
        audioControlsRight
    )
    return audioContainer;
}
