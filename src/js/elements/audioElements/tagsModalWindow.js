import { getCurrentWebview } from "@tauri-apps/api/webview";
import { fromHtml } from "../../functions/html.js";
import { setMetaData } from "../../functions/metaData/metaData.js";
import { ModalWindowElement } from "../windows/modalWindow.js";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function TagEditorElement({ file, tags, element }) {
    let { title, artist, album, genre, year, track, comment } = tags;
    const [parsedArtist, parsedTitle] = file.normalizedName?.split(" - ");
    artist ??= parsedArtist;
    title ??= parsedTitle;

    const modalWindow = ModalWindowElement({
        title: "Edit Metadata",
        classList: ["metadata-modal"],
        id: "metadataModal",

    })
    const content = fromHtml(`
        <div class="metadata-fields">
            <label>
                <span>Title</span>
                <input type="text" id="metaTitle" value="${title ?? ""}">
            </label>

            <label>
                <span>Artist</span>
                <input type="text" id="metaArtist" value="${artist ?? ""}">
            </label>

            <label>
                <span>Album</span>
                <input type="text" id="metaAlbum" value="${album ?? ""}">
            </label>

            <label>
                <span>Genre</span>
                <input type="text" id="metaGenre" value="${genre ?? ""}">
            </label>
            
            <label>
                <span>Year</span>
                <input type="number"
                    id="metaYear"
                    min="0"
                    max="9999"
                    value="${year ?? ""}">
            </label>
            
            <label>
                <span>Track</span>
                <input type="number"
                    id="metaTrack"
                    min="1"
                    value="${track ?? ""}">
            </label>

            <label>
                <span>Comment</span>
                <textarea id="metaComment" rows="4">${comment ?? ""}</textarea>
            </label>
        </div>
    `);
    modalWindow.querySelector(".modal-body")?.append(content);

    const cancelButton = fromHtml(`
        <button class="modal-btn" id="cancelMetadata">
            Cancel
        </button>
    `);
    const saveButton = fromHtml(`
        <button class="modal-btn" id="saveMetadata">
            Save
        </button>
    `);
    modalWindow.querySelector(".modal-footer")?.append(cancelButton, saveButton);
    const closeWindow = () => {

        modalWindow?.remove();
        getCurrentWindow()?.close();
        getCurrentWebview()?.close();
    }

    const saveMetadata = async () => {
        const newTags = {
            title: modalWindow.querySelector("#metaTitle")?.value ?? "",
            artist: modalWindow.querySelector("#metaArtist")?.value ?? "",
            album: modalWindow.querySelector("#metaAlbum")?.value ?? "",
            genre: modalWindow.querySelector("#metaGenre")?.value ?? "",
            year: modalWindow.querySelector("#metaYear")?.value ?? "",
            track: modalWindow.querySelector("#metaTrack")?.value ?? "",
            comment: modalWindow.querySelector("#metaComment")?.value ?? ""
        }
        const res = await setMetaData({ path: file.path, tags: newTags });

        if (!res) {
            getCurrentWebview().emit("save-tags", {
                file
            });
            closeWindow();
        }
    }
    cancelButton.addEventListener("click", () => closeWindow());

    saveButton.addEventListener("click", () => saveMetadata());
    return modalWindow;
}