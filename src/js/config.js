import { Store } from '@tauri-apps/plugin-store';

// Створення store
let store = null;

// Ініціалізація store
async function initStore() {
    if (!store) {
        store = await Store.load('settings.json');
    }
    return store;
}
let config;

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
    console.log(keys);
}

// // Слухати зміни
// const unlisten = await store.onKeyChange('theme', (newValue) => {
//     console.log('Theme changed to:', newValue);
// });