import { audioElement } from "./js/audioElement.js";
import { statusLine } from "./js/controls.js";
import { GO_TO_DIRECTIONS } from "./js/enums/gotoDirections.js";
import { isAudio } from "./js/functions/fileFormats.js";
import { fromHtml } from "./js/functions/html.js";
import { doSizeCache, getDrives, getFolderItems } from "./js/functions/listFuncs.js";
import { getMetaData } from "./js/functions/metaData.js";
import { headerElement, windowHeader } from "./js/header.js";
import { mainList } from "./js/list.js";
import { listElement } from "./js/listItems.js"
import { sideBarElement } from "./js/sideBar.js";
import { appWindow, ui } from "./main.js";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

import { invoke, convertFileSrc } from '@tauri-apps/api/core';

export class UI {
    sizeCache = {};
    forvardHistory = [];
    pathHistory = [];
    curPath = GO_TO_DIRECTIONS.HOME;
    constructor() {
        this.app = document.getElementById("app");
        this.generateUI();
        this.initElements();
        this.addEvents();
        this.openFolder();

        this.player = new Player();

    }
    generateUI() {
        this.app.innerHTML = "";
        const mainContent = fromHtml(`<div class="app-content"></div>`);
        mainContent.append(sideBarElement(), mainList());
        this.app.append(
            // windowHeader(),
            headerElement(),
            mainContent,
            audioElement(),
            statusLine(),
        );
    }
    initElements() {
        this.header = this.app.querySelector("#app-header");
        this.path = this.header.querySelector("#path");
        this.list = this.app.querySelector("#app-list");

        this.sidebar = this.app.querySelector("#app-sidebar");
        this.status = this.app.querySelector("#status-line");
        this.audio = this.app.querySelector("#audio-player");

    }
    addEvents() {
        this.app.querySelector("#close-window-button")?.addEventListener("click", async () => {
            await appWindow.close();
        })
        this.app.querySelector("#control-back").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.BACK));
        this.app.querySelector("#control-forvard").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.FORWARD));
        this.app.querySelector("#control-home").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.HOME));
        this.app.querySelector("#control-refresh").addEventListener("click", () => this.openFolder(this.curPath));
        this.app.querySelector("#control-show-size").addEventListener("click", () => this.showSize());
        this.app.querySelector("#sidebar-user-music").addEventListener("click", async () => {
            const musicPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Music" });
            this.goto(musicPath)
        });
        this.app.querySelector("#sidebar-user-downloads").addEventListener("click", async () => {
            const downloadsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Downloads" });
            this.goto(downloadsPath);

        });
        this.app.querySelector("#sidebar-user-videos").addEventListener("click", async () => {
            const videoPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Videos" });
            this.goto(videoPath)
        });
        this.app.querySelector("#sidebar-user-pictures").addEventListener("click", async () => {
            const picsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Pictures" });
            this.goto(picsPath);
        });
        this.app.querySelector("#sidebar-user-docs").addEventListener("click", async () => {
            const docsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Documents" });
            this.goto(docsPath)
        });
        this.app.querySelector("#sidebar-user-desktop").addEventListener("click", async () => {
            const deskPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Desktop" });
            this.goto(deskPath);
        });
        this.app.querySelector("#sidebar-user-user").addEventListener("click", async () => {
            const userPath = await invoke("parse_env_path", { path: "%USERPROFILE%" });
            this.goto(userPath);
        });
        this.app.querySelector("#control-sort-list").addEventListener("click", () => {
            console.log("ext-window");
            const webview = new WebviewWindow('my-window', {
                url: 'index.html',
                title: 'Налаштування',
                width: 800,
                height: 600,
            });
            webview.once('tauri://error', e => {
                console.error('Window error:', e);
            });

        })


        navigator.mediaSession.setActionHandler('previoustrack', () => {
            this.player.playPrevious();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            this.player.playNext();
        });

        navigator.mediaSession.setActionHandler('play', () => {
            this.player.resume();
        });

        navigator.mediaSession.setActionHandler('stop', () => {
            this.player.stop();
        });

    }
    async goto(path) {
        if (path === GO_TO_DIRECTIONS.BACK) {
            if (this.pathHistory.length === 0) return;
            this.forvardHistory.push(this.curPath);
            this.curPath = this.pathHistory.pop();

            if (this.curPath === GO_TO_DIRECTIONS.HOME) {
                await this.openFolder();
            }
            else {
                await this.openFolder(this.curPath);
            }
        }
        else if (path === GO_TO_DIRECTIONS.FORWARD) {

            if (this.forvardHistory.length === 0) return;
            this.pathHistory.push(this.curPath);
            this.curPath = this.forvardHistory.pop();

            // this.pathHistory.push(this.curPath);
            if (this.curPath === GO_TO_DIRECTIONS.HOME) {
                await this.openFolder();
            }
            else {
                await this.openFolder(this.curPath);
            }


        }
        else if (path === GO_TO_DIRECTIONS.HOME) {
            this.pathHistory.push(this.curPath);
            this.forvardHistory = [];
            await this.openFolder();
            this.curPath = path;


        }
        else {
            this.pathHistory.push(this.curPath);
            this.forvardHistory = [];
            await this.openFolder(path);
            this.curPath = path;
        }
        console.log(path)

    }
    async showSize(path) {
        path ??= this.curPath;
        doSizeCache({
            path,
            onUpdate: (log) => this.updateStatus(log),
            onFinish: (cache) => this.updateSizeCache(cache)
        })
    }
    async openFolder(path) {
        path ??= GO_TO_DIRECTIONS.HOME;
        this.list.innerHTML = "";
        this.path.value = path;
        let items = [];
        if (path === GO_TO_DIRECTIONS.HOME) {
            // items = await getFolderItems("%USERPROFILE%", this.sizeCache);

            items = await getDrives();
        }
        else {
            items = await getFolderItems(path, this.sizeCache);
        }
        items = this.sortItems(items);
        items.forEach(item => {
            const itemElement = listElement(item);
            if (item.path === this.activeFile?.path) {
                itemElement.classList.add("played");
            }
            if (isAudio(item)) {
                this.updateWithMeta(item, itemElement);
            }
            itemElement && this.list.append(itemElement);
            if (item.is_dir || item.is_drive) {
                itemElement.addEventListener("click", () => this.goto(item.path));
            }
        })
    }
    async updateWithMeta(file, element) {
        if (!file || !element) return;
        const { path, name, normalizedName } = file;
        const meta = await getMetaData(file);
        const titleElement = element?.querySelector(".list-item__title");

        if (meta.artist && meta.title) {
            if (titleElement) {
                titleElement.innerText = `${meta.artist} - ${meta.title}`;
                titleElement.title = name;
            }
            // console.log(meta);
        }
        else {
            titleElement.innerText = normalizedName;
        }
    }
    sortItems(items) {
        return items.sort((a, b) => b.size - a.size).sort((a, b) => b.is_dir - a.is_dir);
    }
    updateSizeCache(cache) {
        this.sizeCache = Object.assign(this.sizeCache, cache);
        this.openFolder(this.curPath);
    }
    updateStatus(log) {
        this.clearStatusTimer && clearTimeout(this.clearStatusTimer);
        this.status.innerHTML = log;
        this.clearStatusTimer = setTimeout(() => this.status.innerHTML = "", 5 * 1e3)
    }
    async startPlayer(item) {
        this.player.openFile(item);

    }
    addActiveFile(file, activity) {
        this.activeFile = file;
        const folderPath = file?.path?.replace(/[\\\/][^\/\\]+$/, "");
        const activeItems = this.list.querySelectorAll(`li.played`);
        activeItems.forEach(li => li.classList.remove("played"));
        const activeElement = this.list.querySelector(`li[data-name="${file.name}"]`);
        activeElement?.classList.add("played");
    }
    removeActiveFile(file) {
        if (this.activeFile && file.path === this.activeFile?.path) {
            delete this.activeFile;
        }
    }
}
class Player {
    currentlyPlayed() {
        return this.playlist?.[this.playlistIndex];
    }
    constructor() {
        this.audio = document.querySelector("#audio-player");
        const playerContainer = document.querySelector(".audio__container");
        this.playerElements = {
            container: playerContainer,
            title: playerContainer.querySelector(".audio__title"),
            seekbar: playerContainer.querySelector(".audio__seekbar"),
            seekberContainer: playerContainer.querySelector(".audio__seekbar-container"),
            elapsedTime: playerContainer.querySelector(".audio__seekbar-elapsed"),
            duration: playerContainer.querySelector(".audio__seekbar-duration"),
            playButton: playerContainer.querySelector("#audio__play-button"),
            nextButton: playerContainer.querySelector("#audio__next-button"),
            prevButton: playerContainer.querySelector("#audio__prev-button"),
        }
        this.addEvents();
    }
    addEvents() {
        this.playerElements.playButton.addEventListener("click", () => {
            if (this.isPlayed) {
                this.pause();
            }
            else {
                this.resume();
            }
        });
        this.playerElements.nextButton.addEventListener("click", () => {
            this.playNext();
        });
        this.playerElements.prevButton.addEventListener("click", () => {
            this.playPrevious();
        });
        this.playerElements.seekberContainer.addEventListener("click", (event) => {
            const posX = event.offsetX;
            const seekbarWidth = event.target.offsetWidth;
            const targetProgress = posX / seekbarWidth;
            this.goToPosition(targetProgress);
        });
    }
    async createPlaylist({ folderPath, filePath }) {
        folderPath ??= filePath?.replace(/[\\\/][^\/\\]+$/, "");

        const folderItems = await getFolderItems(folderPath);
        const playlist = folderItems.filter(item => isAudio(item)).sort((a, b) => b.size - a.size);
        this.playlist = playlist;
    }
    async openFile(file) {
        const curFile = this.currentlyPlayed();
        if (curFile && curFile.path === file.path) {
            this.resume();
        }
        else {
            await this.createPlaylist({ filePath: file.path })
            this.play(file);
        }

    }

