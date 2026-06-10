// @ts-nocheck
import {utils} from '../../../../../utilities.js';
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
const canvas = document.getElementById('screen')
const fpsc = document.getElementById('FPS')
const ctx = canvas.getContext('2d');
const death_screen = document.getElementById('death_screen');
death_screen.style.display = "none";
const pause_screen = document.getElementById('pause_screen');
pause_screen.style.display = "none";
const textureCache = {};
const blockSize = 32;
// Velocities (Current speed in blocks per second)
let vx = 0;
let vy = 0;

// Accelerations (Rate of speed change per second)
let ax = 0;
let ay = 0;

// Minimum Speed Caps (Prevents falling or moving left too fast)
const minvx = -8;
const minvy = -24; // High terminal velocity downward for falling

// Maximum Speed Caps (Prevents flying or moving right too fast)
const maxvx = 8;
const maxvy = 8;

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
function draw() {
    if (!ctx) return;

    // 1. Clear Screen
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 2. Loop through your blocks
    for (let key in blocks) {
        const blockId = blocks[key];
        const blockData = blockDATA[blockId]; 
        const [bx, by] = key.split(",").map(Number);

        // Check if the block has an image path string
        if (blockData && blockData.image) {
            const img = getTexture(blockData.image);

            // CAMERA MATH
            const screenX = (bx - playerX) * blockSize + centerX;
            const screenY = centerY - (by - playerY) * blockSize;

            // CULLING (Only draw if it's on screen)
            if (screenX > -blockSize && screenX < canvas.width + blockSize &&
                screenY > -blockSize && screenY < canvas.height + blockSize) {
                
                // 3. DRAW AND SCALE
                // ctx.drawImage(image, x, y, width, height)
                ctx.drawImage(
                    img, 
                    Math.round(screenX - blockSize / 2), 
                    Math.round(screenY - blockSize / 2), 
                    32, 
                    32
                );
            }
        }
    }

    // 4. Draw Player (Fixed at screen center)
    ctx.fillStyle = "#008080";
    ctx.fillRect(centerX - 16, centerY - 32, 32, 64);
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
    const dt = (performance.now() - lastTime) / 1000;
    lastTime = performance.now();
    if (fpsc) {
        fpsc.innerText = "FPS: " + Math.round(1 / dt);
    }
    // 1. Update your variables (physics, player movement, etc.)
    update();

    // 2. Draw everything to the screen
    draw();

    // 3. Tell the browser to run this function again before the next frame
    requestAnimationFrame(gameLoop);
}