const slider = document.getElementById('time-slider');
const display = document.getElementById('selected-time');

function formatTime(value) {
  const hours = Math.floor(value);
  const minutes = value % 1 === 0.5 ? '30' : '00';
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
}

slider.addEventListener('input', () => {
  display.textContent = formatTime(parseFloat(slider.value));
});

const tickContainer = document.getElementById('tick-labels');
const labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm', '12pm,'];

labels.forEach(label => {
  const span = document.createElement('span');
  span.textContent = label;
  span.style.cssText = 'font-size: 11px; color: var(--color-text-tertiary);';
  tickContainer.appendChild(span);
});