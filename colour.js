import * as maths from "./maths.js";

export class Colour {

    /**
     * 
     * @param {Integer} r 
     * @param {Integer} g 
     * @param {Integer} b 
     */
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    /**
     * Apply an intensity value to the stored colour
     * 
     * @param {Number} i - between 0 and 1
     * @returns {Colour}
     */
    applyIntensity(i) {

        this.r = maths.clamp(Math.round(this.r * i), 0, 255);
        this.g = maths.clamp(Math.round(this.g * i), 0, 255);
        this.b = maths.clamp(Math.round(this.b * i), 0, 255);

        return this;
    }

    add(colour) {
        this.r = maths.clamp(this.r + colour.r, 0, 255);
        this.g = maths.clamp(this.g + colour.g, 0, 255);
        this.b = maths.clamp(this.b + colour.b, 0, 255);

        return this;
    }

    avg(colour) {
        this.r = maths.clamp((this.r + colour.r) / 2, 0, 255);
        this.g = maths.clamp((this.g + colour.g) / 2, 0, 255);
        this.b = maths.clamp((this.b + colour.b) / 2, 0, 255);

        return this;

    }
}
