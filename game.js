import Matter from 'matter-js';
import { applyQuantumEffects, update4DObject, entangleObjects } from './physics.js';
import { setupController, setPlayerControl } from './controllers.js';

let score = 0;
let level = 1;
let isPaused = false;
let gameMode = 'single';
let fourDObjects = [];
let selectedObject = null;
let render;
let engine;
let world;

let levels = [
  { numObjects: 5, objective: 'Merge all objects', timeLimit: 60 },
  { numObjects: 10, objective: 'Avoid obstacles and merge', timeLimit: 60 },
];

let metacognitiveController = {
  learningRate: 0.01,
  explorationRate: 0.1,
  strategy: 'random',
  performanceHistory: [],

  updateStrategy: function(performance) {
    this.performanceHistory.push(performance);
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }

    const averagePerformance = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;

    if (averagePerformance < 0.3) {
      this.strategy = 'exploratory';
      this.explorationRate = 0.3;
    } else if (averagePerformance < 0.7) {
      this.strategy = 'balanced';
      this.explorationRate = 0.1;
    } else {
      this.strategy = 'exploitative';
      this.explorationRate = 0.05;
    }

    this.learningRate = Math.max(0.001, this.learningRate * 0.99);
    
    updateAIInfoDisplay();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded, initializing game...');
  const gameViewElement = document.getElementById('gameView');
  if (!gameViewElement) {
    console.error('Game view element not found!');
    return;
  }

  // Initialize physics engine and renderer
  engine = Matter.Engine.create();
  world = engine.world;

  render = Matter.Render.create({
    element: gameViewElement,
    engine: engine,
    options: {
      width: gameViewElement.clientWidth,
      height: gameViewElement.clientHeight,
      wireframes: false,
      background: '#f0f0f0'
    }
  });

  Matter.Render.run(render);
  Matter.Runner.run(Matter.Runner.create(), engine);

  setupUserInterface();
  setupController();
  initializeGame();
  startGame('single');

  console.log('Game initialized and started');
});

function initializeGame() {
  console.log('Initializing game...');
  createGameObjects(levels[level - 1].numObjects);
  setLevel(level);
}

function createGameObjects(numObjects) {
  console.log(`Creating ${numObjects} game objects...`);
  Matter.World.clear(world, false);
  fourDObjects = [];
  const gameViewElement = document.getElementById('gameView');
  
  for (let i = 0; i < numObjects; i++) {
    const x = Math.random() * gameViewElement.clientWidth;
    const y = Math.random() * gameViewElement.clientHeight;
    const radius = 20;
    const body = Matter.Bodies.circle(x, y, radius, {
      render: { 
        fillStyle: getRandomColor(),
        strokeStyle: '#000000',
        lineWidth: 1
      }
    });
    
    fourDObjects.push(body);
    Matter.World.add(world, body);
  }

  for (let i = 0; i < Math.floor(numObjects / 2); i++) {
    entangleObjects(fourDObjects[i * 2], fourDObjects[i * 2 + 1]);
  }

  console.log(`Created ${fourDObjects.length} objects`);
}

function updateGame() {
  if (isPaused) return;

  if (gameMode === 'single') {
    const action = executeAIStrategy();
    const performance = evaluatePerformance(action);
    metacognitiveController.updateStrategy(performance);
  } else {
    // handle multiplayer logic
  }

  applyQuantumEffects(fourDObjects);
  fourDObjects.forEach(update4DObject);
  checkObjectives();
  updateObjectPropertiesDisplay();
}

function executeAIStrategy() {
  let action;
  if (Math.random() < metacognitiveController.explorationRate) {
    action = exploreRandomAction();
  } else {
    action = exploitBestAction();
  }
  applyAction(action);
  return action;
}

function exploreRandomAction() {
  const actionTypes = ['merge', 'split', 'accelerate', 'decelerate', 'rotate'];
  const randomAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];
  const randomObject = fourDObjects[Math.floor(Math.random() * fourDObjects.length)];
  return { type: randomAction, object: randomObject };
}

function exploitBestAction() {
  // Implement your best action selection logic here
  return exploreRandomAction(); // Placeholder for now
}

function applyAction(action) {
  switch (action.type) {
    case 'merge':
      const nearbyObject = findNearestObject(action.object);
      if (nearbyObject) {
        interact4DObjects(action.object, nearbyObject);
      }
      break;
    case 'split':
      splitObject(action.object);
      break;
    case 'accelerate':
      Matter.Body.setVelocity(action.object, {
        x: action.object.velocity.x * 1.5,
        y: action.object.velocity.y * 1.5
      });
      break;
    case 'decelerate':
      Matter.Body.setVelocity(action.object, {
        x: action.object.velocity.x * 0.5,
        y: action.object.velocity.y * 0.5
      });
      break;
    case 'rotate':
      Matter.Body.rotate(action.object, Math.PI / 4);
      break;
  }
}

function findNearestObject(obj) {
  let nearest = null;
  let minDistance = Infinity;
  fourDObjects.forEach(other => {
    if (other !== obj) {
      const distance = Matter.Vector.magnitude(Matter.Vector.sub(obj.position, other.position));
      if (distance < minDistance) {
        minDistance = distance;
        nearest = other;
      }
    }
  });
  return nearest;
}

