// @ts-nocheck
import {utils} from '../../../../../utilities.js';
console.log('v1');
/*
OBJECT OF ALL BLOCKS
LOREM IPSUM
FILLER TO MAKE MOER NOTICABLE
*/
const blockDATA = {
    0: {
        name: 'Air',
        resistance: 0,
        light: 0,
        solid: [[false]],
        image: "../../../../../../nothing.png"
    },
    1: {
        name: 'Block of Grass',
        resistance: 0.6,
        light: 0,
        solid: [[true]],
        image: "../../../../../../grass_block.png",
        hardness: 0.6,
        tool: 's',
        drop: [1, 1, 1, 1, 1, 1, 1, 1]
    },
    2: {
        name: 'Cobbled Stone',
        resistance: 6,
        light: 0,
        solid: [[true]],
        image: "../../../../../../2dc/cobblestone.png",
        hardness: 2,
        tool: 'p',
        drop: [null, 2, 2, 2, 2, 2, 2, 2]
    }
}
/*
FILLER TO MAKE MORE NOTICABLE
LOREM IPSUM DOREM
OBJECT OF ALL BLOCK DATA
*/


//variables 
const savedData = localStorage.getItem('2DCsinglePworldJSON');

let worldINIT;

if (savedData !== null) {
    worldINIT = JSON.parse(savedData);
}
const world_name = worldINIT.name;
const game_mode = worldINIT.game_mode;
const difficulty = worldINIT.difficulty;
const seed = worldINIT.seed;
const flat = worldINIT.flat;
let playerX = worldINIT.x;
let playerY = worldINIT.y;
let blocks = worldINIT.blocks;
let playerHP = worldINIT.HP;
let inventory = worldINIT.inventory;
let entities = worldINIT.entities;
const mountain = Number(worldINIT.m);
const sea= Number(worldINIT.o);
const smoothness = Number(worldINIT.s);
const height = mountain-sea
const canvas = document.getElementById('screen');
const fpsc = document.getElementById('FPS');
const positionc = document.getElementById('position');
const ctx = canvas.getContext('2d');
const death_screen = document.getElementById('death_screen');
death_screen.style.display = "none";
const pause_screen = document.getElementById('pause_screen');
pause_screen.style.display = "none";
const textureCache = {};
const blockSize = 32;
let dt;
let sky = 510;
// Velocities (Current speed in blocks per second)
let vx = 0;
let vy = 0;

// Accelerations (Rate of speed change per second)
let ax = 0;
const ay = 32;

// Minimum Speed Caps (Prevents flying or moving left too fast)
let minvx = -8;
let minvy = 0;

// Maximum Speed Caps (Prevents falling or moving right too fast)
let maxvx = 0;
const maxvy = 78.4;

function getTexture(path) {
    // If we've already loaded this image, just return it
    if (textureCache[path]) {
        return textureCache[path];
    }

    // If not, create it and store it
    const img = new Image();
    img.src = path;
    textureCache[path] = img;
    return img;
}

function loadblock (/** @type {number} */x,/** @type {number} */y) {
    let noiseValue = -61
    if(!flat){noiseValue = utils.perlin.noise(x/smoothness, seed) * height + sea;}
    const noiseFloor = Math.round(noiseValue);
    if (noiseFloor==y){
        return 1;
    } else if (noiseFloor >= y) {
        return 2
    } else {return 0}
}
function unloadblock (/** @type {number} */x,/** @type {number} */y) {
    let noiseValue = -61
    let block = null;
    if(!flat){noiseValue = utils.perlin.noise(x/smoothness, seed) * height + sea;}
    const noiseFloor = Math.round(noiseValue);
    if (noiseFloor==y){
        block = 1;
    } else if (noiseFloor >= y) {
        block = 2
    } else {block = 0}
    if (blocks[`${x},${y}`] == block) {delete blocks[`${x},${y}`]}
}
function load_block (/** @type {number} */x,/** @type {number} */y) {
    if (!blocks[x+","+y]){blocks[x+","+y] = loadblock(x,y);}
}
function load_blocks (/** @type {number} */x,/** @type {number} */y,/** @type {number} */X,/** @type {number} */Y) {
    for (let i = x; i <= X; i++) {
        for (let j=y; j<=Y; j++){
            load_block(i,j);
        }
    }
}
function unload_blocks (/** @type {number} */x,/** @type {number} */y,/** @type {number} */X,/** @type {number} */Y) {
    for (let i = x; i <= X; i++) {
        for (let j=y; j<=Y; j++){
            unloadblock(i,j);
        }
    }
}
let crtl = false;
// --- 'A' KEY (Move Left) ---
window.addEventListener('keydown', (e) => {
    if ((e.key !== 'a' && e.key !== 'A') || e.repeat) return;
    ax = -10;
    minvx = crtl ? -5.612 : -4.317;
});
window.addEventListener('keyup', (e) => {
    if (e.key !== 'a' && e.key !== 'A') return;
    maxvx = 0;
    ax = 10;
});

