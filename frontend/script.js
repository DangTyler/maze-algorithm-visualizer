// remove pixel smoothing
PIXI.settings.SCALE_MODE   = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

const GRID = 317;
const CELL = 2;
const GAP  = 8;

const BOARD_PX = GRID * CELL;
const CANVAS_W = BOARD_PX * 2 + GAP;
const CANVAS_H = BOARD_PX;

const COLOR_GREY  = 0x5a5a5a;
const COLOR_VISIT = 0x00ffff;
const COLOR_PATH  = 0xffff00;

const app = new PIXI.Application({
  width:  CANVAS_W,
  height: CANVAS_H,
  background: 0x111111,
  antialias: false,
  resolution: 1
});
document.getElementById('viewports').appendChild(app.view);

// remove blurring
app.view.style.imageRendering = 'pixelated';

// encode RGB → ABGR as Uint32 for raw buffer use
const toABGR = rgb =>
  0xff000000
  | ((rgb & 0x0000ff) << 16)
  |  (rgb & 0x00ff00)
  | ((rgb & 0xff0000) >>> 16);

// create a board that uses pixel buffer 
function makeBoard(offsetX) {
  const buf = new Uint32Array(GRID * GRID);
  buf.fill(toABGR(COLOR_GREY));

  const gfx = new PIXI.Graphics();
  gfx.position.set(offsetX, 0);
  app.stage.addChild(gfx);

  function paint(x, y, rgb) {
    if (x < 0 || y < 0 || x >= GRID || y >= GRID) return;
    buf[y * GRID + x] = toABGR(rgb);
  }

  return { buf, gfx, paint };
}

const left  = makeBoard(0);
const right = makeBoard(BOARD_PX + GAP);

// re-upload buffer texture every frame 
app.ticker.add(() => {
  let tex = PIXI.Texture.fromBuffer(new Uint8Array(left.buf.buffer), GRID, GRID);
  left.gfx.clear()
         .beginTextureFill({ texture: tex, matrix: new PIXI.Matrix(CELL,0,0,CELL) })
         .drawRect(0, 0, BOARD_PX, BOARD_PX)
         .endFill();

  tex = PIXI.Texture.fromBuffer(new Uint8Array(right.buf.buffer), GRID, GRID);
  right.gfx.clear()
          .beginTextureFill({ texture: tex, matrix: new PIXI.Matrix(CELL,0,0,CELL) })
          .drawRect(0, 0, BOARD_PX, BOARD_PX)
          .endFill();
});

// event listeners for coloring visited, path, and wall nodes
window.visualizeVisitLeft  = (x, y) => left.paint(x, y, COLOR_VISIT);
window.visualizePathLeft   = (x, y) => left.paint(x, y, COLOR_PATH);
window.visualizeVisitRight = (x, y) => right.paint(x, y, COLOR_VISIT);
window.visualizePathRight  = (x, y) => right.paint(x, y, COLOR_PATH);
window.visualizeWallLeft   = (x, y) => left.paint(x, y, 0x000000);
window.visualizeWallRight  = (x, y) => right.paint(x, y, 0x000000);
