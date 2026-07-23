//imports
import {ImgCanvas, Loop, start, Tile, Sprite, Vector2, tiles, tilemap} from '/home/2d.ts';
//varibles
//const(can't change (e.g. HTML elements and objects))
const sqrt2560 = 16 * Math.SQRT10
const world_dataINIT = JSON.parse(localStorage.getItem('2DCsinglePworld'))
localStorage.removeItem('2DCsinglePworld');
const screen = document.getElementById('screen')
start(32,screen,'#0ff','#000')
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
    Tile.create('Air', new ImgCanvas('/home/images/nothing.png'), {})
}
const player = Sprite.summon(new Vector2(world_dataINIT.x,world_dataINIT.y),new Vector2(0,0),new Vector2(0,1024),new ImgCanvas('/images/2dc/player.png'),{hp: 20, movement: (keys, mouse, p) => {
    let move = {vx:0}
    if(keys.d){
        move.vx+=138.144
    }
    if(keys.a){
        move.vx-=138.144
    }
    if(keys.space&&p.v.y==0){
        move.vy=sqrt2560
    }
}})
Loop.onUpdate((dt) => {
    // 1. Get player position directly
    const playerPos = sprites[player].p;

    // 2. Calculate camera bounds centered on player
    const halfWidth = screen.width / 2;
    const halfHeight = screen.height / 2;

    // 3. Convert visible world bounds directly to grid indices using 32
    const minTileX = Math.floor((playerPos.x - halfWidth) / 32) - 1;
    const maxTileX = Math.ceil((playerPos.x + halfWidth) / 32) + 1;
    const minTileY = Math.floor((playerPos.y - halfHeight) / 32) - 1;
    const maxTileY = Math.ceil((playerPos.y + halfHeight) / 32) + 1;

    // 4. Loop through visible tiles
    for (let x = minTileX; x <= maxTileX; x++) {
        for (let y = minTileY; y <= maxTileY; y++) {
            const key = `${x},${y}`;

            if (!Object.hasOwn(tilemap,key)) {
                // 1. Continental noise: determines landmass vs deep ocean span (0.003 = wide region spans)
                const landmass = perlin.noise(x * 0.003, seed); 

                // 2. Local elevation noise: hills, cliffs, and peaks
                const hillNoise = perlin.noise(x * 0.02, seed) - 0.5;
                const mountainNoise = perlin.noise(x * 0.05, seed) - 0.5;

                // 3. Inland water noise: creates river cuts and lake basins on land
                const riverNoise = Math.abs(perlin.noise(x * 0.015, seed) - 0.5);

                // Calculate base terrain elevation relative to sea level (y=63) and ocean floor (y=45)
                let height;

                if (landmass > 0.45) {
                    // --- LANDMASS REGION ---
                    // Smooth rolling hills and occasional steep cliffs/mountains
                    let elevation = (hillNoise * 20) + (Math.max(0, hillNoise) * mountainNoise * 25);
                    
                    // Cut out rivers/lakes where river noise drops near zero
                    if (riverNoise < 0.04) {
                        elevation = Math.min(elevation, -2); // Carves rivers down to sea level or slightly below
                    }

                    // Land base sits around y=63 (sea level) and extends upward
                    height = 63 - Math.floor(elevation + 4); 
                } else {
                    // --- OCEAN REGION ---
                    // Ocean floor sits near y=45
                    let oceanFloor = 45 - Math.floor(hillNoise * 8);

                    // Island / Seamount check: high local peaks in shallow ocean can break above sea level
                    const islandPeak = mountainNoise * 35;
                    if (landmass > 0.38 && islandPeak > 18) {
                        height = 63 - Math.floor(islandPeak - 15); // Small island/cliff rising out of the water
                    } else {
                        height = oceanFloor;
                    }
                }
                height=Math.floor(height)



                //summon tile
                if(y==height){
                    Tile.set(new Vector2(x,y),"GrassBlock")
                } else if (y<height){
                    Tile.set(new Vector2(x,y),"Cobblestone")
                } else {
                    Tile.set(new Vector2(x,y),"Air")
                }
            }
        }
    }
});
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