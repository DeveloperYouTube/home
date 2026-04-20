const str = {
        /**
         * Converts any string into a repeatable 32-bit integer.
         * @param {string} str 
         * @returns {number}
         */
        int: function(str) {
            let hash = 0;
            if (str.length === 0) return hash;

            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                // (hash << 5) - hash is a faster way of saying hash * 31
                hash = ((hash << 5) - hash) + char;
                // Force into a 32-bit signed integer
                hash |= 0; 
            }
            // Return absolute value if you only want positive numbers
            return hash;
        }
    }

export const utils = {
    math: {
        convert_rad2deg: function(/** @type {number} */ radians) {
            return radians * (180 / Math.PI);
        },
        convert_deg2rad: function(/** @type {number} */ degrees) {
            return degrees * (Math.PI / 180);
        },
        pythagorean_theorem: function(/** @type {number} */ a, /** @type {number} */ b) {
            return Math.sqrt(a ** 2 + b ** 2);
        },
        range: function(/** @type {number[]} */ ...numbers) {
            let max = numbers[0];
            numbers.forEach(number => {
                max = Math.max(max, number)
            });
            let min = numbers[0];
            numbers.forEach(number => {
                min = Math.min(min, number)
            });
            return max - min;
        }
    },
    pause: function (/** @type {number} */ ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
	logic: {
		ors: function(/** @type {boolean[]} */ ...booleans) {
			for (const element of booleans) {
				if (element) {
					return true;
				}
			}
			return false;
		},
        ands: function(/** @type {boolean[]} */ ...booleans) {
            return !this.ors(...booleans.map(b => !b));
        }
	},
    arrays: {
        scale2Darray_up2: function (/** @type {any[]} */ array, /** @type {number} */ scaleX, /** @type {number} */ scaleY) {
            const multiplierX = Math.max(Math.round(scaleX / array.length), 1);
            const multiplierY = Math.max(Math.round(scaleY / array[0].length), 1);
            /**
             * @type {any[][]}
             */
            let result = [];
            array.forEach((/** @type {any[]} */ array2) => {
                /**
                 * @type {any[]}
                 */
                let row = [];
                array2.forEach((/** @type {any} */ element) => {
                    for (let index = 0; index < multiplierX; index++) {
                        row.push(element);
                    }
                });
                for (let index = 0; index < multiplierY; index++) {
                    result.push(row);
                }
            });
            return result;
        }
    },
    perlin: {
    noise: function (/** @type {number} */ x, /** @type {string} */seed = "0") {
        // 1. Determine grid cell coordinates
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const t = x - x0;

        // 2. Fade function (smoothes the transitions)
        const fade = (t) * (t) * (t) * (t * (t * 6 - 15) + 10);

        // 3. Deterministic pseudo-random gradient function
        const getGradient = (/** @type {number} */ p) => {
            // Incorporate the seed into the hash
            const hash = Math.sin(p + str.int(seed)) * 43758.5453123;
            return (hash - Math.floor(hash)) * 2 - 1;
        };

        // 4. Calculate gradients and dot products
        const g0 = getGradient(x0);
        const g1 = getGradient(x1);
        
        const n0 = g0 * t;
        const n1 = g1 * (t - 1);

        // 5. Interpolate (lerp)
        const lerp = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ weight) => a + weight * (b - a);
        const result = lerp(n0, n1, fade);

        // Standard Perlin 1D returns roughly [-0.5, 0.5]
        // We add 0.5 to keep the output y mostly between 0 and 1
        return result + 0.5;
    }
    }
};