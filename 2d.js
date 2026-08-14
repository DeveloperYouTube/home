import './utilities.js';
export let tileSize;
export let canvas;
export let ctx; // Store the context for fast drawing 
export let bgcolor;
export let notilecolor;
let tilecreateused = false;
let black = false
export let memory = true;
export let fov = pi/3*2;
export let halffov = pi/3;
export let stepSize;
export function tileSelector(maxdist, img, offset, start, uid, disturbedSprite = false, undisturbedSprites = []) {
    const selector = Sprite.summon(
        new Vector2(0, 0),
        new Vector2(0, 0),
        new Vector2(0, 0),
        img,
        {
            tile: new Vector2(0, 0),
            placeTile: null,
            movement: (keys, mouse, p) => {
                return { };
            },
            passThrough: true
        }
    );
    const radOffset = deg2rad(offset);

    // Ray vs AABB intersection helper
    function rayIntersectsAABB(rayOrigin, rayDir, boxMin, boxMax, maxLen) {
        let tmin = 0;
        let tmax = maxLen;

        // Check X axis slab
        if (Math.abs(rayDir.x) < 1e-6) {
            if (rayOrigin.x < boxMin.x || rayOrigin.x > boxMax.x) return false;
        } else {
            let invD = 1.0 / rayDir.x;
            let t1 = (boxMin.x - rayOrigin.x) * invD;
            let t2 = (boxMax.x - rayOrigin.x) * invD;
            if (t1 > t2) [t1, t2] = [t2, t1];
            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
            if (tmin > tmax) return false;
        }

        // Check Y axis slab
        if (Math.abs(rayDir.y) < 1e-6) {
            if (rayOrigin.y < boxMin.y || rayOrigin.y > boxMax.y) return false;
        } else {
            let invD = 1.0 / rayDir.y;
            let t1 = (boxMin.y - rayOrigin.y) * invD;
            let t2 = (boxMax.y - rayOrigin.y) * invD;
            if (t1 > t2) [t1, t2] = [t2, t1];
            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
            if (tmin > tmax) return false;
        }

        return true;
    }

    Loop.onUpdate(`Tile Selector #${uid}`, () => {
        const player = sprites[1];
        const target = sprites[start];
        if (!target) return;

        // 1. Calculate ray starting position and angle
        const rayStart = new Vector2(target.p.x, target.p.y);

        let dist;
        if (start === 1) {
            dist = mouse.positionmc;
        } else {
            dist = new Vector2(
                player.p.x + mouse.positionmc.x - target.p.x,
                player.p.y + mouse.positionmc.y - target.p.y
            );
        }

        const a = atan(dist.y, dist.x) + radOffset;
        
        // Ray direction vector (unit length)
        const dirX = cos(a);
        const dirY = sin(a);
        const rayDir = new Vector2(dirX, dirY);

        // --- NEW: Exact Bounding Box Obstruction Check ---
        if (disturbedSprite) {
            let closestSpriteDist = Infinity;

            for (let i = 0; i < sprites.length; i++) {
                if (i === selector || undisturbedSprites.includes(i)) continue;

                const s = sprites[i];
                if (!s || !s.p) continue;

                // Fallback to canvas/img size or standard tile size if dimensions aren't on sprite
                const sWidth = s.width || s.img?.w || tileSize;
                const sHeight = s.height || s.img?.h || tileSize;

                const boxMin = new Vector2(s.p.x, s.p.y);
                const boxMax = new Vector2(s.p.x + sWidth, s.p.y + sHeight);

                // If ray passes directly through this sprite's physical box
                if (rayIntersectsAABB(rayStart, rayDir, boxMin, boxMax, maxdist)) {
                    sprites[selector].img = nothingIMG;
                    sprites[selector].stats.tile = null;
                    sprites[selector].stats.placeTile = null;
                    return; // Stop execution immediately, no selection possible
                }
            }
        }

        // Current tile coordinates
        let tileX = floor(rayStart.x / tileSize);
        let tileY = floor(rayStart.y / tileSize);

        // 2. DDA Setup
        const deltaDistX = abs(1 / (dirX || 1e-6)) * tileSize;
        const deltaDistY = abs(1 / (dirY || 1e-6)) * tileSize;

        let stepX, stepY;
        let sideDistX, sideDistY;

        if (dirX < 0) {
            stepX = -1;
            sideDistX = (rayStart.x - tileX * tileSize) * (deltaDistX / tileSize);
        } else {
            stepX = 1;
            sideDistX = ((tileX + 1) * tileSize - rayStart.x) * (deltaDistX / tileSize);
        }

        if (dirY < 0) {
            stepY = -1;
            sideDistY = (rayStart.y - tileY * tileSize) * (deltaDistY / tileSize);
        } else {
            stepY = 1;
            sideDistY = ((tileY + 1) * tileSize - rayStart.y) * (deltaDistY / tileSize);
        }

        // 3. DDA Traversal Loop for Tilemap
        let selec = false;
        let travelledDist = 0;

        let prevTileX = tileX;
        let prevTileY = tileY;

        while (travelledDist < maxdist) {
            prevTileX = tileX;
            prevTileY = tileY;

            if (sideDistX < sideDistY) {
                travelledDist = sideDistX;
                sideDistX += deltaDistX;
                tileX += stepX;
            } else {
                travelledDist = sideDistY;
                sideDistY += deltaDistY;
                tileY += stepY;
            }

            if (travelledDist > maxdist) break;

            const tileID = tilemap[`${tileX},${tileY}`];
            const currentTile = tiles[tileID];

            if (currentTile && currentTile.properties?.selectable) {
                selec = true;
                break;
            }
        }

        // 4. Update Selector State
        if (selec) {
            sprites[selector].img = img;
            sprites[selector].p.x = tileX * tileSize;
            sprites[selector].p.y = tileY * tileSize;
            
            sprites[selector].stats.tile = new Vector2(tileX, tileY);
            sprites[selector].stats.placeTile = new Vector2(prevTileX, prevTileY);
        } else {
            sprites[selector].img = nothingIMG;
            sprites[selector].stats.tile = null;
            sprites[selector].stats.placeTile = null;
        }
    });

    return selector;
}

