
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
// 1. Time utilities
globalThis.time = {
    pause: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// 2. Perlin noise utilities
globalThis.perlin = {
    noise: function(x, seed = "0") {
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const t = x - x0;

        const fade = t * t * t * (t * (t * 6 - 15) + 10);

        const getGradient = (p) => {
            // Uses the custom String.prototype.toIntHash!
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
};


// /===================\
// ||Math. mods/addons||
// \===================/


// ==========================================
// 1. ANGLE-TO-NUMBER FUNCTIONS (Trig Ratios)
// ==========================================

// sec(angle) = 1 / cos(angle)
globalThis.sec = function(radians) {
    return 1.0 / Math.cos(radians);
};

// csc(angle) = 1 / sin(angle)
globalThis.csc = function(radians) {
    return 1.0 / Math.sin(radians);
};

// cot(angle) = 1 / tan(angle)
globalThis.cot = function(radians) {
    return 1.0 / Math.tan(radians);
};


// ==========================================
// 2. NUMBER-TO-ANGLE FUNCTIONS (Inverses)
// ==========================================

// asec(ratio) -> returns angle
globalThis.asec = function(ratio) {
    return Math.acos(1.0 / ratio);
};

// acsc(ratio) -> returns angle
globalThis.acsc = function(ratio) {
    return Math.asin(1.0 / ratio);
};

// acot(ratio) OR acot(y, x) -> multi-argument variant
globalThis.acot = function(y, x) {
    if (x === undefined) {
        return Math.atan(1.0 / y); // 1 input: treats 'y' as the standard ratio
    }
    return Math.atan2(x, y);   // 2 inputs: 4-quadrant vertical angle finder
};

// atan(ratio) OR atan(y, x) -> multi-argument variant
globalThis.atan = function(y, x) {
    if (x === undefined) {
        return Math.atan(y);       // 1 input: treats 'y' as the standard ratio
    }
    return Math.atan2(y, x);   // 2 inputs: 4-quadrant horizontal angle finder
};

// Dedicated 4-quadrant vertical tool
globalThis.acot2 = function(y, x) {
    return Math.atan2(x, y);
};
//================================
// --- Normal trig/inverse ---
//================================
globalThis.sin = Math.sin
globalThis.cos = Math.cos
globalThis.tan = Math.tan
globalThis.asin = Math.asin
globalThis.acos = Math.acos
globalThis.atan2 = Math.atan2

//========================================
// --- 1. Degree & Radian Conversions ---
//========================================
// --- Conversions (The Complete Angular Grid) ---
globalThis.rad2deg = function(radians) {
    return radians * (180 / Math.PI);
};

globalThis.deg2rad = function(degrees) {
    return degrees * (Math.PI / 180);
};

globalThis.deg2grad = function(degrees) {
    return degrees * (10 / 9);
};

globalThis.rad2grad = function(radians) {
    return radians * (200 / Math.PI);
};

globalThis.grad2rad = function(gradians) {
    return gradians * (Math.PI / 200);
};

globalThis.grad2deg = function(gradians) {
    return gradians * (9 / 10);
};

// --- Array Utilities ---
globalThis.range = function(...numbers) {
    if (numbers.length === 0) return 0;
    return Math.max(...numbers) - Math.min(...numbers);
};

// --- Series & Factorial ---
globalThis.sum = function(e, s, f) {
    let r = 0;
    for (let i = s; i <= e; i++) {
        r += f(i);
    }
    return r;
};

globalThis.product = function(e, s, f) {
    if (e < s) return 1;
    let r = f(s);
    for (let i = s + 1; i <= e; i++) {
        r = r * f(i);
    }
    return r;
};

globalThis.factorial = function(n) {
    if (n === 0 || n === 1) return 1;
    return product(n, 1, (a) => a);
};

// --- Kinematics ---


// --- Other ---
globalThis.within = function(min,n,max){
    return (min<=n&&n<=max)
}
globalThis.log = function(b,n){
    return Math.log(n)/Math.log(b)
}

//constants
globalThis.pi = Math.PI
globalThis.tau = 2*pi
globalThis.sqrt0_5 = Math.SQRT1_2
globalThis.sqrt5 = Math.sqrt(5)
globalThis.sqrt10 = Math.sqrt(10)
globalThis.sqrt2560 = 16 * sqrt10
globalThis.sqrt81920= 128 * sqrt5


//Number.prototype extensions
Number.prototype.exp=function(n){return Math.pow(this,n)}



//AST
Math.AST = {
    encode: function(str) {
        let pos = 0;

        function tokenize(input) {
            const regex = /\s*([A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[+\-*/(),^!])/g;
            const tokens = [];
            let match;
            while ((match = regex.exec(input)) !== null) {
                tokens.push(match[1]);
            }
            return tokens;
        }

        const tokens = tokenize(str);

        function peek() {
            return tokens[pos];
        }

        function consume() {
            return tokens[pos++];
        }

        function parseExpression() {
            let node = parseTerm();

            while (peek() === '+' || peek() === '-') {
                const operator = consume();
                const right = parseTerm();
                node = {
                    operator: operator === '+' ? 'addition' : 'subtraction',
                    input1: node,
                    input2: right
                };
            }

            return node;
        }

        function parseTerm() {
            let node = parsePower();

            while (peek() === '*' || peek() === '/') {
                const operator = consume();
                const right = parsePower();
                node = {
                    operator: operator === '*' ? 'multiplication' : 'division',
                    input1: node,
                    input2: right
                };
            }

            return node;
        }

        function parsePower() {
            let node = parsePostfix();

            while (peek() === '^' || (peek() === '*' && tokens[pos + 1] === '*')) {
                let operator = consume();
                if (operator === '*') consume(); // handle '**'
                const right = parsePostfix();
                node = {
                    operator: 'exponentiation',
                    input1: node,
                    input2: right
                };
            }

            return node;
        }

        function parsePostfix() {
            let node = parseFactor();

            while (peek() === '!') {
                consume();
                node = {
                    operator: 'factorial',
                    input1: node
                };
            }

            return node;
        }

        function parseFactor() {
            const token = peek();

            if (!token) {
                throw new Error("Unexpected end of expression");
            }

            // Handle parentheses grouping
            if (token === '(') {
                consume();
                const node = parseExpression();
                if (consume() !== ')') {
                    throw new Error("Missing closing parenthesis");
                }
                return node;
            }

            // Handle numbers or variables as strings
            if (!isNaN(token) || /^[A-Za-z_]/.test(token)) {
                consume();
                // Check if it's a function call (e.g. integral(...))
                if (peek() === '(') {
                    consume(); // consume '('
                    const args = [];
                    if (peek() !== ')') {
                        args.push(parseExpression());
                        while (peek() === ',') {
                            consume(); // consume ','
                            args.push(parseExpression());
                        }
                    }
                    if (consume() !== ')') {
                        throw new Error("Missing closing parenthesis in function call");
                    }
                    
                    // Build AST node mapping all arguments sequentially to input1, input2, input3, etc.
                    const funcNode = { operator: token };
                    args.forEach((arg, index) => {
                        funcNode[`input${index + 1}`] = arg;
                    });
                    return funcNode;
                }
                
                return token;
            }

            throw new Error(`Unexpected token: ${token}`);
        }

        const result = parseExpression();
        if (pos < tokens.length) {
            throw new Error(`Unexpected token: ${peek()}`);
        }
        return result;
    },
    decode: function (node) {
        if (typeof node === 'string') {
            return node;
        }

        if (node.type === 'Literal') {
            return String(node.value);
        }

        if (node.type === 'Identifier') {
            return node.name;
        }

        const op = node.operator;

        // Handle standard binary arithmetic operators
        const binaryOps = {
            'addition': '+',
            'subtraction': '-',
            'multiplication': '*',
            'division': '/',
            'exponentiation': '**'
        };

        if (binaryOps[op]) {
            const left = Math.AST.decode(node.input1);
            const right = Math.AST.decode(node.input2);
            // Note: For a fully robust compiler you might add precedence checks for parentheses, 
            // but this accurately reconstructs standard binary expressions.
            return `${left} ${binaryOps[op]} ${right}`;
        }

        // Handle postfix operators like factorial
        if (op === 'factorial') {
            return `${Math.AST.decode(node.input1)}!`;
        }

        // Handle functions with arbitrary inputs (e.g., integral, acot, customFunc)
        const args = [];
        let i = 1;
        while (node[`input${i}`] !== undefined) {
            args.push(Math.AST.decode(node[`input${i}`]));
            i++;
        }

        return `${op}(${args.join(',')})`;
    },
    evaluate: function(node, scope = {}) {
        // If it's a string, it's either a number literal or a variable name
        if (typeof node === 'string') {
            if (!isNaN(node)) {
                return Number(node);
            }
            if (scope[node] !== undefined) {
                return scope[node];
            }
            throw new Error(`Undefined variable: ${node}`);
        }

        const op = node.operator;

        // Binary Arithmetic & Exponentiation mappings
        const binaryOps = {
            'addition': (a, b) => a + b,
            'subtraction': (a, b) => a - b,
            'multiplication': (a, b) => a * b,
            'division': (a, b) => a / b,
            'exponentiation': (a, b) => Math.pow(a, b)
        };

        if (binaryOps[op]) {
            return binaryOps[op](
                Math.AST.evaluate(node.input1, scope),
                Math.AST.evaluate(node.input2, scope)
            );
        }

        // Postfix / Unary Operators
        if (op === 'factorial') {
            let n = Math.AST.evaluate(node.input1, scope);
            if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial requires a non-negative integer");
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        }

        // Collect all inputs dynamically for functions
        const args = [];
        let i = 1;
        while (node[`input${i}`] !== undefined) {
            args.push(Math.AST.evaluate(node[`input${i}`], scope));
            i++;
        }

        // Try executing directly as a function in the scope (e.g., Math or user-defined)
        if (typeof scope[op] === 'function') {
            return scope[op](...args);
        }

        // Try executing directly as a global function (e.g., Math methods like Math.sin, etc.)
        if (typeof globalThis[op] === 'function') {
            return globalThis[op](...args);
        }

        // Check inside Math object automatically if not found globally
        if (Math[op] !== undefined && typeof Math[op] === 'function') {
            return Math[op](...args);
        }

        throw new Error(`Undefined function or operator: ${op}`);
    }
}



// Calculus Module
globalThis.derivative = function(node, variable = 'x') {
    if (typeof node === 'string') {
        if (!isNaN(node)) return '0';
        return node === variable ? '1' : '0';
    }

    const op = node.operator;
    const f = node.input1;
    const g = node.input2;
    
    const df = derivative(f, variable);
    const dg = g !== undefined ? derivative(g, variable) : '0';

    if (op === 'addition') {
        return { operator: 'addition', input1: df, input2: dg };
    }
    if (op === 'subtraction') {
        return { operator: 'subtraction', input1: df, input2: dg };
    }
    if (op === 'multiplication') {
        return {
            operator: 'addition',
            input1: { operator: 'multiplication', input1: df, input2: g },
            input2: { operator: 'multiplication', input1: f, input2: dg }
        };
    }
    if (op === 'division') {
        return {
            operator: 'division',
            input1: {
                operator: 'subtraction',
                input1: { operator: 'multiplication', input1: df, input2: g },
                input2: { operator: 'multiplication', input1: f, input2: dg }
            },
            input2: { operator: 'exponentiation', input1: g, input2: '2' }
        };
    }
    if (op === 'exponentiation') {
        if (typeof g === 'string' && !isNaN(g)) {
            return {
                operator: 'multiplication',
                input1: {
                    operator: 'multiplication',
                    input1: g,
                    input2: {
                        operator: 'exponentiation',
                        input1: f,
                        input2: String(Number(g) - 1)
                    }
                },
                input2: df
            };
        }
        if (typeof f === 'string' && !isNaN(f)) {
            return {
                operator: 'multiplication',
                input1: {
                    operator: 'multiplication',
                    input1: node,
                    input2: { operator: 'ln', input1: f }
                },
                input2: dg
            };
        }
    }

    if (op === 'sin') {
        return { operator: 'multiplication', input1: df, input2: { operator: 'cos', input1: f } };
    }
    if (op === 'cos') {
        return {
            operator: 'multiplication',
            input1: df,
            input2: { operator: 'subtraction', input1: '0', input2: { operator: 'sin', input1: f } }
        };
    }
    if (op === 'tan') {
        return {
            operator: 'multiplication',
            input1: df,
            input2: { operator: 'exponentiation', input1: { operator: 'sec', input1: f }, input2: '2' }
        };
    }

    return node;
};

// Returns the derived AST object as intended
String.prototype.prime = function(variable = 'x') {
    const ast = Math.AST.encode(this);
    return derivative(ast, variable);
};

globalThis.integral = {
    indefinite: function(node, variable = 'x') {
        if (typeof node === 'string') {
            if (node === variable) {
                return {
                    operator: 'multiplication',
                    input1: { operator: 'division', input1: '1', input2: '2' },
                    input2: { operator: 'exponentiation', input1: variable, input2: '2' }
                };
            }
            return { operator: 'multiplication', input1: node, input2: variable };
        }

        if (typeof node === 'number' || !isNaN(node)) {
            return { operator: 'multiplication', input1: String(node), input2: variable };
        }

        const op = node.operator;
        const f = node.input1;
        const g = node.input2;

        if (op === 'addition') {
            return {
                operator: 'addition',
                input1: integral.indefinite(f, variable),
                input2: integral.indefinite(g, variable)
            };
        }

        if (op === 'subtraction') {
            return {
                operator: 'subtraction',
                input1: integral.indefinite(f, variable),
                input2: integral.indefinite(g, variable)
            };
        }

        if (op === 'exponentiation' && f === variable && typeof g === 'string' && !isNaN(g)) {
            const n = Number(g);
            if (n !== -1) {
                return {
                    operator: 'multiplication',
                    input1: { operator: 'division', input1: '1', input2: String(n + 1) },
                    input2: { operator: 'exponentiation', input1: variable, input2: String(n + 1) }
                };
            }
        }

        if (op === 'cos' && f === variable) {
            return { operator: 'sin', input1: variable };
        }

        if (op === 'sin' && f === variable) {
            return {
                operator: 'subtraction',
                input1: '0',
                input2: { operator: 'cos', input1: variable }
            };
        }

        return {
            operator: 'integral',
            input1: node,
            input2: variable
        };
    },

    definite: function(a, b, expr, variable = 'x') {
        const ast = typeof expr === 'string' ? Math.AST.encode(expr) : expr;
        const antiDerivative = integral.indefinite(ast, variable);
        
        const valB = Math.AST.evaluate(antiDerivative, { [variable]: b });
        const valA = Math.AST.evaluate(antiDerivative, { [variable]: a });
        
        return valB - valA;
    }
};

//rounding
globalThis.round = function(n, i=1) {
    return Math.round(n / i) * i;
}
Number.prototype.round = function(i=1) {
    return Math.round(this / i) * i;
}
globalThis.floor = function(n, i=1) {
    return Math.floor(n / i) * i;
}
Number.prototype.floor = function(i=1) {
    return Math.floor(this / i) * i;
}
globalThis.ceil = function(n, i=1) {
    return Math.ceil(n / i) * i;
}
Number.prototype.ceil = function(i=1) {
    return Math.ceil(this / i) * i;
}
globalThis.ceiling = ceil
Number.prototype.ceiling = function(i=1) {
    return Math.ceil(this / i) * i;
}
globalThis.trunc = function(n, i=1) {
    return Math.trunc(n / i) * i;
}
Number.prototype.trunc = function(i=1) {
    return Math.trunc(this / i) * i;
}
globalThis.truncate = trunc
Number.prototype.truncate = function(i=1) {
    return Math.trunc(this / i) * i;
}

//other
globalThis.map = function(n, in_min, in_max, out_min, out_max) {
    return (n - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
globalThis.clamp = function(n, min, max) {
    return Math.max(min, Math.min(n, max));
}
Number.prototype.clamp = function(min, max) {
    return Math.max(min, Math.min(this, max));
}
Number.prototype.sign = function() {
    return Math.sign(this);
}
globalThis.abs = function(n) {
    return Math.abs(n);
}
globalThis.absolute = abs
Number.prototype.abs = function() {
    return Math.abs(this);
}
Number.prototype.absolute = function() {
    return Math.abs(this);
}

globalThis.difference = function(a,b){
    return Math.abs(a-b)
}