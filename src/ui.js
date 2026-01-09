import { statusLine } from "./components/controls.js";
import { GO_TO_DIRECTIONS } from "./components/enums/gotoDirections.js";
import { doSizeCache, getDrives, getFolderItems } from "./components/functions/listFuncs.js";
import { headerElement } from "./components/header.js";
import { mainList } from "./components/list.js";
import { listElement } from "./components/listItems.js"

export class UI {
    sizeCache = {};
    forvardHistory = [];
    pathHistory = [];
    curPath = GO_TO_DIRECTIONS.HOME;
    constructor() {
        this.app = document.getElementById("app");
        this.generateUI();
        this.addEvents();
        this.openFolder();
    }
    generateUI() {
        this.app.innerHTML = "";
        this.header = headerElement();
        this.path = this.header.querySelector("#path");
        this.list = mainList();
        this.status = statusLine();
        this.app.append(this.header, this.list, this.status);
    }
    addEvents() {
        this.app.querySelector("#control-back").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.BACK));
        this.app.querySelector("#control-forvard").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.FORWARD));
        this.app.querySelector("#control-home").addEventListener("click", () => this.goto(GO_TO_DIRECTIONS.HOME));
        this.app.querySelector("#control-refresh").addEventListener("click", () => this.openFolder(this.curPath));
        this.app.querySelector("#control-show-size").addEventListener("click", () => this.showSize());
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
        console.log(this.pathHistory)

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
            items = await getDrives();
        }
        else {
            items = await getFolderItems(path, this.sizeCache);
        }
        items = this.sortItems(items);
        items.forEach(item => {
            const itemElement = listElement(item);
            itemElement && this.list.append(itemElement);
            if (item.is_dir || item.is_drive) {
                itemElement.addEventListener("click", () => this.goto(item.path));
            }
        })
    }
    sortItems(items) {
        return items.sort((a, b) => b.size - a.size).sort((a, b) => b.is_dir - a.is_dir);
    }
    updateSizeCache(cache) {
        this.sizeCache = Object.assign(this.sizeCache, cache);
        this.openFolder(this.curPath);
    }
    updateStatus(log) {
        this.status.innerHTML = log;
    }
}