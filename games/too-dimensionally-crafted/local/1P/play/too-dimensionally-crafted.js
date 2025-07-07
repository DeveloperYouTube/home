import {utils} from '/utilities.js';
//variables 
const worldINIT = JSON.parse(localStorage.getItem('2DCsinglePworldJSON'));
const world_name = worldINIT.name;
const game_mode = worldINIT.game_mode;
const difficulty = worldINIT.difficulty;