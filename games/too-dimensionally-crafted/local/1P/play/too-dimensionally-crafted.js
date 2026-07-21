//imports
import {Tile, Sprite, Loop, sprites} from '../../../../../2d.ts';
//varibles
//const(can't change (e.g. HTML elements and objects))
const world_dataINIT = JSON.parse(localStorage.getItem('2DCsinglePworld'))
localStorage.removeItem('2DCsinglePworld');
const screen = document.getElementById('screen')
start(32, screen,'#00ffff','#000000')
const background = document.body
const death = {
    void: `You fell out of the world`
};
const death_screen = document.querySelector('.death_screen');
const death_message = document.querySelector('.deathID');
const pause_screen = document.querySelector('.pause_screen');
const seed = world_dataINIT.seed;
const slots = document.querySelectorAll('.hotbar canvas');
//background things
let light = 15;
//other
let death_reason;
document.querySelector('.how2play').style.display = 'none';

pause_screen.style.display = 'none';
death_screen.style.display = 'none';

//resizeing and centering 
function resizeCanvas() {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

//START!
function create () {
    Tile.create('GrassBlock', new ImgCanvas('/home/images/2dc/grass_block.png'), {})
    Tile.create('Cobblestone', new ImgCanvas('/home/images/2dc/cobblestone.png'), {})
}
Sprite
Loop.onUpdate((dt) => {
    
})
//END!

window.addEventListener('beforeunload', (event) => {
    // 1. Force the save immediately
    window.save();

    // 2. Standard modern browser flag to prevent thread interruption during localStorage writes
    event.preventDefault();
    
    // 3. Guarantee execution priority (some browsers require a returnValue assigned)
    event.returnValue = true;
});

//stuff for html things
let save = true;
window.respawnPlayer = function() {
    
};
window.save = function() {
    if(save){if (death_screen.style.display === 'flex') {
        window.respawnPlayer();
    };
    const worldsJSON = localStorage.getItem('2DCsinglePworlds');
    let worlds = {}; // Initialize worlds as an empty object by default

    if (worldsJSON) {
        // Only parse if worldsJSON is not null or undefined
        try {
            worlds = JSON.parse(worldsJSON);
        } catch (e) {
            console.error("Error parsing worlds data from localStorage:", e);
            // Optionally, clear the corrupted data or handle it otherwise
            // localStorage.removeItem('2DCsinglePworlds');
        }
    }
    worlds[world_dataINIT.name] = {
        game_mode: world_dataINIT.game_mode,
        difficulty: world_dataINIT.difficulty,
        seed: seed,
        flat: flat,
        x: playerX,
        y: playerY,
        blocks: blocks,
        HP: playerHP,
        inventory: inventory,
        entities: entities,
        rx: respawnX,
        ry: respawnY,
    };
    localStorage.setItem('2DCsinglePworlds', JSON.stringify(worlds));
}};
window.hidepause = function() {
    pause_screen.style.display = 'none';
    last_frame = performance.now();
    game_running = true;
}
window.deleteWorld = function(worldName = world_dataINIT.name) {
    // 1. Confirm with the player
    const confirmDelete = confirm(`Are you sure you want to delete "${worldName}"? This cannot be undone.`);
    if (!confirmDelete) return; 

    //  STOP ALL AUTOMATIC SAVES IMMEDIATELY
    save = false; 

    // 2. Fetch the current worlds object
    const worldsJSON = localStorage.getItem('2DCsinglePworlds');
    
    if (worldsJSON) {
        try {
            let worlds = JSON.parse(worldsJSON);
            
            // 3. Check if the world actually exists, then delete it
            if (worlds[worldName]) {
                delete worlds[worldName]; 
                
                // 4. Save the updated worlds object back to localStorage
                localStorage.setItem('2DCsinglePworlds', JSON.stringify(worlds));
                console.log(`World "${worldName}" successfully deleted.`);
                
                // 5. Go to list
                window.location.replace('../../');
            } else {
                // Fallback: If the world wasn't found, re-enable saving so the game isn't frozen out
                save = true;
                console.warn(`World "${worldName}" not found in storage.`);
            }
        } catch (e) {
            // Fallback: Re-enable if parsing crashed
            save = true;
            console.error("Error deleting world:", e);
        }
    } else {
        // Fallback: Re-enable if localStorage was completely empty
        save = true;
    }
};