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
        solid: [[false]]
    },
    1: {
        name: 'Block of Grass',
        resistance: 0.6,
        light: 0,
        solid: [[true]]
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
const screen = document.getElementById('screen')
const fpsc = document.getElementById('FPS')

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
    // 1. Clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Calculate the camera bounds (which blocks are actually on screen)
    const halfWidth = (canvas.width / 2) / blockSize;
    const halfHeight = (canvas.height / 2) / blockSize;

    const startX = Math.floor(playerX - halfWidth);
    const endX = Math.ceil(playerX + halfWidth);
    const startY = Math.floor(playerY - halfHeight);
    const endY = Math.ceil(playerY + halfHeight);

    // 3. Loop only through visible coordinates
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const blockType = blocks[x + "," + y];

            if (blockType && blockType !== 0) {
                // Calculate screen position
                // We multiply by blockSize to convert "Grid" units to "Pixel" units
                const screenX = (x - playerX) * blockSize + (canvas.width / 2);
                
                // In Canvas, Y grows downward, so we subtract (y - playerY) 
                // if you want higher Y numbers to be "up" in the world.
                const screenY = (canvas.height / 2) - (y - playerY) * blockSize;

                drawBlock(screenX, screenY, blockType);
            }
        }
    }

    // 4. Draw the player in the center
    drawPlayer(canvas.width / 2, canvas.height / 2);
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