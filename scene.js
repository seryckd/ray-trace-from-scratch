
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
            colour: 'rgb(255, 0, 0)'
        },
        {
            id: 2,
            shape: 'sphere',
            centre: { x:2, y:0, z:4 },
            radius: 1,
            colour: 'rgb(0, 0, 255)'
        },
        {
            id: 3,
            shape: 'sphere',
            centre: { x:-2, y:0, z:4 },
            radius: 1,
            colour: 'rgb(0, 255, 0)'
        }
    ]
}
