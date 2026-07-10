import { fromHtml } from "../../functions/html.js";
import { setMetaData } from "../../functions/metaData/metaData.js";

export function TagEditorElement({ file, tags, element }) {
    let { title, artist, album, genre, year, track, comment } = tags;
    const [parsedArtist, parsedTitle] = file.normalizedName?.split(" - ");
    artist ??= parsedArtist;
    title ??= parsedTitle;
    console.log({ parsedArtist, parsedTitle });
    const modalWindow = fromHtml(`
        <div class="modal metadata-modal" id="metadataModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Metadata</h2>
                    <button class="close-btn">&times;</button>
                </div>

                <div class="modal-body">
                    <!--<div class="cover-section">
                        <img id="coverPreview" src="assets/default-cover.png" alt="Cover">
                        <div class="cover-actions">
                            <button id="changeCover">Change Cover</button>
                            <button id="removeCover">Remove</button>
                        </div>
                    </div>-->

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
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" id="cancelMetadata">
                        Cancel
                    </button>

                    <button class="modal-btn" id="saveMetadata">
                        Save
                    </button>
                </div>
            </div>
        </div>
    `);
    const closeWindow = () => modalWindow?.remove();

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
        console.log(newTags, res);
        if (!res) {
            closeWindow();
            ui.updateWithMeta(file, element);
        }
    }
    modalWindow.querySelector(".close-btn").addEventListener("click", () => closeWindow());
    modalWindow.querySelector("#cancelMetadata").addEventListener("click", () => closeWindow());

    modalWindow.querySelector("#saveMetadata").addEventListener("click", () => saveMetadata());
    return modalWindow;
}