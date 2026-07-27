import { AudioPlayerElement } from "./js/elements/audioElements/AudioPlayer.js";
import { statusLine } from "./js/elements/controls.js";
import { GO_TO_DIRECTIONS } from "./js/enums/gotoDirections.js";
import { isAudio, isRetro, isVideo } from "./js/functions/fileFormats.js";
import { fromHtml } from "./js/functions/html.js";
import { doSizeCache, getDrives, getFolderItems } from "./js/functions/listFuncs.js";
import { getMetaData } from "./js/functions/metaData/metaData.js";
import { headerElement } from "./js/elements/header.js";
import { mainList } from "./js/elements/list.js";
import { itemBadge, listElement } from "./js/elements/listItems.js"
import { sideBarElement } from "./js/elements/sideBar.js";
import { appWindow } from "./main.js";

import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { shuffle, sortBy } from "./js/functions/filesSort.js";
import { Player } from "./js/audioPlayer.js";
import { mainContentElement } from "./js/elements/content.js";
import { STATUS_STATES } from "./js/enums/statusLineStates.js";
import { LIST_VIEW_TYPES } from "./js/enums/listViews.js";
import { formatSongDuration } from "./js/functions/timeFormat.js";
import { ContextMenu, removeContextMenus, setPosition } from "./js/elements/contextMenu/contextMenu.js";
import { getConfig, saveSettingProperty } from "./js/config.js";
import { SORT_NAMES } from "./js/functions/filesSort.js";
import { VideoElement } from "./js/elements/listItems/VideoItem.js";
import { LIST_ITEM_TYPES } from "./js/enums/listItems.js";
import { event } from "@tauri-apps/api";
import { TagEditorElement } from "./js/elements/audioElements/tagsModalWindow.js";
import { SearchWindowElement } from "./js/elements/windows/searchWindow.js";
import { openWidget } from "./js/functions/ui/openWidget.js";
import { raBadgeHtml } from "./js/elements/listItems/components/badges.js";