/**
 * Dynamic 2D AABB raycast selection wrapper targeting entities.
 * @param {number} maxdist - Maximum ray length in pixels.
 * @param {object} img - The ImgCanvas or BlankImgCanvas instance used for the selector graphic.
 * @param {number} offset - Structural angle offset in degrees.
 * @param {number} start - The array index of the sprite casting the ray.
 * @param {string} uid - Unique identifier key for registration in the Loop system.
 * @param {number[]} [spritesToIgnore=[]] - Array of sprite indices that the ray completely passes through.
 * @param {number[]} [spritesToDisturb=[]] - Array of sprite indices that break line-of-sight and cancel selection.
 * @param {boolean} [tilesDisturbSelector=false] - If true, non-whitelisted tiles block the selector line-of-sight.
 * @param {string[]} [allowedTileNames=[]] - Whitelist array of tile IDs (e.g., ['Air']) that the ray is allowed to pass through.
 * @returns {number} The active array index of the spawned selector sprite instance.
 */
export function spriteSelector(
    maxdist, 
    img, 
    offset, 
    start, 
    uid, 
    spritesToIgnore = [], 
    spritesToDisturb = [], 
    tilesDisturbSelector = false, 
    allowedTileNames = [] // Only tiles listed here let the selector ray pass through!
) {
    const selector = Sprite.summon(
        new Vector2(0, 0),
        new Vector2(0, 0),
        new Vector2(0, 0),
        img,
        {
            selectedSpriteIndex: null,
            movement: (keys, mouse, p) => { return {}; },
            passThrough: true
        }
    );
    const radOffset = deg2rad(offset);

    // Ray vs Axis-Aligned Bounding Box Intersection Helper
    function getRayIntersectionDistance(rayOrigin, rayDir, boxMin, boxMax, maxLen) {
        let tmin = 0;
        let tmax = maxLen;

        for (const axis of ['x', 'y']) {
            if (Math.abs(rayDir[axis]) < 1e-6) {
                if (rayOrigin[axis] < boxMin[axis] || rayOrigin[axis] > boxMax[axis]) return null;
            } else {
                let invD = 1.0 / rayDir[axis];
                let t1 = (boxMin[axis] - rayOrigin[axis]) * invD;
                let t2 = (boxMax[axis] - rayOrigin[axis]) * invD;
                if (t1 > t2) [t1, t2] = [t2, t1];
                tmin = Math.max(tmin, t1);
                tmax = Math.min(tmax, t2);
                if (tmin > tmax) return null;
            }
        }
        return tmin;
    }

    Loop.onUpdate(`Sprite Selector #${uid}`, () => {
        const player = sprites[1];
        const target = sprites[start];
        if (!target) return;

        const rayStart = new Vector2(target.p.x, target.p.y);

        let dist;
        if (start === 1) {
            dist = mouse.positionmc;
        } else {
            dist = new Vector2(
                player.p.x + mouse.positionmc.x - target.p.x,
                player.p.y + mouse.positionmc.y - target.p.y
            );
        }

        const a = atan(dist.y, dist.x) + radOffset;
        const rayDir = new Vector2(cos(a), sin(a));

        let closestHitDist = maxdist;
        let selectedIndex = null;
        let isDisturbedBySprite = false;

        // 1. EVALUATE SPRITE INTERSECTIONS
        for (let i = 0; i < sprites.length; i++) {
            if (i === selector || i === start || spritesToIgnore.includes(i)) continue;

            const s = sprites[i];
            if (!s || !s.p) continue;

            const sWidth = s.width || s.img?.w || tileSize;
            const sHeight = s.height || s.img?.h || tileSize;

            const boxMin = new Vector2(s.p.x, s.p.y);
            const boxMax = new Vector2(s.p.x + sWidth, s.p.y + sHeight);

            const tHit = getRayIntersectionDistance(rayStart, rayDir, boxMin, boxMax, maxdist);

            if (tHit !== null && tHit < closestHitDist) {
                if (spritesToDisturb.includes(i)) {
                    isDisturbedBySprite = true;
                    closestHitDist = tHit; // Pull in line of sight boundary to this sprite
                    selectedIndex = null;
                } else {
                    isDisturbedBySprite = false;
                    closestHitDist = tHit;
                    selectedIndex = i;
                }
            }
        }

        // 2. EVALUATE TILE MAP OBSTRUCTIONS (Strict Whitelist Check)
        let isDisturbedByTile = false;
        if (tilesDisturbSelector && !isDisturbedBySprite) {
            let tileX = floor(rayStart.x / tileSize);
            let tileY = floor(rayStart.y / tileSize);

            const deltaDistX = abs(1 / (rayDir.x || 1e-6)) * tileSize;
            const deltaDistY = abs(1 / (rayDir.y || 1e-6)) * tileSize;

            let stepX = rayDir.x < 0 ? -1 : 1;
            let stepY = rayDir.y < 0 ? -1 : 1;

            let sideDistX = rayDir.x < 0 ? (rayStart.x - tileX * tileSize) * (deltaDistX / tileSize) : ((tileX + 1) * tileSize - rayStart.x) * (deltaDistX / tileSize);
            let sideDistY = rayDir.y < 0 ? (rayStart.y - tileY * tileSize) * (deltaDistY / tileSize) : ((tileY + 1) * tileSize - rayStart.y) * (deltaDistY / tileSize);

            let travelledDist = 0;

            while (travelledDist < closestHitDist) {
                if (sideDistX < sideDistY) {
                    travelledDist = sideDistX;
                    sideDistX += deltaDistX;
                    tileX += stepX;
                } else {
                    travelledDist = sideDistY;
                    sideDistY += deltaDistY;
                    tileY += stepY;
                }

                if (travelledDist > closestHitDist) break;

                const tileID = tilemap[`${tileX},${tileY}`];
                
                // If a tile coordinate is missing, your map treats it as empty air/void. 
                // We check if that name/ID string is absent from the safe allowed whitelist array.
                const tileName = tileID !== undefined ? tileID : 'Air'; 

                if (!allowedTileNames.includes(tileName)) {
                    isDisturbedByTile = true;
                    break; // Blocked! Terminate ray immediately
                }
            }
        }

        // 3. FINAL RESOLUTION
        if (selectedIndex !== null && !isDisturbedByTile && !isDisturbedBySprite) {
            const chosenSprite = sprites[selectedIndex];
            
            sprites[selector].img = img;
            sprites[selector].p.x = chosenSprite.p.x;
            sprites[selector].p.y = chosenSprite.p.y;
            sprites[selector].stats.selectedSpriteIndex = selectedIndex;
        } else {
            sprites[selector].img = nothingIMG;
            sprites[selector].stats.selectedSpriteIndex = null;
        }
    });

    return selector;
}
export function blackout(memo, sight, qual) {
    black = true;
    memory=memo;
    fov=deg2rad(sight)
    halffov=0.5*fov
    stepSize=qual
}
export function start(_tileSize, _canvas, bg, notile) {
    if(tilecreateused){bgcolor = bg;
    notilecolor = notile;
    tileSize = _tileSize;
    canvas = _canvas;
    ctx = canvas.getContext("2d"); // Capture the 2D canvas context
    lastTime = performance.now(); // Initialize the frame timer safely
    loop();
    updateCanvasRect()} else {//not so safe anymore unlike lasttime initializing safly
        throw new Error("Tile.create() must be invoked at least once prior to startGame().");
    }
    setupInputListeners(canvas);
}
function calculateTextureTransparency(imageOrCanvas) {
  // 1. Draw tile texture onto an offscreen canvas to sample raw pixels
  const offCanvas = document.createElement("canvas");
  offCanvas.width = imageOrCanvas.width;
  offCanvas.height = imageOrCanvas.height;
  const offCtx = offCanvas.getContext("2d");
  offCtx.drawImage(imageOrCanvas, 0, 0);

  // 2. Fetch RGBA pixel array
  const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
  let totalAlpha = 0;
  const totalPixels = imgData.length / 4;

  // 3. Sum up all alpha values (index 3, 7, 11, etc.)
  for (let i = 3; i < imgData.length; i += 4) {
    totalAlpha += imgData[i]; // Alpha ranges from 0 to 255
  }

  // 4. Return average transparency as a 0.0 - 1.0 multiplier
  const averageAlpha = totalAlpha / totalPixels;
  return averageAlpha / 255; 
}
//vector
export class Vector2 {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    get vectors() {
        return `${this._x},${this._y}`;
    }
    get hypot() {
        return Math.hypot(this._x,this._y)
    }
    polar(){
        return new Polar2(this.hypot(),atan(this._y,this._x))
    }
    complex(){
        return new Complex(this._x,this._y)
    }
}
export class Polar2 {
    constructor(r,a){
        this.r=r
        this.a=a
    }
    vector(){
        return new Vector2(this.r*cos(this.a),this.r*sin(this.a))
    }
    complex(){
        return new Complex(this.r*cos(this.a),this.r*sin(this.a))
    }
}
export class Complex {
    constructor(real = 0, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    add(real, imag = 0) {
        this.real += real;
        this.imag += imag;
        return this;
    }

    subtract(real, imag = 0) {
        this.real -= real;
        this.imag -= imag;
        return this;
    }

    multiply(r, i = 0) {
        const resReal = (this.real * r) - (this.imag * i);
        const resImag = (this.real * i) + (this.imag * r);
        this.real = resReal;
        this.imag = resImag;
        return this;
    }

    divide(r, i = 0) {
        const denom = (r * r) + (i * i);
        if (denom === 0) throw new Error("Complex division by zero");

        const resReal = ((this.real * r) + (this.imag * i)) / denom;
        const resImag = ((this.imag * r) - (this.real * i)) / denom;
        this.real = resReal;
        this.imag = resImag;
        return this;
    }

    polar() {
        return new Polar2(
            Math.hypot(this.real, this.imag), 
            atan(this.imag, this.real)
        );
    }

    vector() {
        return new Vector2(this.real, this.imag);
    }

    power(e) {
        const r = Math.hypot(this.real, this.imag) ** e;
        const theta = atan(this.imag, this.real) * e;
        this.real = r * cos(theta);
        this.imag = r * sin(theta);
        return this;
    }

    root(n) {
        return this.power(1 / n);
    }
}
const mouse = {
    positiontl: new Vector2(0,0),
    positionmc: new Vector2(0,0),
    anglemc: 0,
    ldown: false,
    lhold: false,
    lreal: false,
    rdown: false,
    rhold: false,
    rreal: false
}
let cachedRect = null;

function updateCanvasRect() {
    if (canvas) {
        cachedRect = canvas.getBoundingClientRect();
    }
}

// 2. Update bounds on scroll/resize (or call updateCanvasRect() inside your start/init function)
window.addEventListener("resize", updateCanvasRect);
window.addEventListener("scroll", updateCanvasRect);

// 3. Optimized mousemove listener
window.addEventListener("mousemove", (event) => {
    if (!canvas) return;

    // Fetch rect if not cached yet or if unrendered
    if (!cachedRect || cachedRect.width === 0) {
        updateCanvasRect();
    }

    // Safety guard: if still 0 (e.g. element hidden), bail out before dividing by zero
    if (!cachedRect || cachedRect.width === 0 || cachedRect.height === 0) return;

    // Scale factor
    const scaleX = canvas.width / cachedRect.width;
    const scaleY = canvas.height / cachedRect.height;

    // True canvas pixel coordinates (top-left origin)
    mouse.positiontl.x = (event.clientX - cachedRect.left) * scaleX;
    mouse.positiontl.y = (event.clientY - cachedRect.top) * scaleY;

    // Internal canvas center point
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Offset relative to canvas center
    mouse.positionmc.x = mouse.positiontl.x - centerX;
    mouse.positionmc.y = mouse.positiontl.y - centerY;

    // Angle from canvas center
    mouse.anglemc = atan2(mouse.positionmc.y, mouse.positionmc.x);
});
export class ImgCanvas {
    /**
     * @param filepath - The text path or URL to the image file (e.g., './assets/img.png')
     */
    constructor(filepath, w, h) {
        this.isLoaded = false;
        this.src = filepath;
        
        // 1. Force the correct dimensions instantly 
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            // 2. Paint the loaded image onto your perfectly sized canvas
            this.ctx.drawImage(img, 0, 0, w, h);
            this.isLoaded = true;
        };
        img.onerror = () => {
            console.error(`ImgCanvas failed to load asset at: ${this.src}`);
        };
        img.src = this.src;
    }
    // Easy getters to read the dimensions instantly
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
}
export class SolidImgCanvas {
    /**
     * @param {string} color - Any valid CSS color (e.g., '#00FF00', 'rgb(255, 0, 0)', 'black', etc.)
     * @param {number} w - Width of the canvas in pixels
     * @param {number} h - Height of the canvas in pixels
     */
    constructor(color, w, h) {
        this.isLoaded = true; // Instantly ready since no network loading is needed
        this.src = null;
        this.color = color;

        // 1. Create the invisible canvas element in memory
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext('2d');

        // 2. Fill the canvas with the specified color
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, w, h);
    }

    // Easy getters to read dimensions instantly
    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }
}
export class BlankImgCanvas extends SolidImgCanvas {
    /**
     * @param {number} w - Width of the canvas in pixels
     * @param {number} h - Height of the canvas in pixels
     */
    constructor(w, h) {
        super('rgba(0,0,0,0)', w, h);
    }
}
const nothingIMG = new BlankImgCanvas(1, 1);
const halfFov = 0.5 * fov;
// 1. Declare your registries globally using proper TypeScript Record types
export const tiles = {};
export const tilemap = {};
export const seen = new Set();
export const sprites = {};
export class Tile {
    constructor(img, special) {
        this.img = img;
        this.special = special;
        
        if (img.isLoaded) {
            // If it's a solid/blank canvas, it's ready right now
            this.transparency = calculateTextureTransparency(img.canvas);
        } else {
            // Default to opaque until it loads so you don't get X-ray vision at startup
            this.transparency = 1; 
            
            // Sneak a hook into the canvas context or check for loading
            // An even cleaner approach: recalculate it dynamically the first time it renders!
            this.needsTransparencyCalculation = true;
        }
    }
    // Static registration method
    static create(name, img, special) {
        tiles[name] = new Tile(img, special);
        tilecreateused=true;
    }
    // Static map placement method
    static set(p, name) {
        tilemap[p.vectors] = name;
    }
    static remove(p, name) {
        if (!name || tilemap[p.vectors] == name) {
            delete tilemap[p.vectors];
        }
    }
    get properties() {
        return this.special;
    }
    get image() {
        return this.img;
    }
}
export let sprite_n = 0;
export const spriteBlueprint = {};
export class Sprite {
    constructor(p, v, a, img, stats) {
        this.p = p;
        this.v = v;
        this.a = a;
        this.img = img;
        this.size = new Vector2(img.width, img.height);
        this.stats = stats || {};
    }
    static create(name, img, stats) {
        spriteBlueprint[name] = {
            img: img,
            stats: stats || {}
        };
    }
    static summon(p, v, a, img, stats) {
        sprite_n++;
        sprites[sprite_n] = new this(p, v, a, img, stats);
        return sprite_n;
    }
    static summonBlueprint(name, p, v, a, overrides) {
        const blueprint = spriteBlueprint[name];
        if (!blueprint) {
            console.error(`Sprite blueprint '${name}' does not exist!`);
            return;
        }
        // 1. Safely combine template stats and override stats into a brand new object.
        // This spreads the original stats, then overwrites them with anything inside overrides.
        const finalStats = Object.assign(Object.assign({}, blueprint.stats), (overrides || {}));
        // 2. Spawn the sprite using the merged data
        this.summon(p, v, a, blueprint.img, finalStats);
    }
}
let update_loops = {};
let overlay_loops = {};
export class Loop {
    static onUpdate(name,f) {
        update_loops[name]=f;
    }
    static overlay(name,f) {
        overlay_loops[name]=f;
    }
    static terminateOverlay(name) {
        delete overlay_loops[name]
    }
    static terminateOnUpdate(name) {
        delete update_loops[name]
    }
    // Call this inside your requestAnimationFrame update tick
    static applyOnUpdate() {
        for (const key in update_loops) {
            update_loops[key]();
        }
    }

