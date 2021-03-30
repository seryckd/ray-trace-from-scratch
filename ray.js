/*jshint browser: true, esversion: 6*/
import * as maths from "./maths.js";

export class Ray {

    constructor(cw, ch, scene) {

        this.scene = scene;

        // Canvas
        this.CN = { 
            Width: cw,
            HalfWidth: cw/2,
            Height: ch,
            HalfHeight: ch/2
         };

        // Viewport
        this.VP = { 
            Width: scene.viewport.width, 
            Height: scene.viewport.height 
        };

        // distance to projection plance
        this.dp = scene.projectionPlane.d;

        this.defaultColour = 'rgb(255,255,255)';
    }

    render(ctx, camera, rotation) {
        console.log('render');
        for (let x=-this.CN.HalfWidth; x<=this.CN.HalfWidth; x++) {
            for (let y=-this.CN.HalfHeight; y<=this.CN.HalfHeight; y++) {
                let D = maths.applyMatrix3x3ToVector(rotation, this.canvasToViewport({x:x, y:y}));
                let colour = this.traceRay(camera, D, 1, Number.POSITIVE_INFINITY);
                this.putPixel(ctx, {x:x, y:y}, colour);
            }
        }
    }

    /* 
       O vector: camera point of view
       D vector: from point on canvas to point on viewport
       tmin real: range of points on the ray
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
        return spherecloset.colour;
    }

    /*
       O vector: camera point of view
       D vector: from point on canvas to point on viewport
       sphere sphere: sphere radius and centre
     */
    intersectRaySphere(O, D, sphere) {
        let r = sphere.radius;
        let CO = maths.pointSubtract(O, sphere.centre);

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

    canvasToViewport(pt) {
        return {
            x: pt.x*(this.VP.Width / this.CN.Width),
            y: pt.y*(this.VP.Height / this.CN.Height),
            z: this.dp
        };
    }

    putPixel(ctx, pt, colour) {
        let x = this.CN.HalfWidth + pt.x;
        let y = this.CN.HalfHeight - pt.y;

        ctx.fillStyle = colour;
        ctx.fillRect(x, y, 1, 1);
    }
} 