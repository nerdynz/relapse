import { join } from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
// import pkg from './package.json'
import svgLoader from 'vite-svg-loader'
const renderDir = join(__dirname, 'src/render')

// @ts-ignore
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'


// https://vitejs.dev/config/
export default defineConfig({
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
        additionalData: `@import "./src/scss/_variables.scss";`
      }
    }
  },
  plugins: [vue(), ReactivityTransform(), svgLoader()]
})
