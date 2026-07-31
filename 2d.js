import '/home/utilities.js';
export let tileSize;
export let canvas;
export let ctx; // Store the context for fast drawing loops
export let bgcolor;
export let notilecolor;
let tilecreateused = false;
let black = false
export let memory = true;
export let fov = Math.PI/3*2;
export let halffov = Math.PI/3;
export let stepSize;
export function blackout(memo, sight, qual) {
    black = true
    memory=memo;
    fov=Math.deg2rad(sight)
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
    loop();} else {//not so safe anymore unlike lasttime initializing safly
        throw new Error("Tile.create() must be invoked at least once prior to startGame().");
    }
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
        // 2. Now assign them cleanly without inline type annotations
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
}
let mouse = {
    positiontl: new Vector2(0,0),
    positionmc: new Vector2(0,0),
    anglemc: 0
}
window.addEventListener("mousemove", (event) => {
    // 1. Get the bounding box of the canvas element on the page
    const rect = canvas.getBoundingClientRect();

    // 2. Scale factor in case canvas CSS dimensions differ from internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 3. True canvas pixel coordinates (top-left origin)
    mouse.positiontl.x = (event.clientX - rect.left) * scaleX;
    mouse.positiontl.y = (event.clientY - rect.top) * scaleY;

    // 4. Internal canvas center point
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 5. Offset relative to canvas center
    mouse.positionmc.x = mouse.positiontl.x - centerX;
    mouse.positionmc.y = mouse.positiontl.y - centerY;

    // 6. Angle from canvas center
    mouse.anglemc = Math.atan2(mouse.positionmc.y, mouse.positionmc.x);
});
export class ImgCanvas {
    /**
     * @param filepath - The text path or URL to the image file (e.g., './assets/img.png')
     */
    constructor(filepath) {
        this.isLoaded = false;
        this.src = filepath;
        // 1. Create the invisible canvas element in system memory
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        // 2. Load the image source in the background
        const img = new Image();
        img.onload = () => {
            // Match the canvas dimensions to the downloaded image file exactly
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            // Paint the image onto the invisible canvas canvas once
            this.ctx.drawImage(img, 0, 0);
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
const TAU = Math.PI * 2;
const halfFov = 0.5 * fov;
// 1. Declare your registries globally using proper TypeScript Record types
export const tiles = {};
export const tilemap = {};
export const seen = {};
export const sprites = {};
export class Tile {
    constructor(img, special) {
        this.img = img;
        this.special = special;
        this.transparency=calculateTextureTransparency(img)
    }
    // Static registration method
    static create(name, img, special) {
        tiles[name] = new Tile(img, special);
        tilecreateused=true;
    }
    // Static map placement method
    static set(p, name,del=false) {
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
// Use Record<string, any> instead of object so TypeScript allows dynamic property access
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
let loops = [];
export class Loop {
    static onUpdate(f) {
        loops.push(f);
    }
}
// Global engine input registries
export const keys = {};
export const mousei = { x: 0, y: 0, left: false, right: false };
// ==========================================
// SYSTEM LISTENERS
// ==========================================
export function setupInputListeners(canvasElement) {
    // 1. Keyboard Tracking
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });
    // 2. Mouse Position Tracking (Adjusted for canvas bounding margins)
    canvasElement.addEventListener('mousemove', (e) => {
        const rect = canvasElement.getBoundingClientRect();
        mousei.x = e.clientX - rect.left;
        mousei.y = e.clientY - rect.top;
    });
    // 3. Dedicated Mouse Button Click Trackers
    canvasElement.addEventListener('mousedown', (e) => {
        if (e.button === 0)
            mousei.left = true;
        if (e.button === 2)
            mousei.right = true;
    });
    canvasElement.addEventListener('mouseup', (e) => {
        if (e.button === 0)
            mousei.left = false;
        if (e.button === 2)
            mousei.right = false;
    });
    // Prevents standard right-click context popups from breaking canvas actions
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
    for (let i = 0; i < loops.length; i++) {
        loops[i](dt); // Pass dt in case callbacks need delta time!
    }
    for (const id in sprites) {
        const sprite = sprites[id];
        const move = sprite.stats.movement(keys, mousei, sprite) || {};
        if (Object.hasOwn(move, 'vx')) {
            sprite.v.x = move.vx;
        }
        if (Object.hasOwn(move, 'vy')) {
            sprite.v.y = move.vy;
        }
        if (Object.hasOwn(move, 'ax')) {
            sprite.a.x = move.ax;
        }
        if (Object.hasOwn(move, 'ay')) {
            sprite.a.y = move.ay;
        }
        sprite.p.x += sprite.v.x * dt + 0.5 * sprite.a.x * dt * dt;
        sprite.p.y += sprite.v.y * dt + 0.5 * sprite.a.y * dt * dt;
        sprite.v.x += sprite.a.x * dt;
        sprite.v.y += sprite.a.y * dt;
    }
    for (const id1 in sprites) {
        for (const id2 in sprites) {
            if (id1 == id2) {
                continue;
            }
            const spr1 = sprites[id1];
            const spr2 = sprites[id2];
            if (checkAABBCollision(spr1, spr2)) {
                handleDecollide(spr1, spr2);
            }
        }
    }
    for (const id in sprites) {
        const sprite = sprites[id];
        handleTileCollisions(sprite);
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
        const overlapX = minSizeX - Math.abs(distX);
        const overlapY = minSizeY - Math.abs(distY);
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
function handleTileCollisions(s1) {
    var _a, _b;
    // 1. Calculate the bounding tile indices based on the sprite's bounding box
    const startX = Math.floor(s1.p.x / tileSize);
    const endX = Math.floor((s1.p.x + s1.size.x) / tileSize);
    const startY = Math.floor(s1.p.y / tileSize);
    const endY = Math.floor((s1.p.y + s1.size.y) / tileSize);
    // 2. Scan every grid coordinate the sprite overlaps
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            // Look up the tile name via your "x,y" string format match
            const tileName = tilemap[`${x},${y}`];
            if (!tileName)
                continue;
            const tile = tiles[tileName];
            if (!tile)
                continue;
            const props = tile.properties; // Access via our class getter
            // Find the boundary boundaries of the current grid tile
            const tileLeft = x * tileSize;
            const tileTop = y * tileSize;
            const center1X = s1.p.x + s1.size.x / 2;
            const center1Y = s1.p.y + s1.size.y / 2;
            const center2X = tileLeft + tileSize / 2;
            const center2Y = tileTop + tileSize / 2;
            const distX = center1X - center2X;
            const distY = center1Y - center2Y;
            const minSizeX = s1.size.x / 2 + tileSize / 2;
            const minSizeY = s1.size.y / 2 + tileSize / 2;
            const overlapX = minSizeX - Math.abs(distX);
            const overlapY = minSizeY - Math.abs(distY);
            // Double check there's an active overlap intersection
            if (overlapX > 0 && overlapY > 0) {
                // --- PASS-THROUGH PHASE ---
                if (props.passThrough) {
                    (_a = props.within) === null || _a === void 0 ? void 0 : _a.call(props, s1);
                    continue;
                }
                // --- SOLID PHYSICS DE-COLLISION PHASE ---
                const result = { up: false, down: false, left: false, right: false };
                let collided = false; // Flag to track if a push actually happened
                if (overlapX < overlapY) {
                    // Horizontal Collision Check
                    if (distX > 0) {
                        // Sprite is on the right, moving left into the tile's right face
                        if (s1.v.x < 0) {
                            s1.p.x += overlapX; // Push out fully
                            s1.v.x = 0;
                            result.left = true;
                            collided = true;
                        }
                    }
                    else {
                        // Sprite is on the left, moving right into the tile's left face
                        if (s1.v.x > 0) {
                            s1.p.x -= overlapX; // Push out fully
                            s1.v.x = 0;
                            result.right = true;
                            collided = true;
                        }
                    }
                }
                else {
                    // Vertical Collision Check
                    if (distY > 0) {
                        // Sprite is below, moving up into the tile's ceiling face
                        if (s1.v.y < 0) {
                            s1.p.y += overlapY; // Push out fully
                            s1.v.y = 0;
                            result.up = true;
                            collided = true;
                        }
                    }
                    else {
                        // Sprite is above, moving down into the tile's floor face
                        if (s1.v.y > 0) {
                            s1.p.y -= overlapY; // Push out fully
                            s1.v.y = 0;
                            result.down = true;
                            collided = true;
                        }
                    }
                }
                // FIXED: Call onTouch exactly once down here, ONLY if a collision actually happened
                if (collided) {
                    (_b = props.onTouch) === null || _b === void 0 ? void 0 : _b.call(props, s1, result);
                }
            }
        }
    }
}
function render() {
    if (!ctx || !canvas)
        return;
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
    const startX = Math.floor(camX / tileSize);
    const endX = Math.ceil((camX + canvas.width) / tileSize);
    const startY = Math.floor(camY / tileSize);
    const endY = Math.ceil((camY + canvas.height) / tileSize);

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const tileName = tilemap[`${x},${y}`];
            const drawX = x * tileSize - camX;
            const drawY = y * tileSize - camY;
            ctx.fillStyle = notilecolor;

            let visible = true
            if (black) {
                // 1. Ray origin (Player center)
                const ray = new Vector2(
                    sprites[1].x + (sprites[1].width / 2),
                    sprites[1].y + (sprites[1].height / 2)
                );

                // 2. Target tile center
                const tilecent = new Vector2(
                    (x + 0.5) * tileSize, 
                    (y + 0.5) * tileSize
                );

                const dx = tilecent.x - ray.x;
                const dy = tilecent.y - ray.y;
                const d = Math.hypot(dx, dy);

                const a = Math.atan2(dy,dx)

                if (fov < TAU && Math.abs(((a - mouse.anglemc) % TAU + TAU + Math.PI) % TAU - Math.PI) > halffov) {visible = false;} else 
                {
                // 3. Step vector
                const steps = Math.ceil(d / stepSize);
                const step = new Vector2(
                    (dx / d) * stepSize,
                    (dy / d) * stepSize
                );

                let raystr = 1;
                let oldtile = new Vector2(NaN,NaN)

                for (let i = 0; i <= steps; i++) {
                    const gridX = Math.floor(ray.x / tileSize);
                    const gridY = Math.floor(ray.y / tileSize);

                    // Only process unique grid cells as the ray crosses boundary lines
                    if (gridX !== oldtile.x || gridY !== oldtile.y) {
                        oldtile.x = gridX;
                        oldtile.y = gridY;

                        const currentTile = tiles[tilemap[`${gridX},${gridY}`]];

                        if (currentTile?.img) {
                            raystr -= (1 - currentTile.transparency);
                            if (raystr <= 0) {visible=false;break}
                        }

                        // Target tile reached
                        if (gridX === x && gridY === y) break;
                    }

                    ray.x += step.x;
                    ray.y += step.y;
                }}
            }

            if (!tileName) {
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
                continue;
            }
            const tile = tiles[tileName];
            if (tile && tile.image && tile.image.isLoaded && visible) {
                ctx.drawImage(tile.image.canvas, drawX, drawY, tileSize, tileSize);
            }
            else {
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
            }
        }
    }

    // 4. Render All Sprites (With Frustum Culling)
    for (const id in sprites) {
        const sprite = sprites[id];
        if (sprite.img && sprite.img.isLoaded) {
            // OPTIMIZATION: Check if the sprite overlaps the camera screen bounds
            const isVisible = sprite.p.x < camX + canvas.width &&
                sprite.p.x + sprite.size.x > camX &&
                sprite.p.y < camY + canvas.height &&
                sprite.p.y + sprite.size.y > camY;
            if (isVisible) {
                ctx.drawImage(sprite.img.canvas, sprite.p.x - camX, sprite.p.y - camY, sprite.size.x, sprite.size.y);
            }
        }
    }
}
function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}
globalThis.Vector2 = Vector2;
globalThis.Tile = Tile;
globalThis.Loop = Loop;
globalThis.Sprite = Sprite;
globalThis.ImgCanvas = ImgCanvas;
globalThis.startGame = start;
