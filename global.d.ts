export {}; // Tells TypeScript this is a module, allowing global augmentation

declare global {
    // ==========================================
    // 1. PROTOTYPE EXTENSIONS
    // ==========================================
    interface String {
        /** Converts a string into a repeatable 32-bit integer hash. */
        toIntHash(): number;
    }

    interface Array<T> {
        /** Scales up a 2D array by specific X and Y integer multipliers. */
        scale2D_up(scaleX: number, scaleY: number): T[][];
        /** Scales up a 2D array proportionally based on a target max bounding box. */
        scale2D_upToMax(maxX: number, maxY: number): T[][];
    }

    interface Number {
        // Rounding Prototypes
        /** Rounds this number to the nearest multiple of the specified interval step. */
        round(i?: number): number;
        /** Rounds this number down to the nearest multiple of the specified interval step. */
        floor(i?: number): number;
        /** Rounds this number up to the nearest multiple of the specified interval step. */
        ceil(i?: number): number;
        /** Alias for `ceil`. Rounds this number up to the nearest multiple of the specified interval step. */
        ceiling(i?: number): number;
        /** Truncates this number to the nearest multiple of the specified interval step, removing fractional digits. */
        trunc(i?: number): number;
        /** Alias for `trunc`. Truncates this number to the nearest multiple of the specified interval step. */
        truncate(i?: number): number;

        // Utilities
        /** Re-maps this number from one range to another. */
        map(in_min: number, in_max: number, out_min: number, out_max: number): number;
        /** Clamps this number between an inclusive minimum and maximum bound. */
        clamp(min: number, max: number): number;
        /** Returns the sign of this number, indicating whether it is positive, negative, or zero. */
        sign(): number;
        /** Returns the absolute value of this number. */
        abs(): number;
        /** Alias for `abs`. Returns the absolute value of this number. */
        absolute(): number;
    }

    // ==========================================
    // 2. ENGINE UTILITIES (globalThis Namespaces)
    // ==========================================
    var time: {
        /** Pauses execution asynchronously for a specified duration in milliseconds. */
        pause(ms: number): Promise<void>;
    };

    var perlin: {
        /** Generates a 1D Perlin noise value between 0 and 1. */
        noise(x: number, seed?: string): number;
    };

    // ==========================================
    // 3. NATIVE MATH ALIASES & TRIG ADDONS
    // ==========================================
    
    // Custom Rounding Utilities with Precision Steps
    /** Rounds a number to the nearest multiple of the specified interval step. */
    function round(n: number, i?: number): number;
    /** Rounds a number down to the nearest multiple of the specified interval step. */
    function floor(n: number, i?: number): number;
    /** Rounds a number up to the nearest multiple of the specified interval step. */
    function ceil(n: number, i?: number): number;
    /** Alias for `ceil`. Rounds a number up to the nearest multiple of the specified interval step. */
    var ceiling: (n: number, i?: number) => number;
    /** Truncates a number to the nearest multiple of the specified interval step, removing fractional digits. */
    function trunc(n: number, i?: number): number;
    /** Alias for `trunc`. Truncates a number to the nearest multiple of the specified interval step. */
    var truncate: (n: number, i?: number) => number;

    // Range, Boundary, & Absolute Mapping Utilities
    /** Re-maps a number from one numeric range to another. */
    function map(n: number, in_min: number, in_max: number, out_min: number, out_max: number): number;
    /** Clamps a number between an inclusive minimum and maximum bound. */
    function clamp(n: number, min: number, max: number): number;
    /** Returns the absolute value of a number. */
    function abs(n: number): number;
    /** Alias for `abs`. Returns the absolute value of a number. */
    var absolute: (n: number) => number;

    // Native Math Pass-Throughs
    function sin(x: number): number;
    function cos(x: number): number;
    function tan(x: number): number;
    function asin(x: number): number;
    function acos(x: number): number;

    // Angle-to-Number Functions (Trig Ratios)
    function sec(radians: number): number;
    function csc(radians: number): number;
    function cot(radians: number): number;

    // Number-to-Angle Functions (Inverses)
    function asec(ratio: number): number;
    function acsc(ratio: number): number;
    /** Single argument finds inverse cotangent ratio. Dual argument acts as a 4-quadrant vertical angle tracker (x, y). */
    function acot(y: number, x?: number): number;
    /** Single argument finds standard inverse tangent. Dual argument calculates 4-quadrant horizontal coordinates (y, x). */
    function atan(y: number, x?: number): number;
    /** Dedicated 4-quadrant vertical angle calculator. */
    function acot2(y: number, x: number): number;
    /** Dedicated 4-quadrant horizontal angle calculator. */
    function atan2(y: number, x: number): number;

    // Angular Grid Conversions
    function rad2deg(radians: number): number;
    function deg2rad(degrees: number): number;
    function deg2grad(degrees: number): number;
    function rad2grad(radians: number): number;
    function grad2rad(gradians: number): number;
    function grad2deg(gradians: number): number;

    // Logarithms
    /** Returns the logarithm of a number `n` with a specified base `b`. */
    function log(b: number, n: number): number;

    // Series, Factorial, & Ranges
    /** Calculates the difference between the highest and lowest numbers in a dataset. */
    function range(...numbers: number[]): number;
    /** Computes Sigma Summation (Σ) from start value to end value using a callback function template. */
    function sum(e: number, s: number, f: (i: number) => number): number;
    /** Computes Pi Product Series (∏) from start value to end value using a callback function template. */
    function product(e: number, s: number, f: (i: number) => number): number;
    /** Calculates the factorial value of a number (n!). */
    function factorial(n: number): number;
    /** Returns true if a value lies safely within inclusive minimum and maximum boundaries. */
    function within(min: number, n: number, max: number): boolean;

    // Lowercase & Custom Pre-calculated Math Constants
    /** π */
    var pi: number;
    /** τ, aka 2π */
    var tau: number;
    /** sqrt(0.5) */
    var sqrt0_5: number;
    /** sqrt(5) */
    var sqrt5: number;
    /** sqrt(10) */
    var sqrt10: number;
    /** sqrt(2560) */
    var sqrt2560: number;
    /** sqrt(81920) */
    var sqrt81920: number;

    // ==========================================
    // 4. ABSTRACT SYNTAX TREE (AST) CORE ENGINE
    // ==========================================
    
    /** Represents an operational node inside the mathematical Abstract Syntax Tree. */
    interface ASTNode {
        /** The structural function command type or operator label. */
        operator: string;
        /** Optional classic expression node properties. */
        type?: string;
        /** Optional value literal assignment tracking properties. */
        value?: any;
        /** Optional identity tag labels. */
        name?: string;
        /** Maps argument sub-trees sequentially to properties (e.g., input1, input2, input3). */
        [inputKey: string]: MathExpression | any;
    }

    /** Mapped union type containing valid items parsed across the engine scope. */
    type MathExpression = ASTNode | string;

    // Namespace attachment declaration for the native Math interface
    interface Math {
        AST: {
            /** Compiles a structural mathematical expression string sequence into an object tree matrix. */
            encode(str: string): MathExpression;
            /** Reconstructs an expression tree object sequence back into a standard math formula string. */
            decode(node: MathExpression): string;
            /** Recursively resolves an expression tree down into a computed float value using environment mappings. */
            evaluate(node: MathExpression, scope?: Record<string, any>): number;
        };
    }

    // ==========================================
    // 5. SYMBOLIC CALCULUS ENGINE FUNCTIONS
    // ==========================================
    
    /** Applies symbolic differentiation transformations onto a tree node structure relative to a targeted variable identity. */
    function derivative(node: MathExpression, variable?: string): MathExpression;
    
    interface integral {
        indefinite(node, variable): object;
        definite(a,b,f,v): number;
    }





    function difference(a: number, b: number): number;
}