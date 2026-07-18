//interfaces
// Simple layout to report which side of the box collided
export interface CollisionSide {
    up: boolean;    // Hit from above
    down: boolean;  // Hit from below
    left: boolean;  // Hit from the left
    right: boolean; // Hit from the right
}

export interface TileSpecialProperties {
    passThrough?: boolean;
    // Target sprite, tile grid x, tile grid y, and side hit
    onTouch?: (runner: Sprite, side: CollisionSide) => void;
    within?: (runner: Sprite, x: number, y: number) => void;
}

export interface SpriteStatProperties {
    hp: number;
    damage: (type: string, ammount: number) => void;
    movement: (keyboard: Record<string, boolean>, mouse: Record<string, any>) => void;
    passThrough?: boolean;
    // Target sprite, other sprite hit, and side hit
    onTouch?: (runner: Sprite, side: CollisionSide) => void;
    within?: (runner: Sprite) => void;
}

//vector
class Vector2 {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
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
        return `${this._x},${this._y}`
    }
}
class ImgCanvas {
    public src: string;
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public isLoaded: boolean = false;

    /**
     * @param filepath - The text path or URL to the image file (e.g., './assets/img.png')
     */
    constructor(filepath: string) {
        this.src = filepath;

        // 1. Create the invisible canvas element in system memory
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;

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
    public get width(): number {
        return this.canvas.width;
    }

    public get height(): number {
        return this.canvas.height;
    }
}
// 1. Declare your registries globally using proper TypeScript Record types
export const tiles: Record<string, Tile> = {};
export const tilemap: Record<string, string> = {};

class Tile {
    private img: ImgCanvas;
    private special: any;

    private constructor(img: ImgCanvas, special: object) {
        this.img = img;
        this.special = special;
    }

    // Static registration method
    static create(name: string, img: ImgCanvas, special: object): void {
        tiles[name] = new Tile(img, special);
    }

    // Static map placement method
    static set(p: Vector2, name: string): void {
        // Use your clean p.vectors getter here! 
        // This converts the Vector2 instance into a unique string key like "12,34"
        tilemap[p.vectors] = name;
    }
    static remove(p: Vector2, name?: string): void {
        if (!name || tilemap[p.vectors] == name) {
            delete tilemap[p.vectors]
        }
    }
    get properties(): any {
        return this.special;
    }
    get image(): ImgCanvas {
        return this.img;
    }
}
export const sprites: Record<number, Sprite> = {};
export let sprite_n: number = 0;
// Use Record<string, any> instead of object so TypeScript allows dynamic property access
export const spriteBlueprint: Record<string, { img: ImgCanvas; stats: Record<string, any> }> = {};

class Sprite {
    public p: Vector2;
    public v: Vector2;
    public a: Vector2;
    public img: ImgCanvas;
    public size: Vector2;
    public stats: Record<string, any>;

    private constructor(p: Vector2, v: Vector2, a: Vector2, img: ImgCanvas, stats?: Record<string, any>) {
        this.p = p;
        this.v = v;
        this.a = a;
        this.img = img;
        this.size = new Vector2(img.width,img.height);
        this.stats = stats || {};
    }

    static create(name: string, img: ImgCanvas, stats?: Record<string, any>): void {
        spriteBlueprint[name] = {
            img: img,
            stats: stats || {}
        };
    }

    static summon(p: Vector2, v: Vector2, a: Vector2, img: ImgCanvas, stats?: Record<string, any>): number {
        sprite_n++;
        sprites[sprite_n]=new this(p, v, a, img, stats);
        return sprite_n;
    }