    // Call this inside your main render/draw tick
    static applyOverlay(pen) {
        for (const key in overlay_loops) {
            overlay_loops[key](pen);
        }
    }
}
// Global engine input registries
export const keys = {};
// ==========================================
// SYSTEM LISTENERS
// ==========================================
export function setupInputListeners(canvasElement) {
    // Ensure the global objects exist so we don't get undefined errors
    globalThis.keys = globalThis.keys || {};
    globalThis.mouse = globalThis.mouse || { ldown: false, lreal: false, lhold: false, rdown: false, rreal: false, rhold: false };

    // 1. Keyboard Tracking - Write directly to globalThis
    window.addEventListener('keydown', (e) => { 
        globalThis.keys[e.key] = true; 
    });
    window.addEventListener('keyup', (e) => { 
        globalThis.keys[e.key] = false; 
    });

    // 3. Dedicated Mouse Button Click Trackers - Write directly to globalThis
    canvasElement.addEventListener('mousedown', (e) => {
        if (e.button === 0){
            globalThis.mouse.ldown = true;
            globalThis.mouse.lhold = true;
        }
        if (e.button === 2){
            globalThis.mouse.rdown = true;
            globalThis.mouse.rhold = true;
        }
    });
    canvasElement.addEventListener('mouseup', (e) => {
        if (e.button === 0){
            globalThis.mouse.lreal = true;
            globalThis.mouse.lhold = false;
        }
        if (e.button === 2){
            globalThis.mouse.rreal = true;
            globalThis.mouse.rhold = false;
        }
    });
    
    canvasElement.addEventListener('contextmenu', (e) => e.preventDefault());
}
// ==========================================
// 3. ENGINE MECHANICS & MAIN LOOP
// ==========================================
let lastTime = performance.now();
function update() {
    const currentTime = performance.now();
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    Loop.applyOnUpdate();
    // Dynamically grab the live, listener-attached objects from global context
    const activeKeys = globalThis.keys;
    const activeMouse = globalThis.mouse;
    
    for (const id in sprites) {
        const sprite = sprites[id];
        
        // Pass the live active tracking maps into your movement function
        const move = sprite.stats.movement(activeKeys, activeMouse, sprite) || {};
        
        if (Object.hasOwn(move, 'vx')) sprite.v.x = move.vx;
        if (Object.hasOwn(move, 'vy')) sprite.v.y = move.vy;
        if (Object.hasOwn(move, 'ax')) sprite.a.x = move.ax;
        if (Object.hasOwn(move, 'ay')) sprite.a.y = move.ay;

        // 🔥 CHECK HERE INSTEAD! Catch the input mutation instantly
        if (isNaN(sprite.p.y) || isNaN(sprite.v.y)) {
            console.error("NaN detected immediately after movement input evaluation!", {
                positionY: sprite.p.y,
                velocityY: sprite.v.y,
                moveObject: move, // Check if move.vy is undefined or NaN here!
                sqrtConstant: globalThis.sqrt2560
            });
        }

        // --- STEP 1: HORIZONTAL INTEGRATION & RESOLUTION ---
        sprite.p.x += sprite.v.x * dt + 0.5 * sprite.a.x * dt * dt;
        sprite.v.x += sprite.a.x * dt;
        handleTileCollisionsX(sprite, dt);

        // --- STEP 2: VERTICAL INTEGRATION & RESOLUTION ---
        sprite.p.y += sprite.v.y * dt + 0.5 * sprite.a.y * dt * dt;
        sprite.v.y += sprite.a.y * dt;
        handleTileCollisionsY(sprite, dt);
    }

    activeMouse.ldown = false;
    activeMouse.lreal = false;
    activeMouse.rdown = false;
    activeMouse.rreal = false;

    for (const id1 in sprites) {
        for (const id2 in sprites) {
            if (id1 == id2) continue;
            const spr1 = sprites[id1];
            const spr2 = sprites[id2];
            if (checkAABBCollision(spr1, spr2)) {
                handleDecollide(spr1, spr2);
            }
        }
    }
}
function handleDecollide(s1, s2) {
    var _a, _b, _c, _d;
    if (!(s1.stats.passThrough || s2.stats.passThrough)) {
        const result = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        const center1X = s1.p.x + s1.size.x / 2;
        const center1Y = s1.p.y + s1.size.y / 2;
        const center2X = s2.p.x + s2.size.x / 2;
        const center2Y = s2.p.y + s2.size.y / 2;
        const distX = center1X - center2X;
        const distY = center1Y - center2Y;
        const minSizeX = s1.size.x / 2 + s2.size.x / 2;
        const minSizeY = s1.size.y / 2 + s2.size.y / 2;
        const overlapX = minSizeX - abs(distX);
        const overlapY = minSizeY - abs(distY);
        // 1. Calculate side flags and stop velocity on the hit axis
        if (overlapX < overlapY) {
            if (distX > 0) {
                result.left = true;
                if (!s1.stats.immoveable)
                    s1.v.x = 0;
            }
            else {
                result.right = true;
                if (!s1.stats.immoveable)
                    s1.v.x = 0;
            }
        }
        else {
            if (distY > 0) {
                result.up = true;
                if (!s1.stats.immoveable)
                    s1.v.y = 0;
            }
            else {
                result.down = true;
                if (!s1.stats.immoveable)
                    s1.v.y = 0; // Acceleration left completely untouched!
            }
        }
        // 2. Generate the precise 1px nudge vector from your boolean math
        const dx = +result.left - +result.right;
        const dy = +result.down - +result.up;
        // 3. Apply the 1px nudge if s1 is allowed to move
        if (!s1.stats.immoveable) {
            s1.p.x += dx;
            s1.p.y += dy;
        }
        // 4. Trigger the collision action handler
        (_b = (_a = s2.stats).onTouch) === null || _b === void 0 ? void 0 : _b.call(_a, s1, result);
    }
    else {
        (_d = (_c = s2.stats).within) === null || _d === void 0 ? void 0 : _d.call(_c, s1);
    }
}
function checkAABBCollision(s1, s2) {
    // Check if they overlap on the horizontal X axis
    const overlapX = s1.p.x < s2.p.x + s2.size.x && s1.p.x + s1.size.x > s2.p.x;
    // Check if they overlap on the vertical Y axis
    const overlapY = s1.p.y < s2.p.y + s2.size.y && s1.p.y + s1.size.y > s2.p.y;
    // A collision only happens if BOTH are true!
    return overlapX && overlapY;
}
function handleTileCollisionsX(s1, dt) {
    if (isNaN(s1.p.y) || isNaN(s1.v.y)) {
    console.error("NaN detected before Y integration!", {
        positionY: s1.p.y,
        velocityY: s1.v.y,
        accelerationY: s1.a.y
    });
}
    var _a, _b;
    const startX = floor(s1.p.x / tileSize);
    const endX = ceil((s1.p.x + s1.size.x) / tileSize) - 1;
    const startY = floor(s1.p.y / tileSize);
    const endY = ceil((s1.p.y + s1.size.y) / tileSize) - 1;

    const result = { up: false, down: false, left: false, right: false };
    let collided = false;
    let activeProps = null;
    const frameVx = s1.v.x * dt;

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const tileName = tilemap[`${x},${y}`];
            if (!tileName) continue;
            const tile = tiles[tileName];
            if (!tile) continue;
            const props = tile.properties;

            const tileLeft = x * tileSize;
            const tileTop = y * tileSize;

            const hasOverlap = (s1.p.x < tileLeft + tileSize &&
                                s1.p.x + s1.size.x > tileLeft &&
                                s1.p.y < tileTop + tileSize &&
                                s1.p.y + s1.size.y > tileTop);

            if (hasOverlap) {
                if (props && props.passThrough) {
                    (_a = props.within) === null || _a === void 0 ? void 0 : _a.call(props, s1);
                    continue;
                }

                if (frameVx > 0 && (s1.p.x + s1.size.x) >= tileLeft && s1.p.x < tileLeft) {
                    s1.p.x = tileLeft - s1.size.x;
                    result.right = true;
                    collided = true;
                    s1.v.x = 0;
                    activeProps = props;
                } 
                else if (frameVx < 0 && s1.p.x <= (tileLeft + tileSize) && (s1.p.x + s1.size.x) > (tileLeft + tileSize)) {
                    s1.p.x = tileLeft + tileSize;
                    result.left = true;
                    collided = true;
                    s1.v.x = 0;
                    activeProps = props;
                }
            }
        }
    }

    if (collided && activeProps) {
        (_b = activeProps.onTouch) === null || _b === void 0 ? void 0 : _b.call(activeProps, s1, result);
    }
}