// --- 'D' KEY (Move Right) ---
window.addEventListener('keydown', (e) => {
    if ((e.key !== 'd' && e.key !== 'D') || e.repeat) return;
    ax = 10;
    maxvx = crtl ? 5.612 : 4.317; 
});
window.addEventListener('keyup', (e) => {
    if (e.key !== 'd' && e.key !== 'D') return;
    ax = -10;
    minvx = 0; 
});

window.addEventListener('keydown', (e) => {
    // Check if the key being pressed is Control OR Command
    if (e.key !== 'Control' && e.key !== 'Meta') return;
    if (e.repeat) return;
    crtl = true
    minvx = minvx * (5.612/4.317);
    maxvx = maxvx * (5.612/4.317);
});

window.addEventListener('keyup', (e) => {
    if (e.key !== 'Control' && e.key !== 'Meta') return;
    crtl = false
    minvx = minvx * (4.317/5.612);
    maxvx = maxvx * (4.317/5.612);
});
function draw() {
    // 1. Reset Frame
    ctx.fillStyle = `rgb(0, ${Math.max(0, sky - 255)}, ${Math.min(255, sky)})`
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Camera math centered around player pixel space
    let cameraX = (playerX * blockSize) - (canvas.width / 2);
    let cameraY = (playerY * blockSize) - (canvas.height / 2);

    // 3. Calculate exactly which block grid coordinates are visible on screen
    let startX = Math.floor(cameraX / blockSize) - 2;
    let endX   = Math.ceil((cameraX + canvas.width) / blockSize) + 2;
    let startY = Math.floor(cameraY / blockSize) - 2;
    let endY   = Math.ceil((cameraY + canvas.height) / blockSize) + 2;

    // 4. Loop ONLY through the visible screen grid cells
    for (let bx = startX; bx <= endX; bx++) {
        for (let by = startY; by <= endY; by++) {
            
            // Generate the exact string key your dictionary uses
            let blockKey = bx + "," + by; 
            const blockId = blocks[blockKey];

            // NEW: If the key doesn't exist or is explicitly unloaded, draw it BLACK
            if (blockId === undefined || blockId === null) {
                ctx.fillStyle = "#000000"; // Black void for unloaded chunks
                ctx.fillRect(
                    Math.round((bx * blockSize) - cameraX), 
                    Math.round((by * blockSize) - cameraY), 
                    blockSize, 
                    blockSize
                );
                continue; // Skip the rest of the loop for this block cell
            }

            // Skip drawing completely if it's explicitly generated as Air
            if (blockId === 0) continue;

            // Render existing terrain blocks
            const blockInfo = blockDATA[blockId];
            if (blockInfo) {
                const img = getTexture(blockInfo.image);
                
                if (img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(
                        img, 
                        Math.round((bx * blockSize) - cameraX), 
                        Math.round((by * blockSize) - cameraY), 
                        blockSize, 
                        blockSize
                    );
                }
            }
        }
    }

    // 5. Render Teal (#008080) Player
    ctx.fillStyle = "#008080";
    ctx.fillRect(
        Math.round((playerX * blockSize) - cameraX),
        Math.round((playerY * blockSize) - cameraY),
        blockSize,      
        blockSize * 2   
    );
}
function update() {
    load_blocks(Math.round(playerX) - Math.ceil(canvas.width / 64) - 2, Math.round(playerY) - Math.ceil(canvas.height / 64) - 2, Math.round(playerX) + Math.ceil(canvas.width / 64) + 2, Math.round(playerY) + Math.ceil(canvas.height / 64) + 2);
    vx += ax * dt;
    vy += ay * dt;
    // Clamp Horizontal Velocity
    vx = Math.max(minvx, Math.min(vx, maxvx));

    // Clamp Vertical Velocity
    vy = Math.max(minvy, Math.min(vy, maxvy));
    playerX += vx * dt;
    playerY += vy * dt;
}
let lastTime = 0;
function gameLoop() {
    dt = (performance.now() - lastTime) / 1000;
    lastTime = performance.now();
    if (fpsc) {
        fpsc.innerText = "FPS: " + Math.round(1 / dt);
    }
    if (positionc) {
        positionc.innerText = "Position: " + Math.round(playerX) + ", " + Math.round(playerY);
    }
    // 1. Update your variables (physics, player movement, etc.)
    update();

    // 2. Draw everything to the screen
    draw();

    // 3. Tell the browser to run this function again before the next frame
    requestAnimationFrame(gameLoop);
}