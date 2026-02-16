

import { ui } from "../main.js";
import { getConfig, saveSettingProperty } from "./config.js";
import { VOLUME_PRESETS } from "./enums/volumePresets.js";
import { isAudio } from "./functions/fileFormats.js";
import { getFolderItems } from "./functions/listFuncs.js";
import { getMetaData } from "./functions/metaData/metaData.js";

import { convertFileSrc } from '@tauri-apps/api/core';
import { formatSongDuration } from "./functions/timeFormat.js";

export class Player {
    isShuffle = false;
    getCurrentlyPlayed() {
        return this.playlist?.[this.playlistIndex];
    }
    getCurrentFolderPath() {
        const curFile = this.getCurrentlyPlayed();
        const curFolder = curFile?.path?.replace(/[^\\\/]+$/gi, "");
        return curFolder;
    }

    constructor() {
        this.initElements();
        this.addEvents();
        this.setElementsValues();
        this.applyConfig();

    }
    async applyConfig() {
        const config = await getConfig();
        const volume = config.audioVolume ?? 1;
        const isShuffle = config.isShuffle ?? false;
        this.setVolume(volume)
        this.isShuffle = isShuffle;
    }
    initElements() {
        const $ = (selector) => playerContainer.querySelector(selector);

        this.audio = document.querySelector("#audio-player");

        const playerContainer = document.querySelector(".audio__container");

        this.playerElements = {
            container: playerContainer,
            title: $(".audio__title"),
            seekbar: $(".audio__seekbar"),
            seekbarContainer: $(".audio__seekbar-container"),
            elapsedTime: $(".audio__seekbar-elapsed"),
            duration: $(".audio__seekbar-duration"),
            playButton: $("#audio__play-button"),
            nextButton: $("#audio__next-button"),
            prevButton: $("#audio__prev-button"),
            volumeButton: $("#audio__mute-button"),
            volumeBar: $("#audio-volume-slider"),
            currentListButton: $("#audio__current-list"),
            shuffleButton: $("#audio__shuffle-button"),
        };
    }
    addEvents() {
        const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
        const onMouseOverProgress = (event, progressFunc) => {
            const container = event.currentTarget;
            const hintElement = container.querySelector(".control__progressbar-hint");
            const width = container.offsetWidth;
            const posX = event.offsetX;

            let progress = ((posX / width) * 100);

            progress = clamp(progress, 0, 100);

            const hintText = progressFunc ? progressFunc(progress) : `${~~progress}%`;
            hintElement.innerText = hintText;
            container.style.setProperty("--mouse-x", `${posX}px`);
        }
        const getSeekValue = (event, seekElement, min = 0, max = 1) => {
            const mouseX = event.clientX;
            const seekbarX = seekElement.getBoundingClientRect().left;
            const posX = mouseX - seekbarX;
            const seekbarWidth = seekElement.offsetWidth;
            const targetVolume = posX / seekbarWidth;
            const normalizedVolume = clamp(targetVolume, min, max);
            return normalizedVolume;

        }
        const onMouseWheelVolume = (event) => {
            event.preventDefault();
            const step = 1 / 20;
            const delta = event.deltaY < 0 ? step : -step;
            this.setVolume(this.audio.volume + delta);
        };

        const seekHintFormat = (percentage) => {
            const { duration } = this.audio;
            if (!duration) return '--:--';
            const posSec = parseInt(duration * percentage / 100);
            const mins = parseInt(posSec / 60);
            const secs = posSec - mins * 60;
            return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }
        this.playerElements.playButton.addEventListener("click", () => {
            this.isPlayed ? this.pause() : this.resume();
        });
        this.playerElements.nextButton.addEventListener("click", () => {
            this.playNext();
        });
        this.playerElements.prevButton.addEventListener("click", () => {
            this.playPrevious();
        });
        this.playerElements.shuffleButton.addEventListener("click", (event) => {
            this.isShuffle = !this.isShuffle;
            saveSettingProperty({ property: "isShuffle", value: this.isShuffle })
            event.currentTarget.classList.toggle("active", this.isShuffle);
        })
        this.playerElements.seekbarContainer.addEventListener("click", (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const posX = event.clientX - rect.left;
            const seekbarWidth = event.currentTarget.offsetWidth;
            const targetProgress = posX / seekbarWidth;
            this.goToPosition(targetProgress);
        });

        this.playerElements.seekbarContainer.addEventListener("mousemove", (event) => onMouseOverProgress(event, seekHintFormat));

        this.playerElements.volumeButton.addEventListener("click", (event) => {
            this.toggleVolumeMode();
        })
        this.playerElements.volumeBar.addEventListener("mousemove", onMouseOverProgress);
        this.playerElements.volumeBar.addEventListener("wheel", onMouseWheelVolume);

        this.playerElements.volumeBar.addEventListener("mousedown", (event) => {
            const seekElement = event.currentTarget;

            const onMouseMove = (event) => {
                const value = getSeekValue(event, seekElement);
                this.setVolume(value);
            };

            const onMouseUp = (e) => {
                const value = getSeekValue(e, seekElement);
                this.setVolume(value);

                document.removeEventListener("mousemove", onMouseMove);
            };

            onMouseMove(event);

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp, { once: true });
        });
        this.playerElements.currentListButton.addEventListener("click", event => {
            ui.goto(this.getCurrentFolderPath())
        })

