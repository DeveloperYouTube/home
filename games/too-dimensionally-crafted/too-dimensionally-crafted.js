/*oooooooo.                                    .o.       oooo                        
`888'   `Y8b                                  .888.      `888                        
 888      888  .ooooo.  oooo    ooo          .8"888.      888   .ooooo.  oooo    ooo 
 888      888 d88' `88b  `88.  .8'          .8' `888.     888  d88' `88b  `88b..8P'  
 888      888 888ooo888   `88..8'          .88ooo8888.    888  888ooo888    Y888'    
 888     d88' 888    .o    `888'          .8'     `888.   888  888    .o  .o8"'88b   
o888bood8P'   `Y8bod8P'     `8'          o88o     o8888o o888o `Y8bod8P' o88'   88*/

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
let player_movement = 0;
let playerHP = 20;
let can_player_take_damage = true;
let fly = false;
let inventory = [];
let player_top;
let player_bottom;
let player_left;
let player_right;
let can_jump = false;
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
    
    player_left = offset_centerX - 16;
    player_top = offset_centerY - 32;
    player_right = player_left + 32;
    player_bottom = player_top + 64;
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
        solid: [
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        ]
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
        solid: [
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        ]
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
        solid: [
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        ]
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
        solid: [
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        ]
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
        solid: [
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        ]
    },
    5: {
        name: 'Bedrock',
        texture: [
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
            ['#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020', '#202020'],
        ],
        solid: [
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        ]
    },
    6: {
        name: 'Water',
        texture: [
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
            ['#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080', '#0000f080'],
        ],
        solid: [
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        ]
    },
    7: {
        name: 'Lava',
        texture: [
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
            ['#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020', '#ff6020'],
        ],
        solid: [
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        ]
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
        solid: [
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        ]
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
        solid: [
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        ]
    },
    10: {
        name: 'Sand',
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
        solid: [
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        ],
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
    itemIDs[0][9]
];
block_drops.forEach((element, index) => {
    if (blockIDs[index]) {
        blockIDs[index].drop = function(x, y) {
            entities.push({
                texture: this.texture,
                behavior: {
                    X: x,
                    Y: y,
                    VY: 0,
                    VX: 0,
                    code: function() {
                        this.VY += 512 * delta_time;
                        this.X += this.VX * delta_time;
                        this.Y += this.VY * delta_time;
                        const collision = checkCollisions(this.X, this.Y, 16, 16);
                        if (collision.collided) {
                            const resolvedPosition = resolveCollision(this.X, this.Y, 16, 16, collision.collisionX, collision.collisionY, this.VX, this.VY);
                            this.X = resolvedPosition.x;
                            this.Y = resolvedPosition.y;
                            this.VX = resolvedPosition.vx;
                            this.VY = resolvedPosition.vy;
                        }
                        const drawX = this.X - playerX;
                        const drawY = this.Y - playerY;
                        if (drawX + 16 > 0 && drawX < screen.width && drawY + 16 > 0 && drawY < screen.height){
                            for (let y = 0; y < 16; y++) {
                                for (let x = 0; x < 16; x++) {
                                    pen.fillStyle = texture[y][x];
                                    pen.fillRect(x + drawX, y + drawY, 1, 1);
                                }
                            }
                        }
                    }
                }
            });
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
                const blockSolid = blockIDs[blockID].solid;

                // Check if any part of the block is solid
                let isSolid = false;
                for (let y = 0; y < 16; y++) {
                    for (let x = 0; x < 16; x++) {
                        if (blockSolid[y][x]) {
                            isSolid = true;
                            break; // Exit inner loop if solid pixel found
                        }
                    }
                    if (isSolid) {
                        break; // Exit outer loop if solid pixel found
                    }
                }

                if (isSolid) {
                    selectedBlock = { x: blockX, y: blockY };
                    break; // Exit loop after selecting a solid block
                }
            }
        }

        if (selectedBlock) {
            blockIDs[blocks[`${selectedBlock.x}, ${selectedBlock.y}`]].drop(selectedBlock.x * 32 - 16, selectedBlock.y * 32 - 16);
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

function checkCollisions(entityX, entityY, entityWidth, entityHeight) {
    const entityLeft = entityX;
    const entityTop = entityY;
    const entityRight = entityX + entityWidth;
    const entityBottom = entityY + entityHeight;

    const blockLeft = Math.floor(entityLeft / 32);
    const blockTop = Math.floor(entityTop / 32);
    const blockRight = Math.ceil(entityRight / 32);
    const blockBottom = Math.ceil(entityBottom / 32);

    let onGround = false;
    let collided = false;
    let collisionX = 0;
    let collisionY = 0;

    for (let x = blockLeft; x < blockRight; x++) {
        for (let y = blockTop; y < blockBottom + 1; y++) {
            const blockKey = `${x}, ${y}`;
            const blockID = blocks[blockKey];
            if (blockID !== 3 && blockID !== undefined) {
                const blockTexture = blockIDs[blockID].texture;
                const blockSolid = blockIDs[blockID].solid;
                const blockX = x * 32;
                const blockY = y * 32;

                if (entityRight > blockX && entityLeft < blockX + 32 && entityBottom >= blockY && entityTop < blockY + 32) {
                    if (checkPixelCollision(entityLeft, entityTop, entityRight, entityBottom, blockX, blockY, blockTexture, blockSolid)) {
                        collided = true;
                        collisionX = blockX;
                        collisionY = blockY;

                        if (Math.abs(entityBottom - blockY) < 1) {
                            onGround = true;
                        }
                    }
                }
            }
        }
    }

    return {
        collided: collided,
        collisionX: collisionX,
        collisionY: collisionY,
        onGround: onGround,
    };
}

function checkPixelCollision(entityLeft, entityTop, entityRight, entityBottom, blockX, blockY, blockTexture, blockSolid) {
    for (let py = Math.max(0, entityTop - blockY); py < Math.min(32, entityBottom - blockY); py++) {
        for (let px = Math.max(0, entityLeft - blockX); px < Math.min(32, entityRight - blockX); px++) {
            const blockColor = blockTexture[Math.floor(py / 2)][Math.floor(px / 2)];
            const solidX = Math.floor(px / 2);
            const solidY = Math.floor(py / 2);
            if (blockColor !== '#00000000' && blockSolid[solidY][solidX]) {
                return true;
            }
        }
    }
    return false;
}

// Function to resolve collision
function resolveCollision(entityX, entityY, entityWidth, entityHeight, blockX, blockY, entityVX, entityVY) {
    const entityLeft = entityX;
    const entityTop = entityY;
    const entityRight = entityX + entityWidth;
    const entityBottom = entityY + entityHeight;

    const overlapX = Math.min(entityRight, blockX + 32) - Math.max(entityLeft, blockX);
    const overlapY = Math.min(entityBottom, blockY + 32) - Math.max(entityTop, blockY);

    let newEntityX = entityX;
    let newEntityY = entityY;
    let newEntityVX = entityVX;
    let newEntityVY = entityVY;

    if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
            if (entityLeft < blockX) {
                newEntityX = blockX - entityWidth;
                newEntityVX = 0;
            } else {
                newEntityX = blockX + 32;
                newEntityVX = 0;
            }
        } else {
            if (entityTop < blockY) {
                newEntityY = blockY - entityHeight;
                if (entityVY >= 0) {
                    newEntityVY = 0;
                }
            } else {
                newEntityY = blockY + 32;
                if (entityVY <= 0) {
                    newEntityVY = 0;
                }
            }
        }
    }

    return {
        x: newEntityX,
        y: newEntityY,
        vx: newEntityVX,
        vy: newEntityVY,
    };
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
                if (is_pressed(' ') && can_jump) {
                    playerVY = -Math.sqrt(40960);
                }
                if (!can_jump) {
                    playerVY = playerVY + 512 * delta_time;
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
            
            const playerCollision = checkCollisions(playerX, playerY, 32, 64);
            can_jump = playerCollision.onGround;

            if (playerCollision.collided) {
                const resolvedPlayerPosition = resolveCollision(playerX, playerY, 32, 64, playerCollision.collisionX, playerCollision.collisionY, playerVX, playerVY);
                playerX = resolvedPlayerPosition.x;
                playerY = resolvedPlayerPosition.y;
                playerVX = resolvedPlayerPosition.vx;
                playerVY = resolvedPlayerPosition.vy;
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