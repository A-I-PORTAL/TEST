const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
  element: document.body,
  engine: engine,
  canvas: document.getElementById('gameCanvas'),
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false
  }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

const boundaries = [
  Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 50, { isStatic: true }),
  Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 50, { isStatic: true }),
  Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }),
  Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true })
];
World.add(world, boundaries);

const fourDObjects = [];

Events.on(engine, 'beforeUpdate', () => {
  fourDObjects.forEach(update4DObject);
});

function update4DObject(object) {
  object.fourthDimension += 0.01;
  object.position.x = 200 + 100 * Math.sin(object.fourthDimension);
  object.position.y = 200 + 100 * Math.cos(object.fourthDimension);

  if (object.fourthDimension % (2 * Math.PI) < Math.PI) {
    Body.scale(object, 1.01, 1.01);
  } else {
    Body.scale(object, 0.99, 0.99);
  }

  fourDObjects.forEach(otherObject => {
    if (object !== otherObject && areObjectsClose(object, otherObject)) {
      interact4DObjects(object, otherObject);
    }
  });
}

function areObjectsClose(obj1, obj2) {
  const distance = Math.sqrt(Math.pow(obj1.position.x - obj2.position.x, 2) + Math.pow(obj1.position.y - obj2.position.y, 2));
  return distance < 50;
}

function interact4DObjects(obj1, obj2) {
  Body.scale(obj1, 1.05, 1.05);
  Body.scale(obj2, 1.05, 1.05);
}