    static summonBlueprint(name: string, p: Vector2, v: Vector2, a: Vector2, overrides?: Record<string, any>): void {
        const blueprint = spriteBlueprint[name];
        if (!blueprint) {
            console.error(`Sprite blueprint '${name}' does not exist!`);
            return;
        }

        // 1. Safely combine template stats and override stats into a brand new object.
        // This spreads the original stats, then overwrites them with anything inside overrides.
        const finalStats = { 
            ...blueprint.stats, 
            ...(overrides || {}) 
        };

        // 2. Spawn the sprite using the merged data
        this.summon(p, v, a, blueprint.img, finalStats);
    }
}






//GAME LOGIC
// ==========================================
// INPUT TRACKING STRUCTURES
// ==========================================
export type KeyState = Record<string, boolean>;

export interface MouseState {
    x: number;       // Canvas-relative X coordinate
    y: number;       // Canvas-relative Y coordinate
    left: boolean;   // True if left mouse button is pressed
    right: boolean;  // True if right mouse button is pressed
}

// Global engine input registries
export const keys: KeyState = {};
export const mouse: MouseState = { x: 0, y: 0, left: false, right: false };

// ==========================================
// SYSTEM LISTENERS
// ==========================================
export function setupInputListeners(canvasElement: HTMLCanvasElement): void {
    // 1. Keyboard Tracking
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // 2. Mouse Position Tracking (Adjusted for canvas bounding margins)
    canvasElement.addEventListener('mousemove', (e) => {
        const rect = canvasElement.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // 3. Dedicated Mouse Button Click Trackers
    canvasElement.addEventListener('mousedown', (e) => {
        if (e.button === 0) mouse.left = true;
        if (e.button === 2) mouse.right = true;
    });

    canvasElement.addEventListener('mouseup', (e) => {
        if (e.button === 0) mouse.left = false;
        if (e.button === 2) mouse.right = false;
    });

    // Prevents standard right-click context popups from breaking canvas actions
    canvasElement.addEventListener('contextmenu', (e) => e.preventDefault());
}
// ==========================================
// 3. ENGINE MECHANICS & MAIN LOOP
// ==========================================
let lastTime = performance.now();

function update(): void {
    const currentTime = performance.now();
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    for (const id in sprites) {
        const sprite = sprites[id]
        sprite.stats.movement(keys, mouse)
        sprite.p.x += sprite.v.x * dt + 0.5 * sprite.a.x * dt * dt
        sprite.p.y += sprite.v.y * dt + 0.5 * sprite.a.y * dt * dt
        sprite.v.x += sprite.a.x * dt
        sprite.v.y += sprite.a.y * dt
    }
    for (const id1 in sprites) {for (const id2 in sprites) {
        if (id1==id2){continue}
        const spr1 = sprites[id1]
        const spr2 = sprites[id2]
        if(checkAABBCollision(spr1, spr2)){handleDecollide(spr1,spr2)}
    }}
    for (const id in sprites) {
        const sprite = sprites[id]
        handleTileCollisions(sprite)
    }
}
function handleDecollide(s1: Sprite, s2: Sprite): void {
    if (!(s1.stats.passThrough || s2.stats.passThrough)) {
        
        const result: CollisionSide = {
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
                if (!s1.stats.immoveable) s1.v.x = 0;
            } else {
                result.right = true;
                if (!s1.stats.immoveable) s1.v.x = 0;
            }
        } else {
            if (distY > 0) {
                result.up = true;
                if (!s1.stats.immoveable) s1.v.y = 0;
            } else {
                result.down = true;
                if (!s1.stats.immoveable) s1.v.y = 0; // Acceleration left completely untouched!
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
        s2.stats.onTouch?.(s1, result);

    } else {
        s2.stats.within?.(s1);
    }
}
function checkAABBCollision(s1: Sprite, s2: Sprite): boolean {
  // Check if they overlap on the horizontal X axis
  const overlapX = s1.p.x < s2.p.x + s2.size.x && s1.p.x + s1.size.x > s2.p.x

  // Check if they overlap on the vertical Y axis
  const overlapY = s1.p.y < s2.p.y + s2.size.y && s1.p.y + s1.size.y > s2.p.y

  // A collision only happens if BOTH are true!
  return overlapX && overlapY
}
function handleTileCollisions(s1: Sprite): void {
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
            if (!tileName) continue; 

            const tile = tiles[tileName];
            if (!tile) continue;

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
                    props.within?.(s1);
                    continue; 
                }

                // --- SOLID PHYSICS DE-COLLISION PHASE ---
                const result: CollisionSide = { up: false, down: false, left: false, right: false };
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
                    } else {
                        // Sprite is on the left, moving right into the tile's left face
                        if (s1.v.x > 0) {
                            s1.p.x -= overlapX; // Push out fully
                            s1.v.x = 0;
                            result.right = true;
                            collided = true;
                        }
                    }
                } else {
                    // Vertical Collision Check
                    if (distY > 0) {
                        // Sprite is below, moving up into the tile's ceiling face
                        if (s1.v.y < 0) {
                            s1.p.y += overlapY; // Push out fully
                            s1.v.y = 0;
                            result.up = true;
                            collided = true;
                        }
                    } else {
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
                    props.onTouch?.(s1, result);
                }
            }
        }
    }
}

function render(): void {
    if (!ctx || !canvas) return;

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

            if (!tileName) {
                ctx.fillStyle = notilecolor;
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
                continue;
            }

            const tile = tiles[tileName];
            if (tile && tile.image && tile.image.isLoaded) {
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
            // OPTIMIZATION: Check if the sprite overlaps the camera screen bounds
            const isVisible = sprite.p.x < camX + canvas.width &&
                              sprite.p.x + sprite.size.x > camX &&
                              sprite.p.y < camY + canvas.height &&
                              sprite.p.y + sprite.size.y > camY;

            if (isVisible) {
                ctx.drawImage(
                    sprite.img.canvas,
                    sprite.p.x - camX,
                    sprite.p.y - camY,
                    sprite.size.x,
                    sprite.size.y
                );
            }
        }
    }
}

function loop(): void {
    update();
    render();
    requestAnimationFrame(loop)
}
export let tileSize: number;
export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D; // Store the context for fast drawing loops
export let bgcolor: string;
export let notilecolor: string;

export function start(_tileSize: number, _canvas: HTMLCanvasElement, bg:string, notile: string) {
    bgcolor=bg
    notilecolor=notile
    tileSize = _tileSize;
    canvas = _canvas;
    ctx = canvas.getContext("2d")!; // Capture the 2D canvas context
    
    lastTime = performance.now(); // Initialize the frame timer safely
    loop();
}