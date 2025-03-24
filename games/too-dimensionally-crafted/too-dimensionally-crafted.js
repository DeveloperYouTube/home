/*
Made by: 
 _______________________________________________
|    ______      _______    __        __        | ™
|   |  ___  \   |  _____|   \ \      / /        |
|   | |   |  |  | |___       \ \    / /         |
|   | |   |  |  |  ___|       \ \  / /          |
|   | |___|  |  | |_____       \ \/ /    ___    |
|   |_______/   |_______|       \__/    /   \   |
|_______________________________________\___/___|
*/

//safty
const correctURL = "https://developeryoutube.github.io/home/games/too-dimensionally-crafted/";
const url = window.location.href;
let in_correctURL = true;
if (url !== correctURL) {
    in_correctURL = confirm(`The URL\n${url}\nis invalid and might break the game.\nPlease go to\n${correctURL}\nfor no risk of the game breaking.`);
    if (in_correctURL) {
        window.location.href = correctURL;
    };
};

//imports
import {utils} from '../../utilities.js';

//varibles
//const(can't change (e.g. HTML elements and objects))
const username = prompt('Enter your Username');
const seed = Math.random() * 10000;
const screen = document.getElementById('screen');
const pen = screen.getContext('2d');
const background = document.body;
const position_text = document.querySelector('.position');
const FPStext = document.querySelector('.FPS');
const death = {
    void: `${username} fell out of the world`,
    incorrectURL: `death.error.404.\${username} broke whilst trying to escape me breaking it for user being in ${url}<br>
    If you want the player back go <a href="${correctURL}">here</a>`,
    FPS_NaN: "death.physics.unstable",
    not_subscribed: `I destroyed the player as user wasn't subscribed to the developer of me`
};
const death_screen = document.querySelector('.death_screen');
const death_message = document.querySelector('.deathID');
const pressedKeys = {};
const main_menu = document.querySelector('.main_menu');
const pause_screen = document.querySelector('.pause_screen');
const how2play = document.querySelector('.how2play');
//let (can change (e.g. player stuff))
//offsets
let offset_centerX;
let offset_centerY;
let offsetX;
let offsetY;
//player stuff
let respawnX = 0;
let respawnY = -32;
let playerX = respawnX;
let playerY = respawnY;
let playerVY = 0;
let playerVX = 0;
let player_movement = 0;
let playerHP = 20;
let can_player_take_damage = true;
let fly = false;
let inventory = []
//fps and delta time
let FPS = 0;
let last_frame = 0;
let delta_time = 0;
//background things
let light = 15;
//mouse
let mouseX = 0;
let mouseY = 0;
let mouse_dir = 0;
//fly mode checker
let spaceBarPresses = 0;
let lastPressTime = 0;
//other
let death_reason;
let game_running = false;

main_menu.style.display = 'flex';
pause_screen.style.display = 'none';
death_screen.style.display = 'none';
how2play.style.display = 'none';
//key press logic
document.addEventListener('keydown', (event) => {
    pressedKeys[event.key] = true; 
    if (event.key === 'Escape') {
        if (game_running) { // Only show pause menu if the game is running
            pause_screen.style.display = 'flex';
        }
    };
});
document.addEventListener('keyup', (event) => {
    pressedKeys[event.key] = false;
    if (event.key === ' ') {
        const currentTime = Date.now();

        if (currentTime - lastPressTime <= 500) { 
            spaceBarPresses++;
            if (spaceBarPresses >= 2) {
                fly = !fly
                spaceBarPresses = 0;
                lastPressTime = currentTime; 
            }
        } else {
            spaceBarPresses = 1; 
        }
        lastPressTime = currentTime; 
    }
});
function is_pressed(key) {
    return pressedKeys[key];
}

