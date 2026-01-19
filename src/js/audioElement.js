import { iconsHtml } from "./controls.js";
import { fromHtml } from "./functions/html.js";

export function audioElement() {
    return fromHtml(`
            <div class="audio__container" >
                <audio id="audio-player" src=""></audio>
                <div class="audio__controls">
                    <button id="audio__play-button" class="audio__control-button audio__play-button">${iconsHtml.play_audio}</button>
                    <button id="audio__prev-button" class="audio__control-button audio__prev-button">${iconsHtml.prev_audio}</button>
                    <button id="audio__next-button" class="audio__control-button audio__next-button">${iconsHtml.next_audio}</button>
                </div>
                <div class="audio__main-content">
                    <div class="audio__title"></div>
                    <div class="audio__progress-container">
                    <div class="audio__seekbar-elapsed"></div>
                        <div class="audio__seekbar-container">
                            <div class="audio__seekbar"></div>
                        </div>
                        <div class="audio__seekbar-duration"></div>
                    </div>
                </div>
                <div class="audio__controls">
                    <button id="audio__fav-button" class="audio__fav-button"></button>
                </div>
            </div>
            
        `)
}