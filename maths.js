export function pointSubtract(pt1, pt2) {
    return {
        x: pt1.x - pt2.x,
        y: pt1.y - pt2.y,
        z: pt1.z - pt2.z
    }
}

export function dotProduct(v, w) {
    return v.x*w.x + v.y*w.y + v.z*w.z;
}

export function valueInRange(pt, min, max) {
    if (pt > min && pt < max) {
        return true;
    }
    return false;
}

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

export function makeRotZ(angle) {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    return [
        [c, s, 0],
        [-s, c, 0],
        [0, 0, 1]
    ];
}

export function applyMatrix3x3ToVector(m, v) {
    return {
        x: m[0][0]*v.x + m[0][1]*v.y + m[0][2]*v.z,
        y: m[1][0]*v.x + m[1][1]*v.y + m[1][2]*v.z,
        z: m[2][0]*v.x + m[2][1]*v.y + m[2][2]*v.z
    }
}

export function matrix3Mult(m, n) {
    return [
        [ m[0][0]*n[0][0] + m[0][1]*n[1][0] + m[0][2]*n[2][0], m[0][0]*n[0][1] + m[0][1]*n[1][1] + m[0][2]*n[2][1], m[0][0]*n[0][2] + m[0][1]*n[1][2] + m[0][2]*n[2][2] ],
        [ m[1][0]*n[0][0] + m[1][1]*n[1][0] + m[1][2]*n[2][0], m[1][0]*n[0][1] + m[1][1]*n[1][1] + m[1][2]*n[2][1], m[1][0]*n[0][2] + m[1][1]*n[1][2] + m[1][2]*n[2][2] ],
        [ m[2][0]*n[0][0] + m[2][1]*n[1][0] + m[2][2]*n[2][0], m[2][0]*n[0][1] + m[2][1]*n[1][1] + m[2][2]*n[2][1], m[2][0]*n[0][2] + m[2][1]*n[1][2] + m[2][2]*n[2][2] ]
    ]
}

export function degToRads(deg) {
    return deg * (Math.PI / 180);
}