function handleTileCollisionsY(s1, dt) {
    var _a, _b;
    const startX = floor(s1.p.x / tileSize);
    const endX = ceil((s1.p.x + s1.size.x) / tileSize) - 1;
    const startY = floor(s1.p.y / tileSize);
    const endY = ceil((s1.p.y + s1.size.y) / tileSize) - 1;

    const result = { up: false, down: false, left: false, right: false };
    let collided = false;
    let activeProps = null;
    const frameVy = s1.v.y * dt;

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const tileName = tilemap[`${x},${y}`];
            if (!tileName) continue;
            const tile = tiles[tileName];
            if (!tile) continue;
            const props = tile.properties;

            const tileLeft = x * tileSize;
            const tileTop = y * tileSize;

            const hasOverlap = (s1.p.x < tileLeft + tileSize &&
                                s1.p.x + s1.size.x > tileLeft &&
                                s1.p.y < tileTop + tileSize &&
                                s1.p.y + s1.size.y > tileTop);

            if (hasOverlap) {
                if (props && props.passThrough) continue;

                if (frameVy > 0 && (s1.p.y + s1.size.y) >= tileTop && s1.p.y < tileTop) {
                    s1.p.y = tileTop - s1.size.y;
                    result.down = true;
                    collided = true;
                    s1.v.y = 0;
                    activeProps = props;
                } 
                else if (frameVy < 0 && s1.p.y <= (tileTop + tileSize) && (s1.p.y + s1.size.y) > (tileTop + tileSize)) {
                    s1.p.y = tileTop + tileSize;
                    result.up = true;
                    collided = true;
                    s1.v.y = 0;
                    activeProps = props;
                }
            }
        }
    }

    // Always keep the grounded flag perfectly updated at the end of the full frame phase
    s1.stats.grounded = result.down;

    if (collided && activeProps) {
        (_b = activeProps.onTouch) === null || _b === void 0 ? void 0 : _b.call(activeProps, s1, result);
    }
}
function render() {
    if (!ctx || !canvas) { return; }

    // 1. Fill the entire canvas viewport with the base background color
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Center the camera window over Sprite ID 1
    const player = sprites[1];
    let camX = 0;
    let camY = 0;
    if (player) {
        camX = (player.p.x + player.size.x / 2) - canvas.width / 2;
        camY = (player.p.y + player.size.y / 2) - canvas.height / 2;
    }

    // 3. Render World Grid Viewport (Already culled by visible bounds)
    const startX = floor(camX / tileSize);
    const endX = ceil((camX + canvas.width) / tileSize);
    const startY = floor(camY / tileSize);
    const endY = ceil((camY + canvas.height) / tileSize);

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const tileName = tilemap[`${x},${y}`];
            const drawX = x * tileSize - camX;
            const drawY = y * tileSize - camY;

            let visible = true;
            const key = `${x},${y}`;

            if (black) {
                // If memory is on AND the tile has already been seen, skip FOV/raycasting
                if (!(memory && seen.has(key))) {
                    // 1. Ray origin (Player center)
                    const ray = new Vector2(
                        sprites[1].p.x + (sprites[1].size.x * 0.5),
                        sprites[1].p.y + (sprites[1].size.y * 0.5)
                    );

                    // 2. Target tile center
                    const tilecent = new Vector2(
                        (x + 0.5) * tileSize, 
                        (y + 0.5) * tileSize
                    );

                    const dx = tilecent.x - ray.x;
                    const dy = tilecent.y - ray.y;
                    const d = Math.hypot(dx, dy);

                    const a = atan2(dy, dx);

                    // FOV Cone Check
                    const angleDiff = abs(((a - mouse.anglemc) % tau + tau + pi) % tau - pi);

                    if (fov < tau && angleDiff > halffov) {
                        visible = false;
                    } else {
                        // --- DDA Initialization ---
                        // Start ray at player center
                        let rX = ray.x;
                        let rY = ray.y;

                        let tileX = floor(rX / tileSize);
                        let tileY = floor(rY / tileSize);

                        // Target coordinates from the outer loop
                        const targetX = x;
                        const targetY = y;

                        // Prevent division by zero if ray is perfectly vertical/horizontal
                        const dirX = dx === 0 ? 0.000001 : dx / d;
                        const dirY = dy === 0 ? 0.000001 : dy / d;

                        const deltaDistX = abs(1 / dirX);
                        const deltaDistY = abs(1 / dirY);

                        let stepX, stepY;
                        let sideDistX, sideDistY;

                        if (dirX < 0) {
                            stepX = -1;
                            sideDistX = (rX / tileSize - tileX) * deltaDistX;
                        } else {
                            stepX = 1;
                            sideDistX = (tileX + 1.0 - rX / tileSize) * deltaDistX;
                        }

                        if (dirY < 0) {
                            stepY = -1;
                            sideDistY = (rY / tileSize - tileY) * deltaDistY;
                        } else {
                            stepY = 1;
                            sideDistY = (tileY + 1.0 - rY / tileSize) * deltaDistY;
                        }

                        let raystr = 1;
                        let maxSteps = ceil(d / (tileSize / 2)); // Safety cap to avoid infinite loops
                        let stepCount = 0;

                        // --- DDA Traversal Loop ---
                        while ((tileX !== targetX || tileY !== targetY) && stepCount < maxSteps) {
                            stepCount++;

                            // Jump to next grid square
                            if (sideDistX < sideDistY) {
                                sideDistX += deltaDistX;
                                tileX += stepX;
                            } else {
                                sideDistY += deltaDistY;
                                tileY += stepY;
                            }

                            // If we overshoot or land exactly on the target tile, we have clear line of sight up to this point
                            if (tileX === targetX && tileY === targetY) {
                                break;
                            }

                            // Check line-of-sight blockers at the current grid square
                            const currentTile = tiles[tilemap[`${tileX},${tileY}`]];
                            if (currentTile?.image) {
                                // Lazy calculation: If the image is loaded but transparency hasn't been evaluated yet
                                if (currentTile.needsTransparencyCalculation && currentTile.image.isLoaded) {
                                    currentTile.transparency = calculateTextureTransparency(currentTile.image.canvas);
                                    currentTile.needsTransparencyCalculation = false; // Never run it again
                                }

                                const cost = currentTile.transparency;
                                raystr -= cost;

                                if (raystr <= 0) {
                                    visible = false;
                                    break;
                                }
                            }
                        }

                        // If the ray successfully reached the target destination without dropping raystr to 0
                        if (visible) {
                            seen.add(key);
                        }
                    }
                }
            }

            // Draw Tile or Blank Space
            if (!tileName) {
                ctx.fillStyle = notilecolor;
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
                continue;
            }

            const tile = tiles[tileName];
            if (tile && tile.image && tile.image.isLoaded && visible) {
                ctx.drawImage(tile.image.canvas, drawX, drawY, tileSize, tileSize);
            } else {
                ctx.fillStyle = notilecolor;
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
            }
        }
    }

    // 4. Render All Sprites (With Frustum Culling)
    for (const id in sprites) {
        const sprite = sprites[id];
        if (sprite.img && sprite.img.isLoaded) {
            const isVisible = sprite.p.x < camX + canvas.width &&
                sprite.p.x + sprite.size.x > camX &&
                sprite.p.y < camY + canvas.height &&
                sprite.p.y + sprite.size.y > camY;
            if (isVisible) {
                ctx.drawImage(sprite.img.canvas, sprite.p.x - camX, sprite.p.y - camY, sprite.size.x, sprite.size.y);
            }
        }
    }

    Loop.applyOverlay(ctx);
}
function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

