import { join } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
const outDir = join(__dirname, 'dist/render')
const renderDir = join(__dirname, 'src/render')
const publicDir = join(__dirname, 'public')

// https://vitejs.dev/config/
export default defineConfig({
  publicDir,
  base: './',
  plugins: [vue(), svgLoader()],
  build: {
    outDir,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@assets': join(__dirname, 'src/render/assets'),
      '@grpc': join(__dirname, 'src/grpc'),
      '@render': renderDir,
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/render/scss/_variables.scss";`
      }
    }
  }
})
