import {utils} from '../../../../../utilities.js';
//variables 
const savedData = localStorage.getItem('2DCsinglePworldJSON');

let worldINIT;

if (savedData !== null) {
    // Inside this block, the editor knows for sure savedData is a string
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
function loadblock (/** @type {number} */x,/** @type {number} */y) {
    const noiseValue = utils.perlin.noise(x, seed) * 10; // Adjust multiplier as needed
    const noiseFloor = Math.round(noiseValue);
    if (noiseFloor==y){
        return 1;
    } else if (noiseFloor >= y) {
        return 2
    } else {return 0}
}
function load_blocks (/** @type {number} */x,/** @type {number} */y,/** @type {number} */X,/** @type {number} */Y) {
    
}