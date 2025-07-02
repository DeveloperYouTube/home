//imports
import {utils} from '../../utilities.js';

//varibles
//const(can't change (e.g. HTML elements and objects))
const username = prompt('Enter your Username');
const screen = document.getElementById('screen');
const pen = screen.getContext('2d', {willReadFrequently: true});
const background = document.body;
const position_text = document.querySelector('.position');
const FPStext = document.querySelector('.FPS');
const death = {
    void: `${username} fell out of the world`,
    incorrectURL: `death.error.404.\${username} broke whilst trying to escape me breaking it for user being in ${url}<br>
    If you want the player back go <a href="${correctURL}">here</a>`,
    FPS_NaN: "death.physics.unstable"
};
const death_screen = document.querySelector('.death_screen');
const death_message = document.querySelector('.deathID');
const pressedKeys = {};
const main_menu = document.querySelector('.main_menu');
const pause_screen = document.querySelector('.pause_screen');
const how2play = document.querySelector('.how2play');
const hotbar = document.querySelector('.hotbar');
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
let playerHP = 20;
let can_player_take_damage = true;
let fly = false;
let inventory = [];
let on_ground = false;
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
let entities = [];

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
                //fly = !fly
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
            ['#00ff00'],
            ['#804000'],
            ['#804000'],
            ['#804000'],
        ],
        solid: [[true]]
    }, 
    1: {
        name: 'Dirt',
        texture: [['#804000']],
        solid: [[true]]
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
        solid: [[true]]
    }, 
    3: {
        name: 'Air',
        texture: [['#00000000']],
        solid: [[false]]
    }, 
    4: {
        name: 'Stone',
        texture: [['#808080']],
        solid: [[true]]
    },
    5: {
        name: 'Bedrock',
        texture: [['#202020']],
        solid: [[true]]
    },
    6: {
        name: 'Water',
        texture: [['#0000f080']],
        solid: [[false]]
    },
    7: {
        name: 'Lava',
        texture: [['#ff6020']],
        solid: [[false]]
    },
    8: {
        name: 'Oak Planks',
        texture: [
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000'],
            ['#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000'],
            ['#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000'],
            ['#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000'],
            ['#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000'],
            ['#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
            ['#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000', '#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080'],
            ['#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000', '#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080'],
            ['#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000', '#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080'],
            ['#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000', '#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080'],
            ['#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000', '#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080'],
            ['#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#804000', '#804000', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080', '#c0a080'],
            ['#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000', '#804000'],
        ],
        solid: [[true]]
    },
    9: {
        name: 'Oak Sapling',
        texture: [
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#40a000ff', '#40a000ff', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#40a000ff', '#40a000ff', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#40a000ff', '#40a000ff', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#40a000ff', '#40a000ff', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#40a000ff', '#40a000ff', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#40a000ff', '#40a000ff', '#00ff0080', '#00ff0080', '#00ff0080', '#00ff0080', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#804000ff', '#804000ff', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#804000ff', '#804000ff', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#804000ff', '#804000ff', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#804000ff', '#804000ff', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#804000ff', '#804000ff', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
            ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#804000ff', '#804000ff', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ],
        solid: [[false]]
    },
    10: {
        name: 'Sand',
        texture: [['#c0a080']],
        solid: [[true]],
        fallingBlockEntity: true
    }
};
const itemIDs = {
    0: blockIDs
}
const block_drops = [
    itemIDs[0][1],
    itemIDs[0][1],
    itemIDs[0][2],
    null,
    itemIDs[0][2],
    null,
    null,
    null,
    itemIDs[0][8],
    itemIDs[0][9],
    itemIDs[0][10]
];
const blockTextureCanvases = {};
function preRenderBlockTextures() {
    for (const blockID in blockIDs) {
        const block = blockIDs[blockID];
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const texture = utils.arrays.scale2Darray_up2(block.texture, 16, 16);

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
const itemTextureCanvases = {};
function preRenderItemTextures() {
    for (const itemID in itemIDs) {
        if (itemIDs.hasOwnProperty((itemID))) {
            if (itemIDs[itemID] != blockIDs) {
                const item = itemIDs[itemID];
                const canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = 16;
                const ctx = canvas.getContext('2d');
                const texture = utils.arrays.scale2Darray_up2(item.texture, 16, 16);
    
                for (let y = 0; y < 16; y++) {
                    for (let x = 0; x < 16; x++) {
                        ctx.fillStyle = texture[y][x];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
                itemTextureCanvases[itemID] = canvas;
            }
        }
    }
}
preRenderItemTextures();

function summon_item_entity (x, y, vx, vy, id, block) {
    if (block) {
        entities.push({
            texture: blockTextureCanvases[id],
            X: x,
            Y: y,
            VX: vx,
            VY: vy,
            code: function () {
                this.VY = this.VY + 512 * delta_time;
                this.VX = this.VX - 8 * this.VX * delta_time;
                this.VY = this.VY - 8 * this.VY * delta_time;
                this.Vdirection = Math.atan2(this.VY, this.VX);
                this.V = utils.math.pythagorean_theorem(this.VX, this.VY);
                this.V = Math.min(this.V, 39.2);
                this.VX = Math.cos(this.Vdirection) * this.V;
                this.VY = Math.sin(this.Vdirection) * this.V;

                const collisionResult = checkCollision(this.X, this.Y, 16, 16, this.VX, this.VY);

                if (collisionResult.collision) {
                    // Resolve the collision
                    if (collisionResult.directionX !== 0) {
                        this.X -= collisionResult.overlapX * collisionResult.directionX;
                        this.VX = 0;
                    }
                    if (collisionResult.directionY !== 0) {
                        this.Y -= collisionResult.overlapY * collisionResult.directionY;
                        this.VY = 0;
                    }
                } else {
                    // Apply velocity if no collision
                    this.X += this.VX * delta_time;
                    this.Y += this.VY * delta_time;
                }

                const drawX = this.X * 32 + offsetX - 16;
                const drawY = this.Y * 32 + offsetY - 32;

                if (drawX + 16 > 0 && drawX < screen.width && drawY + 16 > 0 && drawY < screen.height){
                    pen.drawImage(this.texture, drawX, drawY, 16, 16);
                }

                if (utils.math.range(this.X, playerX) < 24 && utils.math.range(this.Y, playerY) < 24) {
                    entities = entities.filter(entity =>
                        !(entity.X === this.X &&
                        entity.Y === this.Y &&
                        entity.VX === this.VX &&
                        entity.VY === this.VY &&
                        entity.texture === this.texture)
                    );
                    inventory.push({block: id, ammount: 1, max: 64});
                }
            }
        });
    } else {
        entities.push({
            texture: itemTextureCanvases[id],
            X: x,
            Y: y,
            VX: vx,
            VY: vy,
            code: function () {
                this.VY = this.VY + 512 * delta_time;
                this.VX = this.VX - 8 * this.VX * delta_time;
                this.VY = this.VY - 8 * this.VY * delta_time;
                this.Vdirection = Math.atan2(this.VY, this.VX);
                this.V = utils.math.pythagorean_theorem(this.VX, this.VY);
                this.V = Math.min(this.V, 39.2);
                this.VX = Math.cos(this.Vdirection) * this.V;
                this.VY = Math.sin(this.Vdirection) * this.V;

                const collisionResult = checkCollision(this.X, this.Y, 16, 16, this.VX, this.VY);

                if (collisionResult.collision) {
                    // Resolve the collision
                    if (collisionResult.directionX !== 0) {
                        this.X -= collisionResult.overlapX * collisionResult.directionX;
                        this.VX = 0;
                    }
                    if (collisionResult.directionY !== 0) {
                        this.Y -= collisionResult.overlapY * collisionResult.directionY;
                        this.VY = 0;
                    }
                } else {
                    // Apply velocity if no collision
                    this.X += this.VX * delta_time;
                    this.Y += this.VY * delta_time;
                }

                const drawX = this.X * 32 + offsetX - 16;
                const drawY = this.Y * 32 + offsetY - 32;
    
                if (drawX + 16 > 0 && drawX < screen.width && drawY + 16 > 0 && drawY < screen.height){
                    pen.drawImage(this.texture, drawX, drawY, 16, 16);
                }

                if (utils.math.range(this.X, playerX) < 24 && utils.math.range(this.Y, playerY) < 24) {
                    entities = entities.filter(entity =>
                        !(entity.X === this.X &&
                        entity.Y === this.Y &&
                        entity.VX === this.VX &&
                        entity.VY === this.VY &&
                        entity.texture === this.texture)
                    );
                    inventory.push({item: id, ammount: 1, max: 64});
                }
            }
        });
    }
}

block_drops.forEach((element, index) => {
    if (blockIDs[index]) {
        blockIDs[index].drop = function(x, y, id) {
            if (block_drops[index]) {
                summon_item_entity(x, y, 0, 0, id, block_drops[index].solid);
            }
        };
    }
});
const entityIDs = {
    0: itemIDs
};

function load_blocks(x, y) {
    let block_key = `${x}, ${y}`;
    if (!blocks.hasOwnProperty(block_key)) {
        const noiseValue = utils.perlin.generateNoise(x * 0.1, 0, seed) * 10; // Adjust multiplier as needed
        const noiseFloor = Math.round(noiseValue);
        if (y >= noiseFloor) {
            if (y === noiseFloor) {
                blocks[block_key] = 0; // Grass block on top
            } else {
                if (y > noiseFloor + 3 + Math.random()) {
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
        // Break block
        const mouseXrad = Math.cos(mouse_dir);
        const mouseYrad = Math.sin(mouse_dir);

        let selectedBlock = null;

        for (let px = 0; px < 160; px++) {
            const blockX = Math.round((playerX + mouseXrad * px) / 32);
            const blockY = Math.round((playerY + mouseYrad * px) / 32);
            const blockKey = `${blockX}, ${blockY}`;

            if (blocks[blockKey] !== undefined) { // Check if the block exists
                const blockID = blocks[blockKey];
                const blockSolid2D = blockIDs[blockID].solid;

                // Condense the 2D solid array into a 1D array
                const blockSolid1D = blockSolid2D.flat();

                // Check if any part of the block is solid
                if (utils.logic.ors(...blockSolid1D)) {
                    selectedBlock = { x: blockX, y: blockY };
                    break; // Exit loop after selecting a solid block
                }
            }
        }

        if (selectedBlock) {
            blockIDs[blocks[`${selectedBlock.x}, ${selectedBlock.y}`]].drop(selectedBlock.x * 32 - 16, selectedBlock.y * 32 - 16, blocks[`${selectedBlock.x}, ${selectedBlock.y}`]);
            blocks[`${selectedBlock.x}, ${selectedBlock.y}`] = 3;
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
        const blockX = Math.round((playerX + mouseXrad * px) / 32);
        const blockY = Math.round((playerY + mouseYrad * px) / 32);
        const blockKey = `${blockX}, ${blockY}`;
        if (blocks[blockKey] !== undefined) { // Check if the block exists
            const blockID = blocks[blockKey];
            const blockSolid2D = blockIDs[blockID].solid;

            // Condense the 2D solid array into a 1D array
            const blockSolid1D = blockSolid2D.flat();

            // Check if any part of the block is solid
            if (utils.logic.ors(...blockSolid1D)) {
                selectedBlock = { x: blockX, y: blockY };
                break; // Exit loop after selecting a solid block
            }
        }
    }
});

function checkCollision(x, y, sizeX, sizeY, vx, vy, map = blocks, blockInfo = blockIDs, blockSize = 32) {
  const collidingObject = { collision: false };

  // Calculate the bounding box of the moving object
  const objectLeft = x;
  const objectRight = x + sizeX;
  const objectTop = y;
  const objectBottom = y + sizeY;

  // Determine the range of map tiles to check based on the object's potential movement
  const minX = Math.floor(Math.min(objectLeft, objectLeft + vx) / blockSize);
  const maxX = Math.ceil(Math.max(objectRight, objectRight + vx) / blockSize);
  const minY = Math.floor(Math.min(objectTop, objectTop + vy) / blockSize);
  const maxY = Math.ceil(Math.max(objectBottom, objectBottom + vy) / blockSize);

  for (let mapX = minX; mapX <= maxX; mapX++) {
    for (let mapY = minY; mapY <= maxY; mapY++) {
      const mapKey = `${mapX},${mapY}`;
      if (map.hasOwnProperty(mapKey)) {
        const blockId = map[mapKey];
        if (blockInfo.hasOwnProperty(blockId) && blockInfo[blockId].solid && blockInfo[blockId].solid[0][0]) {
          // Calculate the boundaries of the map square
          const tileLeft = mapX * blockSize;
          const tileRight = (mapX + 1) * blockSize;
          const tileTop = mapY * blockSize;
          const tileBottom = (mapY + 1) * blockSize;

          // Check for overlap
          if (objectRight > tileLeft &&
              objectLeft < tileRight &&
              objectBottom > tileTop &&
              objectTop < tileBottom) {
            collidingObject.collision = true;
            collidingObject.tileX = mapX;
            collidingObject.tileY = mapY;
            collidingObject.blockId = blockId;

            // Calculate overlap on each side
            const overlapLeft = objectRight - tileLeft;
            const overlapRight = tileRight - objectLeft;
            const overlapTop = objectBottom - tileTop;
            const overlapBottom = tileBottom - objectTop;

            collidingObject.overlapX = Math.min(overlapLeft, overlapRight);
            collidingObject.overlapY = Math.min(overlapTop, overlapBottom);

            // Determine collision direction to help with resolution
            collidingObject.directionX = 0;
            collidingObject.directionY = 0;

            if (vx > 0 && overlapLeft < overlapRight) {
              collidingObject.directionX = -1; // Colliding from the left
            } else if (vx < 0 && overlapRight < overlapLeft) {
              collidingObject.directionX = 1;  // Colliding from the right
            }

            if (vy > 0 && overlapTop < overlapBottom) {
              collidingObject.directionY = -1; // Colliding from the top
            } else if (vy < 0 && overlapBottom < overlapTop) {
              collidingObject.directionY = 1;  // Colliding from the bottom
            }

            return collidingObject; // Return the first collision found for simplicity
          }
        }
      }
    }
  }

  return collidingObject; // No collision
}

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
                playerVX = -138.144;
            }
            if (is_pressed('d')) {
                playerVX = 138.144;
            }
            if ((!(is_pressed('a') || is_pressed('d'))) || (is_pressed('a') && is_pressed('d'))) {
                playerVX = 0;
            }
            //vertical
            if (!fly) {
                if (is_pressed(' ') && on_ground) {
                    playerVY = -Math.sqrt(81920);
                }
                if (!on_ground) {
                    playerVY = playerVY + 1024 * delta_time;
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

            playerVX = playerVX - 36 * playerVX * delta_time;
            playerVY = playerVY - 8 * playerVY * delta_time;
            const playerVdirection = Math.atan2(playerVY, playerVX);
            let playerV = utils.math.pythagorean_theorem(playerVX ** 2 + playerVY ** 2);
            playerV = Math.min(playerV, 78.4);
            playerVX = Math.cos(playerVdirection) * playerV;
            playerVY = Math.sin(playerVdirection) * playerV;

            const collisionResult = checkCollision(playerX, playerY, 32, 64, playerVX, playerVY);

            if (collisionResult.collision) {
                // Resolve the collision
                if (collisionResult.directionX !== 0) {
                    playerX -= collisionResult.overlapX * collisionResult.directionX;
                    playerVX = 0;
                }
                if (collisionResult.directionY !== 0) {
                    playerY -= collisionResult.overlapY * collisionResult.directionY;
                    playerVY = 0;
                }
            } else {
                // Apply velocity if no collision
                playerX += playerVX * delta_time;
                playerY += playerVY * delta_time;
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
            //entities
            entities.forEach(element => {
                element.behavior.code();
            });
            //draw player
            pen.fillStyle = '#3f8c9f';
            pen.fillRect(offset_centerX - 16, offset_centerY - 32, 32, 64);
    
            // Draw selector around selected block
            if (selectedBlock) {
                pen.strokeStyle = '#000000'; 
                pen.lineWidth = 1 / window.devicePixelRatio * 2;
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
        document.querySelectorAll('.HP canvas').forEach((element, index) => {
            const heart = element.getContext('2d');
            heart.fillStyle = '#000000';
            heart.fillRect(0, 0, element.width, element.height);
            if (Math.ceil(playerHP / 2) >= index) {
                heart.fillStyle = '#ff0000';
                heart.fillRect(2, 2, element.width/2, element.height - 2);
                if (Math.floor(playerHP / 2) >= index) {
                    heart.fillRect(2, 2, element.width - 2, element.height - 2);
                }
            }
        });
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