        this.audioEndedHandler = () => this.playNext();
    }
    setElementsValues() {
        this.playerElements.container.classList.toggle("hidden", !this.getCurrentlyPlayed());
        this.playerElements.shuffleButton.classList.toggle("active", this.isShuffle);
        this.setVolume();

    }
    async createPlaylist({ folderPath, filePath, filesList }) {
        folderPath ??= filePath?.replace(/[\\\/][^\/\\]+$/, "");

        const folderItems = filesList || await getFolderItems(folderPath);
        const playlist = folderItems.filter(item => isAudio(item)).sort((a, b) => b.size - a.size);
        this.playlist = playlist;
    }
    async openFile(file, filesList) {
        const curFile = this.getCurrentlyPlayed();
        if (curFile && curFile.path === file.path) {
            this.resume();
        }
        else {
            await this.createPlaylist({ filePath: file.path, filesList })
            this.play(file);
        }
        this.setElementsValues();

    }

    async updatePlayerData(file, doUpdate = true) {



        const updateIntervalMS = 1000;
        this.updateProgressInterval && clearInterval(this.updateProgressInterval);

        const meta = await getMetaData(file);
        const { title, artist } = meta;
        const duration = this.audio.duration;

        const updatePlayButton = () => {
            const playIcon = this.playerElements.playButton.querySelector("i.svg-icon");
            playIcon.classList.toggle("play_audio-icon", !this.isPlayed);
            playIcon.classList.toggle("pause_audio-icon", this.isPlayed);

        }
        const updateProgressData = (interval) => {
            interval ??= doUpdate ? updateIntervalMS : 0;
            const elapsed = this.audio.currentTime;
            const elapsedString = formatSongDuration(elapsed);
            this.playerElements.elapsedTime.innerText = elapsedString;
            const progress = 100 * (doUpdate ? elapsed + 0.5 : elapsed) / duration;
            this.playerElements.seekbar.style.setProperty("--transition-duration", `${interval}ms`);
            this.playerElements.seekbar.style.setProperty("--completion", `${progress}%`);
        }
        const updateStaticData = () => {
            let songTitle;
            if (artist && title) {
                songTitle = `<span class="bold">${artist}</span> - ${title}`;
            }
            else {
                songTitle = file.normalizedName;
            }
            this.playerElements.title.innerHTML = songTitle;
        }

        updateStaticData();
        const durString = formatSongDuration(duration);
        this.playerElements.duration.innerText = durString;

        updateProgressData();
        updatePlayButton();
        if (doUpdate) {
            this.updateProgressInterval && clearInterval(this.updateProgressInterval);
            this.updateProgressInterval = setInterval(() => {
                updateProgressData(updateIntervalMS)
            }, updateIntervalMS)
        }

    }
    toggleVolumeMode() {
        const presetsArray = Object.values(VOLUME_PRESETS);
        const curVolume = this.audio.volume;
        const targetIndx = presetsArray.findIndex(val => val < curVolume);
        if (targetIndx !== -1) {
            this.setVolume(presetsArray[targetIndx])
        }
        else {
            let vol = 0;
            const increaseInterval = setInterval(() => {
                vol = Math.min(vol + 0.05, VOLUME_PRESETS.max);
                this.setVolume(vol);

                if (vol >= VOLUME_PRESETS.max) {
                    clearInterval(increaseInterval);
                }
            }, 10);

        }
    }
    setVolume(targetVolume) {
        targetVolume ??= this.audio.volume;
        targetVolume = targetVolume > 1 ? 1 : targetVolume < 0 ? 0 : targetVolume;

        this.audio.volume = targetVolume;
        this.playerElements.volumeBar.style.setProperty("--completion", `${targetVolume * 1e2}%`);
        saveSettingProperty({ property: "audioVolume", value: targetVolume });
    }
    resume() {
        const file = this.getCurrentlyPlayed();
        this.audio.play();
        this.isPlayed = true;
        ui.addActiveFile(file);
        this.updatePlayerData(file, true);
    }
    async play(file) {

        file ??= this.getCurrentlyPlayed();
        const { name, size, modified, readonly, hidden, path, fileType } = file;
        this.stop();
        this.playlistIndex = this.playlist.findIndex(file => file.path === path);
        const src = convertFileSrc(path);
        this.audio.src = src;
        this.audio.addEventListener('canplay', () => {
            this.audio.play();
            this.isPlayed = true;
            ui.addActiveFile(file);
            this.updatePlayerData(file, true);

        }, { once: true });

        this.audio.removeEventListener('ended', this.audioEndedHandler);
        this.audio.addEventListener('ended', this.audioEndedHandler, { once: true });



    }
    pause() {
        this.updateProgressInterval && clearInterval(this.updateProgressInterval);
        // ui.removeActiveFile(this.playlist[this.playlistIndex]);
        this.audio.pause();
        this.isPlayed = false;
        this.updatePlayerData(this.getCurrentlyPlayed(), false)
    }
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlayed = false;
        this.updateProgressInterval && clearInterval(this.updateProgressInterval);
        ui.removeActiveFile(this.playlist[this.playlistIndex]);

    }
    playPrevious() {
        this.stop();
        this.playlistIndex--;
        if (this.playlistIndex < 0) {
            this.playlistIndex = this.playlist.length - 1;
        }
        this.play(this.playlist[this.playlistIndex]);
    }
    playNext() {
        // 
        const getNextSongIndex = () => {
            let index = 0;
            const playlistLength = this.playlist?.length ?? 0;
            const curIndex = this.playlistIndex;
            if (this.isShuffle && playlistLength > 1) {
                let random;
                do {
                    random = Math.floor(Math.random() * playlistLength);
                } while (random === curIndex)
                index = random;
            }
            else {
                index = curIndex + 1;
                if (index === playlistLength) {
                    index = 0;
                }
            }

            return index;
        }
        this.stop();
        this.playlistIndex = getNextSongIndex();

        this.play(this.getCurrentlyPlayed());
    }
    async goToPosition(targetProgress) {
        this.pause();
        this.audio.currentTime = this.audio.duration * targetProgress;
        this.updatePlayerData(this.getCurrentlyPlayed(), false);
        // await new Promise(resolve => requestAnimationFrame(resolve));
        setTimeout(() => this.resume(), 25);
    }
}