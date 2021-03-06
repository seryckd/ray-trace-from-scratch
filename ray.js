/*jshint browser: true, esversion: 6*/
import { Colour } from "./colour.js";
import { Camera } from "./camera.js";
import * as maths from "./maths.js";

/**
 * Camera (O)
 * The origin of the rays.
 * Has position (in world space) and an orientation (rotation matrix)
 * 
 * Projection Plane (PP)
 * A Plane that is a fixed distance and orientation from the camera.
 * i.e. the projection plane is always is in the same place relative to the camera.
 * 
 * Viewport (VP)
 * A rectangle in the Projection Plane that bounds what can be seen by the camera.
 * 
 * Canvas (CN)
 * A mapping from the viewport (word coords) to pixels on the screen.
 * 
 */
export class Ray {

    /**
     * 
     * @param {Integer} cw - canvas width
     * @param {Integer} ch - canvas height
     * @param {Scene} scene - Scene object
     * @param {Object} flags - feature toggles
     */
    constructor(cw, ch, scene, flags) {

        this.scene = scene;
        this.flags = flags;

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
            width: 1, 
            height: 1 
        };

        /**
         * Projection Plane
         */
        this.PP = {
            d: 1        // distance from camera to projection plane
        };

        this.defaultColour = new Colour(255, 255, 255);
    }

    /**
     * 
     * @param {Buffer} buffer - canvas buffer 
     * @param {Camera} camera - camera origin
     */
    render(buffer, camera) {
        console.log('render' + ' with reflectionDepth ' + this.flags['reflectionDepth']);

        // Iterate over every pixel in the canvas
        for (let x=-this.CN.HalfWidth; x<=this.CN.HalfWidth; x++) {
            for (let y=-this.CN.HalfHeight; y<=this.CN.HalfHeight; y++) {

                // D is the Ray Direction (Vector)
                // canvasToViewport calculates direction from a point on the canvas to a 
                // point in the viewport on the projection plane.
                // D is rotated by the Camera orientation
                let D = maths.applyMatrix3x3ToVector(
                    camera.rotationMatrix(), 
                    this.canvasToViewport({x:x, y:y}));

                // Trace the ray from camera.position along the D direction, only
                // seeing objects between the projection plane and infinity.
                let colour = this.traceRay(
                    camera.position, 
                    D, 
                    this.PP.d, 
                    Number.POSITIVE_INFINITY, 
                    this.flags['reflectionDepth']);

                this.putPixel(buffer, {x:x, y:y}, colour);
            }
        }
    }

    /**
     * Start at O and walk the vector D between tmin and tmax until we intersect 
     * with an obect in the scene.  Return the object and distance along the 
     * ray it intersects.
     * 
     * @param {Point} O - a point in world space 
     * @param {Vector} D - direction of ray from the point
     * @param {Number} tmin - ignore everything on the ray before this value
     * @param {Number} tmax - ignore everything on the ray after this value
     * @returns {Object} - closest_sphere or NULL; closest_t or infinity
     */
    closestIntersection(O, D, tmin, tmax) {
        let self = this;

        let closest_t = Number.POSITIVE_INFINITY;
        let closest_sphere = null;

        this.scene.objects.forEach(function(obj) {

            // does the ray intersect the object?
            let ts = self.intersectRaySphere(O, D, obj);
            if (maths.valueInRange(ts.t1, tmin, tmax) && ts.t1 < closest_t) {
                closest_t = ts.t1;
                closest_sphere = obj;
            }
            if (maths.valueInRange(ts.t2, tmin, tmax) && ts.t2 < closest_t) {
                closest_t = ts.t2;
                closest_sphere = obj;
            }
        });

        return {
            sphere: closest_sphere,
            t: closest_t
        }
    }

    /**
     * Start at O and walk the vector D between tmin and tmax until we intersect 
     * with an obect in the scene.
     * 
     * @param {Point} O - a point in world space 
     * @param {Vector} D - direction of ray from the point
     * @param {Number} tmin - ignore everything on the ray before this value
     * @param {Number} tmax - ignore everything on the ray after this value
     * @returns {Boolean} - true if we hit an object
     */
    anyIntersection(O, D, tmin, tmax) {
            
        for (let index = 0; index < this.scene.objects.length; index++) {
            const obj = this.scene.objects[index];
            
            // does the ray intersect the object?
            let ts = this.intersectRaySphere(O, D, obj);
            if (maths.valueInRange(ts.t1, tmin, tmax)) {
                return true;
            }
            if (maths.valueInRange(ts.t2, tmin, tmax)) {
                return true;
            }
        };

        return false;
    }

    /**
     * Trace (or 'cast') a ray into the scene and return a colour value
     * 
     * @param {Point} O - camera position in world space 
     * @param {Vector} D - direction of ray from the camera position
     * @param {Number} tmin - ignore everything on the ray before this value
     * @param {Number} tmax - ignore everything on the ray after this value
     * @param {Integer} depth - the number of times this function has been recursively called
     * @returns {Colour} - colour to display
     */
    traceRay(O, D, tmin, tmax, depth) {

        let closest = this.closestIntersection(O, D, tmin, tmax);

        if (closest.sphere === null) {
            // no objects were hit, so return the background colour
            return this.defaultColour;
        }

        // At this point the base colour is closest_sphere.colour.
        let colour = new Colour(closest.sphere.colour.r, closest.sphere.colour.g, closest.sphere.colour.b);

        // Now we apply lighting affects

        // P is the intersection point between the Ray and the Sphere
        // Calculate by starting from camera position and travel in the 
        // direction of the ray (D) by the amount closest_t.
        let P = maths.addVectorToPoint(O, maths.scalarProduct(D, closest.t));

        // N is the sphere normal at the intersection point
        // (a vector from the center of the sphere to the intersection point)
        let N = maths.normalizeVector(
            maths.makeVectorFromPoints(P, closest.sphere.centre));

        // Compute the colour at the point

        let local_colour = colour.applyIntensity(
            this.computeLighting(P, N, maths.inverseVector(D), closest.sphere.specular));
        
        if (this.flags['reflection']) {
            // If the object is reflective then trace another ray to find the colour that should
            // be reflected.  Put a limit on the number of times we reflect.

            let r = closest.sphere.refective;
            if (depth <= 0 || r <= 0) {
                return local_colour;
            }

            let R = this.reflectRay(maths.inverseVector(D), N);
            let reflected_colour = this.traceRay(P, R, 0.001, Number.POSITIVE_INFINITY, depth - 1);

            local_colour = local_colour.applyIntensity(1-r).add(reflected_colour.applyIntensity(r));
        }

        return local_colour;
    }

    /**
     * Find the values along a ray (D) where it intersects the Sphere.
     * 
     * There are 3 possible values
     * t1 == t2 == POSITIVE_INFINITY - ray does not intersect the sphere
     * t1 == t2 != POSITIVE_INFINITY - ray intersects at the edge of the sphere
     * t1 != t2 != POSITIVE_INFINITY - ray goes through the sphere
     * 
     * @param {Point} O - location of the Camera 
     * @param {Vector} D - vector from the camera to a point on the viewport (the 'ray')
     * @param {Sphere} sphere  - definition of a sphere
     * @returns {Object} - object containing the values of entering (t1) and exiting (t2) the sphere
     */
    intersectRaySphere(O, D, sphere) {
        let r = sphere.radius;
        let CO = maths.makeVectorFromPoints(O, sphere.centre);

        let a = maths.dotProduct(D, D);
        let b = 2*maths.dotProduct(CO, D);
        let c = maths.dotProduct(CO, CO) - r*r;
        
        let discriminant = b*b - 4*a*c;

        if (discriminant < 0) {
            // does not intersect
            return { t1: Number.POSITIVE_INFINITY, t2: Number.POSITIVE_INFINITY};
        }

        return {
            t1: (-b + Math.sqrt(discriminant)) / (2*a),
            t2: (-b - Math.sqrt(discriminant)) / (2*a)
        }
    }

    /**
     * Return a vlue representing the intensity of light on a point of an object
     * 
     * @param {Point} P - a point on an object
     * @param {Vector} N - normal vector of the point on the object
     * @param {Vector} V - vector from point to the viewport
     * @param {Integer} specular - the specular exponent of the point
     * @returns {Number} - intensity of the light at the point
     */
    computeLighting(P, N, V, specular) {

        let self = this;

        // Intensity starts at 0 (no light)
        let i = 0.0;

        for (let index = 0; index < this.scene.lights.length; index++) {
            const light = this.scene.lights[index];
            
            if (light.type === 'ambient') {
                if (self.flags['ambient']) {
                    // Ambient light is applied to every point
                    i += light.intensity;
                }
                continue;
            }

            // L is the vector from the light source to the point (P)
            let L = {};
            let tmax;

            if (light.type === 'point') {
                if (self.flags['point']) {
                    // Point light is calculated as a vector from the light source to the point
                    L = maths.makeVectorFromPoints(light.position, P);
                    tmax = 1;
                } else {
                    continue;
                }

            } else {
                if (self.flags['directional']) {
                    // Directional light has given vector
                    L = light.direction;
                    tmax = Number.POSITIVE_INFINITY;
                } else {
                    continue;
                }
            }

            let in_shadow = false;

            if (self.flags['shadow']) {

                // Shadow Check
                // If the point on the object to the light is interrupted
                // by an object in the scene, then do not use the light source.
                // If tmin is equal to 0 then the point will intersect with the 
                // object it is on.
                in_shadow = self.anyIntersection(P, L, 0.001, tmax);
            }

            if (!in_shadow) {

                // Diffuse Light            
                // Find fraction of the light that is reflected given the surface normal and 
                // the angle of the light

                let n_dot_l = maths.dotProduct(N, L);
                if (n_dot_l > 0) {
                    // values that are less than 0 indicate light on the back of the surface
                    i += light.intensity * n_dot_l 
                        / (maths.vectorLength(N) * maths.vectorLength(L));
                }

                // Specular
                // Find the amount of light that bounces back to the viewer
                if (self.flags['specular'] && specular != -1) {

                    // R is the light reflected at the point (P). It reflects at the same angle
                    // as the angle between L and N
                    const R = self.reflectRay(L, N);

                    /*const R = maths.subtractVectors(
                        maths.scalarProduct(N, 2 * n_dot_l),
                        L);*/

                    const r_dot_v = maths.dotProduct(R, V);

                    if (r_dot_v > 0) {
                        // the angle between the reflected light (R) and the view vector (V) is less than 90deg
                        // and so some light is reflected.  How much depends upon the specular exponent.

                        // Specular component
                        // 1 - an equal amount of light is reflected across all angles (matte)
                        // 2 - 
                        // 10 - 
                        // 1000 - light is only reflected for a very small angle (very shiny)

                        const len = maths.vectorLength(R) * maths.vectorLength(V);
                        i += light.intensity * Math.pow(r_dot_v/len, specular);
                    }
                }
            }
        }

        return i;
    }

    /**
     * Reflect a ray (R) with respect to a normal (N).  
     * 
     * @param {Vector} R - a ray
     * @param {Vector} N - a normal of a point the ray reflects at
     * @returns {Vector} - the reflected ray
     */
    reflectRay(R, N) {
        return maths.subtractVectors(
            maths.scalarProduct(
                N, 
                2 * maths.dotProduct(N, R)), 
            R);
    }

    /**
     * Transforms a point on the canvas (pixels) into a point on the viewport (in world coords)
     * 
     * @param {Point} pt - point in pixels (on the canvas)
     * @returns {Vector} - a point on the Viewport in Word Coords
     */
    canvasToViewport(pt) {
        return {
            x: pt.x*(this.VP.width / this.CN.Width),
            y: pt.y*(this.VP.height / this.CN.Height),
            // Distance of the viewport from the canvas
            z: this.PP.d
        };
    }

    /**
     * Uses Pixel Manipulation on the Canvas
     * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
     * 
     * Buffer contains 4 byte values for every pixel and starts at 0.
     * pixel(x, y) = data[x*4 + y*width*4]
     * 
     * This was originally implemented using CanvasRenderingContext2D
     * (ctx.fillStyle() and ctx.fillRect()) but it was very slow.
     * 
     * @param {Buffer} buffer 
     * @param {Point} pt 
     * @param {Colour} colour 
     * @returns 
     */
    putPixel(buffer, pt, colour) {

        // The viewport is centered on the Z axis, so we need to transform
        // to the canvas coord
        const x = this.CN.HalfWidth + pt.x;
        // Canvas (0,0) is in the top left so invert the y coord
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