//positions \/
globalThis.Vector2 = Vector2;
globalThis.Polar2 = Polar2;
globalThis.Complex = Complex;
//positions /\

globalThis.Tile = Tile;
globalThis.Loop = Loop;
globalThis.Sprite = Sprite;

//images \/
globalThis.ImgCanvas = ImgCanvas;
globalThis.SolidImgCanvas = SolidImgCanvas;
globalThis.BlankImgCanvas = BlankImgCanvas;
//images /\

globalThis.start = start;

//selectors \/
globalThis.tileSelector = tileSelector;
globalThis.spriteSelector = spriteSelector;
//selectors /\

globalThis.blackout = blackout;

//user inputs \/
globalThis.keys = keys;
globalThis.mouse = mouse;
//user inputs /\

globalThis.tiles = tiles;
globalThis.tilemap = tilemap;
globalThis.sprites = sprites;
globalThis.seen = seen;
globalThis.bgcolor = bgcolor;
globalThis.notilecolor = notilecolor;
globalThis.tileSize = tileSize;
globalThis.canvas = canvas;
globalThis.ctx = ctx;
globalThis.memory = memory;
globalThis.fov = fov;
globalThis.halffov = halffov;
globalThis.stepSize = stepSize;
globalThis.tilecreateused = tilecreateused;
globalThis.black = black;
globalThis.sprite_n = sprite_n;
globalThis.spriteBlueprint = spriteBlueprint;
globalThis.update_loops = update_loops;
globalThis.overlay_loops = overlay_loops;
globalThis.lastTime = lastTime;
globalThis.cachedRect = cachedRect;
globalThis.updateCanvasRect = updateCanvasRect;
globalThis.setupInputListeners = setupInputListeners;
globalThis.handleDecollide = handleDecollide;
globalThis.checkAABBCollision = checkAABBCollision;
globalThis.handleTileCollisionsX = handleTileCollisionsX;
globalThis.handleTileCollisionsY = handleTileCollisionsY;
globalThis.calculateTextureTransparency = calculateTextureTransparency;
globalThis.update = update;
globalThis.render = render;
globalThis.loop = loop;