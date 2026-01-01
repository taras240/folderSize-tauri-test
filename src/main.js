import { driveElement, getFileType, listElement } from "./components/listItems.js";

const { invoke } = window.__TAURI__.core;
let isFolderSizeCalc = false;
let isCalculating = false;
const gotoDirections = {
  back: "back",
  forvard: "fwd",
  home: "root",
}
let sizeCache = {};
let pathHistory = [];
let forvardHistory = [];
let curPath = "root";

const list = document.getElementById("list");
const input = document.getElementById("path");
const button = document.getElementById("load");
const homeButton = document.getElementById("control-home");
const backButton = document.getElementById("control-back");
const forvardButton = document.getElementById("control-forvard");
const statusLine = document.getElementById("status-line");

const updateButtons = () => {
  button.classList.toggle("active", isFolderSizeCalc);
}
// updateButtons();
const getDrives = async () => {
  const disks = await invoke("list_disks");
  // [{
  //   available: 3453085432,
  //   mount_point:"C:\\",
  //   name:"Win11",
  //   total:239166550016,
  // },...]
  return disks;
}

const openFolder = async (path, calcFolderSize) => {
  list.innerHTML = "";
  input.value = path;
  try {
    const files = (await invoke("list_dir", { path }))?.sort((f1, f2) => f2.is_dir - f1.is_dir);

    for (let file of files) {
      let { name, is_dir, is_file, is_symlink, size, modified, readonly, hidden, path } = file;
      if (isFinite(sizeCache[path])) {
        (size = sizeCache[path]);
      }
      if (is_dir && calcFolderSize) {
        showInStatus(`Scan size: ${name}`)
        size = await getFolderSize(path);
        sizeCache[path] = size;
        showInStatus(`OK`)
      }

      const li = listElement({ ...file, size });
      list.appendChild(li);
      if (is_file) {
        const fileType = getFileType(file);
        const musicFormats = ["flac", "mp3", "wav"]
        if (musicFormats.includes(fileType)) {
          let src = path;
          li.addEventListener("click", async () => {
            await invoke("play", ({ path: src }));
          })
        }
      }
      is_dir && li.addEventListener("click", async () => goto(path))
    }
  } catch (e) {
    alert("Помилка: " + e);
  }
}


window.addEventListener("DOMContentLoaded", async () => {
  await initDrives();
})
const initDrives = async () => {
  list.innerHTML = "Drives Init...";
  const drives = await getDrives();
  list.innerHTML = "";

  for (let drive of drives) {

    let { mount_point, name, available, total } = drive;

    const li = driveElement(drive);
    list.appendChild(li);
    li.addEventListener("click", async () => goto(`${mount_point}`))
  }
}

button.addEventListener("click", async () => {
  // isFolderSizeCalc = !isFolderSizeCalc;
  // updateButtons();
  await openFolder(curPath, true);
});

homeButton.addEventListener("click", async () => await goto(gotoDirections.home));
backButton.addEventListener("click", async () => await goto(gotoDirections.back));
forvardButton.addEventListener("click", async () => await goto(gotoDirections.forvard));



const getFolderSize = async (folderPath) => {
  showInStatus(`Calculating folder: ${folderPath}`)
  let folderSize = 0;
  const files = await invoke("list_dir", { path: folderPath });
  for (let file of files) {
    const { name, is_dir, is_file, size, path } = file;
    if (is_dir) {
      try {
        const size = (await getFolderSize(path) ?? 0)
        folderSize += size;
        sizeCache[path] = size;
      }
      catch (e) {
        console.warn(name, e)
      }

    }
    else if (is_file && size) {

      isFinite(size) && (folderSize += size);
    }
  }

  return folderSize;
}
const goto = async (path) => {
  if (path === gotoDirections.back) {
    if (pathHistory.length === 0) return;
    forvardHistory.push(curPath);
    curPath = pathHistory.pop();

    if (curPath === gotoDirections.home) {
      await initDrives();
    }
    else {
      await openFolder(curPath);
    }
  }
  else if (path === gotoDirections.forvard) {

    if (forvardHistory.length === 0) return;
    pathHistory.push(curPath);
    curPath = forvardHistory.pop();

    // pathHistory.push(curPath);
    if (curPath === gotoDirections.home) {
      await initDrives();
    }
    else {
      await openFolder(curPath);
    }


  }
  else if (path === gotoDirections.home) {
    pathHistory.push(curPath);
    forvardHistory = [];
    await initDrives();
    curPath = path;


  }
  else {
    pathHistory.push(curPath);
    forvardHistory = [];
    await openFolder(path);
    curPath = path;
  }

}
const showInStatus = (text) => {
  statusLine.innerText = text;
}