//resizeing and centering
function resizeCanvas() {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
    offset_centerX = screen.width / 2;
    offset_centerY = screen.height / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

//blocks
let blocks = {};
const blockIDs = {
    0: {
        name: 'Grass Block',
        texture: [
            ['#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00'],
            ['#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00'],
            ['#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00', '#00ff00'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
        ],
        drop: 1
    }, 
    1: {
        name: 'Dirt',
        texture: [
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
        ],
        drop: 1
    }, 
    2: {
        name: 'Cobblestone',
        texture: [
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080'],
            ['#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080'],
            ['#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040'],
            ['#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040'],
            ['#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080'],
            ['#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#808080', '#808080', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#404040', '#404040', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
        ],
        drop: 2
    }, 
    3: {
        name: 'Air',
        texture: [
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ],
    }, 
    4: {
        name: 'Stone',
        texture: [
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
            ['#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080', '#808080'],
        ],
        drop: 2
    }
};
const itemIDs = {
    0: blockIDs
}

function load_blocks(x, y) {
        let block_key = `${x}, ${y}`;
            if (!blocks.hasOwnProperty(block_key)) {
                const noiseValue = utils.perlin.generateNoise(x * 0.1, 0, seed) * 10; // Adjust multiplier as needed
                const noiseFloor = Math.round(noiseValue);
                if (y >= noiseFloor) {
                    if (y === noiseFloor) {
                        blocks[block_key] = 0; // Grass block on top
                    } else {
                        if (y > noiseFloor + 3) {
                            blocks[block_key] = 4;
                        } else {
                            blocks[block_key] = 1;
                        }
                    }
                } else {
                    blocks[block_key] = 3; // Air block above
                }
            }
}

const blockTextureCanvases = {};

function preRenderBlockTextures() {
    for (const blockID in blockIDs) {
        const block = blockIDs[blockID];
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const texture = block.texture;

        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                ctx.fillStyle = texture[y][x];
                ctx.fillRect(x * 2, y * 2, 2, 2);
            }
        }
        blockTextureCanvases[blockID] = canvas;
    }
}

preRenderBlockTextures();

function render_blocks() {
    for (const [key, blockID] of Object.entries(blocks)) {
        const [x, y] = key.split(', ').map(Number);
        const drawX = x * 32 + offsetX - 16;
        const drawY = y * 32 + offsetY - 32;

        if (drawX + 32 > 0 && drawX < screen.width && drawY + 32 > 0 && drawY < screen.height){
            pen.drawImage(blockTextureCanvases[blockID], drawX, drawY);
        }
    }
}

//mouse things(for player controls)
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - offset_centerX;
    mouseY = event.clientY - offset_centerY;
    mouse_dir = Math.atan2(mouseY, mouseX);
});
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        //break block
        const mouseXrad = Math.cos(mouse_dir);
        const mouseYrad = Math.sin(mouse_dir);

        let selectedBlock = null;

        for (let px = 0; px < 160; px++) {
            if (blocks[`${Math.round((playerX + mouseXrad * px) / 32)}, ${Math.round((playerY + mouseYrad * px) / 32)}`] !== 3) {
                selectedBlock = {
                    x: Math.round((playerX + mouseXrad * px) / 32), 
                    y: Math.round((playerY + mouseYrad * px) / 32)
                }
                break;
            }
        }

        if (selectedBlock) {
            blocks[`${selectedBlock.x}, ${selectedBlock.y}`] = 3;
            if (selectedBlock === 0) {
                inventory.push();
            }
        }
    }
});

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    //place block
    const mouseXrad = Math.cos(mouse_dir);
    const mouseYrad = Math.sin(mouse_dir);

    let selectedBlock = null;

    for (let px = 0; px < 160; px++) {
        if (blocks[`${Math.round((playerX + mouseXrad * px) / 32)}, ${Math.round((playerY + mouseYrad * px) / 32)}`] !== 3) {
            selectedBlock = {
                x: Math.round((playerX + mouseXrad * (px - 1)) / 32), 
                y: Math.round((playerY + mouseYrad * (px - 1)) / 32)
            }
            break;
        }
    }

    if (selectedBlock) {
        blocks[`${selectedBlock.x}, ${selectedBlock.y}`] = 2;
    }
});

if (!in_correctURL) {
    playerHP = 0;
    death_reason = death.incorrectURL
};

