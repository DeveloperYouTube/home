
// ==========================================
// 1. STRING EXTENSIONS (Built into String.prototype)
// ==========================================
// Converts "hello".toIntHash() into a repeatable 32-bit integer
String.prototype.toIntHash = function() {
    let hash = 0;
    if (this.length === 0) return hash;

    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return hash;
};

// ==========================================
// 2. ARRAY EXTENSIONS (Built into Array.prototype)
// ==========================================
// Allows any 2D array to scale itself up directly: grid.scaleUp(2, 2)
Array.prototype.scale2D_up = function(scaleX, scaleY) {
    let result = [];
    this.forEach((array2) => {
        let row = [];
        array2.forEach((element) => {
            for (let index = 0; index < scaleX; index++) {
                row.push(element);
            }
        });
        for (let index = 0; index < scaleY; index++) {
            result.push([...row]);
        }
    });
    return result;
};

// Scales up based on a target max boundary size
Array.prototype.scale2D_upToMax = function(maxX, maxY) {
    if (this.length === 0 || this[0].length === 0) return [];
    const scaleY = Math.floor(maxY / this.length);
    const scaleX = Math.floor(maxX / this[0].length);
    return this.scale2D_up(scaleX, scaleY);
};

// ==========================================
// 3. ENGINE UTILITIES (Attached globally via globalThis)
// ==========================================
globalThis.utils = {
    pause: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    logic: {
        ors: function(...booleans) {
            for (const element of booleans) {
                if (element) return true;
            }
            return false;
        },
        ands: function(...booleans) {
            return !this.ors(...booleans.map(b => !b));
        }
    },
    perlin: {
        noise: function(x, seed = "0") {
            const x0 = Math.floor(x);
            const x1 = x0 + 1;
            const t = x - x0;

            const fade = t * t * t * (t * (t * 6 - 15) + 10);

            const getGradient = (p) => {
                // Uses the shiny new string prototype patch!
                const hash = Math.sin(p + seed.toIntHash()) * 43758.5453123;
                return (hash - Math.floor(hash)) * 2 - 1;
            };

            const g0 = getGradient(x0);
            const g1 = getGradient(x1);
            
            const n0 = g0 * t;
            const n1 = g1 * (t - 1);

            const lerp = (a, b, weight) => a + weight * (b - a);
            return lerp(n0, n1, fade) + 0.5;
        }
    }
};


// /===================\
// ||Math. mods/addons||
// \===================/

const atan1 = Math.atan;

// ==========================================
// 1. ANGLE-TO-NUMBER FUNCTIONS (Trig Ratios)
// ==========================================

// sec(angle) = 1 / cos(angle)
Math.sec = function(radians) {
    return 1.0 / Math.cos(radians);
};

// csc(angle) = 1 / sin(angle)
Math.csc = function(radians) {
    return 1.0 / Math.sin(radians);
};

// cot(angle) = 1 / tan(angle)
Math.cot = function(radians) {
    return 1.0 / Math.tan(radians);
};


// ==========================================
// 2. NUMBER-TO-ANGLE FUNCTIONS (Inverses)
// ==========================================

// asec(ratio) -> returns angle
Math.asec = function(ratio) {
    return Math.acos(1.0 / ratio);
};

// acsc(ratio) -> returns angle
Math.acsc = function(ratio) {
    return Math.asin(1.0 / ratio);
};

// acot(ratio) OR acot(y, x) -> multi-argument variant
Math.acot = function(y, x) {
    if (x === undefined) {
        return atan1(1.0 / y); // 1 input: treats 'y' as the standard ratio
    }
    return Math.atan2(x, y);   // 2 inputs: 4-quadrant vertical angle finder
};

// atan(ratio) OR atan(y, x) -> multi-argument variant
Math.atan = function(y, x) {
    if (x === undefined) {
        return atan1(y);       // 1 input: treats 'y' as the standard ratio
    }
    return Math.atan2(y, x);   // 2 inputs: 4-quadrant horizontal angle finder
};

// Dedicated 4-quadrant vertical tool
Math.acot2 = function(y, x) {
    return Math.atan2(x, y);
};

//========================================
// --- 1. Degree & Radian Conversions ---
//========================================
// --- Conversions (The Complete Angular Grid) ---
Math.rad2deg = function(radians) {
    return radians * (180 / Math.PI);
};

Math.deg2rad = function(degrees) {
    return degrees * (Math.PI / 180);
};

Math.deg2grad = function(degrees) {
    return degrees * (10 / 9);
};

Math.rad2grad = function(radians) {
    return radians * (200 / Math.PI);
};

Math.grad2rad = function(gradians) {
    return gradians * (Math.PI / 200);
};

Math.grad2deg = function(gradians) {
    return gradians * (9 / 10);
};

// --- Array Utilities ---
Math.range = function(...numbers) {
    if (numbers.length === 0) return 0;
    return Math.max(...numbers) - Math.min(...numbers);
};

// --- Series & Factorial ---
Math.sum = function(e, s, f) {
    let r = 0;
    for (let i = s; i <= e; i++) {
        r += f(i);
    }
    return r;
};

Math.product = function(e, s, f) {
    if (e < s) return 1;
    let r = f(s);
    for (let i = s + 1; i <= e; i++) {
        r = r * f(i);
    }
    return r;
};

Math.factorial = function(n) {
    if (n === 0 || n === 1) return 1;
    return Math.product(n, 1, (a) => a);
};

// --- Kinematics ---
Math.calc = {
    velocity: function(a, v, t) {
        return a * t + v;
    },
    integral: function(a, v, t, C) {
        return 0.5 * a * t * t + v * t + C;
    }
};