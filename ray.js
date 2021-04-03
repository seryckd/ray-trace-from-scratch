/*jshint browser: true, esversion: 6*/
import { Colour } from "./colour.js";
import * as maths from "./maths.js";

export class Ray {

    /**
     * 
     * @param {Integer} cw - canvas width
     * @param {Integer} ch - canvas height
     * @param {Scene} scene - Scene object
     */
    constructor(cw, ch, scene) {

        this.scene = scene;

        /**
         * Canvas
         */
        this.CN = { 
            Width: cw,
            HalfWidth: cw/2,
            Height: ch,
            HalfHeight: ch/2
         };

        /**
         * Viewport
         */
        this.VP = { 
            Width: scene.viewport.width, 
            Height: scene.viewport.height 
        };

        /**
         * distance to projection plance
         */
        this.dp = scene.projectionPlane.d;

        this.defaultColour = new Colour({r:255,g:255,b:255});
    }

    /**
     * 
     * @param {Context} ctx 
     * @param {Point} camera - camera origin
     * @param {Matrix} rotation - camera rotation
     */
    render(buffer, camera, rotation) {
        console.log('render');
        for (let x=-this.CN.HalfWidth; x<=this.CN.HalfWidth; x++) {
            for (let y=-this.CN.HalfHeight; y<=this.CN.HalfHeight; y++) {
                let D = maths.applyMatrix3x3ToVector(rotation, this.canvasToViewport({x:x, y:y}));
                let colour = this.traceRay(camera, D, 1, Number.POSITIVE_INFINITY);
                this.putPixel(buffer, {x:x, y:y}, colour);
            }
        }
    }

    /**
    * 
    * @param {Point} O - camera origin 
    * @param {Vector} D - vector from point on canvas to point on viewport 
    * @param {Number} tmin 
    * @param {Number} tmax 
    * @returns {Colour}
    */
    traceRay(O, D, tmin, tmax) {
        let self = this;

        let tclosest = Number.POSITIVE_INFINITY;
        let spherecloset = null;
        this.scene.objects.forEach(function(obj) {
            let ts = self.intersectRaySphere(O, D, obj);
            //console.log('trace  ' +  ts.t1 + ' ' + tmin);
            if (maths.valueInRange(ts.t1, tmin, tmax) && ts.t1<tclosest) {
                tclosest = ts.t1;
                spherecloset = obj;
            }
            if (maths.valueInRange(ts.t2, tmin, tmax) && ts.t2<tclosest) {
                tclosest = ts.t2;
                spherecloset = obj;
            }
        });
        if (spherecloset === null) {
            return this.defaultColour;
        }
        let P = maths.addPoints(O, maths.scalarProduct(D, tclosest));

        let N = maths.makeVectorFromPoints(P, spherecloset.centre);
        N = maths.normalizeVector(N);

        let colour = new Colour(spherecloset.colour);
        return colour.applyIntensity(this.computeLighting(P, N));
        //return colour;
    }

    /**
     * 
     * @param {Point} O - location of the Camera 
     * @param {Vector} D - vector from a point on canvas to a point on the viewport
     * @param {Sphere} sphere  - definition of a sphere
     * @returns 
     */
    intersectRaySphere(O, D, sphere) {
        let r = sphere.radius;
        let CO = maths.makeVectorFromPoints(O, sphere.centre);

        let a = maths.dotProduct(D, D);
        let b = 2*maths.dotProduct(CO, D);
        let c = maths.dotProduct(CO, CO) - r*r;
        
        let discriminant = b*b - 4*a*c;
        if (discriminant < 0) {
            return { t1: Number.POSITIVE_INFINITY, t2: Number.POSITIVE_INFINITY};
        }
        return {
            t1: (-b + Math.sqrt(discriminant)) / (2*a),
            t2: (-b - Math.sqrt(discriminant)) / (2*a)
        }
    }

    /**
     * Return a vlue representing the intensity of light on a point
     * 
     * @param {Point} pt - a point in the scene
     * @param {Vector} normal - normal vector for the object the point is part of
     * @returns {Number} - intensity
     */
    computeLighting(pt, normal) {
        let i = 0.0;
        this.scene.lights.forEach(function(light) {
            if (light.type === 'ambient') {
                i += light.intensity;
            } else {
                let lightVector = {};
                if (light.type === 'point') {
                    lightVector = maths.makeVectorFromPoints(light.position, pt);
                } else {
                    lightVector = light.direction;
                }
                let dp = maths.dotProduct(normal, lightVector);
                if (dp > 0) {
                    i += light.intensity * dp 
                        / (maths.vectorLength(normal) * maths.vectorLength(lightVector));
                }
            }
        });
        return i;
    }

    /**
     * 
     * @param {Point} pt 
     * @returns {Point}
     */
    canvasToViewport(pt) {
        return {
            x: pt.x*(this.VP.Width / this.CN.Width),
            y: pt.y*(this.VP.Height / this.CN.Height),
            z: this.dp
        };
    }

    /**
     * 
     * @param {Context} ctx 
     * @param {Point} pt 
     * @param {Color} colour 
     */
    /*
    putPixel(ctx, pt, colour) {
        let x = this.CN.HalfWidth + pt.x;
        let y = this.CN.HalfHeight - pt.y;

        // most of the cpu is here!

        ctx.fillStyle = colour.toCSS();
        ctx.fillRect(x, y, 1, 1);
    }*/

    /**
     * Buffer contains 4 byte values for every pixel and starts at 0.
     * pixel(x, y) = data[x*4 + y*width*4]
     * 
     * 
     * @param {*} buffer 
     * @param {*} pt 
     * @param {*} colour 
     * @returns 
     */
    putPixel(buffer, pt, colour) {
        const x = this.CN.HalfWidth + pt.x;
        const y = this.CN.HalfHeight - pt.y - 1;

        if (x < 0 || x >= this.CN.Width || y < 0 || y >= this.CN.Height) {
            return;
        }

        var offset = 4 * x + buffer.width*4 * y;
        buffer.data[offset++] = colour.r;
        buffer.data[offset++] = colour.g;
        buffer.data[offset++] = colour.b;
        buffer.data[offset++] = 255; // Alpha = 255 (full opacity)        
    }
} 