function splitObject(obj) {
  if (obj.circleRadius > 10) {
    const newRadius = obj.circleRadius / Math.sqrt(2);
    const offset = 5;
    const newObj1 = Matter.Bodies.circle(obj.position.x - offset, obj.position.y - offset, newRadius, {
      render: { fillStyle: obj.render.fillStyle }
    });
    const newObj2 = Matter.Bodies.circle(obj.position.x + offset, obj.position.y + offset, newRadius, {
      render: { fillStyle: obj.render.fillStyle }
    });

    Matter.World.remove(world, obj);
    fourDObjects = fourDObjects.filter(o => o !== obj);
    Matter.World.add(world, [newObj1, newObj2]);
    fourDObjects.push(newObj1, newObj2);

    newObj1.fourthDimension = obj.fourthDimension;
    newObj2.fourthDimension = obj.fourthDimension;
  }
}

function evaluatePerformance(action) {
  // Implement performance evaluation logic here
  return Math.random(); // Placeholder for now
}

function checkObjectives() {
  if (fourDObjects.length <= 1) {
    levelUp();
  }
}

function levelUp() {
  setLevel(level + 1);
  updateScore(score + 10);
  displayStatusMessage('Level up! Score +10');
}

function updateScore(newScore) {
  score = newScore;
  document.getElementById('scoreDisplay').innerHTML = `Score: ${score}`;
}

function setLevel(newLevel) {
  level = newLevel;
  document.getElementById('levelDisplay').innerHTML = `Level: ${level}`;
  createGameObjects(levels[level - 1].numObjects);
}

function setupUserInterface() {
  document.getElementById('pauseButton').addEventListener('click', togglePause);
  document.getElementById('resetButton').addEventListener('click', resetGame);
  document.getElementById('singlePlayerButton').addEventListener('click', () => {
    resetGame();
    startGame('single');
  });
  document.getElementById('multiPlayerButton').addEventListener('click', () => {
    resetGame();
    startGame('multi');
  });
  
  updateAIInfoDisplay();
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById('pauseButton').innerHTML = isPaused ? 'Resume' : 'Pause';
  if (isPaused) {
    Matter.Render.stop(render);
    Matter.Runner.stop(engine);
    displayStatusMessage('Game paused');
  } else {
    Matter.Render.run(render);
    Matter.Runner.run(engine);
    displayStatusMessage('Game resumed');
  }
}

function resetGame() {
  console.log('Resetting game...');
  Matter.World.clear(world, false);
  score = 0;
  level = 1;
  isPaused = false;
  updateScore(score);
  setLevel(level);
  metacognitiveController.learningRate = 0.01;
  metacognitiveController.explorationRate = 0.1;
  metacognitiveController.strategy = 'random';
  metacognitiveController.performanceHistory = [];
  updateAIInfoDisplay();
  startGame(gameMode);
  displayStatusMessage('Game reset');
}

function startGame(mode) {
  console.log(`Starting game in ${mode} mode...`);
  gameMode = mode;
  initializeGame();
  setPlayerControl(mode === 'single');
  isPaused = false;
  document.getElementById('pauseButton').innerHTML = 'Pause';
  Matter.Engine.run(engine);
  Matter.Render.run(render);
  displayStatusMessage(`${mode.charAt(0).toUpperCase() + mode.slice(1)} player game started!`);

  // Ensure the game loop is running
  function gameLoop() {
    if (!isPaused) {
      updateGame();
    }
    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}

function updateAIInfoDisplay() {
  document.getElementById('strategyDisplay').innerHTML = `Strategy: ${metacognitiveController.strategy}`;
  document.getElementById('explorationRateDisplay').innerHTML = `Exploration Rate: ${metacognitiveController.explorationRate.toFixed(2)}`;
  document.getElementById('learningRateDisplay').innerHTML = `Learning Rate: ${metacognitiveController.learningRate.toFixed(4)}`;
}

function updateObjectPropertiesDisplay() {
  if (selectedObject) {
    document.getElementById('massDisplay').innerHTML = `Mass: ${selectedObject.mass.toFixed(2)}`;
    document.getElementById('chargeDisplay').innerHTML = `Charge: ${selectedObject.charge ? selectedObject.charge.toFixed(2) : 'N/A'}`;
    document.getElementById('spinDisplay').innerHTML = `Spin: ${selectedObject.spin ? selectedObject.spin.toFixed(2) : 'N/A'}`;
    document.getElementById('entanglementDisplay').innerHTML = `Entanglement: ${selectedObject.entanglement ? 'Yes' : 'No'}`;
  }
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function displayStatusMessage(message) {
  console.log('Status:', message);
  const statusMessage = document.getElementById('statusMessage');
  if (statusMessage) {
    statusMessage.innerHTML = message;
    setTimeout(() => {
      statusMessage.innerHTML = '';
    }, 3000);
  } else {
    console.error('Status message element not found');
  }
}

function interact4DObjects(obj1, obj2) {
  // Implement 4D object interaction logic here
  console.log('4D objects interacting:', obj1, obj2);
}

document.getElementById('gameView').addEventListener('click', (event) => {
  const mousePosition = Matter.Vector.create(event.clientX, event.clientY);
  selectedObject = Matter.Query.point(fourDObjects, mousePosition)[0];
  updateObjectPropertiesDisplay();
});

export function internalTrigger(action, mode) {
  console.log(`Internal trigger: ${action}, mode: ${mode}`);
  switch(action) {
    case 'start':
      startGame(mode);
      break;
    case 'pause':
      togglePause();
      break;
    case 'reset':
      resetGame();
      break;
    default:
      console.log("Invalid action");
  }
}
