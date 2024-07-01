import Matter from 'matter-js';

const engine = Matter.Engine.create();
const world = engine.world;

let render;
let runner;

function initPhysics(element) {
    render = Matter.Render.create({
        element: element,
        engine: engine,
        options: {
            width: element.clientWidth,
            height: element.clientHeight,
            wireframes: false,
            background: '#f0f0f0'
        }
    });

    Matter.Render.run(render);
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Add 4D gravity effect
    Matter.Events.on(engine, 'beforeUpdate', apply4DGravity);

    return render;
}

function apply4DGravity() {
    const objects = Matter.Composite.allBodies(world);
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const bodyA = objects[i];
            const bodyB = objects[j];
            const force = calculate4DGravitationalForce(bodyA, bodyB);
            Matter.Body.applyForce(bodyA, bodyA.position, force);
            Matter.Body.applyForce(bodyB, bodyB.position, Matter.Vector.neg(force));
        }
    }
}

function calculate4DGravitationalForce(bodyA, bodyB) {
    const G = 6.674e-11; // gravitational constant
    const distanceVector = Matter.Vector.sub(bodyB.position, bodyA.position);
    const distance = Matter.Vector.magnitude(distanceVector) + 1e-10; // avoid division by zero
    const forceMagnitude = (G * bodyA.mass * bodyB.mass) / (distance * distance);
    return Matter.Vector.mult(Matter.Vector.normalise(distanceVector), forceMagnitude);
}

function applyQuantumEffects(objects) {
    objects.forEach(obj => {
        // Quantum tunneling
        if (Math.random() < 0.01) {
            const tunnelDistance = (Math.random() - 0.5) * 50;
            Matter.Body.setPosition(obj, {
                x: obj.position.x + tunnelDistance,
                y: obj.position.y + tunnelDistance
            });
        }

        // Spin-orbit interaction
        const spinForce = Matter.Vector.rotate(Matter.Vector.create(0.1, 0), obj.properties.spin);
        Matter.Body.applyForce(obj, obj.position, spinForce);

        // Charge interaction
        objects.forEach(other => {
            if (other !== obj) {
                const chargeForce = calculateChargeForce(obj, other);
                Matter.Body.applyForce(obj, obj.position, chargeForce);
            }
        });
    });
}

function calculateChargeForce(objA, objB) {
    const k = 8.99e9; // Coulomb's constant
    const distanceVector = Matter.Vector.sub(objB.position, objA.position);
    const distance = Matter.Vector.magnitude(distanceVector) + 1e-10; // avoid division by zero
    const forceMagnitude = (k * objA.properties.charge * objB.properties.charge) / (distance * distance);
    return Matter.Vector.mult(Matter.Vector.normalise(distanceVector), forceMagnitude);
}

function update4DObject(object) {
    object.fourthDimension += 0.01;
    
    // 4D rotation
    const w = Math.sin(object.fourthDimension) * 0.5;
    const x = object.position.x + Math.cos(object.fourthDimension) * w;
    const y = object.position.y + Math.sin(object.fourthDimension) * w;
    const z = Math.cos(object.fourthDimension) * 0.5;

    Matter.Body.setPosition(object, { x, y });
    
    // 4D scaling
    const scale = 1 + 0.1 * Math.sin(object.fourthDimension);
    Matter.Body.scale(object, scale, scale);

    // Apply forces based on object properties
    const forceX = object.properties.charge * Math.cos(object.properties.spin) * 0.1;
    const forceY = object.properties.charge * Math.sin(object.properties.spin) * 0.1;
    Matter.Body.applyForce(object, object.position, { x: forceX, y: forceY });
}

function createBody(x, y, radius, options = {}) {
    const body = Matter.Bodies.circle(x, y, radius, options);
    body.properties = {
        mass: options.mass || Math.random() * 10 + 1,
        charge: options.charge || (Math.random() * 2 - 1),
        spin: options.spin || Math.random() * 2 * Math.PI,
        entanglement: null
    };
    body.fourthDimension = Math.random() * 2 * Math.PI;
    return body;
}

function entangleObjects(obj1, obj2) {
    obj1.properties.entanglement = obj2;
    obj2.properties.entanglement = obj1;
}

export { 
    initPhysics, 
    applyQuantumEffects, 
    update4DObject, 
    createBody, 
    entangleObjects,
    world,
    engine
};
