import { defineConfig } from 'vite';

export default defineConfig({
    // Очищає консоль при перезапуску
    clearScreen: false,

    // Tauri очікує фіксований порт
    server: {
        port: 1420,
        strictPort: true,
        watch: {
            // Ігноруємо Rust файли
            ignored: ['**/src-tauri/**']
        }
    },

    // Змінні оточення з префіксом VITE_ та TAURI_
    envPrefix: ['VITE_', 'TAURI_'],

    build: {
        // Таргет для Tauri
        target: 'chrome105',

        // Не мініфікуємо в режимі дебагу
        minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,

        // Source maps для дебагу
        sourcemap: !!process.env.TAURI_DEBUG,
    }
});