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
    onTouch?: (runner: Sprite, x: number, y: number, side: CollisionSide) => void;
    within?: (runner: Sprite, x: number, y: number) => void;
}

export interface SpriteStatProperties {
    hp: number;
    passThrough?: boolean;
    // Target sprite, other sprite hit, and side hit
    onTouch?: (runner: Sprite, other: Sprite, side: CollisionSide) => void;
    within?: (runner: Sprite, other: Sprite) => void;
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
    private special: object;

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
}
export const sprites: Sprite[] = [];
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

    static summon(p: Vector2, v: Vector2, a: Vector2, img: ImgCanvas, stats?: Record<string, any>): void {
        sprites.push(new this(p, v, a, img, stats));
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

    // Cap dt to avoid huge physics jumps during stutters
    if (dt > 0.1) return; 

    // 1. Receive Input Across All Sprites
    for (let i = 0; i < sprites.length; i++) {
        sprites[i].movement(sprites[i], keys, mouse);
    }

    // 2. Exact Kinematic Motion Pass
    for (let i = 0; i < sprites.length; i++) {
        const s = sprites[i];
        s.p.x += (0.5 * s.a.x * dt * dt) + (s.v.x * dt);
        s.p.y += (0.5 * s.a.y * dt * dt) + (s.v.y * dt);

        s.v.x += s.a.x * dt;
        s.v.y += s.a.y * dt;
    }

    // 3. Collisions (Tiles First -> Sprites Second)
    for (let i = 0; i < sprites.length; i++) {
        handleTileCollisions(sprites[i]);
        handleSpriteCollisions(sprites[i], i);
    }
}

function render(): void {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw Background Tiles
    for (const [posKey, tileName] of Object.entries(tilemap)) {
        const [x, y] = posKey.split(',').map(Number);
        const tileConfig = tiles[tileName];
        if (tileConfig) {
            ctx.drawImage(tileConfig.img.canvas, x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Draw Foreground Sprites
    for (let i = 0; i < sprites.length; i++) {
        const s = sprites[i];
        ctx.drawImage(s.img.canvas, s.p.x, s.p.y);
    }
}

function loop(): void {
    update();
    render();
    requestAnimationFrame(loop);
};
// ==========================================
// ENGINE CONFIGURATION
// ==========================================
export let tileSize: number = 32; // Square tiles (e.g., 32x32 pixels)

// ==========================================
// COLLISION SYSTEM
// ==========================================

function handleTileCollisions(s: Sprite): void {
    // 1. Calculate the bounding box of the sprite in pixels
    const spriteLeft = s.p.x;
    const spriteRight = s.p.x + s.size.x;
    const spriteTop = s.p.y;
    const spriteBottom = s.p.y + s.size.y;

    // 2. Convert pixel boundaries into grid coordinates to check nearby tiles
    const startX = Math.floor(spriteLeft / tileSize);
    const endX = Math.floor(spriteRight / tileSize);
    const startY = Math.floor(spriteTop / tileSize);
    const endY = Math.floor(spriteBottom / tileSize);

    // 3. Scan the grid area overlapping the sprite
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const coordinateKey = `${x},${y}`;
            const tileName = tilemap[coordinateKey];

            if (tileName) {
                const tileConfig = tiles[tileName];
                
                
                if (tileConfig && !tileConfig.passThrough) {
                    // Your custom de-collision pushing logic will go right here!
                }
            }
        }
    }
}

function handleSpriteCollisions(s: Sprite, index: number): void {
    // Start looping from index + 1 to avoid checking the same pair twice or checking a sprite against itself
    for (let j = index + 1; j < sprites.length; j++) {
        const other = sprites[j];

        // Axis-Aligned Bounding Box (AABB) overlap check
        const isOverlapping = 
            s.p.x < other.p.x + other.size.x &&
            s.p.x + s.size.x > other.p.x &&
            s.p.y < other.p.y + other.size.y &&
            s.p.y + s.size.y > other.p.y;

        if (isOverlapping) {
            // Reserve space for special behaviors (e.g., bullet hits player, items get picked up)
            
            // Your custom de-collide physical pushing math goes here!
        }
    }
}