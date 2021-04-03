
export const Scene = {
    viewport: {
        width: 1,
        height: 1
    },

    projectionPlane: {
        d: 1
    },
    
    objects: [
        {
            id: 1,
            shape: 'sphere',            
            centre: { x:0, y:-1, z:3 },
            radius: 1,
            colour: { r:255, g:0, b:0 }
        },
        {
            id: 2,
            shape: 'sphere',
            centre: { x:2, y:0, z:4 },
            radius: 1,
            colour: { r:0, g:0, b:255 }
        },
        {
            id: 3,
            shape: 'sphere',
            centre: { x:-2, y:0, z:4 },
            radius: 1,
            colour: { r:0, g:255, b:0 }
        },
        {
            id: 4,
            shape: 'sphere',
            centre: { x:0, y:-5001, z:0 },
            radius: 5000,
            colour: { r:255, g:255, b:0 }
        }
    ],

    lights: [
        {
            id: 1,
            type: 'ambient',
            intensity: 0.2
        },
        {
            id: 2,
            type: 'point',
            intensity: 0.6,
            position: { x:2, y:1, z:1 }
        },
        {
            id: 3,
            type: 'directional',
            intensity: 0.2,
            direction: { x:1, y:4, z:4 }
        }
    ]
}
