export const utils = {
    math: {
        convert_rad2deg: function(radians) {
            return radians * (180 / Math.PI);
        },
        convert_deg2rad: function(degrees) {
            return degrees * (Math.PI / 180);
        },
        pythagorean_theorem: function(a, b) {
            return Math.sqrt(a^2 + b^2);
        }
    },
    pause: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    perlin: {
        generateNoise: function(x, y, seed) {
          // 1. Gradient Vectors (Simplified)
          function getGradient(ix, iy, seed) {
            // Pseudo-random gradient generation
            const random = (seed) => {
              let value = (ix * 397) ^ (iy * 613) ^ seed;
              value = (value * value * value * 60493) % 4932800;
              return value / 4932800;
            };
            const angle = random(ix, iy, seed) * 2 * Math.PI;
            return { x: Math.cos(angle), y: Math.sin(angle) };
          }
    
          // 2. Dot Products
          const ix = Math.floor(x);
          const iy = Math.floor(y);
          const fx = x - ix;
          const fy = y - iy;
    
          const g00 = getGradient(ix, iy, seed);
          const g10 = getGradient(ix + 1, iy, seed);
          const g01 = getGradient(ix, iy + 1, seed);
          const g11 = getGradient(ix + 1, iy + 1, seed);
    
          const d00 = { x: fx, y: fy };
          const d10 = { x: fx - 1, y: fy };
          const d01 = { x: fx, y: fy - 1 };
          const d11 = { x: fx - 1, y: fy - 1 };
    
          const v00 = g00.x * d00.x + g00.y * d00.y;
          const v10 = g10.x * d10.x + g10.y * d10.y;
          const v01 = g01.x * d01.x + g01.y * d01.y;
          const v11 = g11.x * d11.x + g11.y * d11.y;
    
          // 3. Interpolation (Smoothstep)
          function smoothstep(x) {
            return x * x * (3 - 2 * x);
          }
    
          const sx = smoothstep(fx);
          const sy = smoothstep(fy);
    
          const i1 = v00 + sx * (v10 - v00);
          const i2 = v01 + sx * (v11 - v01);
    
          return i1 + sy * (i2 - i1);
        }
    },
	logic: {
		ors: function(...booleans) {
			for (const element of booleans) {
				if (element) {
					return true;
				}
			}
			return false;
		}
	},
    arrays: {
        scale2Darray_up2: function (array, scaleX, scaleY) {
            const multiplierX = Math.max(Math.round(scaleX / array.length), 1);
            const multiplierY = Math.max(Math.round(scaleY / array[1].length), 1);
            let result = [];
            array.forEach(array2 => {
                let row = [];
                array2.forEach(element => {
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
    }
};