    async updatePlayerData(file, doUpdate = true) {

        const normalizeDuration = (duration) => {
            duration = ~~duration;
            const minutes = ~~(duration / 60);
            const seconds = duration % 60;
            return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
        }

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
            const elapsedString = normalizeDuration(elapsed);
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
        const durString = normalizeDuration(duration);
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

    resume() {
        const file = this.currentlyPlayed();
        this.audio.play();
        this.isPlayed = true;
        ui.addActiveFile(file);
        this.updatePlayerData(file, true);
    }
    async play(file) {

        file ??= this.currentlyPlayed();
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
            setTimeout(() =>
                this.audio.addEventListener('ended', () => {
                    this.playNext();
                }, { once: true }), 25);
        }, { once: true });



    }
    pause() {
        this.updateProgressInterval && clearInterval(this.updateProgressInterval);
        // ui.removeActiveFile(this.playlist[this.playlistIndex]);
        this.audio.pause();
        this.isPlayed = false;
        this.updatePlayerData(this.currentlyPlayed(), false)
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
        this.stop();

        this.playlistIndex++;
        if (this.playlistIndex === this.playlist.length) {
            this.playlistIndex = 0;
        }
        this.play(this.currentlyPlayed());
    }
    async goToPosition(targetProgress) {
        this.pause();
        this.audio.currentTime = this.audio.duration * targetProgress;
        this.updatePlayerData(this.currentlyPlayed(), false);
        // await new Promise(resolve => requestAnimationFrame(resolve));
        setTimeout(() => this.resume(), 25);
    }
}