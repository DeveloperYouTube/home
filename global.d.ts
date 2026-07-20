declare global {
    // ==========================================
    // 1. NATIVE MATH EXTENSIONS (Math.*)
    // ==========================================
    interface Math {
        // --- 4-Quadrant Functions (Y-First Coordinate Aligned) ---
        atan(y: number, x?: number): number;
        acot(y: number, x?: number): number;
        acot2(y: number, x: number): number;

        // --- Reciprocal Trigonometric Functions & Inverses ---
        sec(radians: number): number;
        csc(radians: number): number;
        cot(radians: number): number;
        asec(ratio: number): number;
        acsc(ratio: number): number;

        // --- Complete Angular Conversion Grid ---
        rad2deg(radians: number): number;
        deg2rad(degrees: number): number;
        deg2grad(degrees: number): number;
        rad2grad(radians: number): number;
        grad2rad(gradians: number): number;
        grad2deg(gradians: number): number;

        // --- Array, Series, & Math Tools ---
        range(...numbers: number[]): number;
        sum(e: number, s: number, f: (i: number) => number): number;
        product(e: number, s: number, f: (i: number) => number): number;
        factorial(n: number): number;

        // --- Kinematics Sub-Object ---
        calc: {
            velocity(a: number, v: number, t: number): number;
            integral(a: number, v: number, t: number, C: number): number;
        };
    }

    // ==========================================
    // 2. PROTOTYPE EXTENSIONS ("string".* and [array].*)
    // ==========================================
    interface String {
        /** Converts any string into a repeatable 32-bit integer hash. */
        toIntHash(): number;
    }

    interface Array<T> {
        /** Scales up a 2D array by separate X and Y factor multipliers. */
        scale2D_up(scaleX: number, scaleY: number): any[][];
        /** Scales up a 2D array automatically based on target boundary caps. */
        scale2D_upToMax(maxX: number, maxY: number): any[][];
    }

    // ==========================================
    // 3. GLOBAL ENGINE UTILITIES (utils.*)
    // ==========================================
    var utils: {
        /** Non-blocking async sleep pause tool. */
        pause(ms: number): Promise<void>;
        logic: {
            ors(...booleans: boolean[]): boolean;
            ands(...booleans: boolean[]): boolean;
        };
        perlin: {
            noise(x: number, seed?: string): number;
        };
    };
}

// Crucial line: tells TypeScript this is a module file so the global injection binds correctly
export {};