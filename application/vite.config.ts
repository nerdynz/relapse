import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vitejs-plugin-electron'
import svgLoader from 'vite-svg-loader'
import { resolve } from 'path'
const root = resolve(__dirname, 'src/render')
const outDir = resolve(__dirname, 'dist/render')

// https://vitejs.dev/config/
export default defineConfig({
  root,
  base: './',
  build: {
    outDir,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/render'),
      '@grpc': resolve(__dirname, 'src/grpc')
    }
  },
  plugins: [vue(), electron(), svgLoader()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/scss/_variables.scss";`
      }
    }
  }
})
