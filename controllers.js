let playerControl = true;

function setupController() {
  const speedSlider = document.getElementById('speedSlider');
  const directionSlider = document.getElementById('directionSlider');

  speedSlider.addEventListener('input', () => {
    if (playerControl) {
      // Update player controlled object speed
    }
  });

  directionSlider.addEventListener('input', () => {
    if (playerControl) {
      // Update player controlled object direction
    }
  });
}

setupController();
