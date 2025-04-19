const GRID = 320;
const CELL = 2;      // screen pixels per logical cell
const GAP  = 8;      // px between boards

const BOARD_PX = GRID * CELL;
const CANVAS_W = BOARD_PX * 2 + GAP;
const CANVAS_H = BOARD_PX;

const COLOR_GREY  = 0x5a5a5a;
const COLOR_VISIT = 0x00ffff;
const COLOR_PATH  = 0xffff00;

// create Pixi app (v7 legacy)
const app = new PIXI.Application({
  width:  CANVAS_W,
  height: CANVAS_H,
  background: 0x111111
});
document.getElementById('viewports').appendChild(app.view);

// pack RRGGBB → ABGR little‑endian Uint32 for fromBuffer
const toABGR = rgb =>
  0xff000000
  | ((rgb & 0x0000ff) << 16)
  |  (rgb & 0x00ff00)
  | ((rgb & 0xff0000) >>> 16);

// makeBoard builds a pixel buffer + Graphics layer at offsetX
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

// each frame we rebuild the texture from the buffer
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

window.visualizeVisitLeft  = (x, y) => left.paint(x, y, COLOR_VISIT);
window.visualizePathLeft   = (x, y) => left.paint(x, y, COLOR_PATH);
window.visualizeVisitRight = (x, y) => right.paint(x, y, COLOR_VISIT);
window.visualizePathRight  = (x, y) => right.paint(x, y, COLOR_PATH);

// BFS: yield cells by Manhattan‑distance rings
function* bfsSteps() {
  for (let r = 0; r <= (GRID-1)*2; r++) {
    for (let x = 0; x < GRID; x++)
      for (let y = 0; y < GRID; y++)
        if (Math.abs(x) + Math.abs(y) === r)
          yield { x, y, type: 'visited' };
  }
  for (let i = 0; i < GRID; i++) yield { x:i, y:i, type: 'path' };
}

// DFS: diagonal first, then flood the rest
function* dfsSteps() {
  for (let i = 0; i < GRID; i++) yield { x:i, y:i, type: 'visited' };
  for (let x = 0; x < GRID; x++)
    for (let y = 0; y < GRID; y++)
      if (x !== y) yield { x, y, type: 'visited' };
  for (let i = 0; i < GRID; i++) yield { x:i, y:i, type: 'path' };
}

// syncDemo pulls one step from each generator per tick
async function syncDemo() {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const bfsGen = bfsSteps(), dfsGen = dfsSteps();
  let bfsNext = bfsGen.next(), dfsNext = dfsGen.next();

  while (!bfsNext.done || !dfsNext.done) {
    if (!bfsNext.done) {
      const { x, y, type } = bfsNext.value;
      (type === 'visited'
        ? window.visualizeVisitLeft
        : window.visualizePathLeft)(x, y);
      bfsNext = bfsGen.next();
    }
    if (!dfsNext.done) {
      const { x, y, type } = dfsNext.value;
      (type === 'visited'
        ? window.visualizeVisitRight
        : window.visualizePathRight)(x, y);
      dfsNext = dfsGen.next();
    }
    await delay(10); // yield so UI can update
  }
  console.log('🏁 Both complete');
}

syncDemo();