async function game_update() {
    delta_time = (performance.now() - last_frame) / 1000;
    if (!in_correctURL) {
        delta_time = NaN;
    };
    FPS = 1 / delta_time;
    last_frame = performance.now();
    if (game_running) {
        FPStext.textContent = `FPS : ${Math.round(FPS)}`;
    
        // Game logic
        background.style.backgroundColor = `rgb(0, ${Math.round(Math.max(0, (Math.sin(performance.now()/600000+1)*255) - 255))}, ${Math.round(Math.min(255, Math.sin(performance.now()/600000+1)*255))})`;
        light = Math.sin(performance.now()/600000+1)*7.5;
        if (playerHP > 0) {
            offsetX = offset_centerX - playerX;
            offsetY = offset_centerY - playerY;
            position_text.textContent = `Position: ${Math.round(playerX / 32)} ${0 - (Math.ceil((playerY - 1) / 32))}`;
            
            //movement
            //horisontal
            if (is_pressed('a')) {
                player_movement = -138.144;
            }
            if (is_pressed('d')) {
                player_movement = 138.144;
            }
            if ((!(is_pressed('a') || is_pressed('d'))) || (is_pressed('a') && is_pressed('d'))) {
                player_movement = 0;
            }
            //vertical
            if (!fly) {
                if (is_pressed(' ') && 
                    (blocks[`${Math.floor(playerX / 32)}, ${Math.floor(playerY / 32) + 1}`] !== 3 ||
                    blocks[`${Math.ceil(playerX / 32)}, ${Math.floor(playerY / 32) + 1}`] !== 3)) {
                    playerVY = -Math.sqrt(40960);
                }
                if (playerVY < 2240) {
                    playerVY = playerVY + 512 * delta_time;
                } else {
                    playerVY = playerVY + 256 * delta_time;
                }
            } else {
                playerVY = 0;
                if (is_pressed(' ')) {
                    playerVY = playerVY - 138.144;
                }
                if (is_pressed('Shift')) {
                    playerVY = playerVY + 138.144;
                }
            }
            playerVX = player_movement + ((player_movement - playerVX) / 2);
            playerX = playerX + playerVX * delta_time;
            playerY = playerY + playerVY * delta_time;
    
            //collisions
            //horisontally
            //left
            if (blocks[`${Math.ceil(playerX / 32) - 1}, ${Math.ceil(playerY / 32) - 1}`] !== 3 ||
                blocks[`${Math.ceil(playerX / 32) - 1}, ${Math.floor(playerY / 32)}`] !== 3) {
                playerX = Math.ceil(playerX / 32) * 32;
                playerVX = Math.min(playerVX, 0);
            }
            //right
            if (blocks[`${Math.floor(playerX / 32) + 1}, ${Math.ceil(playerY / 32) - 1}`] !== 3 ||
                blocks[`${Math.floor(playerX / 32) + 1}, ${Math.floor(playerY / 32)}`] !== 3) {
                playerX = Math.floor(playerX / 32) * 32;
                playerVX = Math.max(playerVX, 0);
            }
            //vertically
            //bottom
            if (blocks[`${Math.floor(playerX / 32)}, ${Math.floor(playerY / 32) + 1}`] !== 3 ||
                blocks[`${Math.ceil(playerX / 32)}, ${Math.floor(playerY / 32) + 1}`] !== 3) {
                playerY = Math.floor(playerY / 32) * 32;
                playerVY = Math.min(playerVY, 0);
            }
            //top
            if (blocks[`${Math.floor(playerX / 32)}, ${Math.ceil(playerY / 32) - 2}`] !== 3 ||
                blocks[`${Math.ceil(playerX / 32)}, ${Math.ceil(playerY / 32) - 2}`] !== 3) {
                playerY = Math.ceil(playerY / 32) * 32;
                playerVY = Math.max(playerVY, 0);
            }
    
            for (let i = 0; i < Math.round(window.innerWidth / 32) + 1; i++) {
                for (let j = 0; j < Math.round(window.innerHeight / 32) + 1; j++) {
                    load_blocks(Math.round(playerX / 32) + i - Math.round(window.innerWidth / 64), Math.round(playerY / 32) + j - Math.round(window.innerHeight / 64));
                }
            }
    
            // Calculate mouse direction vector
            const mouseXrad = Math.cos(mouse_dir);
            const mouseYrad = Math.sin(mouse_dir);
    
            let selectedBlock = null;
    
            for (let px = 0; px < 160; px++) {
                if (blocks[`${Math.round((playerX + mouseXrad * px) / 32)}, ${Math.round((playerY + mouseYrad * px) / 32)}`] !== 3) {
                    selectedBlock = {
                        x: Math.round((playerX + mouseXrad * px) / 32), 
                        y: Math.round((playerY + mouseYrad * px) / 32)
                    }
                    break;
                }
            }
    
            // Clear the canvas before drawing anything
            pen.clearRect(0, 0, screen.width, screen.height); 
            render_blocks();
            //draw player
            pen.fillStyle = '#3f8c9f';
            pen.fillRect(offset_centerX - 16, offset_centerY - 64, 32, 64);
    
            // Draw selector around selected block
            if (selectedBlock) {
                pen.strokeStyle = '#000000'; 
                pen.lineWidth = window.devicePixelRatio;
                pen.beginPath();
                pen.rect((selectedBlock.x * 32) + offsetX - 16, ((selectedBlock.y - 1) * 32) + offsetY, 32, 32); 
                pen.closePath(); 
                pen.stroke();
            }
            if (can_player_take_damage) {
                if (playerY > 4096) {
                    death_reason = death.void;
                    playerHP = playerHP - 2.5;
                    can_player_take_damage = false;
                    pen.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    pen.fillRect(0, 0, screen.width, screen.height);
                    utils.pause(100);
                    setTimeout(() => {
                        can_player_take_damage = true;
                    }, 150);
                }
                if (isNaN(FPS)) {
                    death_reason = death.FPS_NaN;
                    playerHP = playerHP - Math.random() * 20;
                    can_player_take_damage = false;
                    pen.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    pen.fillRect(0, 0, screen.width, screen.height);
                    utils.pause(100);
                    setTimeout(() => {
                        can_player_take_damage = true;
                    }, 150);
                }
            }
        }
        if (playerHP <= 0) {
            death_message.innerHTML = death_reason;
            death_screen.style.display = 'flex';
        } else {
            death_screen.style.display = 'none';
        }
    }
    requestAnimationFrame(game_update);
}

