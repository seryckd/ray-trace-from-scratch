import * as maths from "./maths.js";

/**
 * Camera has a position (Point) and direction (Vector). The direction is encoded
 * as a rotation matrix.
 */
export class Camera {
    constructor() {
        this.reset();
    }

    reset() {
        this.position = { x:0, y:0, z:0 };
        this.rotation = { pitch:0, roll:0, yaw: 0};
        this.direction = { x:0, y:0, z:1 };
        this.matrix = maths.makeIdent();
        this.fChanged = true;
    }

    hasChanged() {
        return this.fChanged;
    }

    forward(value) {
        let d = maths.scalarProduct(this.direction, value);

        this.position = maths.addVectorToPoint(this.position, d);

        this.fChanged = true;
    }

    backward(value) {
        this.forward(-value);
    }

    adjustX(value) {
        this.position.x += value;
        this.fChanged = true;
    }

    adjustY(value) {
        this.position.y += value;
        this.fChanged = true;
    }

    adjustZ(value) {
        this.position.z += value;
        this.fChanged = true;
    }

    adjustPitch(angle) {
        this.rotation.pitch += angle;

        this.rotationMatrix();

        this.direction = maths.applyMatrix3x3ToVector(this.matrix, this.direction);

        this.fChanged = true;
    }

    adjustRoll(angle) {
        this.rotation.roll += angle;
        this.fChanged = true;
    }

    adjustYaw(angle) {
        this.rotation.yaw += angle;
        this.fChanged = true;
    }

    rotationMatrix() {

        if (this.fChanged) {
            this.fChanged = false;

            this.matrix = maths.matrix3Mult(
                maths.makeRotZ(maths.degToRads(this.rotation.roll)),
                maths.matrix3Mult(
                    maths.makeRotY(maths.degToRads(this.rotation.yaw)),
                    maths.makeRotX(maths.degToRads(this.rotation.pitch))
                )
            );
        }

        return this.matrix; 
    }
}