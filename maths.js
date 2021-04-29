
// ----------------------------------------------------------------------------
// Misc
// ----------------------------------------------------------------------------

export function degToRads(deg) {
    return deg * (Math.PI / 180);
}

export function valueInRange(scalar, min, max) {
    if (scalar > min && scalar < max) {
        return true;
    }
    return false;
}

/**
 * Restricts a value between the given min and max
 * 
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Number} - value in the range between min and max
 */
export function clamp(value, min, max) {
    if (value <= min) {
        return min;
    }
    if (value >= max) {
        return max;
    }
    return value;
}

// ----------------------------------------------------------------------------
// Vectors
// ----------------------------------------------------------------------------

/**
 * Return a vector from start point to end point
 * 
 * @param {Point} pt1 - start point
 * @param {Point} pt2 - end point
 * @returns {Vector}
 */
export function makeVectorFromPoints(pt1, pt2) {
    return {
        x: pt1.x - pt2.x,
        y: pt1.y - pt2.y,
        z: pt1.z - pt2.z
    }
}

/**
 * Add a vector to a point to return a new point
 * 
 * @param {Point} p
 * @param {Vector} v 
 * @returns {Point}
 */
 export function addVectorToPoint(p, v) {
    return {
        x: p.x + v.x,
        y: p.y + v.y,
        z: p.z + v.z
    }
}

/**
 * Subtract v2 from v1
 * 
 * @param {Vector} v1 
 * @param {Vector} v2 
 * @returns {Vector}
 */
export function subtractVectors(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    }
}

/**
 * Multiple a vector by a number (Scalar Product)
 * 
 * @param {Vector} v 
 * @param {Number} s 
 * @returns {Vector}
 */
export function scalarProduct(v, s) {
    return {
        x: v.x * s,
        y: v.y * s,
        z: v.z * s
    }
}

/**
 * Magnitude (length) of a vector
 * 
 * @param {Vector} v 
 * @returns Number
 */
 export function vectorLength(v) {
    return Math.sqrt(dotProduct(v, v));
}

/**
 * Return the inverse of a Vector
 * @param {Vector} v 
 * @returns {Vector}
 */
export function inverseVector(v) {
    return {
        x: v.x * -1,
        y: v.y * -1,
        z: v.z * -1
    }
}

/**
 * 
 * @param {Vector} v
 * @returns {Vector} 
 */
export function normalizeVector(v) {
    let length = vectorLength(v);
    return {
        x: v.x / length,
        y: v.y / length,
        z: v.z / length
    }
}

/**
 * 
 * @param {Vector} v 
 * @param {Vector} w 
 * @returns Number
 */
 export function dotProduct(v, w) {
    return v.x*w.x + v.y*w.y + v.z*w.z;
}

// ----------------------------------------------------------------------------
// Matrixes
// ----------------------------------------------------------------------------

export function makeIdent() {
    return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
}

export function makeRotX(angle) {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    return [
        [1, 0, 0],
        [0, c, s],
        [0, -s, c]
    ];
}

export function makeRotY(angle) {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    return [
        [c, 0, -s],
        [0, 1, 0],
        [s, 0, c]
    ];
}

/**
 * @param {Float} angle in radians 
 * @returns 
 */
export function makeRotZ(angle) {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    return [
        [c, s, 0],
        [-s, c, 0],
        [0, 0, 1]
    ];
}

/**
 * 
 * @param {Matrix} m 
 * @param {Vector} v 
 * @returns {Vector}
 */
export function applyMatrix3x3ToVector(m, v) {
    return {
        x: m[0][0]*v.x + m[0][1]*v.y + m[0][2]*v.z,
        y: m[1][0]*v.x + m[1][1]*v.y + m[1][2]*v.z,
        z: m[2][0]*v.x + m[2][1]*v.y + m[2][2]*v.z
    }
}

/**
 * 
 * @param {Matrix} m 
 * @param {Matrix} n 
 * @returns {Matrix}
 */
export function matrix3Mult(m, n) {
    return [
        [ m[0][0]*n[0][0] + m[0][1]*n[1][0] + m[0][2]*n[2][0], m[0][0]*n[0][1] + m[0][1]*n[1][1] + m[0][2]*n[2][1], m[0][0]*n[0][2] + m[0][1]*n[1][2] + m[0][2]*n[2][2] ],
        [ m[1][0]*n[0][0] + m[1][1]*n[1][0] + m[1][2]*n[2][0], m[1][0]*n[0][1] + m[1][1]*n[1][1] + m[1][2]*n[2][1], m[1][0]*n[0][2] + m[1][1]*n[1][2] + m[1][2]*n[2][2] ],
        [ m[2][0]*n[0][0] + m[2][1]*n[1][0] + m[2][2]*n[2][0], m[2][0]*n[0][1] + m[2][1]*n[1][1] + m[2][2]*n[2][1], m[2][0]*n[0][2] + m[2][1]*n[1][2] + m[2][2]*n[2][2] ]
    ]
}

