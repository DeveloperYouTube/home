export {}; // Tells TypeScript this is a module, allowing global augmentation

declare global {
    // ==========================================
    // 1. PROTOTYPE EXTENSIONS
    // ==========================================
    interface Object {
        /**
         * Computes the symbolic derivative of this AST object.
         * @param variable The variable to differentiate with respect to (defaults to `'x'`).
         * @returns The resulting symbolic derivative node in the AST.
         */
        prime(variable?: string): ASTNode;
    }

    interface String {
        /**
         * Converts a string into a repeatable 32-bit integer hash.
         * @returns A 32-bit signed integer hash code representation of the string.
         */
        toIntHash(): number;
        /**
         * Encodes this string as an AST and computes its symbolic derivative.
         * @param variable The variable to differentiate with respect to (defaults to `'x'`).
         * @returns The symbolic derivative of the parsed expression tree.
         */
        prime(variable?: string): ASTNode;
    }

    interface Array<T> {
        /**
         * Scales up a 2D array by specific X and Y integer multipliers.
         * @param scaleX The positive integer multiplier for horizontal expansion.
         * @param scaleY The positive integer multiplier for vertical expansion.
         * @returns A new 2D grid scaled up by the specified dimensions.
         */
        scale2D_up(scaleX: number, scaleY: number): T[][];
        /**
         * Scales up a 2D array proportionally based on a target max bounding box.
         * @param maxX The maximum horizontal width constraint.
         * @param maxY The maximum vertical height constraint.
         * @returns A scaled-up 2D array fitting within the target bounding boundaries.
         */
        scale2D_upToMax(maxX: number, maxY: number): T[][];
    }

    interface Number {
        // Rounding Prototypes
        /**
         * Rounds this number to the nearest multiple of the specified interval step.
         * @param i The step interval to round against (defaults to `1`).
         * @returns The rounded number.
         */
        round(i?: number): number;
        /**
         * Rounds this number down to the nearest multiple of the specified interval step.
         * @param i The step interval to floor against (defaults to `1`).
         * @returns The floored number.
         */
        floor(i?: number): number;
        /**
         * Rounds this number up to the nearest multiple of the specified interval step.
         * @param i The step interval to ceiling against (defaults to `1`).
         * @returns The ceiled number.
         */
        ceil(i?: number): number;
        /**
         * Alias for `ceil`. Rounds this number up to the nearest multiple of the specified interval step.
         * @param i The step interval to ceiling against (defaults to `1`).
         * @returns The ceiled number.
         */
        ceiling(i?: number): number;
        /**
         * Truncates this number to the nearest multiple of the specified interval step, removing fractional digits.
         * @param i The step interval to truncate against (defaults to `1`).
         * @returns The truncated number.
         */
        trunc(i?: number): number;
        /**
         * Alias for `trunc`. Truncates this number to the nearest multiple of the specified interval step.
         * @param i The step interval to truncate against (defaults to `1`).
         * @returns The truncated number.
         */
        truncate(i?: number): number;

        // Utilities
        /**
         * Re-maps this number from one range to another.
         * @param in_min The lower bound of the input range.
         * @param in_max The upper bound of the input range.
         * @param out_min The lower bound of the output target range.
         * @param out_max The upper bound of the output target range.
         * @returns The re-mapped value within the output range.
         */
        map(in_min: number, in_max: number, out_min: number, out_max: number): number;
        /**
         * Clamps this number between an inclusive minimum and maximum bound.
         * @param min The lower boundary floor.
         * @param max The upper boundary ceiling.
         * @returns The clamped value.
         */
        clamp(min: number, max: number): number;
        /**
         * Returns the sign of this number, indicating whether it is positive, negative, or zero.
         * @returns `1` if positive, `-1` if negative, or `0` if zero.
         */
        sign(): number;
        /**
         * Returns the absolute value of this number.
         * @returns The positive non-negative magnitude of this number.
         */
        abs(): number;
        /**
         * Alias for `abs`. Returns the absolute value of this number.
         * @returns The positive non-negative magnitude of this number.
         */
        absolute(): number;
    }

    // ==========================================
    // 2. ENGINE UTILITIES (globalThis Namespaces)
    // ==========================================
    /** Asynchronous time and delay engine utility namespace. */
    var time: {
        /**
         * Pauses execution asynchronously for a specified duration in milliseconds.
         * @param ms The duration to pause in milliseconds.
         * @returns A promise that resolves after the timer completes.
         */
        pause(ms: number): Promise<void>;
    };

    /** Procedural Noise Generation namespace. */
    var perlin: {
        /**
         * Generates a 1D Perlin noise value between 0 and 1.
         * @param x The 1D position coordinate along the sampling axis.
         * @param seed Optional seed string for reproducible procedural generation.
         * @returns A continuous pseudo-random noise scalar float between `0` and `1`.
         */
        noise(x: number, seed?: string): number;
    };

    // ==========================================
    // 3. NATIVE MATH ALIASES & TRIG ADDONS
    // ==========================================
    
    // Custom Rounding Utilities with Precision Steps
    /**
     * Rounds a number to the nearest multiple of the specified interval step.
     * @param n The input number.
     * @param i The step interval to round against (defaults to `1`).
     * @returns The rounded number.
     */
    function round(n: number, i?: number): number;
    /**
     * Rounds a number down to the nearest multiple of the specified interval step.
     * @param n The input number.
     * @param i The step interval to floor against (defaults to `1`).
     * @returns The floored number.
     */
    function floor(n: number, i?: number): number;
    /**
     * Rounds a number up to the nearest multiple of the specified interval step.
     * @param n The input number.
     * @param i The step interval to ceiling against (defaults to `1`).
     * @returns The ceiled number.
     */
    function ceil(n: number, i?: number): number;
    /**
     * Alias for `ceil`. Rounds a number up to the nearest multiple of the specified interval step.
     * @param n The input number.
     * @param i The step interval to ceiling against (defaults to `1`).
     * @returns The ceiled number.
     */
    var ceiling: (n: number, i?: number) => number;
    /**
     * Truncates a number to the nearest multiple of the specified interval step, removing fractional digits.
     * @param n The input number.
     * @param i The step interval to truncate against (defaults to `1`).
     * @returns The truncated number.
     */
    function trunc(n: number, i?: number): number;
    /**
     * Alias for `trunc`. Truncates a number to the nearest multiple of the specified interval step.
     * @param n The input number.
     * @param i The step interval to truncate against (defaults to `1`).
     * @returns The truncated number.
     */
    var truncate: (n: number, i?: number) => number;

    // Range, Boundary, & Absolute Mapping Utilities
    /**
     * Re-maps a number from one numeric range to another.
     * @param n The input value to transform.
     * @param in_min The lower bound of the input range.
     * @param in_max The upper bound of the input range.
     * @param out_min The lower bound of the target output range.
     * @param out_max The upper bound of the target output range.
     * @returns The scaled number relative to the output bounds.
     */
    function map(n: number, in_min: number, in_max: number, out_min: number, out_max: number): number;
    /**
     * Clamps a number between an inclusive minimum and maximum bound.
     * @param n The input value.
     * @param min The lower floor boundary.
     * @param max The upper ceiling boundary.
     * @returns The bounded number value.
     */
    function clamp(n: number, min: number, max: number): number;
    /**
     * Returns the absolute value of a number.
     * @param n The input value.
     * @returns The absolute positive value.
     */
    function abs(n: number): number;
    /**
     * Alias for `abs`. Returns the absolute value of a number.
     * @param n The input value.
     * @returns The absolute positive value.
     */
    var absolute: (n: number) => number;

    // Native Math Pass-Throughs
    /**
     * Computes the sine of an angle given in radians.
     * @param x An angle expressed in radians.
     * @returns The sine ratio of the angle (-1 to 1).
     */
    function sin(x: number): number;
    /**
     * Computes the cosine of an angle given in radians.
     * @param x An angle expressed in radians.
     * @returns The cosine ratio of the angle (-1 to 1).
     */
    function cos(x: number): number;
    /**
     * Computes the tangent of an angle given in radians.
     * @param x An angle expressed in radians.
     * @returns The tangent ratio of the angle.
     */
    function tan(x: number): number;
    /**
     * Computes the arcsine (inverse sine) of a number.
     * @param x A numeric value between `-1` and `1`.
     * @returns The angle in radians in the range `[-π/2, π/2]`.
     */
    function asin(x: number): number;
    /**
     * Computes the arccosine (inverse cosine) of a number.
     * @param x A numeric value between `-1` and `1`.
     * @returns The angle in radians in the range `[0, π]`.
     */
    function acos(x: number): number;

    // Angle-to-Number Functions (Trig Ratios)
    /**
     * Calculates the secant of an angle (`1 / cos(x)`).
     * @param radians An angle expressed in radians.
     * @returns The secant ratio value.
     */
    function sec(radians: number): number;
    /**
     * Calculates the cosecant of an angle (`1 / sin(x)`).
     * @param radians An angle expressed in radians.
     * @returns The cosecant ratio value.
     */
    function csc(radians: number): number;
    /**
     * Calculates the cotangent of an angle (`1 / tan(x)`).
     * @param radians An angle expressed in radians.
     * @returns The cotangent ratio value.
     */
    function cot(radians: number): number;

    // Number-to-Angle Functions (Inverses)
    /**
     * Computes the arcsecant (inverse secant) ratio angle.
     * @param ratio The secant ratio.
     * @returns The angle in radians.
     */
    function asec(ratio: number): number;
    /**
     * Computes the arccosecant (inverse cosecant) ratio angle.
     * @param ratio The cosecant ratio.
     * @returns The angle in radians.
     */
    function acsc(ratio: number): number;
    /**
     * Single argument finds inverse cotangent ratio. Dual argument acts as a 4-quadrant vertical angle tracker (x, y).
     * @param y The vertical Y coordinate or input scalar ratio.
     * @param x Optional horizontal X coordinate for 4-quadrant tracking.
     * @returns The arc-cotangent angle in radians.
     */
    function acot(y: number, x?: number): number;
    /**
     * Single argument finds standard inverse tangent. Dual argument calculates 4-quadrant horizontal coordinates (y, x).
     * @param y The vertical Y coordinate or input scalar ratio.
     * @param x Optional horizontal X coordinate for 4-quadrant tracking.
     * @returns The arc-tangent angle in radians.
     */
    function atan(y: number, x?: number): number;
    /**
     * Dedicated 4-quadrant vertical angle calculator.
     * @param y The vertical Y component coordinate.
     * @param x The horizontal X component coordinate.
     * @returns The angle in radians between the positive y-axis and vector (x, y).
     */
    function acot2(y: number, x: number): number;
    /**
     * Dedicated 4-quadrant horizontal angle calculator.
     * @param y The vertical Y component coordinate.
     * @param x The horizontal X component coordinate.
     * @returns The angle in radians between the positive x-axis and vector (x, y).
     */
    function atan2(y: number, x: number): number;

    // Angular Grid Conversions
    /**
     * Converts an angular measurement from radians to degrees.
     * @param radians The angle in radians.
     * @returns The equivalent angle in degrees.
     */
    function rad2deg(radians: number): number;
    /**
     * Converts an angular measurement from degrees to radians.
     * @param degrees The angle in degrees.
     * @returns The equivalent angle in radians.
     */
    function deg2rad(degrees: number): number;
    /**
     * Converts an angular measurement from degrees to gradians.
     * @param degrees The angle in degrees.
     * @returns The equivalent angle in gradians (400 grad = 360 deg).
     */
    function deg2grad(degrees: number): number;
    /**
     * Converts an angular measurement from radians to gradians.
     * @param radians The angle in radians.
     * @returns The equivalent angle in gradians.
     */
    function rad2grad(radians: number): number;
    /**
     * Converts an angular measurement from gradians to radians.
     * @param gradians The angle in gradians.
     * @returns The equivalent angle in radians.
     */
    function grad2rad(gradians: number): number;
    /**
     * Converts an angular measurement from gradians to degrees.
     * @param gradians The angle in gradians.
     * @returns The equivalent angle in degrees.
     */
    function grad2deg(gradians: number): number;

    // Logarithms
    /**
     * Returns the logarithm of a number `n` with a specified base `b`.
     * @param b The base of the logarithm.
     * @param n The value to calculate the logarithm for.
     * @returns The exponent value log_b(n).
     */
    function log(b: number, n: number): number;

    // Series, Factorial, & Ranges
    /**
     * Calculates the difference between the highest and lowest numbers in a dataset.
     * @param numbers Variable list of numerical arguments.
     * @returns The difference `(max - min)`.
     */
    function range(...numbers: number[]): number;
    /**
     * Computes Sigma Summation (Σ) from start value to end value using a callback function template.
     * @param e The upper bound limit index of the iteration sequence.
     * @param s The starting index value of the sum loop.
     * @param f Evaluation function called on every step index `(i: number) => number`.
     * @returns The total calculated sum.
     */
    function sum(e: number, s: number, f: (i: number) => number): number;
    /**
     * Computes Pi Product Series (∏) from start value to end value using a callback function template.
     * @param e The upper bound limit index of the iteration sequence.
     * @param s The starting index value of the product loop.
     * @param f Evaluation function called on every step index `(i: number) => number`.
     * @returns The total cumulative product.
     */
    function product(e: number, s: number, f: (i: number) => number): number;
    /**
     * Calculates the factorial value of a number (n!).
     * @param n Non-negative integer input.
     * @returns The computed product sequence value (`n * (n-1) * ... * 1`).
     */
    function factorial(n: number): number;
    /**
     * Returns true if a value lies safely within inclusive minimum and maximum boundaries.
     * @param min Inclusive minimum lower threshold boundary.
     * @param n Target value to test.
     * @param max Inclusive maximum upper threshold boundary.
     * @returns `true` if `min <= n <= max`, otherwise `false`.
     */
    function within(min: number, n: number, max: number): boolean;

    // Lowercase & Custom Pre-calculated Math Constants
    /** The mathematical constant Pi (π ≈ 3.14159). */
    var pi: number;
    /** The circle constant Tau, equal to 2π (τ ≈ 6.28318). */
    var tau: number;
    /** The square root of 0.5 (`sqrt(0.5)` ≈ 0.70710). */
    var sqrt0_5: number;
    /** The square root of 5 (`sqrt(5)` ≈ 2.23606). */
    var sqrt5: number;
    /** The square root of 10 (`sqrt(10)` ≈ 3.16227). */
    var sqrt10: number;
    /** The square root of 2560 (`sqrt(2560)` ≈ 50.59644). */
    var sqrt2560: number;
    /** The square root of 81920 (`sqrt(81920)` ≈ 286.21670). */
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
        /** Core Abstract Syntax Tree (AST) compilation, decoding, and evaluation tools. */
        AST: {
            /**
             * Compiles a structural mathematical expression string sequence into an object tree matrix.
             * @param str Raw mathematical string expression to parse.
             * @returns The generated `MathExpression` node or composite tree structure.
             */
            encode(str: string): MathExpression;
            /**
             * Reconstructs an expression tree object sequence back into a standard math formula string.
             * @param node The AST node or string expression to decode.
             * @returns The formatted formula string representation.
             */
            decode(node: MathExpression): string;
            /**
             * Recursively resolves an expression tree down into a computed float value using environment mappings.
             * @param node The target AST node or expression to evaluate.
             * @param scope Optional key-value record mapping variable names to numerical values.
             * @returns The resolved scalar float evaluation result.
             */
            evaluate(node: MathExpression, scope?: Record<string, any>): number;
        };
    }

    // ==========================================
    // 5. SYMBOLIC CALCULUS ENGINE FUNCTIONS
    // ==========================================
    
    /**
     * Applies symbolic differentiation transformations onto a tree node structure relative to a targeted variable identity.
     * @param node The target AST node or string expression to differentiate.
     * @param variable The variable to differentiate with respect to (defaults to `'x'`).
     * @returns The differentiated symbolic expression tree.
     */
    function derivative(node: MathExpression, variable?: string): MathExpression;
    
    /**
     * Applies symbolic anti-derivative transformations onto a tree node structure relative to a targeted variable identity.
     * @param node The target AST node or string expression to integrate.
     * @param variable The variable to integrate with respect to (defaults to `'x'`).
     * @returns The integrated symbolic expression tree.
     */
    function integral(node: MathExpression, variable?: string): MathExpression;
    
    /**
     * Computes a definite integral bound calculation across a localized interval window using FTC evaluation mapping equations.
     * @param a Lower boundary limit of integration.
     * @param b Upper boundary limit of integration.
     * @param f Target expression tree or formula string to evaluate.
     * @param variable The integration variable identity (defaults to `'x'`).
     * @returns The calculated numerical definite integral value.
     */
    function limitIntegral(a: number, b: number, f: MathExpression, variable?: string): number;

    /**
     * Calculates the absolute difference between two numbers `|a - b|`.
     * @param a The first scalar number.
     * @param b The second scalar number.
     * @returns The positive scalar distance interval between the two values.
     */
    function difference(a: number, b: number): number;
}
