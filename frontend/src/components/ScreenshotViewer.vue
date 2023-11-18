<template>
  <div class="screenshot-viewer">
    <zoom :value="currentZoomLevel" @input="zoomChanged" @middle-clicked="resetCanvasZoom" />
    <canvas ref="canvasEl" id="screenshot-viewer" width="1280" height="800" />
  </div>
</template>

<script lang="ts" setup>
import { Canvas, Image, Point } from 'fabric'
import Zoom from "../components/Zoom.vue";
import { Ref, ref, onUnmounted, onMounted, watch } from "vue";
import { Capture } from '../relapse.pb';

let canvas: Canvas;
let canvasX: number;
let canvasY: number;
let lastRenderedImg: Image;

const currentZoomLevel = ref(0.5);
const canvasEl: Ref<HTMLCanvasElement | undefined> = ref()

const props = defineProps<{
  currentCapture?: Capture
}>()

const imagePath = $computed(() => {
  let filepath = ''
  const file = props.currentCapture;
  if (file && file.Fullpath) {
    try {
      filepath = 'http://localhost:5020/capture?path=' + file.Fullpath
    } catch {

    }
  }
  

  return filepath
})

async function captureChanged() {
  if (imagePath) {
    let oImg = await Image.fromURL(imagePath)
    oImg.left = 0;
    oImg.top = 0;
    oImg.selectable = false;
    oImg.hoverCursor = "-webkit-grab";
    oImg.moveCursor = "-webkit-grabbing";
    canvas.add(oImg);
    canvas.remove(lastRenderedImg);
    lastRenderedImg = oImg;
  } else {
    canvas.remove(lastRenderedImg);
  }
}
watch(() => props.currentCapture, captureChanged)


function zoomChanged(newZoom: number) {
  const canvasX = canvas.width! / 2;
  const canvasY = canvas.height! / 3;
  setCanvasZoom(canvasX, canvasY, newZoom);
}

function setCanvasZoom(canvasX: number, canvasY: number, newZoom: number) {
  if (newZoom >= 0.09 && newZoom < 2.1) {
    currentZoomLevel.value = newZoom;
    canvas.zoomToPoint(new Point(canvasX, canvasY), newZoom);
  }
}

function resetCanvasZoom() {
  currentZoomLevel.value = 0.7;
  canvas.selection = false;
  canvas.defaultCursor = "-webkit-grab";
  canvas.absolutePan(new Point(-50, -60));
  canvas.setZoom(currentZoomLevel.value);
  setCanvasDimensions()
}

function setCanvasDimensions() {
  canvas.setDimensions({
    width: window.innerWidth,
    height: window.innerHeight - 30,
  });
}

let lastEventDate = 0;
function zoomFromMouseWheel(e: WheelEvent) {
  let wheelDelta = -e.deltaY || -e.detail;
  let eventDebounce = 50;
  let incAmount = 0.05;
  if (wheelDelta < -100 || wheelDelta > 100) {
    eventDebounce = 10; // likely its a mouse...
    incAmount = 0.05;
  }

  if (lastEventDate + eventDebounce < Number(+new Date())) {
    lastEventDate = Number(+new Date());
    var delta = Math.max(-1, Math.min(1, wheelDelta));

    let newZoom = currentZoomLevel.value + delta * incAmount;
    // round it to 1 decimal place
    newZoom = Math.round(newZoom * 100);
    newZoom = newZoom / 100;

    setCanvasZoom(canvasX, canvasY, newZoom);
  }
}

onMounted(() => {
  let panning = false;
  canvas = new Canvas("screenshot-viewer");
  canvas.selection = false;
  // canvas.defaultCursor = '-webkit-grab'
  canvas.absolutePan(new Point(-50, -50));

  canvas.on("mouse:up", (e: any) => {
    canvas.defaultCursor = "-webkit-grab";
    if (e.target) {
      e.target!.hoverCursor = "-webkit-grab";
    }
    panning = false;
  });

  canvas.on("mouse:down", (e: any) => {
    canvas.defaultCursor = "-webkit-grabbing";
    if (e.target) {
      e.target!.hoverCursor = "-webkit-grabbing";
    }
    panning = true;
  });

  canvas.on("mouse:move", (e: any) => {
    let event = e.e as any;
    canvasX = event.layerX;
    canvasY = event.layerY;
    if (panning && e && event) {
      // var units = 10
      var delta = new Point(event.movementX, event.movementY);
      canvas.relativePan(delta);
    }
  });

  window.addEventListener("resize", setCanvasDimensions);
  // @ts-ignore
  document.addEventListener("mousewheel", zoomFromMouseWheel, false);

  captureChanged();
  resetCanvasZoom();
})

onUnmounted(() => {
  window.addEventListener("resize", setCanvasDimensions);

  // @ts-ignore
  document.removeEventListener("mousewheel", zoomFromMouseWheel, false);
})


</script>

<style>
img {
  margin-top: -25px;
  width: 450px;
}

.screenshot-viewer {
  position: relative;
  background-color: black;
}

.zoom {
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>
