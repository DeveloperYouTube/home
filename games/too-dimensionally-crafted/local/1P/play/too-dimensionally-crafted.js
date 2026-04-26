import {utils} from '../../../../../utilities.js';
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

function loadblock (/** @type {number} */x,/** @type {number} */y) {
    const noiseValue = utils.perlin.noise(x/smoothness, seed) * height + sea;
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