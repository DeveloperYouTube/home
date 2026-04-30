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
        image: "../../../../../../grass_block.png"
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
// This will store our actual Image objects, keyed by their file path
const textureCache = {};

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
function load_chunk (/** @type {number} */x,/** @type {number} */y) {
    load_blocks(Math.floor(x)*16,Math.floor(y)*16,Math.ceil(x)*16,Math.ceil(y)*16)
}
function load_start () {
    for (let i = -8; i <= 8; i++) {
        for (let j=-8; j<=8; j++){
            load_chunk(i,j);
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
        const blockData = blocks[key]; 
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
    ctx.fillStyle = "red";
    ctx.fillRect(centerX - 10, centerY - 20, 20, 40);
}
function update() {

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