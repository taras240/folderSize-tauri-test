import { audioPlayerElement } from "./js/elements/audioPlayer.js";
import { statusLine } from "./js/elements/controls.js";
import { GO_TO_DIRECTIONS } from "./js/enums/gotoDirections.js";
import { isAudio, isVideo } from "./js/functions/fileFormats.js";
import { fromHtml } from "./js/functions/html.js";
import { doSizeCache, getDrives, getFolderItems } from "./js/functions/listFuncs.js";
import { getMetaData } from "./js/functions/metaData.js";
import { headerElement } from "./js/elements/header.js";
import { mainList } from "./js/elements/list.js";
import { listElement, videoElement } from "./js/elements/listItems.js"
import { sideBarElement } from "./js/elements/sideBar.js";
import { appWindow } from "./main.js";

import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { shuffle, sortBy } from "./js/functions/filesSort.js";
import { Player } from "./js/audioPlayer.js";
import { mainContentElement } from "./js/elements/content.js";
import { STATUS_STATES } from "./js/enums/statusLineStates.js";

export class UI {
    sizeCache = {};
    forwardHistory = [];
    pathHistory = [];
    curPath = GO_TO_DIRECTIONS.home;
    isVideoView = false;
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
        const mainContent = mainContentElement();
        mainContent.append(sideBarElement(), mainList());
        this.app.append(
            // windowHeader(),
            headerElement(),
            mainContent,
            audioPlayerElement(),
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
        const $ = (selector) => this.app.querySelector(selector);
        $("#close-window-button")?.addEventListener("click", async () => {
            await appWindow.close();
        })
        $("#control-back").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.back));
        $("#control-forvard").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.forward));
        $("#control-home").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.home));
        $("#control-refresh").addEventListener("click", () => this.openFolder(this.curPath));
        $("#control-show-size").addEventListener("click", () => this.showSize());
        $("#control-show-all-files").addEventListener("click", event => {
            this.openFolder(this.curPath, true);
        })
        $("#control-switch-video-view").addEventListener("click", event => {
            this.switchListView();
        })
        $("#sidebar-user-music").addEventListener("click", async () => {
            const musicPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Music" });
            this.goto(musicPath)
        });
        $("#sidebar-user-downloads").addEventListener("click", async () => {
            const downloadsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Downloads" });
            this.goto(downloadsPath);

        });
        $("#sidebar-user-videos").addEventListener("click", async () => {
            const videoPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Videos" });
            this.goto(videoPath)
        });
        $("#sidebar-user-pictures").addEventListener("click", async () => {
            const picsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Pictures" });
            this.goto(picsPath);
        });
        $("#sidebar-user-docs").addEventListener("click", async () => {
            const docsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Documents" });
            this.goto(docsPath)
        });
        $("#sidebar-user-desktop").addEventListener("click", async () => {
            const deskPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Desktop" });
            this.goto(deskPath);
        });
        $("#sidebar-user-user").addEventListener("click", async () => {
            const userPath = await invoke("parse_env_path", { path: "%USERPROFILE%" });
            this.goto(userPath);
        });
        $("#control-sort-list").addEventListener("click", async () => {

            // const webview = new WebviewWindow('my-window', {
            //     url: 'index.html',
            //     title: 'Налаштування',
            //     width: 800,
            //     height: 600,
            // });
            // webview.once('tauri://error', e => {
            //     console.error('Window error:', e);
            // });

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
    switchListView(view) {
        this.isVideoView = !this.isVideoView;
        this.openFolder(this.curPath);
        // console.log("isVideo: ", this.isVideoView)
    }
    async goto(path) {
        path = path?.replace(/[\\\/]+$/, "");
        if (path === this.curPath) {
            await this.openFolder(path);
        }
        else if (path === GO_TO_DIRECTIONS.back) {
            if (this.pathHistory.length === 0) return;
            this.forwardHistory.push(this.curPath);
            this.curPath = this.pathHistory.pop();

            if (this.curPath === GO_TO_DIRECTIONS.home) {
                await this.openFolder();
            }
            else {
                await this.openFolder(this.curPath);
            }
        }
        else if (path === GO_TO_DIRECTIONS.forward) {

            if (this.forwardHistory.length === 0) return;
            this.pathHistory.push(this.curPath);
            this.curPath = this.forwardHistory.pop();

            // this.pathHistory.push(this.curPath);
            if (this.curPath === GO_TO_DIRECTIONS.home) {
                await this.openFolder();
            }
            else {
                await this.openFolder(this.curPath);
            }


        }
        else if (path === GO_TO_DIRECTIONS.home) {
            this.pathHistory.push(this.curPath);
            this.forwardHistory = [];
            await this.openFolder();
            this.curPath = path;


        }
        else {

            this.pathHistory.push(this.curPath);
            this.forwardHistory = [];
            await this.openFolder(path);
            this.curPath = path;
        }

    }
    async showSize(path) {
        path ??= this.curPath;
        doSizeCache({
            path,
            onUpdate: ({ statusState, message }) => this.updateStatus({ statusState, message }),
            onFinish: (cache) => this.updateSizeCache(cache)
        })
    }
    async openFolder(path, isFullFolder) {
        path ??= GO_TO_DIRECTIONS.home;
        this.list.innerHTML = "";
        this.path.value = path;
        let items = [];
        if (path === GO_TO_DIRECTIONS.home) {
            items = await getDrives();
        }
        else {
            items = await getFolderItems(path, this.sizeCache, isFullFolder);
        }
        this.list.classList.toggle("video-view", this.isVideoView)
        if (this.isVideoView) {

            items = items.filter(item => isVideo(item) || item.is_dir);
        }
        items = this.sortItems(items);
        items.forEach((item, index) => {
            if (this.isVideoView && index > 50) return;
            let itemElement;
            if (this.isVideoView) {
                itemElement = item.is_dir ? listElement(item) : videoElement(item);
                const videos = document.querySelectorAll("video");

                const observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach(entry => {
                            const video = entry.target;

                            if (entry.isIntersecting) {
                                video.play();
                            } else {
                                video.pause();
                            }
                        });
                    },
                    { threshold: 0.6 }
                );

                videos.forEach(video => observer.observe(video));
            }
            else {
                itemElement = listElement(item);
                if (item.path === this.activeFile?.path) {
                    itemElement.classList.add("played");
                }
                if (isAudio(item)) {
                    this.updateWithMeta(item, itemElement);
                }

            }
            this.items = items;
            itemElement && this.list.append(itemElement);
            if (item.is_dir || item.is_drive) {
                itemElement?.addEventListener("click", () => this.goto(item.path));
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
        if (this.isVideoView) {
            return shuffle(items);
        }
        return items.sort((a, b) => sortBy.size(a, b)).sort((a, b) => sortBy.isDir(a, b));
    }
    updateSizeCache(cache) {
        this.sizeCache = Object.assign(this.sizeCache, cache);
        this.openFolder(this.curPath);
    }
    updateStatus({ statusState = STATUS_STATES.ok, message }) {
        const hideWithDelay = (delay) => {
            this.clearStatusTimer = setTimeout(() => this.status.innerHTML = "", delay)
        }
        this.clearStatusTimer && clearTimeout(this.clearStatusTimer);
        switch (statusState) {
            case STATUS_STATES.error:
                this.status.dataset.status = "error";
                this.status.innerHTML = message;
                hideWithDelay(5e3)
                break;
            case STATUS_STATES.busy:
                this.status.dataset.status = "busy";
                this.status.innerHTML = message;
                break;
            case STATUS_STATES.ok:
                this.status.dataset.status = "ok";
                this.status.innerHTML = message;
                hideWithDelay(5e3);
                break;
            default:
                break;
        }
    }
    async startPlayer(item) {
        this.player.openFile(item, this.items);

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
        if (this.activeFile && (file?.path !== this.activeFile?.path)) {
            delete this.activeFile;
        }
    }
}
