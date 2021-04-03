export class Colour {

    constructor(c) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
    }

    applyIntensity(i) {

        this.r = this.r * i;
        this.g = this.g * i;
        this.b = this.b * i;

        return this;
    }

    toCSS() {
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
    }
}
