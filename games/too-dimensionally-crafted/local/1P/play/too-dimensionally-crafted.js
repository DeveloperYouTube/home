//imports
import {utils} from '../../../../../2d.ts';
//varibles
//const(can't change (e.g. HTML elements and objects))
const world_dataINIT = JSON.parse(localStorage.getItem('2DCsinglePworld'))
localStorage.removeItem('2DCsinglePworld');
const screen = document.getElementById('screen');
const pen = screen.getContext('2d', {willReadFrequently: true});
const background = document.body;
const position_text = document.querySelector('.position');
const FPStext = document.querySelector('.FPS');
const death = {
    void: `You fell out of the world`
};
const death_screen = document.querySelector('.death_screen');
const death_message = document.querySelector('.deathID');
const pause_screen = document.querySelector('.pause_screen');
const seed = world_dataINIT.seed;
const flat = world_dataINIT.flat;
const game_mode = world_dataINIT.game_mode;
const slots = document.querySelectorAll('.hotbar canvas');
//background things
let light = 15;
//mouse
let mouseX = 0;
let mouseY = 0;
let mouse_dir = 0;
//other
let death_reason;
document.querySelector('.how2play').style.display = 'none';

pause_screen.style.display = 'none';
death_screen.style.display = 'none';

//slots logic
slots.forEach((slot, index) => {
    slot.addEventListener('click', () => {
        slots[selected].style.borderStyle = 'outset';
        selected = index;
        slot.style.borderStyle = 'inset';
    });
    
});
// Listen for keys pressed anywhere on the game window
window.addEventListener('keydown', (event) => {
    
    // Check if the physical key pressed is Digit1 through Digit9
    // event.code looks like "Digit1", "Digit2", etc.
    if (event.code.startsWith('Digit') && event.code !== 'Digit0') {
        
        // Extract the number character from the code string (e.g., "Digit5" -> 5)
        const pressedNum = parseInt(event.code.replace('Digit', ''), 10);
        
        // Convert the 1-9 key into a 0-8 list index for your 'slots' array
        const targetIndex = pressedNum - 1;
        
        // If they press a key for a slot they are already on, do nothing
        if (selected === targetIndex) return;

        // 1. Reset the border of the old selected slot to outset
        if (slots[selected]) {
            slots[selected].style.borderStyle = 'outset';
        }
        
        // 2. Update your global tracking variable to the new index
        selected = targetIndex;
        
        // 3. Set the newly selected slot's border to inset
        if (slots[selected]) {
            slots[selected].style.borderStyle = 'inset';
        }
        
        console.log(`Switched to slot index ${selected} via keyboard key: ${pressedNum}`);
    }
});
//key press logic
document.addEventListener('keydown', (event) => {
    pressedKeys[event.key] = true; 
    if (event.key === 'Escape') {
        if (game_running) { // Only show pause menu if the game is running
            pause_screen.style.display = 'flex';
            game_running = false;
        }
    };
});

//resizeing and centering 
function resizeCanvas() {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
    offset_centerX = screen.width / 2;
    offset_centerY = screen.height / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let blocks = world_dataINIT.blocks;

window.addEventListener('beforeunload', (event) => {
    // 1. Force the save immediately
    window.save();

    // 2. Standard modern browser flag to prevent thread interruption during localStorage writes
    event.preventDefault();
    
    // 3. Guarantee execution priority (some browsers require a returnValue assigned)
    event.returnValue = true;
});
function get_block(x, y) {
    let block_key = `${x}, ${y}`;
    let value;
        if (!flat) {
            const noiseValue = utils.perlin.noise(x * 0.1, 0, seed) * 10; // Adjust multiplier as needed
            const noiseFloor = Math.round(noiseValue);
        if (y >= noiseFloor) {
            if (y === noiseFloor) {
                value = 0; // Grass block on top
            } else {
                if (y > noiseFloor + 3.5) {
                    value = 4;
                } else {
                    value = 1;
                }
            }
        } else {
            value = 3; // Air block above
        }
    } else {
        if (y >= 2) {
            if (y === 2) {
                value = 0; // Grass block on top
            } else {
                if (y > 4) {
                    value = 5;
                } else {
                    value = 1;
                }
            }
        } else {
            value = 3; // Air block above
        }
    }
    return value;
}
function load_blocks(x, y) {
    let block_key = `${x}, ${y}`;
    if (!blocks.hasOwnProperty(block_key)) {
        blocks[block_key] = get_block(x, y);
    }
}

function unload_blocks(x, y) {
    let block_key = `${x}, ${y}`;
    if (blocks.hasOwnProperty(block_key)) {
        if (blocks[block_key] === get_block(x, y)) {
            delete blocks[block_key];
        }
    }
}

//mouse things(for player controls)
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    mouse_dir = Math.atan2(mouseY, mouseX);
});
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        // Break block
    }
});

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    //place block
});


//stuff for html things
let save = true;
window.respawnPlayer = function() {
    playerHP = 20;
    playerX = respawnX;
    playerY = respawnY;
    playerVY = 0;
    playerVX = 0;
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