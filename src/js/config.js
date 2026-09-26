import { Store } from '@tauri-apps/plugin-store';

// Створення store
let store = null;
let config;
let metaStore = null;

// Ініціалізація store
async function initStore() {
    if (!store) {
        store = await Store.load('settings.json');
    }
    if (!metaStore) {
        metaStore = await Store.load("library.json");
    }
    return { store, metaLibrary: metaStore };
}

export async function saveSettingProperty({ property, value }) {
    if (!store) await initStore();
    if (!config) config = await loadSettings();
    Object.assign(config, { [property]: value });
    saveSettings(config);
}
async function saveSettings(config) {
    await store.set('config', config);

    await store.save();
}

// Читання налаштувань
async function loadSettings() {
    if (!store) await initStore();

    config = await store.get('config') ?? {};
    config.sidebarItems ??= [
        {
            label: "User",
            path: "%USERPROFILE%",
            displayOrder: 0,
        },
        {
            label: "Downloads",
            path: "%USERPROFILE%\\Downloads",
            displayOrder: 1,
        },
        {
            label: "Desktop",
            path: "%USERPROFILE%\\Desktop",
            displayOrder: 2,
        },
        {
            label: "Music",
            path: "%USERPROFILE%\\Music",
            displayOrder: 3,
        },
        {
            label: "Videos",
            path: "%USERPROFILE%\\Videos",
            displayOrder: 4,
        },
        {
            label: "Pictures",
            path: "%USERPROFILE%\\Pictures",
            displayOrder: 5,
        },
        {
            label: "Documents",
            path: "%USERPROFILE%\\Documents",
            displayOrder: 6,
        },
    ]
    return config;
}
export async function getConfig() {
    config ??= await loadSettings();
    return config;
}
// Видалення налаштування
async function resetTheme() {
    await store.delete('config');
    await store.save();
}

// Очистити всі налаштування
async function clearAll() {
    await store.clear();
    await store.save();
}

// Отримати всі ключі
async function getAllKeys() {
    const keys = await store.keys();
}



export async function getMetaLibrary() {
    if (!metaStore) await initStore();
    return metaStore;
}
export async function pushToMetaLibrary(hash, props) {
    // metaStore[hash] ??= {};
    metaStore.set(hash, props);
    metaStore.save();
}
export async function getFromMetaLibrary(hash) {
    return await metaStore.get(hash);
}