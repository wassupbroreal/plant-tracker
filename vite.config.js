import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      // Игнорируем файлы сборки Rust/Tauri, чтобы избежать конфликтов блокировки (EBUSY) на Windows
      ignored: ['**/src-tauri/**']
    }
  }
});
