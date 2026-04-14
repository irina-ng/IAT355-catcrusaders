// Sun Animation. when toggle is on, adds one hour to the time

let sunData = [];
let cities = [];
let currentCity = "Vancouver";
let currentMonth = 5;
let currentTimeDecimal = 14;

const canvas = document.getElementById('sun-canvas');
const ctx = canvas.getContext('2d');

async function loadSunData() {
  try {
    const response = await fetch('data/canada_sun_2026.csv');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const rows = text.trim().split('\n');
    const headers = rows[0].split(',').map(h => h.trim());

    sunData = rows.slice(1).map(row => {
      const values = row.split(',');
      const obj = {};
      headers.forEach((header, i) => obj[header] = values[i] ? values[i].trim() : '');
      return obj;
    });

    cities = [...new Set(sunData.map(r => r.City))].sort();

    populateSelects();
    updateVisualization();

  } catch (err) {
    console.error("Load error:", err);
  }
}

function populateSelects() {
  const citySelect = document.getElementById('city-select');
  citySelect.innerHTML = cities.map(city => 
    `<option value="${city}" ${city === currentCity ? 'selected' : ''}>${city}</option>`
  ).join('');

  const monthSelect = document.getElementById('month-select');
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthSelect.innerHTML = monthNames.map((name, i) => 
    `<option value="${i+1}" ${i+1 === currentMonth ? 'selected' : ''}>${name}</option>`
  ).join('');
}

function timeToDecimal(timeStr) {
  if (!timeStr || timeStr === '--:--') return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
}

function decimalToTime(decimal) {
  if (decimal === null) return '--:--';
  let hours = Math.floor(decimal);
  let minutes = Math.round((decimal % 1) * 60);
  if (minutes === 60) { hours++; minutes = 0; }
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${displayHour}:${minStr} ${period}`;
}

function getDayData(city, month) {
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthAbbr = monthNames[month - 1];
  const day = 15;
  const dateStr1 = `${monthAbbr} ${day} 2026`;
  const dateStr2 = `${monthAbbr}  ${day} 2026`;

  return sunData.find(row => 
    row.City === city && (row.Date.includes(dateStr1) || row.Date.includes(dateStr2))
  );
}

function drawSun(timeDecimal, dayData, showDST) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // sky gradient
  let topColor = '#0a1428', bottomColor = '#1a2a4a';
  if (timeDecimal >= 5 && timeDecimal <= 21) {
    if (timeDecimal < 7 || timeDecimal > 19) {
      topColor = '#1e3a6b';
      bottomColor = '#ff9a5c';
    } else {
      topColor = '#5eb3ff';
      bottomColor = '#b0e0ff';
    }
  }

  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.79);
  skyGrad.addColorStop(0, topColor);
  skyGrad.addColorStop(1, bottomColor);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.79);

  let sunrise = timeToDecimal(dayData ? dayData.Sunrise : null);
  let sunset  = timeToDecimal(dayData ? dayData.Sunset : null);

  // toggle: showDST if true +1 hour for DST, if false CSV standard
  if (showDST) {
    if (sunrise !== null) sunrise += 1;
    if (sunset  !== null) sunset  += 1;
  }

  let progress = 0.5;
  if (sunrise !== null && sunset !== null) {
    if (timeDecimal <= sunrise) progress = 0;
    else if (timeDecimal >= sunset) progress = 1;
    else progress = (timeDecimal - sunrise) / (sunset - sunrise);
  }

  const sunX = w * (0.12 + progress * 0.76);
  const heightFactor = Math.sin(progress * Math.PI);
  let sunY = h * 0.76 - heightFactor * (h * 0.26);

  const horizonY = h * 0.79;

  if (sunY < horizonY - 18) {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#1e3a2f';
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // update sunset/sunrse times
  if (dayData) {
    document.getElementById('current-date').textContent = 
      `${new Date(2026, currentMonth-1, 15).toLocaleString('default', { month: 'long' })} 15, 2026`;

    let displayRise = dayData.Sunrise || '--:--';
    let displaySet  = dayData.Sunset  || '--:--';

    if (showDST) {
      let r = timeToDecimal(dayData.Sunrise);
      let s = timeToDecimal(dayData.Sunset);
      if (r !== null) r += 1;
      if (s !== null) s += 1;
      displayRise = decimalToTime(r);
      displaySet  = decimalToTime(s);
    } else {
      displayRise = decimalToTime(timeToDecimal(dayData.Sunrise));
      displaySet  = decimalToTime(timeToDecimal(dayData.Sunset));
    }

    document.getElementById('info-sunrise').textContent = displayRise;
    document.getElementById('info-sunset').textContent = displaySet;
  }
}

function updateVisualization() {
  currentCity = document.getElementById('city-select').value || currentCity;
  currentMonth = parseInt(document.getElementById('month-select').value) || currentMonth;

  const dayData = getDayData(currentCity, currentMonth);
  const showDST = document.getElementById('dst-toggle').checked;

  drawSun(currentTimeDecimal, dayData, showDST);
}

// Events
document.getElementById('time-slider').addEventListener('input', (e) => {
  currentTimeDecimal = parseFloat(e.target.value);
  document.getElementById('selected-time').textContent = formatTime(currentTimeDecimal);
  updateVisualization();
});

document.getElementById('city-select').addEventListener('change', updateVisualization);
document.getElementById('month-select').addEventListener('change', updateVisualization);
document.getElementById('dst-toggle').addEventListener('change', updateVisualization);

function formatTime(value) {
  const hours = Math.floor(value);
  const minutes = (value % 1 === 0.5) ? '30' : '00';
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
}

// Start
window.addEventListener('load', () => {
  loadSunData();

  const tickContainer = document.getElementById('tick-labels');
  tickContainer.innerHTML = '';
  ['12am','3am','6am','9am','12pm','3pm','6pm','9pm','12am'].forEach(label => {
    const span = document.createElement('span');
    span.textContent = label;
    span.style.cssText = 'font-size: 11px; color: var(--color-text-tertiary);';
    tickContainer.appendChild(span);
  });
});