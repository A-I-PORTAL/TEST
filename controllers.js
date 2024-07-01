import { world, engine } from './physics.js';

let playerControl = true;
let selectedObject = null;

export function setupController() {
  const speedSlider = document.getElementById('speedSlider');
  const directionSlider = document.getElementById('directionSlider');
  const massSlider = document.createElement('input');
  const chargeSlider = document.createElement('input');
  const spinSlider = document.createElement('input');

  massSlider.type = 'range';
  massSlider.min = '1';
  massSlider.max = '20';
  massSlider.step = '0.1';
  massSlider.id = 'massSlider';

  chargeSlider.type = 'range';
  chargeSlider.min = '-1';
  chargeSlider.max = '1';
  chargeSlider.step = '0.1';
  chargeSlider.id = 'chargeSlider';

  spinSlider.type = 'range';
  spinSlider.min = '0';
  spinSlider.max = '6.28';
  spinSlider.step = '0.1';
  spinSlider.id = 'spinSlider';

  const controllerContainer = document.getElementById('controllerContainer');
  controllerContainer.appendChild(createSliderWithLabel(massSlider, 'Mass:'));
  controllerContainer.appendChild(createSliderWithLabel(chargeSlider, 'Charge:'));
  controllerContainer.appendChild(createSliderWithLabel(spinSlider, 'Spin:'));

  speedSlider.addEventListener('input', updateObjectVelocity);
  directionSlider.addEventListener('input', updateObjectVelocity);
  massSlider.addEventListener('input', updateObjectMass);
  chargeSlider.addEventListener('input', updateObjectCharge);
  spinSlider.addEventListener('input', updateObjectSpin);

  document.getElementById('gameView').addEventListener('click', selectObject);
}

function createSliderWithLabel(slider, labelText) {
  const container = document.createElement('div');
  const label = document.createElement('label');
  label.htmlFor = slider.id;
  label.textContent = labelText;
  container.appendChild(label);
  container.appendChild(slider);
  return container;
}

function selectObject(event) {
  const mousePosition = Matter.Vector.create(event.clientX, event.clientY);
  selectedObject = Matter.Query.point(Matter.Composite.allBodies(world), mousePosition)[0];
  
  if (selectedObject) {
    updateSliders();
  }
}

function updateSliders() {
  if (selectedObject) {
    document.getElementById('massSlider').value = selectedObject.properties.mass;
    document.getElementById('chargeSlider').value = selectedObject.properties.charge;
    document.getElementById('spinSlider').value = selectedObject.properties.spin;
    document.getElementById('speedSlider').value = Matter.Vector.magnitude(selectedObject.velocity) * 10;
    document.getElementById('directionSlider').value = (Math.atan2(selectedObject.velocity.y, selectedObject.velocity.x) * 180 / Math.PI + 360) % 360;
  }
}

function updateObjectVelocity() {
  if (selectedObject && playerControl) {
    const speed = document.getElementById('speedSlider').value / 10;
    const direction = document.getElementById('directionSlider').value * Math.PI / 180;
    Matter.Body.setVelocity(selectedObject, {
      x: speed * Math.cos(direction),
      y: speed * Math.sin(direction)
    });
  }
}

function updateObjectMass() {
  if (selectedObject && playerControl) {
    const newMass = parseFloat(document.getElementById('massSlider').value);
    Matter.Body.setMass(selectedObject, newMass);
    selectedObject.properties.mass = newMass;
  }
}

function updateObjectCharge() {
  if (selectedObject && playerControl) {
    selectedObject.properties.charge = parseFloat(document.getElementById('chargeSlider').value);
  }
}

function updateObjectSpin() {
  if (selectedObject && playerControl) {
    selectedObject.properties.spin = parseFloat(document.getElementById('spinSlider').value);
  }
}

export function setPlayerControl(isPlayerControlled) {
  playerControl = isPlayerControlled;
}
