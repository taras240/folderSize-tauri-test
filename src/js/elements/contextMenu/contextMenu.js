import { event } from "@tauri-apps/api";
import { fromHtml } from "../../functions/html.js"
import { iconsHtml, InputIcons } from "../icons.js";
import { CONTEXT_ITEM_TYPES } from "../../enums/contextMenuItemTypes.js";

export const setPosition = ({ element, position, event }) => {
    if (!position) {
        position = {
            X: event.clientX,
            Y: event.clientY
        }
    }
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const isOverflowRight = position.X + width > window.innerWidth;
    element.style.left = `${isOverflowRight ? position.X - width : position.X}px`;
    element.style.top = `${position.Y}px`;
}
export const removeContextMenus = () => {
    document.querySelectorAll(".context-menu")?.forEach(menu => menu.remove())
}
export const ContextMenu = (menuItems = []) => {
    removeContextMenus();
    const menuContainer = MenuContainer();
    const menuElements = menuItems.map(item => MenuItem(item));
    menuContainer.append(...menuElements);
    menuContainer.addEventListener("click", event => event.stopPropagation())
    return menuContainer;
}
const MenuContainer = () => fromHtml(`
        <div class="context-menu context-menu__container"></div>
    `);
const MenuItem = (item) => {
    const ItemContainer = (itemElement) => {
        const container = fromHtml(`
                <div class="contextmenu__item"></div>
            `);
        container.append(itemElement);
        return container;
    }
    switch (item.type) {
        case (CONTEXT_ITEM_TYPES.radio):
            return ItemContainer(RadioButton(item));
        case (CONTEXT_ITEM_TYPES.button):
            return ItemContainer(Button(item));
        default:
            break;

    }
}
const RadioButton = ({ label, name, isChecked, onChange }) => {
    const radioContainer = fromHtml(`
            <label class="radio-container"></label>
        `);
    const input = fromHtml(`
            <input 
                type="radio" 
                name="${name}" 
                ${isChecked ? "checked" : ""}
            >
        `)
    const radioIcon = InputIcons.Radio();

    radioContainer.append(input, radioIcon, label);

    input.addEventListener("change", () => {
        removeContextMenus();
        onChange();
    });
    input.addEventListener("click", () => {
        setTimeout(() => removeContextMenus(), 50);
    });

    return radioContainer;
}
const Button = ({ label, onClick, }) => {
    const button = fromHtml(`
        <button class="context-btn">${label}</button>
    `);
    button.addEventListener("click", (event) => {
        onClick?.();
        event.target.closest(".context-menu")?.remove();
    });
    return button;
}