/*  frontend/script.js  */
/*  =====================================================
    Loads Three.js from jsDelivr (pre‑built ES‑module),
    builds TWO viewports, and exposes visualizeVisit()
    so websocket‑client.js can recolor cells live.
   ===================================================== */

   import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.175.0/build/three.module.js';

   console.log('🚀 script.js loaded');
   
   const GRID  = 10;               // 10 × 10 grid
   const CELL  = 1;
   const cubes = {};               // map "x,y" → cube
   
   /* ------------------------------------------- */
   /*  helper to create one viewport (left/right) */
   /* ------------------------------------------- */
   function addViewport(offsetX) {
     const scene  = new THREE.Scene();
   
     // camera set so the whole grid is visible
     const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
     camera.position.set(GRID / 2 + offsetX, GRID / 2, 30);
     camera.lookAt(GRID / 2 + offsetX, GRID / 2, 0);
   
     const renderer = new THREE.WebGLRenderer();
     renderer.setSize(window.innerWidth / 2, window.innerHeight - 32); // 32 px for status bar
     renderer.setClearColor(offsetX === 0 ? 0x202020 : 0x303030);      // left darker / right lighter
     document.getElementById('viewports').appendChild(renderer.domElement);
   
     /* --- build the flat grid of cubes --- */
     for (let x = 0; x < GRID; x++) {
       for (let y = 0; y < GRID; y++) {
         const cube = new THREE.Mesh(
           new THREE.BoxGeometry(CELL, CELL, 0.1),
           new THREE.MeshBasicMaterial({ color: 0x444444 })             // default grey
         );
         cube.position.set(x + offsetX, y, 0);
         scene.add(cube);
         cubes[`${x + offsetX},${y}`] = cube;                           // store for live updates
       }
     }
   
     return { scene, camera, renderer };
   }
   
   /* ---------- create LEFT (BFS) and RIGHT (DFS placeholder) ---------- */
   const left  = addViewport(0);
   const right = addViewport(15);
   
   /* ---------- simple perpetual draw loop ---------- */
   (function animate() {
     requestAnimationFrame(animate);
     left .renderer.render(left .scene, left .camera);
     right.renderer.render(right.scene, right.camera);
   })();
   
   /* ---------- exposed API for websocket‑client.js ---------- */
   window.visualizeVisit = (x, y) => {
     const cube = cubes[`${x},${y}`];
     if (cube) cube.material.color.set(0x00ffff);   // cyan for “visited”
   };
   
   /* Optionally add this later for path coloring
   window.visualizePath = (x, y) => {
     const cube = cubes[`${x},${y}`];
     if (cube) cube.material.color.set(0xffff00);   // yellow for final path
   };
   */
   