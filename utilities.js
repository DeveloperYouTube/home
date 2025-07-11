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
            let result = [];
            array.forEach((/** @type {any[]} */ array2) => {
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
    }
};