game_update();

//stuff for html things
window.respawnPlayer = function() {
    playerHP = 20;
    playerX = respawnX;
    playerY = respawnY;
    playerVY = 0;
    playerVX = 0;
};

window.play = function() {
    game_running = true;
    const savedGameData = localStorage.getItem('gameData');
    if (savedGameData) {
        const gameData = JSON.parse(savedGameData);
        blocks = gameData.blocks;
        playerX = gameData.playerX;
        playerY = gameData.playerY;
        playerHP = gameData.playerHP;
    }
    main_menu.style.display = 'none';
    pause_screen.style.display = 'none';
};
window.save = function() {
    if (death_screen.style.display === 'flex') {
        window.respawnPlayer();
    };
    const gameData = {
        blocks: blocks,
        playerX: playerX,
        playerY: playerY,
        playerHP: playerHP,
    };
    localStorage.setItem('gameData', JSON.stringify(gameData));
    main_menu.style.display = 'flex';
    pause_screen.style.display = 'none';
    death_screen.style.display = 'none';
    how2play.style.display = 'none';
};

window.new = function() {
    if (confirm("Creating a new world will erase your current progress. Are you sure?")) {
        window.respawnPlayer();
        const gameData = {
            blocks: {},
            playerX: playerX,
            playerY: playerY,
            playerHP: playerHP,
        };
        localStorage.setItem('gameData', JSON.stringify(gameData));
        alert('Created!');
        window.play();
    } else {
        alert('Canceled!');
    }
}