export class UI {
    listViewType = LIST_VIEW_TYPES.audio;
    sizeCache = {};
    forwardHistory = [];
    pathHistory = [];
    curPath = GO_TO_DIRECTIONS.home;
    isVideoView = false;
    constructor() {
        this.app = document.getElementById("app");
        this.generateUI();
        this.initApp();
    }
    async initApp() {
        this.initElements();
        this.addEvents();
        await this.initConfig();
        this.openFolder();
        this.player = new Player();
    }
    async editMetaData({ file, element }) {
        ui.app.querySelectorAll(".modal").forEach(m => m.remove());
        openWidget("tags", {
            file,
        });
    }
    async initConfig() {
        const config = await getConfig();
        this.listViewType = config?.listViewType || LIST_VIEW_TYPES.files;
        this.sortName = config?.sortName || SORT_NAMES.fileName;
    }
    generateUI() {
        this.app.innerHTML = "";
        const mainContent = mainContentElement();
        mainContent.append(sideBarElement(), mainList());
        this.app.append(
            // windowHeader(),
            headerElement(),
            mainContent,
            AudioPlayerElement(),
            statusLine(),
        );
    }
    initElements() {
        this.header = this.app.querySelector("#app-header");
        this.path = this.header.querySelector("#path");
        this.listContainer = this.app.querySelector(".app-content");
        this.list = this.app.querySelector("#app-list");

        this.sidebar = this.app.querySelector("#app-sidebar");
        this.status = this.app.querySelector("#status-line");
        this.audio = this.app.querySelector("#audio-player");

    }
    addEvents() {
        this.app.addEventListener("click", () => removeContextMenus());
        const $ = (selector) => this.app.querySelector(selector);

        $("#close-window-button")?.addEventListener("click", async () => await appWindow.close());
        $("#control-back").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.back));
        $("#control-forvard").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.forward));
        $("#control-home").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.home));
        $("#control-refresh").addEventListener("click", () => this.openFolder(this.curPath));
        $("#control-show-size").addEventListener("click", () => this.showSize());
        $("#control-show-all-files").addEventListener("click", () => this.openFolder(this.curPath, true));
        $("#control-sort-list").addEventListener("click", event => this.toggleSortContextMenu(event));
        $("#control-switch-view").addEventListener("click", event => this.toggleSwitchViewContextMenu(event));

        $("#control-sort-list").addEventListener("click", async () => {
            // placeholder for future sort UI
        });

        this.registerSidebarHandlers($);
        this.registerMediaSessionHandlers();



    }
    registerSidebarHandlers($) {
        $("#sidebar-user-music").addEventListener("click", async () => {
            const musicPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Music" });
            this.goto(musicPath);
        });
        $("#sidebar-user-downloads").addEventListener("click", async () => {
            const downloadsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Downloads" });
            this.goto(downloadsPath);
        });
        $("#sidebar-user-videos").addEventListener("click", async () => {
            const videoPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Videos" });
            this.goto(videoPath);
        });
        $("#sidebar-user-pictures").addEventListener("click", async () => {
            const picsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Pictures" });
            this.goto(picsPath);
        });
        $("#sidebar-user-docs").addEventListener("click", async () => {
            const docsPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Documents" });
            this.goto(docsPath);
        });
        $("#sidebar-user-desktop").addEventListener("click", async () => {
            const deskPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Desktop" });
            this.goto(deskPath);
        });
        $("#sidebar-user-user").addEventListener("click", async () => {
            const userPath = await invoke("parse_env_path", { path: "%USERPROFILE%" });
            this.goto(userPath);
        });
        $("#sidebar-roms").addEventListener("click", async () => {
            const userPath = await invoke("parse_env_path", { path: "%USERPROFILE%\\Desktop\\retroGames" });
            this.goto(userPath);
        });
    }

    registerMediaSessionHandlers() {
        navigator.mediaSession.setActionHandler('previoustrack', () => this.player.playPrevious());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.player.playNext());
        navigator.mediaSession.setActionHandler('play', () => this.player.resume());
        navigator.mediaSession.setActionHandler('stop', () => this.player.stop());
    }
    toggleSortContextMenu(event) {
        event.stopPropagation();
        const contextMenu = ContextMenu(Object.keys(SORT_NAMES)
            .map(sortName => ({
                type: "radio",
                name: "sort-list",
                isChecked: this.sortName === sortName,
                label: sortName,
                onChange: () => this.sortList(sortName),
            })
            ));
        this.app.append(contextMenu);
        const rect = event.currentTarget.getBoundingClientRect();
        const position = { X: rect.left + rect.width / 2, Y: rect.top + rect.height };
        setPosition({ element: contextMenu, position, event });
    }
    toggleSwitchViewContextMenu(event) {
        event.stopPropagation();
        const contextMenu = ContextMenu(
            Object.values(LIST_VIEW_TYPES)
                .map(type => {
                    return {
                        type: "radio",
                        name: "view-type",
                        isChecked: this.listViewType === type,
                        label: type,
                        onChange: () => this.switchListView(type),
                    }
                })
        );
        this.app.append(contextMenu);
        const rect = event.currentTarget.getBoundingClientRect();
        const position = { X: rect.left + rect.width / 2, Y: rect.top + rect.height };
        setPosition({ element: contextMenu, position, event });
    }
    switchListView(view) {
        // this.isVideoView = !this.isVideoView;
        this.listViewType = view;
        this.openFolder(this.curPath);
        saveSettingProperty({ property: "listViewType", value: view })
        // console.log("isVideo: ", this.isVideoView)
    }
    sortList(sortName) {
        this.sortName = sortName;
        this.openFolder(this.curPath);
        saveSettingProperty({ property: "sortName", value: sortName })
    }
    async goto(path, items = []) {
        path = path?.replace(/[\\\/]+[\\\/]$/, "");
        if (path == GO_TO_DIRECTIONS.web_search) {
            this.openWeb(items);
            // this.curPath = GO_TO_DIRECTIONS.web_search;
            // this.pathHistory.push(this.curPath);
        }
        else if (path === this.curPath) {
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
    toggleLoadingScreen({ show = true, message = "Loading", cancelCallback }) {
        this.app.querySelectorAll(".loading-screen").forEach(s => s.remove());
        if (show) {
            console.log({ show })
            const loadingElement = fromHtml(`
                <div class="loading-screen">Loading...</div>
            `)
            loadingElement.addEventListener("click", (event) => console.log("Cancel loading"));
            this.app.append(loadingElement);
        }
    }

    async openFolder(path, isFullFolder = false) {
        path ??= GO_TO_DIRECTIONS.home;
        this.list.innerHTML = "";
        this.path.value = path;
        appWindow.setTitle(`[ ${path} ]`);
        let items = [];
        console.log({ isFullFolder })
        this.toggleLoadingScreen({ show: isFullFolder });
        if (path === GO_TO_DIRECTIONS.home) {
            items = await getDrives();
        }
        else {
            items = await getFolderItems(path, this.sizeCache, isFullFolder);
        }
        this.toggleLoadingScreen({ show: false });

        this.showItems(items);
    }
    openWeb(items) {
        path ??= GO_TO_DIRECTIONS.web_search;
        this.list.innerHTML = "";
        this.path.value = "WEB SEARCH";
        appWindow.setTitle('WEB SEARCH');
        this.showItems(items);
    }
    showItems(items) {
        items = this.sortItems(items);
        this.list.classList.toggle("video-view", this.isVideoView);
        switch (this.listViewType) {
            case (LIST_VIEW_TYPES.files):
                this._showFiles(items);
                break;
            case (LIST_VIEW_TYPES.video):
                this._showVideos(items);
                break;
            case (LIST_VIEW_TYPES.audio):
                this._showAudio(items);
                break;
            case (LIST_VIEW_TYPES.retro):
                this._showRetro(items);
                break;
            default:
                break;
        }
    }
    async search(query) {
        this.toggleLoadingScreen({ show: true });
        this.listContainer.querySelectorAll(".modal").forEach(m => m.remove());
        this.listContainer.append(await SearchWindowElement(query));
        this.toggleLoadingScreen({ show: false });

        // this.goto(GO_TO_DIRECTIONS.web_search, links);
        // this.showItems(links)

    }
    _showFiles(items) {
        this.items = items;
        items.forEach((item) => {
            const itemElement = listElement(item);
            if (item.path === this.activeFile?.path) itemElement?.classList.add("played");
            itemElement && this.list.append(itemElement);
            if (item.is_dir || item.is_drive) itemElement?.addEventListener("click", () => this.goto(item.path));
        });
    }

    _showVideos(items) {
        const videoListContainer = fromHtml(`<div class="video-view"></div>`);
        this.list.append(videoListContainer);

        items = items.filter(item => isVideo(item) || item.is_dir || item.is_drive);
        this.items = items;

        let currentIndex = 0;
        const itemsPerLoad = 20;
        let sentinel = null;

        const loadMoreItems = () => {
            if (currentIndex >= items.length) return;

            const endIndex = Math.min(currentIndex + itemsPerLoad, items.length);

            if (sentinel) {
                scrollObserver.unobserve(sentinel);
                sentinel.remove();
            }

            for (let i = currentIndex; i < endIndex; i++) {
                const item = items[i];
                const itemElement = item.is_dir ? listElement(item) : VideoElement(item);
                if (!itemElement) continue;
                videoListContainer.append(itemElement);
                if (item.is_dir || item.is_drive) itemElement.addEventListener("click", () => this.goto(item.path));
                if (!item.is_dir && !item.is_drive) {
                    const video = itemElement.querySelector('video');
                    if (video) {
                        videoObserver.observe(video);
                        lazyLoadObserver.observe(video);
                    }
                }
            }

            currentIndex = endIndex;

            if (currentIndex < items.length) {
                sentinel = fromHtml(`<div class="scroll-sentinel" style="height: 1px;"></div>`);
                videoListContainer.append(sentinel);
                scrollObserver.observe(sentinel);
            }
        };

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) video.play().catch(() => { });
                else video.pause();
            });
        }, { threshold: 0.6 });

        const lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        video.load();
                        delete video.dataset.src;
                    }
                }
            });
        }, { rootMargin: '200px' });

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) loadMoreItems(); });
        }, { root: null, rootMargin: '100px', threshold: 0 });

        loadMoreItems();
    }

    async _showAudio(items) {
        items = items.filter(item => isAudio(item) || item.is_dir || item.is_drive || item.url);
        this.items = items;
        for (const item of items) {
            const itemElement = listElement(item, this.listViewType);
            if (item.path === this.activeFile?.path) itemElement?.classList.add("played");
            if (isAudio(item)) await this.updateWithMeta(item, itemElement);
            itemElement && this.list.append(itemElement);
            if (item.is_dir || item.is_drive) itemElement?.addEventListener("click", () => this.goto(item.path));
        }
    }
    async _showRetro(items) {
        this.controller?.abort(); // зупинити попередній запуск
        this.controller = new AbortController();

        const { signal } = this.controller;
        items = items.filter(item =>
            isRetro(item) || item.is_dir || item.is_drive || item.url
        );
        this.items = items;

        for (const item of items) {
            if (signal.aborted) return;

            const itemElement = listElement(item, LIST_VIEW_TYPES.retro);
            item.itemElement = itemElement;
            this.list.append(itemElement);

            if (item.is_dir || item.is_drive) {
                itemElement?.addEventListener("click", () => this.goto(item.path));
            }
        }
        for (const item of items) {
            if (signal.aborted) return;
            if (item.type === LIST_ITEM_TYPES.FILE) {
                await this.updateWithRAData(item, item.itemElement);
                if (signal.aborted) return;
            }
        }
    }

    async updateWithRAData(file, element) {
        if (!file || file.type != LIST_ITEM_TYPES.FILE) return;
        element ??= this.app.querySelector(`li[data-path="${CSS.escape(file.path)}"]`);
        if (!element) return;
        // const element = this.app.querySelector()
        const { path, name, normalizedName, normalizedSize, modifiedDate } = file;
        const meta = await getMetaData(file);
        const titleElement = element?.querySelector(".list-item__title");
        if (!meta) {
            element.classList.add("red-bg");
            titleElement.innerText = `❓ ${titleElement.innerText}`
            return;
        };
        const { title, console, id } = meta;

        if (titleElement) {
            titleElement.innerText = `${title}`;
            element.prepend(fromHtml(raBadgeHtml()));
            const classList = ["audio-badge"];
            // element.querySelectorAll(".audio-badge").forEach(b => b.remove());
            element.append(
                itemBadge({ text: console, classList }),
            )
            titleElement.title = name;
        }
    }
    async updateWithMeta(file, element) {
        if (!file || file.type === LIST_ITEM_TYPES.URL) return;
        element ??= this.app.querySelector(`li[data-path="${CSS.escape(file.path)}"]`);
        if (!element) return;
        // const element = this.app.querySelector()
        const { path, name, normalizedName, normalizedSize, modifiedDate } = file;
        const meta = await getMetaData(file);
        const { artist, title, duration, album, year, bitrate } = meta;
        const normalizedDuration = formatSongDuration(duration);
        const titleElement = element?.querySelector(".list-item__title");

        if (titleElement) {
            const songName = artist && title ? `${artist} - ${title}` : `❓ ${normalizedName}`;
            titleElement.innerText = `${songName}`;
            const classList = ["audio-badge"];
            element.querySelectorAll(".audio-badge").forEach(b => b.remove());
            meta.duration && element.append(
                itemBadge({ text: normalizedDuration, classList }),
                itemBadge({ text: bitrate + "kbps", classList }),

            )
            element.append(
                itemBadge({ text: normalizedSize, classList }),
                itemBadge({ text: modifiedDate, classList }),
            )
            titleElement.title = name;
        }
        // console.log(meta);

    }
    sortItems(items) {
        if (this.isVideoView) {
            return shuffle(items);
        }
        return items.sort((a, b) => sortBy[this.sortName || SORT_NAMES.size](a, b)).sort((a, b) => sortBy.isDir(a, b));
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
        if (item.type === LIST_ITEM_TYPES.URL) {
            this.player.openUrl(item, this.items);
        }
        else {

            this.player.openFile(item, this.items);
        }

    }
    addActiveFile(file, activity) {
        console.log(file);
        this.activeFile = file;
        const folderPath = file?.path?.replace(/[\\\/][^\/\\]+$/, "");
        const activeItems = this.listContainer.querySelectorAll(`li.played`);
        activeItems.forEach(li => li.classList.remove("played"));
        const activeElement = this.listContainer.querySelector(`li[data-path="${CSS.escape(file.path)}"]`);
        activeElement?.classList.add("played");
    }
    removeActiveFile(file) {
        if (this.activeFile && (file?.path !== this.activeFile?.path)) {
            delete this.activeFile;
        }
    }
}
